import type { GrantExpiredWebhook } from "@pg-async-trigger/integrations-nylas";

import { FunctionDefinition } from "../types";

export type HandleNylasGrantExpiredPayload = GrantExpiredWebhook;

export type HandleNylasGrantExpiredFunction = FunctionDefinition<
	"nylas/handle-grant-expired",
	HandleNylasGrantExpiredPayload
>;
