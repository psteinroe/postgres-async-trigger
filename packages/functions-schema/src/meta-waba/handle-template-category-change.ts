import { WhatsAppTemplateCategoryUpdateChange } from "@pg-async-trigger/integrations-meta";

import { FunctionDefinition } from "../types";

export type HandleMetaWabaTemplateCategoryChangePayload =
	WhatsAppTemplateCategoryUpdateChange["value"] & {
		waba_id: string;
	};

export type HandleMetaWabaTemplateCategoryChangeFunction = FunctionDefinition<
	"meta-waba/handle-template-category-change",
	HandleMetaWabaTemplateCategoryChangePayload
>;
