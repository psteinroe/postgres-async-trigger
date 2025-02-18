import { FunctionDefinition } from "@pg-async-trigger/functions-schema";
import {
	ConnectionOptions,
	DelayedError,
	Job,
	MetricsTime,
	Queue,
	QueueEvents,
	Telemetry,
	Worker,
} from "bullmq";
import { BullMQOtel } from "bullmq-otel";
import { createServer, Server } from "node:http";
import { ListenOptions } from "node:net";
import postgres from "postgres";

import { Function as AFunction, FunctionConfig } from "./Function";
import { FunctionCache } from "./FunctionCache";
import { Repeated } from "./Repeated";
import { Trigger } from "./Trigger";
import {
	WorkerServerLogger,
	Handler,
	AsyncTrigger,
	TriggerOperation,
	Helpers,
} from "./types";

export type FunctionsServerOpts<
	Dependencies extends Record<string, any> & {
		sql: ReturnType<typeof postgres>;
	},
	Functions extends FunctionDefinition = FunctionDefinition,
> = {
	connection: ConnectionOptions;
	logger: WorkerServerLogger;
	functions: AFunction<Functions, Dependencies, any, any>[];
	triggers: Trigger<Functions, Dependencies, any>[];
	repeated: Repeated<Functions, Dependencies>[];
	onError?: (err: Error, ctx?: Record<string, unknown>) => void;
	dependencies: Dependencies;
	deployTriggers: (name: string, trigger: AsyncTrigger[]) => Promise<void>;
};

const ONE_DAY_IN_SECONDS = 86400;
const ONE_DAY_IN_MS = 86400000;
const SHUTDOWN_TIMEOUT = 10000;
const SCHEDULER_QUEUE = "scheduler";

export class FunctionsServer<
	Functions extends FunctionDefinition = FunctionDefinition,
	Dependencies extends Record<string, any> & {
		sql: ReturnType<typeof postgres>;
	} = never,
