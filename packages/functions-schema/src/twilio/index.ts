import { HandleTwilioMessagingWebhookFunction } from "./handle-messaging-webhook";
import { HandleTwilioRegulatoryBundleStatusWebhookFunction } from "./handle-regulatory-bundle-status-webhook";

export type TwilioFunctions =
	| HandleTwilioMessagingWebhookFunction
	| HandleTwilioRegulatoryBundleStatusWebhookFunction;
