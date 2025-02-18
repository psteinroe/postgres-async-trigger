import { type Server, createServer } from "node:http";
import type { ListenOptions } from "node:net";
import {
	FunctionsClient,
	type FunctionsClientOptions,
	type TriggerFunctionFallbackJobPayload,
} from "@pg-async-trigger/functions-client";
import type { Functions } from "@pg-async-trigger/functions-schema";
import { type ILogger, Logger } from "@pg-async-trigger/logger";
import {
	type JobHelpers,
	type PromiseOrDirect,
	type Runner,
	type RunnerOptions,
	run,
} from "graphile-worker";

export interface Destination<P extends object = any> {
	readonly identifier: string;
	send: (payload: P) => Promise<void>;
	close: () => Promise<void>;
}

export type ExporterServerOpts = {
	runner: Omit<RunnerOptions, "logger" | "taskList" | "taskDirectory">;
	destinations: Destination[];
	heartbeatId?: string;
	redis: FunctionsClientOptions["redis"];
	onError: (error: Error, ctx?: Record<string, unknown>) => void;
};

type TypedTask<Payload> = (
	payload: Payload,
	helpers: JobHelpers,
) => PromiseOrDirect<void | PromiseOrDirect<unknown>[]>;

type TriggerFunctionTask<FName extends Functions["name"] = Functions["name"]> =
	TypedTask<TriggerFunctionFallbackJobPayload<FName>>;

type TypedTaskList = {
	[name: string]: TypedTask<any>;
};

const SHUTDOWN_TIMEOUT = 10000;

export class ExporterServer {
	private httpServer: Server;
	private runner: Runner | null = null;
	private heartbeatInterval: NodeJS.Timeout | null = null;
	private functionsClient: FunctionsClient;
	private readonly destinations: Record<string, Destination> = {};
	private logger: ILogger = new Logger();

	constructor(private readonly opts: ExporterServerOpts) {
		this.httpServer = this.createHttpServer();
		this.functionsClient = new FunctionsClient({
			redis: opts.redis,
			onError: opts?.onError,
			defaultJobOptions: {
				attempts: 9,
				backoff: {
					type: "exponential",
					delay: 1000,
				},
			},
		});

		this.opts.destinations.forEach((d) => {
			this.destinations[d.identifier] = d;
		});
	}

	private createHttpServer(): Server {
		return createServer((req, res) => {
			if (req.url === "/health" && req.method === "GET") {
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ status: "OK" }));
				return;
			}

			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not found");
		});
	}

	registerShutdownHooks() {
		["SIGINT", "SIGTERM"].forEach((signal) => {
			process.once(signal, async () => {
				setTimeout(() => {
					return process.exit(1);
				}, SHUTDOWN_TIMEOUT).unref();

				await this.close();

				process.exit(0);
			});
		});
	}

	async listen(opts: ListenOptions) {
		const trigger_function: TriggerFunctionTask = async (p, { job }) => {
			if (Array.isArray(p)) {
				return p.map((p) =>
					this.functionsClient.triggerFunction(p.name, p.payload),
				);
			} else {
				return this.functionsClient.triggerFunction(p.name, p.payload, {
					deduplication: job.key ? { id: job.key, forDays: 30 } : undefined,
				});
			}
		};

		const publish_events: TypedTask<{
			__destination: string;
			__duration: number;
		}> = async (p, { job }) => {
			try {
				const payload = Array.isArray(p) ? p : [p];

				return payload.map((p) => {
					if (!this.destinations[p.__destination]) {
						throw new Error(`Unknown destination: ${p.__destination}`);
					}

					this.logger.info("duration", {
						duration: p.__duration,
						tg_name: p.tg_name,
						tg_table_name: p.tg_table_name,
					});

					return this.destinations[p.__destination].send(p);
				});
			} catch (e) {
				this.opts.onError?.(e instanceof Error ? e : new Error(String(e)), {
					job,
				});
				throw e;
			}
		};

		const taskList: TypedTaskList = { trigger_function, publish_events };

		this.runner = await run({
			taskList,
			...this.opts.runner,
		});

		await new Promise<void>((r) => this.httpServer.listen(opts, () => r()));
	}

	async close() {
		if (this.runner) {
			await this.runner.stop();
			this.runner = null;
		}

		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}

		await Promise.all(this.opts.destinations.map((d) => d.close()));

		await this.functionsClient.close();

		await new Promise<void>((r) => this.httpServer.close(() => r()));
	}
}
