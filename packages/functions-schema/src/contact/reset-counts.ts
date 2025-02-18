import { FunctionDefinition } from "../types";

export type ResetContactCountsPayload = {
	contactId: string;
};

export type ResetContactCountsFunction = FunctionDefinition<
	"contact/reset-counts",
	ResetContactCountsPayload
>;
