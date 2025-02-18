import type { ChannelWebhookPayload } from "@pg-async-trigger/integrations-360dialog";

import { FunctionDefinition } from "../types";

export type HandleDialogTemplateCategoryChangePayload = ChannelWebhookPayload;

export type HandleDialogTemplateCategoryChangeFunction = FunctionDefinition<
	"dialog/handle-template-category-change",
	HandleDialogTemplateCategoryChangePayload
>;
