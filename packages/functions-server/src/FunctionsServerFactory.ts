import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";
import type { SupabaseClient } from "@supabase/supabase-js";
import type postgres from "postgres";
import type { PostgresError } from "postgres";
import type { z } from "zod";

import type { Function as AFunction } from "./Function";
import { FunctionsServer } from "./FunctionsServer";
import type { Repeated } from "./Repeated";
import type { Trigger } from "./Trigger";
import { SAMPLE_DATA, type WorkerServerLogger } from "./types";

export class FunctionsServerFactory<
	Database = any,
	Functions extends FunctionDefinition = FunctionDefinition,
	Environment extends {
		REDIS_HOST: string;
		REDIS_PORT: number;
		REDIS_USERNAME: string;
		REDIS_PASSWORD: string;
		NODE_ENV: string;
		DB_CONNECTION_STRING: string;
	} & Record<string, any> = never,
	Dependencies extends {
		logger: WorkerServerLogger;
		supabase: SupabaseClient<Database>;
		sql: ReturnType<typeof postgres>;
	} & Record<string, any> = never,
> {
	private envSchema: z.ZodType<Environment> | null = null;
	private buildDeps: ((e: Environment) => Dependencies) | null = null;

	constructor(
		private readonly name: string,
		private readonly opts?: {
			onError?: (err: Error, ctx?: Record<string, unknown>) => void;
		},
	) {}

	withEnv<
		E extends Record<string, unknown> & {
			REDIS_HOST: string;
			REDIS_PORT: number;
			REDIS_USERNAME: string;
			REDIS_PASSWORD: string;
			NODE_ENV: string;
			DB_CONNECTION_STRING: string;
		},
	>(env: z.ZodType<E>): FunctionsServerFactory<Database, Functions, E> {
		this.envSchema = env as any;
		return this as any;
	}

	withDependencies<
		D extends {
			logger: WorkerServerLogger;
			supabase: SupabaseClient<Database>;
			sql: ReturnType<typeof postgres>;
		} & Record<string, any>,
	>(
		build: (e: Environment) => D,
	): FunctionsServerFactory<Database, Functions, Environment, D> {
		this.buildDeps = build as any;

		return this as any;
	}

	async serve({
		triggers,
		functions,
		repeated,
	}: {
		triggers: Trigger<Functions, Dependencies, any>[];
		functions: AFunction<Functions, Dependencies, any, any>[];
		repeated: Repeated<Functions, Dependencies>[];
	}): Promise<FunctionsServer<Functions, Dependencies>> {
		if (!this.envSchema) {
			throw new Error("Environment schema not set");
		}
		if (!this.buildDeps) {
			throw new Error("Dependencies builder not set");
		}

		const env = this.envSchema.parse(process.env);
		const dependencies = this.buildDeps(env);

		const sql = dependencies.sql;

		// validate that all trigger extra clauses are valid
		for (const trigger of triggers) {
			if (!trigger.extra) {
				continue;
			}

			const { query, when } = trigger.extra;

			// replace params with $1, $2, etc
			let ctr = 1;
			let queryClause = query;
			while (true) {
				const n = queryClause.replace(/(new\.|old\.)\w+/i, `$$${ctr++}`);
				if (n === queryClause) {
					break;
				}
				queryClause = n;
			}

			try {
				await sql.unsafe(queryClause).describe();
			} catch (e) {
				throw new Error(
					`Invalid extra query for trigger ${trigger.name}: ${(e as PostgresError).message} for "${queryClause}"`,
				);
			}

			const whenClause = when
				? Object.entries(trigger.extra.describe).reduce((acc, [key, type]) => {
						return acc.replaceAll(key, SAMPLE_DATA[type]);
					}, when)
				: null;

			if (whenClause) {
				try {
					await sql.unsafe(`select ${whenClause}`).describe();
				} catch (e) {
					throw new Error(
						`Invalid extra when clause for trigger ${trigger.name}: ${(e as PostgresError).message} for "${whenClause}"`,
					);
				}
			}
		}

		return new FunctionsServer(this.name, {
			triggers,
			functions,
			// for some reason, upsertJobScheduler hangs forever when running locally
			repeated: env.NODE_ENV === "production" ? repeated : [],
			dependencies,
			connection: {
				host: env.REDIS_HOST,
				port: env.REDIS_PORT,
				username: env.REDIS_USERNAME,
				password: env.REDIS_PASSWORD,
				...(env.NODE_ENV === "production" ? { tls: {} } : {}),
			},
			onError: this.opts?.onError,
			logger: dependencies.logger,
			deployTriggers: async (app, triggers) => {
				const maxRetries = 10;
				let retries = 0;
				while (retries < maxRetries) {
					try {
						dependencies.logger.info("Deploying subscriptions...");
						const now = new Date();
						await dependencies.supabase
							.rpc("set_subscriptions", {
								app,
								subscriptions: triggers.map((t) => ({
									...t,
									app_name: app,
									destination: "async_trigger",
								})),
							})
							.throwOnError();
						dependencies.logger.info("Subscriptions deployed", {
							duration: new Date().getTime() - now.getTime(),
						});
						break;
					} catch (error) {
						dependencies.logger.error("Error deploying triggers", { error });
						this.opts?.onError?.(error as Error, { app, retries });
						retries++;
						if (retries === maxRetries) {
							throw error;
						}
						await new Promise((resolve) => setTimeout(resolve, 200));
					}
				}
			},
		});
	}
}
