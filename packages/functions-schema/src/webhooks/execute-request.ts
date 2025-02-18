import { Tables } from "@pg-async-trigger/supabase";

import { FunctionDefinition } from "../types";

export type ExecuteWebhookRequestPayload = Pick<
	Tables<"webhook_request">,
	"organisation_id" | "webhook_id" | "event" | "entity_id"
> &
	Partial<Pick<Tables<"webhook_request">, "payload">> &
	Pick<Tables<"webhook">, "target_url" | "headers" | "method">;

export type ExecuteWebhookRequestFunction = FunctionDefinition<
	"webhooks/execute-request",
	ExecuteWebhookRequestPayload
>;
