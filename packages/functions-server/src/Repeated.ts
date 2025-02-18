import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";

import { Function, type FunctionConfig } from "./Function";
import type { Handler } from "./types";

export type RepeatedConfig = {
	cron: string;
};

export class Repeated<
	Function extends FunctionDefinition,
	Dependencies,
> extends Function<Function, Dependencies, null, void> {
	public readonly cron: string;

	constructor(
		name: string,
		handler: Handler<null, Dependencies, void, Function>,
		config: FunctionConfig & RepeatedConfig,
	) {
		super(name, handler, config, "Repeated");
		this.cron = config.cron;
	}
}
