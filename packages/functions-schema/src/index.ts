import { AnalyticsFunctions } from "./analytics";
import { CampaignFunctions } from "./campaign";
import { CommonFunctions } from "./common";
import { ContactFunctions } from "./contact";
import { DialogFunctions } from "./dialog";
import { FfmpegFunctions } from "./ffmpeg";
import { FormsFunctions } from "./forms";
import { GoogleFunctions } from "./google";
import { JourneyFunctions } from "./journeys";
import { MarketingChannelFunctions } from "./marketing-channel";
import { MessagingFunctions } from "./messaging";
import { MetaFunctions } from "./meta";
import { MetaWabaFunctions } from "./meta-waba";
import { NylasFunctions } from "./nylas";
import { ProviderTemplateApprovalFunctions } from "./provider-template-approval";
import { SegmentFunctions } from "./segment";
import { SendoutFunctions } from "./sendout";
import { StorageFunctions } from "./storage";
import { StripeFunctions } from "./stripe";
import { TwilioFunctions } from "./twilio";
import { WebhookFunctions } from "./webhooks";

export type { FunctionDefinition } from "./types";

export type Functions =
	| SendoutFunctions
	| MessagingFunctions
	| WebhookFunctions
	| FormsFunctions
	| ProviderTemplateApprovalFunctions
	| ContactFunctions
	| MarketingChannelFunctions
	| CampaignFunctions
	| SegmentFunctions
	| GoogleFunctions
	| AnalyticsFunctions
	| StorageFunctions
	| StripeFunctions
	| CommonFunctions
	| DialogFunctions
	| FfmpegFunctions
	| MetaFunctions
	| MetaWabaFunctions
	| NylasFunctions
	| TwilioFunctions
	| JourneyFunctions;

export type FunctionPayload<N extends Functions["name"]> = Extract<
	Functions,
	{ name: N }
>["payload"];

export type FunctionReturns<N extends Functions["name"]> = Extract<
	Functions,
	{ name: N }
>["returns"];
