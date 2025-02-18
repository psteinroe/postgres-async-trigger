import { WhatsAppMessageTemplateStatusUpdateChange } from "@pg-async-trigger/integrations-meta";

import { FunctionDefinition } from "../types";

export type HandleMetaWabaTemplateStatusChangePayload =
	WhatsAppMessageTemplateStatusUpdateChange["value"] & {
		waba_id: string;
	};

export type HandleMetaWabaTemplateStatusChangeFunction = FunctionDefinition<
	"meta-waba/handle-template-status-change",
	HandleMetaWabaTemplateStatusChangePayload
>;
