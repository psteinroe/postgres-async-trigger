import { WhatsAppMessagesStatus } from "@pg-async-trigger/integrations-meta";

import { FunctionDefinition } from "../types";

export type HandleMetaWabaMessageStatusUpdatePayload =
	WhatsAppMessagesStatus & {
		waba_id: string;
		phone_number_id: string;
		display_phone_number: string;
	};

export type HandleMetaWabaMessageStatusUpdateFunction = FunctionDefinition<
	"meta-waba/handle-message-status-update",
	HandleMetaWabaMessageStatusUpdatePayload
>;
