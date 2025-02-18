import { RegulatoryBundleStatusWebhookPayload } from "@pg-async-trigger/integrations-twilio";

import { FunctionDefinition } from "../types";

export type HandleTwilioRegulatoryBundleStatusWebhookPayload =
	RegulatoryBundleStatusWebhookPayload;

export type HandleTwilioRegulatoryBundleStatusWebhookFunction =
	FunctionDefinition<
		"twilio/handle-regulatory-bundle-status-webhook",
		HandleTwilioRegulatoryBundleStatusWebhookPayload
	>;
