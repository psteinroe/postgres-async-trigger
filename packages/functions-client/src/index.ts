import type { Functions } from "@pg-async-trigger/functions-schema";
import {
	type ConnectionOptions,
	type DefaultJobOptions,
	Queue,
	QueueEvents,
} from "bullmq";
import { type WorkerUtils, makeWorkerUtils } from "graphile-worker";

export type FunctionsClientOptions = {
	redis: ConnectionOptions;
	db?: { connectionString: string };
	onError?: (error: Error) => void;
	defaultJobOptions: DefaultJobOptions;
};

export type CallFunctionOpts = {
	deduplication?: {
		id: string;
		forDays: number;
	};
};

export type TriggerFunctionFallbackJobPayload<
	FName extends Functions["name"] = Functions["name"],
> = {
	name: FName;
	payload: Extract<Functions, { name: FName }>["payload"];
};

const ONE_DAY_IN_SECONDS = 86400;

export class FunctionsClient {
	private queues: Record<string, Queue> = {};
	private queueEvents: Record<string, QueueEvents> = {};
	private workerUtilsPromise: Promise<WorkerUtils> | null = null;

	constructor(private readonly opts: FunctionsClientOptions) {}

	registerShutdownHooks() {
		["SIGINT", "SIGTERM"].forEach((signal) => {
			process.once(signal, async () => {
				setTimeout(() => {
					return process.exit(1);
				}, 10000).unref();

				await this.close();

				process.exit(0);
			});
		});
	}

	async triggerFunction<FName extends Functions["name"]>(
		name: FName,
		payload: Extract<Functions, { name: FName }>["payload"],
		opts?: CallFunctionOpts,
	): Promise<void> {
		try {
			await this.queue(name).add(name, payload, {
				...this.opts.defaultJobOptions,
				jobId: opts?.deduplication?.id,
				removeOnComplete: {
					age: ONE_DAY_IN_SECONDS * (opts?.deduplication?.forDays || 0),
				},
			});
		} catch (e) {
			this.opts.onError?.(e instanceof Error ? e : new Error(String(e)));

			if (this.opts.db) {
				const workerUtils = await this.getWorkerUtils();

				await workerUtils.addJob(
					"trigger_function",
					{ name, payload },
					{ jobKey: opts?.deduplication?.id, maxAttempts: 30 },
				);
			}
		}
	}

	private getWorkerUtils(): Promise<WorkerUtils> {
		if (!this.opts.db) {
			throw new Error(
				"Cannot use fallback without a database connection string",
			);
		}

		if (!this.workerUtilsPromise) {
			this.workerUtilsPromise = makeWorkerUtils({
				connectionString: this.opts.db.connectionString,
			});
		}
		return this.workerUtilsPromise;
	}

	async callFunction<FName extends Functions["name"]>(
		name: FName,
		payload: Extract<Functions, { name: FName }>["payload"],
		opts?: CallFunctionOpts,
	): Promise<Extract<Functions, { name: FName }>["returns"]> {
		const queueEvent = this.queueEvent(name);
		const j = await this.queue(name).add(name, payload, {
			jobId: opts?.deduplication?.id,
			removeOnComplete: {
				age: ONE_DAY_IN_SECONDS * (opts?.deduplication?.forDays || 0),
			},
		});
		return j.waitUntilFinished(queueEvent);
	}

	async close() {
		for (const queue of Object.values(this.queues)) {
			await queue.close();
		}
		for (const queueEvent of Object.values(this.queueEvents)) {
			await queueEvent.close();
		}

		if (this.workerUtilsPromise) {
			const workerUtils = await this.workerUtilsPromise;
			await workerUtils.release();
		}
	}

	private queue(name: string): Queue {
		if (!this.queues[name]) {
			this.queues[name] = new Queue(name, {
				connection: this.opts.redis,
				defaultJobOptions: this.opts.defaultJobOptions,
			});
		}

		return this.queues[name];
	}

	private queueEvent(name: string): QueueEvents {
		if (!this.queueEvents[name]) {
			this.queueEvents[name] = new QueueEvents(name, {
				connection: this.opts.redis,
			});
		}

		return this.queueEvents[name];
	}
}
