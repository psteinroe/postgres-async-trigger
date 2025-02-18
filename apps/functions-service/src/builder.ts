import type { Functions } from "@pg-async-trigger/functions-schema";
import { Builder } from "@pg-async-trigger/functions-server";
import type { Database } from "@pg-async-trigger/supabase";

import type { Dependencies } from "./dependencies";

export const builder = new Builder<Database, Functions, Dependencies>();
