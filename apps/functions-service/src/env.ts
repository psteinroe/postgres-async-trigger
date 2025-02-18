import { EnvMap } from "@pg-async-trigger/infisical-ext";
import { z } from "zod";

export const envSchema = z.object({
	ENV: z.string().nonempty(),
	NODE_ENV: z.string().nonempty(),

	DB_CONNECTION_STRING: z.string().nonempty(),

	BULLMQ_REDIS_HOST: z.string().nonempty(),
	BULLMQ_REDIS_PORT: z.coerce.number().gt(0),
	BULLMQ_REDIS_USERNAME: z.string().nonempty(),
	BULLMQ_REDIS_PASSWORD: z.string().nonempty(),

	CACHE_REDIS_HOST: z.string().nonempty(),
	CACHE_REDIS_PORT: z.coerce.number().gt(0),
	CACHE_REDIS_USERNAME: z.string().nonempty(),
	CACHE_REDIS_PASSWORD: z.string().nonempty(),

	LOGTAIL_SOURCE_TOKEN: z.string().nonempty(),
	HEARTBEAT_ID: z.string().nonempty(),

	SUPABASE_URL: z.string().nonempty(),
	SUPABASE_SERVICE_KEY: z.string().nonempty(),

	SENTRY_DSN: z.string().nonempty().optional(),

	DIALOG_USERNAME: z.string().nonempty(),
	DIALOG_PASSWORD: z.string().nonempty(),
	DIALOG_PARTNER_ID: z.string().nonempty(),
	DIALOG_CLIENT_WEBHOOK_BEARER_TOKEN: z.string().nonempty(),

	TWILIO_ACCOUNT_SID: z.string().nonempty(),
	TWILIO_AUTH_TOKEN: z.string().nonempty(),

	STRIPE_SECRET_KEY: z.string().nonempty(),

	GOOGLE_MY_BUSINESS_CLIENT_ID: z.string().nonempty(),
	GOOGLE_MY_BUSINESS_CLIENT_SECRET: z.string().nonempty(),

	NYLAS_API_KEY: z.string().nonempty(),

	POSTHOG_API_KEY: z.string().nonempty().optional(),

	NOVU_API_KEY: z.string().nonempty().optional(),

	META_APP_ID: z.string().nonempty(),

	SERVICE_SECRET: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;

export const envMap: EnvMap<typeof envSchema> = {
	ENV: { name: "ENV" },
	NODE_ENV: { name: "NODE_ENV" },

	DB_CONNECTION_STRING: {
		name: "CONNECTION_STRING",
		path: "/database",
	},

	BULLMQ_REDIS_HOST: { name: "REDIS_HOST", path: "/BullMqRedis" },
	BULLMQ_REDIS_PORT: { name: "REDIS_PORT", path: "/BullMqRedis" },
	BULLMQ_REDIS_USERNAME: { name: "REDIS_USERNAME", path: "/BullMqRedis" },
	BULLMQ_REDIS_PASSWORD: { name: "REDIS_PASSWORD", path: "/BullMqRedis" },

	CACHE_REDIS_HOST: { name: "REDIS_HOST", path: "/CacheRedis" },
	CACHE_REDIS_PORT: { name: "REDIS_PORT", path: "/CacheRedis" },
	CACHE_REDIS_USERNAME: { name: "REDIS_USERNAME", path: "/CacheRedis" },
	CACHE_REDIS_PASSWORD: { name: "REDIS_PASSWORD", path: "/CacheRedis" },

	LOGTAIL_SOURCE_TOKEN: {
		name: "LOGTAIL_SOURCE_TOKEN",
		path: "/functions-service",
	},
	HEARTBEAT_ID: {
		name: "HEARTBEAT_ID",
		path: "/functions-service",
	},

	SUPABASE_URL: { name: "SUPABASE_URL" },
	SUPABASE_SERVICE_KEY: { name: "SUPABASE_SERVICE_KEY" },

	SENTRY_DSN: {
		name: "SENTRY_DSN",
		path: "/functions-service",
	},

	DIALOG_USERNAME: {
		name: "USERNAME",
		path: "/dialog",
	},
	DIALOG_PASSWORD: {
		name: "PASSWORD",
		path: "/dialog",
	},
	DIALOG_PARTNER_ID: {
		name: "PARTNER_ID",
		path: "/dialog",
	},
	DIALOG_CLIENT_WEBHOOK_BEARER_TOKEN: {
		name: "CLIENT_WEBHOOK_BEARER_TOKEN",
		path: "/dialog",
	},

	TWILIO_ACCOUNT_SID: {
		name: "ACCOUNT_SID",
		path: "/twilio",
	},
	TWILIO_AUTH_TOKEN: {
		name: "AUTH_TOKEN",
		path: "/twilio",
	},

	STRIPE_SECRET_KEY: {
		name: "SECRET_KEY",
		path: "/stripe",
	},

	GOOGLE_MY_BUSINESS_CLIENT_ID: {
		name: "MY_BUSINESS_CLIENT_ID",
		path: "/google",
	},
	GOOGLE_MY_BUSINESS_CLIENT_SECRET: {
		name: "MY_BUSINESS_CLIENT_SECRET",
		path: "/google",
	},

	NYLAS_API_KEY: {
		name: "API_KEY",
		path: "/nylas",
	},

	POSTHOG_API_KEY: { name: "POSTHOG_API_KEY" },

	NOVU_API_KEY: { name: "NOVU_API_KEY" },

	META_APP_ID: { name: "APP_ID", path: "/meta" },

	SERVICE_SECRET: { name: "SERVICE_SECRET" },
};
