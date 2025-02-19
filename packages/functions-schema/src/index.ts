import type { SampleFunction } from "./sample-function";
import type { SampleFunction2 } from "./sample-function-2";

export type { FunctionDefinition } from "./types";

export type Functions = SampleFunction | SampleFunction2;

export type FunctionPayload<N extends Functions["name"]> = Extract<
	Functions,
	{ name: N }
>["payload"];

export type FunctionReturns<N extends Functions["name"]> = Extract<
	Functions,
	{ name: N }
>["returns"];
