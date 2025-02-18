import { FunctionDefinition } from "../types";

export type ScheduleMessagePayload = {
	sendoutId: string;
	sms: string | null;
	whatsapp: string | null;
	email: string | null;
	facebook: string | null;
	instagram: string | null;
	google_business_messaging: string | null;
	full_name: string | null;
	contactId: string | null;
	sendAfter: string;
};
export type ScheduleMessageFunction = FunctionDefinition<
	"sendout/schedule-message",
	ScheduleMessagePayload
>;
