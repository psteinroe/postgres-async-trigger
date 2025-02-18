import { FunctionDefinition } from "@pg-async-trigger/functions-schema";

import { Handler } from "./types";

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
		type: string = "Function",
	) {
		this._type = type;
	}
}
