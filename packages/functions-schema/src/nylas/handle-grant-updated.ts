import type { GrantUpdatedWebhook } from "@pg-async-trigger/integrations-nylas";

import { FunctionDefinition } from "../types";

export type HandleNylasGrantUpdatedPayload = GrantUpdatedWebhook;

export type HandleNylasGrantUpdatedFunction = FunctionDefinition<
	"nylas/handle-grant-updated",
	HandleNylasGrantUpdatedPayload
>;
