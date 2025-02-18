import type {
	MessageCreatedWebhook,
	MessageCreatedTruncatedWebhook,
	MessageUpdatedWebhook,
	MessageUpdatedTruncatedWebhook,
} from "@pg-async-trigger/integrations-nylas";

import { FunctionDefinition } from "../types";

export type HandleNylasMessageCreatedPayload =
	| MessageCreatedWebhook
	| MessageCreatedTruncatedWebhook
	| MessageUpdatedWebhook
	| MessageUpdatedTruncatedWebhook;

export type HandleNylasMessageCreatedFunction = FunctionDefinition<
	"nylas/handle-message-created",
	HandleNylasMessageCreatedPayload
>;
