import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";
import type { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

import type { FunctionConfig } from "./Function";
import { Trigger } from "./Trigger";
import type {
	DataTypes,
	Handler,
	TriggerOperation,
	TriggerPayload,
} from "./types";

type ParserError<Message extends string> = { error: true } & Message;
type GenericStringError = ParserError<"Received a generic string">;

export type SplitColumns<
	S extends string,
	Row extends Record<string, unknown>,
> = string extends S
	? GenericStringError
	: S extends `${infer T},${infer U}`
		? T extends keyof Row
			? T | SplitColumns<U, Row>
			: ParserError<`${T} is not a key of Row`>
		: S extends keyof Row
			? S
			: ParserError<`${S} is not a key of Row`>;

export class TriggerBuilder<
	Function extends FunctionDefinition,
	Database,
	Dependencies extends Record<string, any> = Record<string, any>,
	SchemaName extends keyof Database = "public" extends keyof Database
		? "public"
		: keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: never,
	TableName extends keyof Schema["Tables"] = keyof Schema["Tables"],
	Table extends Schema["Tables"][TableName] = Schema["Tables"][TableName],
	Columns extends keyof Table["Row"] = keyof Table["Row"],
	Operations extends TriggerOperation = never,
	ExtraContext extends Record<string, any> = never,
> {
	private table: TableName | undefined;
	private columns: Columns | undefined;
	private extra:
		| {
				query: string;
				when?: string;
				describe: Record<string, DataTypes>;
		  }
		| undefined;
	private ops: { [K in TriggerOperation]?: string } = {};

	constructor(private name: string) {}

	on<TN extends keyof Schema["Tables"], T extends Schema["Tables"][TN]>(
		relation: TN,
	): TriggerBuilder<
		Function,
		Database,
		Dependencies,
		SchemaName,
		Schema,
		TN,
		T,
		Columns,
		Operations,
		ExtraContext
	> {
		this.table = relation as any;
		return this as any;
	}

	withColumns<C extends string>(
		columns: C,
	): TriggerBuilder<
		Function,
		Database,
		Dependencies,
		SchemaName,
		Schema,
		TableName,
		Table,
		SplitColumns<C, Table["Row"]>,
		Operations,
		ExtraContext
	> {
		this.columns = columns as any;
		return this as any;
	}

	withExtra<Context extends Record<string, any>>(extra: {
		query: string;
		when?: string;
		describe: Record<string, DataTypes>;
	}): TriggerBuilder<
		Function,
		Database,
		Dependencies,
		SchemaName,
		Schema,
		TableName,
		Table,
		Columns,
		Operations,
		Context
	> {
		this.extra = extra;
		return this as any;
	}

	afterInsert(
		when?: string,
	): TriggerBuilder<
		Function,
		Database,
		Dependencies,
		SchemaName,
		Schema,
		TableName,
		Table,
		Columns,
		Operations | "INSERT",
		ExtraContext
	> {
		this.ops.INSERT = when || "";
		return this as any;
	}

	afterUpdate(
		when?: string,
	): TriggerBuilder<
		Function,
		Database,
		Dependencies,
		SchemaName,
		Schema,
		TableName,
		Table,
		Columns,
		Operations | "UPDATE",
		ExtraContext
	> {
		this.ops.UPDATE = when || "";
		return this as any;
	}

	afterDelete(
		when?: string,
	): TriggerBuilder<
		Function,
		Database,
		Dependencies,
		SchemaName,
		Schema,
		TableName,
		Table,
		Columns,
		Operations | "DELETE",
		ExtraContext
	> {
		this.ops.DELETE = when || "";
		return this as any;
	}

	execute(
		handler: Handler<
			TriggerPayload<Operations, Pick<Table["Row"], Columns>, ExtraContext>,
			Dependencies,
			void,
			Function
		>,
		config: FunctionConfig,
	): Trigger<
		Function,
		Dependencies,
		TriggerPayload<Operations, Pick<Table["Row"], Columns>, ExtraContext>
	> {
		return new Trigger(this.name, handler, {
			...config,
			table: this.table as string,
			columns: this.columns as string,
			ops: this.ops,
			extra: this.extra,
		});
	}
}
