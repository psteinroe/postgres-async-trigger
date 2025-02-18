import { type ClientOptions, type EventPayload, Inngest } from "inngest";

import type { Destination } from "./ExporterServer";

type InngestPayload = EventPayload;

export type InngestTargetOpts = {
	eventKey: string;
};

export class InngestDestination implements Destination<InngestPayload> {
	readonly identifier = "inngest";

	private readonly client: Inngest;

	constructor(opts: ClientOptions) {
		this.client = new Inngest(opts);
	}

	async send(payload: InngestPayload) {
		await this.client.send(payload);
	}

	async close() {}
}
