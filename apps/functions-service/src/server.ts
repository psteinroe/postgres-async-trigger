import type { Functions } from "@pg-async-trigger/functions-schema";
import { FunctionsServerFactory } from "@pg-async-trigger/functions-server";
import type { Database } from "@pg-async-trigger/supabase";

import buildDependencies from "./dependencies";
import { envSchema } from "./env";
import { contactFunctions } from "./functions/contact";
import { mergeFunctions } from "./types";
import sampleFunction from "./functions/sample-function";
import sampleCron from "./functions/sample-cron";
import sampleFunction2 from "./functions/sample-function-2";

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
					functions: [sampleFunction, sampleFunction2],
					triggers: [],
					repeated: [sampleCron],
				},
				contactFunctions,
			]),
		);

	server.registerShutdownHooks();

	return server;
};
