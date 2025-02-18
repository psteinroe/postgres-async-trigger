import type { SampleFunction } from "./sample-function";

export type { FunctionDefinition } from "./types";

export type Functions = SampleFunction;

export type FunctionPayload<N extends Functions["name"]> = Extract<
	Functions,
	{ name: N }
>["payload"];

export type FunctionReturns<N extends Functions["name"]> = Extract<
	Functions,
	{ name: N }
>["returns"];
