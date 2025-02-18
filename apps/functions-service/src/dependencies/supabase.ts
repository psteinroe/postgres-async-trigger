import { Database } from "@pg-async-trigger/supabase";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

import { TypedDependencyBuilder } from "./types";

export const supabase: TypedDependencyBuilder<SupabaseClient<Database>> = (e) =>
	createClient<Database>(e.SUPABASE_URL, e.SUPABASE_SERVICE_KEY, {
		global: { headers: { "x-service-secret": e.SERVICE_SECRET } },
	});
