import type { MessageStatusUpdatePayload } from "@pg-async-trigger/integrations-360dialog";

import { FunctionDefinition } from "../types";

export type HandleDialogMessageStatusUpdatePayload = MessageStatusUpdatePayload;

export type HandleDialogMessageStatusUpdateFunction = FunctionDefinition<
	"dialog/handle-message-status-update",
	HandleDialogMessageStatusUpdatePayload
>;
