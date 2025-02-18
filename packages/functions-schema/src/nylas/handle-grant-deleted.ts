import type { GrantDeletedWebhook } from "@pg-async-trigger/integrations-nylas";

import { FunctionDefinition } from "../types";

export type HandleNylasGrantDeletedPayload = GrantDeletedWebhook;

export type HandleNylasGrantDeletedFunction = FunctionDefinition<
	"nylas/handle-grant-deleted",
	HandleNylasGrantDeletedPayload
>;
