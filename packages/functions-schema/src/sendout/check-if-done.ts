import { FunctionDefinition } from "../types";

export type CheckIfSendoutIsDonePayload = {
	sendoutId: string;
};

export type CheckIfSendoutIsDoneFunction = FunctionDefinition<
	"sendout/check-if-done",
	CheckIfSendoutIsDonePayload
>;
