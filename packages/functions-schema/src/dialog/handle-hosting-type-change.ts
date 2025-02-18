import type { ChannelWebhookPayload } from "@pg-async-trigger/integrations-360dialog";

import { FunctionDefinition } from "../types";

export type HandleDialogHostingTypeChangePayload = ChannelWebhookPayload;

export type HandleDialogHostingTypeChangeFunction = FunctionDefinition<
	"dialog/handle-hosting-type-change",
	HandleDialogHostingTypeChangePayload
>;
