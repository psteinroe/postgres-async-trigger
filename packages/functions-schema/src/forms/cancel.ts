import { FunctionDefinition } from "../types";

export type CancelFormPayload = {
	formSubmissionId: string;
};

export type CancelFormFunction = FunctionDefinition<
	"forms/cancel",
	CancelFormPayload
>;
