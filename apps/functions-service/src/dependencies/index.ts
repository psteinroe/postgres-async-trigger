import { Functions } from "@pg-async-trigger/functions-schema";
import { Helpers } from "@pg-async-trigger/functions-server";

import { dialog } from "./dialog";
import { env } from "./env";
import { filterExpr } from "./expr-filter";
import { ffmpeg } from "./ffmpeg";
import { google } from "./google";
import { heartbeat } from "./heartbeat";
import { logger } from "./logger";
import { meta } from "./meta";
import { novu } from "./novu";
import { nylas } from "./nylas";
import { posthog } from "./posthog";
import { queryCache } from "./query-cache";
import { redis } from "./redis";
import { sql } from "./sql";
import { stripe } from "./stripe";
import { supabase } from "./supabase";
import { twilio } from "./twilio";
import { urls } from "./urls";
import { Env, envSchema } from "../env";

const DEPENDENCIES = {
	filterExpr,
	logger,
	supabase,
	heartbeat,
	dialog,
	meta,
	twilio,
	stripe,
	google,
	nylas,
	env,
	ffmpeg,
	posthog,
	novu,
	sql,
	queryCache,
	urls,
	redis,
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
