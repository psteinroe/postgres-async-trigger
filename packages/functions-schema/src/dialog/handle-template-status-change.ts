import type { ChannelWebhookPayload } from "@pg-async-trigger/integrations-360dialog";

import { FunctionDefinition } from "../types";

export type HandleDialogTemplateStatusChangePayload = ChannelWebhookPayload;

export type HandleDialogTemplateStatusChangeFunction = FunctionDefinition<
	"dialog/handle-template-status-change",
	HandleDialogTemplateStatusChangePayload
>;
