import type { ChannelWebhookPayload } from "@pg-async-trigger/integrations-360dialog";

import { FunctionDefinition } from "../types";

export type HandleDialogChannelStatusChangePayload = ChannelWebhookPayload;

export type HandleDialogChannelStatusChangeFunction = FunctionDefinition<
	"dialog/handle-channel-status-change",
	HandleDialogChannelStatusChangePayload
>;
