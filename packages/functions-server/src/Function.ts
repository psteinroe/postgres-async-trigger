import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";

import type { Handler } from "./types";

export type FunctionConfig = {
	concurrency: number;
	globalConcurrency?: number;
};

export class Function<
	Functions extends FunctionDefinition,
	Dependencies,
	Payload,
	Result,
> {
	public readonly _type: string;

	constructor(
		public readonly name: string,
		public readonly handler: Handler<Payload, Dependencies, Result, Functions>,
		public readonly config: FunctionConfig,
		type = "Function",
	) {
		this._type = type;
	}
}
