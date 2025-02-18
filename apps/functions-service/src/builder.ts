import { Functions } from "@pg-async-trigger/functions-schema";
import { Builder } from "@pg-async-trigger/functions-server";
import { Database } from "@pg-async-trigger/supabase";

import { Dependencies } from "./dependencies";

export const builder = new Builder<Database, Functions, Dependencies>();
