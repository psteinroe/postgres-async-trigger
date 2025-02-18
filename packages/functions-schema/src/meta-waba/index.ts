import { HandleMetaWabaInboundMessageFunction } from "./handle-inbound-message";
import { HandleMetaWabaMessageStatusUpdateFunction } from "./handle-message-status-update";
import { HandleMetaWabaTemplateCategoryChangeFunction } from "./handle-template-category-change";
import { HandleMetaWabaTemplateStatusChangeFunction } from "./handle-template-status-update";
import { HandleMetaWabaUserPreferencesChangeFunction } from "./handle-user-preferences-change";
import { UploadMetaWabaMediaFunction } from "./upload-media";

export type MetaWabaFunctions =
	| HandleMetaWabaInboundMessageFunction
	| HandleMetaWabaMessageStatusUpdateFunction
	| HandleMetaWabaTemplateCategoryChangeFunction
	| HandleMetaWabaTemplateStatusChangeFunction
	| HandleMetaWabaUserPreferencesChangeFunction
	| UploadMetaWabaMediaFunction;
