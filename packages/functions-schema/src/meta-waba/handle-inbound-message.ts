import { WhatsAppMessagesMessage } from "@pg-async-trigger/integrations-meta";

import { FunctionDefinition } from "../types";

export type HandleMetaWabaInboundMessagePayload = WhatsAppMessagesMessage & {
	waba_id: string;
	from_name: string;
	phone_number_id: string;
	display_phone_number: string;
};

export type HandleMetaWabaInboundMessageFunction = FunctionDefinition<
	"meta-waba/handle-inbound-message",
	HandleMetaWabaInboundMessagePayload
>;
