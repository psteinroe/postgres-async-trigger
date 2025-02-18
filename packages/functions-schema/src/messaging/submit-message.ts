import { Enums } from "@pg-async-trigger/supabase";

import { FunctionDefinition } from "../types";

export type SubmitMessagePayload = {
	messageId: string;
	channelType: Enums<"channel_type">;
	providerType: Enums<"provider_type">;
};

export type SubmitMessageFunction = FunctionDefinition<
	"messaging/submit-message",
	SubmitMessagePayload
>;
