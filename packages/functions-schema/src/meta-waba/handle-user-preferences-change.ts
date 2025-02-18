import { WhatsAppUserPreferencesChange } from "@pg-async-trigger/integrations-meta";

import { FunctionDefinition } from "../types";

export type HandleMetaWabaUserPreferencesChangePayload =
	WhatsAppUserPreferencesChange["value"] & {
		waba_id: string;
	};

export type HandleMetaWabaUserPreferencesChangeFunction = FunctionDefinition<
	"meta-waba/handle-user-preferences-change",
	HandleMetaWabaUserPreferencesChangePayload
>;
