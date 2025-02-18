import {
	FunctionPayload,
	FunctionReturns,
	Functions,
} from "@pg-async-trigger/functions-schema";
import {
	Function,
	Handler,
	Helpers,
	Repeated,
	Trigger,
} from "@pg-async-trigger/functions-server";

import { Dependencies } from "./dependencies";

export type FunctionsIndex = {
	triggers: Trigger<Functions, Dependencies, any>[];
	functions: Function<Functions, Dependencies, any, any>[];
	repeated: Repeated<Functions, Dependencies>[];
};

export const mergeFunctions = (functions: FunctionsIndex[]): FunctionsIndex =>
	functions.reduce(
		(acc, curr) => {
			return {
				triggers: [...acc.triggers, ...curr.triggers],
				functions: [...acc.functions, ...curr.functions],
				repeated: [...acc.repeated, ...curr.repeated],
			};
		},
		{ triggers: [], functions: [], repeated: [] },
	);

export type InternalHandler<Payload, Result = void> = (
	payload: Payload,
	dependencies: Dependencies & Pick<Helpers<Functions>, "reportError">,
) => Promise<Result>;

export type UnregisteredHandler<Payload, Result = void> = Handler<
	Payload,
	Dependencies,
	Result,
	Functions
>;

export type TypedHandler<FnName extends Functions["name"]> = Handler<
	FunctionPayload<FnName>,
	Dependencies,
	FunctionReturns<FnName>,
	Functions
>;
