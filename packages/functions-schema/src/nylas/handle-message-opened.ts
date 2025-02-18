import type { MessageOpenedWebhook } from "@pg-async-trigger/integrations-nylas";

import { FunctionDefinition } from "../types";

export type HandleNylasMessageOpenedPayload = MessageOpenedWebhook;

export type HandleNylasMessageOpenedFunction = FunctionDefinition<
	"nylas/handle-message-opened",
	HandleNylasMessageOpenedPayload
>;
