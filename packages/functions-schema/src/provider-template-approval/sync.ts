import { Tables } from "@pg-async-trigger/supabase";

import { FunctionDefinition } from "../types";

export type SyncProviderTemplateApprovalPayload = Pick<
	Tables<"provider_template_approval">,
	| "template_id"
	| "organisation_id"
	| "external_id"
	| "provider_id"
	| "category"
	| "status"
> & {
	provider: Pick<Tables<"provider">, "type" | "external_id" | "config">;
};

export type SyncProviderTemplateApprovalFunction = FunctionDefinition<
	"provider-template-approval/sync",
	SyncProviderTemplateApprovalPayload
>;
