import type { FunctionDefinition } from "./types";

export type SampleFunction = FunctionDefinition<
	"sample",
	{ sample: string },
	{ returns: string }
>;
