import { z } from "zod";

export const envSchema = z.object({
	ENV: z.string().nonempty(),
	NODE_ENV: z.string().nonempty(),

	DB_CONNECTION_STRING: z.string().nonempty(),

	REDIS_HOST: z.string().nonempty(),
	REDIS_PORT: z.coerce.number().gt(0),
	REDIS_USERNAME: z.string().nonempty(),
	REDIS_PASSWORD: z.string().nonempty(),

	INNGEST_EVENT_KEY: z.string().nonempty(),

	HEARTBEAT_ID: z.string().nonempty().optional(),
	SENTRY_DSN: z.string().nonempty().optional(),
	LOGTAIL_SOURCE_TOKEN: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;
