import type { Functions } from "@pg-async-trigger/functions-schema";
import { FunctionsServerFactory } from "@pg-async-trigger/functions-server";
import type { Database } from "@pg-async-trigger/supabase";

import buildDependencies from "./dependencies";
import { envSchema } from "./env";
import { contactFunctions } from "./functions/contact";
import { mergeFunctions } from "./types";

export const buildServer = async () => {
	const server = await new FunctionsServerFactory<Database, Functions>(
		"FunctionsService",
		{
			onError: (e, ctx) => console.error(e, ctx),
		},
	)
		.withEnv(envSchema)
		.withDependencies(buildDependencies)
		.serve(
			mergeFunctions([
				{
					functions: [],
					triggers: [],
					repeated: [],
				},
				contactFunctions,
			]),
		);

	server.registerShutdownHooks();

	return server;
};
