import { MessagingWebhookPayload } from "@pg-async-trigger/integrations-twilio";

import { FunctionDefinition } from "../types";

export type HandleTwilioMessagingWebhookPayload = MessagingWebhookPayload;

export type HandleTwilioMessagingWebhookFunction = FunctionDefinition<
	"twilio/handle-messaging-webhook",
	HandleTwilioMessagingWebhookPayload
>;
