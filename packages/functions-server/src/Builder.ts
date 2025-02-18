import { FunctionDefinition } from "@pg-async-trigger/functions-schema";

import { Function, FunctionConfig } from "./Function";
import { Repeated, RepeatedConfig } from "./Repeated";
import { TriggerBuilder } from "./TriggerBuilder";
import { Handler } from "./types";

export class Builder<
	Database,
	Functions extends FunctionDefinition,
	Dependencies extends Record<string, any> = Record<string, any>,
> {
	createFunction<FName extends Functions["name"]>(
		name: FName,
		handler: Handler<
			Extract<Functions, { name: FName }>["payload"],
			Dependencies,
			Extract<Functions, { name: FName }>["returns"],
			Functions
		>,
		config: FunctionConfig,
	) {
		return new Function<
			Functions,
			Dependencies,
			Extract<Functions, { name: FName }>["payload"],
			Extract<Functions, { name: FName }>["returns"]
		>(name, handler, config);
	}

	createTrigger(
		name: string,
	): TriggerBuilder<Functions, Database, Dependencies> {
		return new TriggerBuilder(name);
	}

	createRepeated(
		name: string,
		handler: Handler<null, Dependencies, void, Functions>,
		config: RepeatedConfig & FunctionConfig,
	) {
		return new Repeated<Functions, Dependencies>(name, handler, config);
	}
}
