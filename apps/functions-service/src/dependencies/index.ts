import type { Functions } from "@pg-async-trigger/functions-schema";
import type { Helpers } from "@pg-async-trigger/functions-server";
import { type Env, envSchema } from "../env";
import { env } from "./env";
import { logger } from "./logger";
import { sql } from "./sql";
import { supabase } from "./supabase";

const DEPENDENCIES = {
	logger,
	supabase,
	env,
	sql,
};

export default function buildDependencies(env: Env): Dependencies {
	return Object.entries(DEPENDENCIES).reduce<any>((acc, [key, builder]) => {
		acc[key] = builder(env);
		return acc;
	}, {} as Dependencies);
}

export type Dependencies = {
	[K in keyof typeof DEPENDENCIES]: ReturnType<(typeof DEPENDENCIES)[K]>;
};

export const buildTestDependencies = (
	overrides: Partial<Dependencies> = {},
): Dependencies & Pick<Helpers<Functions>, "reportError"> => ({
	...buildDependencies(envSchema.parse(process.env)),
	reportError: console.error,
	...overrides,
});
