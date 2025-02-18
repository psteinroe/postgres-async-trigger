import { z } from "zod";

export const envSchema = z.object({
	ENV: z.string().min(1),
	NODE_ENV: z.string().min(1),

	DB_CONNECTION_STRING: z.string().min(1),

	REDIS_HOST: z.string().min(1),
	REDIS_PORT: z.coerce.number().gt(0),
	REDIS_USERNAME: z.string().min(1),
	REDIS_PASSWORD: z.string().min(1),

	SUPABASE_URL: z.string().min(1),
	SUPABASE_SERVICE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;
