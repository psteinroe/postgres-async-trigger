import { HandleDialogChannelStatusChangeFunction } from "./handle-channel-status-change";
import { HandleDialogHostingTypeChangeFunction } from "./handle-hosting-type-change";
import { HandleDialogInboundMessageFunction } from "./handle-inbound-message";
import { HandleDialogMessageStatusUpdateFunction } from "./handle-message-status-update";
import { HandleDialogTemplateCategoryChangeFunction } from "./handle-template-category-change";
import { HandleDialogTemplateStatusChangeFunction } from "./handle-template-status-change";
import { UploadDialogMediaFunction } from "./upload-media";

export type DialogFunctions =
	| HandleDialogChannelStatusChangeFunction
	| HandleDialogHostingTypeChangeFunction
	| HandleDialogInboundMessageFunction
	| HandleDialogMessageStatusUpdateFunction
	| HandleDialogTemplateCategoryChangeFunction
	| HandleDialogTemplateStatusChangeFunction
	| UploadDialogMediaFunction;
