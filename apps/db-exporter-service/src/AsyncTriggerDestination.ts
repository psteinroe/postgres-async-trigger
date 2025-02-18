import { type ConnectionOptions, Queue } from "bullmq";

import type { Destination } from "./ExporterServer";

type AsyncTriggerPayload = {
	tg_name: string;
} & Record<string, unknown>;

export class AsyncTriggerDestination
	implements Destination<AsyncTriggerPayload>
{
	private queues: Record<string, Queue> = {};

	readonly identifier = "async_trigger";

	constructor(private readonly connection: ConnectionOptions) {}

	async send(payload: AsyncTriggerPayload) {
		await this.queue(payload.tg_name).add(payload.tg_name, payload);
	}

	async close() {
		for (const queue of Object.values(this.queues)) {
			await queue.close();
		}
	}

	private queue(name: string): Queue {
		if (!this.queues[name]) {
			this.queues[name] = new Queue(name, {
				connection: this.connection,
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
}
