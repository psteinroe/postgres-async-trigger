import { FunctionDefinition } from "../types";

export type SendFormReminderPayload = {
	formSubmissionId: string;
};

export type SendFormReminderFunction = FunctionDefinition<
	"forms/send-reminder",
	SendFormReminderPayload
>;
