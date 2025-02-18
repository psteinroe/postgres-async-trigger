import type { InboundMessagePayload } from "@pg-async-trigger/integrations-360dialog";

import { FunctionDefinition } from "../types";

export type HandleDialogInboundMessagePayload = InboundMessagePayload;

export type HandleDialogInboundMessageFunction = FunctionDefinition<
	"dialog/handle-inbound-message",
	HandleDialogInboundMessagePayload
>;
