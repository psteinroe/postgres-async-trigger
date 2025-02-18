import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";

import { Function, type FunctionConfig } from "./Function";
import type {
	DataTypes,
	Handler,
	TriggerConfig,
	TriggerOperation,
} from "./types";

export class Trigger<
	Function extends FunctionDefinition,
	Dependencies,
	Payload,
> extends Function<Function, Dependencies, Payload, void> {
	public readonly table: string;
	public readonly columns: string;
	public readonly ops: { [K in TriggerOperation]?: string };
	public readonly extra:
		| {
				query: string;
				when?: string;
				describe: Record<string, DataTypes>;
		  }
		| undefined;

	constructor(
		name: string,
		handler: Handler<Payload, Dependencies, void, Function>,
		config: FunctionConfig & TriggerConfig,
	) {
		super(name, handler, config, "Trigger");
		this.table = config.table;
		this.columns = config.columns;
		this.ops = config.ops;
		this.extra = config.extra;
	}
}