> {
	private queues: Record<string, Queue> = {};
	private workers: Record<string, Worker> = {};
	private queueEvents: Record<string, QueueEvents> = {};
	private telemetry: Telemetry;

	private cache: FunctionCache = new FunctionCache<Functions>();

	private functionNames: Set<string> = new Set();
	private _fnLogger: Record<string, WorkerServerLogger> = {};

	private httpServer: Server;

	public triggers: Trigger<Functions, Dependencies, any>[] = [];

	constructor(
		public readonly appName: string,
		private readonly opts: FunctionsServerOpts<Dependencies, Functions>,
	) {
		this.httpServer = this.createHttpServer();
		this.telemetry = new BullMQOtel(appName);
	}

	private createHttpServer(): Server {
		return createServer((req, res) => {
			if (req.url === "/health" && req.method === "GET") {
				const workersRunning = Object.values(this.workers).some((worker) =>
					worker.isRunning(),
				);

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(
					JSON.stringify({
						status: "OK",
						workersRunning,
					}),
				);
				return;
			}

			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not found");
		});
	}

	functions(): string[] {
		const fns = Array.from(this.functionNames);
		fns.sort();
		return fns;
	}

	async listen(opts: ListenOptions) {
		for (const fn of this.opts.functions) {
			await this.registerFunction(fn.name, fn.handler, fn.config);
		}

		await this.setupSchedulerQueue();

		for (const trigger of this.opts.triggers) {
			this.triggers.push(trigger);
			this.registerFunction(trigger.name, trigger.handler, trigger.config);
		}

		await this.opts.deployTriggers(
			this.appName,
			this.opts.triggers.flatMap<AsyncTrigger>((t) =>
				Object.entries(t.ops).map((o) => ({
					name: t.name,
					operation: o[0] as TriggerOperation,
					schema_name: "public",
					table_name: t.table,
					when_clause: o[1],
					column_names: t.columns.split(","),
					extra_when_clause: t.extra?.when,
					extra_context_query: t.extra?.query,
				})),
			),
		);

		await new Promise<void>((r) => this.httpServer.listen(opts, () => r()));
	}

	registerShutdownHooks() {
		["SIGINT", "SIGTERM"].forEach((signal) => {
			process.once(signal, async () => {
				this.opts.logger.info(`Received ${signal}, shutting down`);

				setTimeout(() => {
					this.opts.logger.warn(
						`Could not close resources gracefully after ${SHUTDOWN_TIMEOUT}ms: forcing shutdown`,
					);
					return process.exit(1);
				}, SHUTDOWN_TIMEOUT).unref();

				await this.close();

				process.exit(0);
			});
		});
	}

	async close() {
		await Promise.all(
			Object.values(this.workers).map(async (w) => await w.close()),
		);

		await Promise.all(
			Object.values(this.queueEvents).map(async (q) => await q.close()),
		);

		await Promise.all(
			Object.values(this.queues).map(async (q) => await q.close()),
		);

		await this.opts.dependencies.sql.end();

		await new Promise<void>((r) => this.httpServer.close(() => r()));
	}

	private async setupSchedulerQueue() {
		if (this.opts.repeated.length === 0) {
			this.opts.logger.info(`No repeated functions to schedule`);
			return;
		}

		const name = `${this.appName}Scheduler`;

		this.assertFunctionNotRegistered(name);

		if (this.workers[name]) {
			throw new Error(`Worker ${name} already registered`);
		}

		this.fnLogger(name).info(`Registering worker for scheduled queue`);

		const w = new Worker(
			name,
			async (job, token) => {
				const processor = this.opts.repeated.find(
					(r) => r.name === job.name,
				)?.handler;

				if (!processor) {
					this.fnLogger(SCHEDULER_QUEUE).error(
						`No processor found for job ${job.name}`,
					);
					return;
				}

				return processor(job.data, {
					...this.opts.dependencies,
					...this.buildHelpers(job, token),
				});
			},
			{
				metrics: {
					maxDataPoints: MetricsTime.TWO_WEEKS,
				},
				telemetry: this.telemetry,
				concurrency: 1,
				connection: this.opts.connection,
				removeOnComplete: {
					age: 0,
				},
				removeOnFail: {
					age: ONE_DAY_IN_SECONDS * 7,
				},
			},
		);

		this.setupWorkerLogs(name, w);

		this.workers[name] = w;

		this.fnLogger(name).info(`Registered worker for scheduled queue`);

		const schedulers = await this.queue(name).getJobSchedulers();
		for (const scheduler of schedulers) {
			if (!this.opts.repeated.find((r) => r.name === scheduler.key)) {
				this.opts.logger.info(
					`Removing job scheduler "${scheduler.name}" from queue "${name}"`,
				);
				await this.queue(name).removeJobScheduler(scheduler.name);
			}
		}

		for (const repeated of this.opts.repeated) {
			this.fnLogger(name).info(`Upserting job scheduler "${repeated.name}"`);
			await this.queue(name).upsertJobScheduler(
				repeated.name,
				{
					pattern: repeated.cron,
				},
				{ name: repeated.name },
			);
		}

		this.fnLogger(name).info(`Synced schedulers for repeated functions`);
	}

	private async registerFunction<Payload, Returns>(
		name: string,
		processor: Handler<Payload, Dependencies, Returns, Functions>,
		opts: FunctionConfig,
	) {
		this.assertFunctionNotRegistered(name);

		if (this.workers[name]) {
			throw new Error(`Worker ${name} already registered`);
		}

		this.fnLogger(name).info(`Registering function ${name}`);

		const w = new Worker(
			name,
			async (job, token) => {
				return processor(job.data, {
					...this.opts.dependencies,
					...this.buildHelpers(job, token),
				});
			},
			{
				metrics: {
					maxDataPoints: MetricsTime.TWO_WEEKS,
				},
				concurrency: opts.concurrency,
				telemetry: this.telemetry,
				connection: this.opts.connection,
				removeOnComplete: {
					age: 0,
				},
				removeOnFail: {
					age: ONE_DAY_IN_SECONDS * 7,
				},
			},
		);

		this.setupWorkerLogs(name, w);

		this.workers[name] = w;

		if (opts.globalConcurrency) {
			await this.queue(name).setGlobalConcurrency(opts.globalConcurrency);
		}

		this.fnLogger(name).info(`Registered function ${name}`);
	}

	private setupWorkerLogs(name: string, w: Worker) {
		w.on("error", (err) => {
			this.fnLogger(name).error(err, { workerId: w.id });
			this.opts.onError?.(err, { workerId: w.id, workerName: w.name });
		});
		w.on("ioredis:close", () =>
			this.fnLogger(name).info("ioredis connection closed", { workerId: w.id }),
		);

		w.on("active", (job) =>
			this.fnLogger(name).info(`Job is active`, {
				jobId: job.id,
				workerId: w.id,
				payload: job.data,
			}),
		);

		w.on("completed", (job) =>
			this.fnLogger(name).info(`Completed job`, {
				jobId: job.id,
				workerId: w.id,
				duration:
					job.processedOn && job.finishedOn
						? job.finishedOn - job.processedOn
						: undefined,
				payload: job.data,
				...(job.processedOn && job.finishedOn
					? { duration: job.processedOn - job.finishedOn }
					: {}),
			}),
		);

		w.on("failed", (job, err) => {
			this.fnLogger(name).error(`Failed job`, {
				jobId: job?.id,
				workerId: w.id,
				duration:
					job?.processedOn && job?.finishedOn
						? job.finishedOn - job.processedOn
						: undefined,
				reason: job?.failedReason,
				attemptsMade: job?.attemptsMade,
			});
			if (job && job.attemptsMade > 0) {
				this.opts.onError?.(err, {
					workerId: w.id,
					workerName: w.name,
					payload: job.data,
					jobId: job.id,
					attemptsMade: job.attemptsMade,
				});
			}
		});
	}

	private buildHelpers(job: Job, token?: string) {
		return {
			attemptsStarted: job.attemptsStarted,
			isFirstAttempt: job.attemptsMade === 0,
			isLastAttempt: job.attemptsMade + 1 === job.opts.attempts,
			schedule: async (name, id, opts, payload) => {
				await this.queue(name).upsertJobScheduler(id, opts, { data: payload });
			},
			unschedule: async (name, id) => {
				await this.queue(name).removeJobScheduler(id);
			},
			findJobById: (name, id) => {
				return this.queue(name).getJob(id);
			},
			logger: this.fnLogger(job.name).child({
				jobId: job.id || "unknown",
			}),
			reportError: (err: Error, ctx?: Record<string, unknown>) => {
				if (typeof this.opts.onError === "function") {
					this.opts.onError(err, { ...ctx, jobId: job.id, fnName: job.name });
				} else console.error(err, ctx);
			},
			triggerFunctions: async (name, payloads) => {
				await this.queue(name).addBulk(
					payloads.map(({ data: payload, opts }) => ({
						name,
						data: payload,
						opts: {
							jobId: opts?.id,
							removeOnComplete: {
								age: ONE_DAY_IN_SECONDS * (opts?.dedupeForDays || 0),
							},
							delay: opts?.delay,
						},
					})),
				);
			},
			triggerFunction: async (name, payload, opts) => {
				await this.queue(name).add(name, payload, {
					jobId: opts?.id,
					removeOnComplete: {
						age: ONE_DAY_IN_SECONDS * (opts?.dedupeForDays || 0),
					},
					delay: opts?.delay,
				});
			},
			callFunction: async (name, payload, opts) => {
				if (opts?.id && opts.dedupeForDays) {
					const result = this.cache.get(name, opts.id);
					if (result) {
						return result;
					}
				}

				const queueEvent = this.queueEvent(name);
				const j = await this.queue(name).add(name, payload, {
					jobId: opts?.id,
					removeOnComplete: {
						age: ONE_DAY_IN_SECONDS * (opts?.dedupeForDays || 0),
					},
				});
				const res = await j.waitUntilFinished(queueEvent);

				if (opts?.id && opts.dedupeForDays && res) {
					this.cache.set(name, opts.id, {
						staleUntil: Date.now() + opts.dedupeForDays * ONE_DAY_IN_MS,
						data: res,
					});
				}

				return res;
			},
			scheduleFor: async (ts) => {
				await job.moveToDelayed(ts.getTime(), token);
				throw new DelayedError();
			},
			rescheduleNextDay: async () => {
				await job.moveToDelayed(Date.now() + 86400000, token);
				throw new DelayedError();
			},
		} satisfies Helpers<Functions>;
	}

	private queueEvent(name: string) {
		if (!this.queueEvents[name]) {
			this.queueEvents[name] = new QueueEvents(name, {
				connection: this.opts.connection,
			});
		}

		return this.queueEvents[name];
	}

	private queue(name: string) {
		if (!this.queues[name]) {
			this.queues[name] = new Queue(name, {
				connection: this.opts.connection,
				telemetry: this.telemetry,
				defaultJobOptions: {
					attempts: 9,
					backoff: {
						type: "exponential",
						delay: 1000,
					},
				},
			});
		}
		return this.queues[name];
	}

	private assertFunctionNotRegistered(name: string) {
		if (this.functionNames.has(name)) {
			throw new Error(`Function ${name} already registered`);
		}
		this.functionNames.add(name);
	}

	private fnLogger(fnName: string): WorkerServerLogger {
		if (!this._fnLogger[fnName]) {
			this._fnLogger[fnName] = this.opts.logger.child({ fnName });
		}

		return this._fnLogger[fnName];
	}
}
