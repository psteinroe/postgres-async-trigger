import type { Tables } from "@pg-async-trigger/supabase";

import { FunctionDefinition } from "../types";

export type SyncGoogleReviewsPayload = Pick<
	Tables<"review_channel">,
	"id" | "config" | "provider_id" | "organisation_id"
>;

export type SyncGoogleReviewsFunction = FunctionDefinition<
	"google/sync-reviews",
	SyncGoogleReviewsPayload
>;
