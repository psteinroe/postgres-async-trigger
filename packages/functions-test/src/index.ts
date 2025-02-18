import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";
import type { Helpers, Trigger } from "@pg-async-trigger/functions-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
	type JobHelpers,
	type PromiseOrDirect,
	runOnce,
} from "graphile-worker";

export type FunctionsTestAppOptions<
	Dependencies extends Record<string, any>,
	Functions extends FunctionDefinition = FunctionDefinition,
> = {
	dependencies: Dependencies & Helpers<Functions>;
	databaseConnectionString: string;
};

type TypedTask<Payload> = (
	payload: Payload,
	helpers: JobHelpers,
) => PromiseOrDirect<void | PromiseOrDirect<unknown>[]>;

type TypedTaskList = {
	[name: string]: TypedTask<any>;
};

export class FunctionsTestApp<
	Dependencies extends Record<string, any> & { supabase: SupabaseClient },
	Functions extends FunctionDefinition = FunctionDefinition,
> {
	private readonly appName: string;

	constructor(
		testName: string,
		private readonly opts: FunctionsTestAppOptions<Dependencies, Functions>,
	) {
		this.appName = `test_${testName}_${Math.floor(Math.random() * 1000)}`;

		if (!opts.databaseConnectionString) {
			throw new Error("Missing database connection string");
		}
	}

	async setSubscriptions(triggers: Trigger<Functions, Dependencies, any>[]) {
		await this.opts.dependencies.supabase
			.rpc("set_subscriptions", {
				app: this.appName,
				subscriptions: triggers.flatMap((t) =>
					Object.entries(t.ops).map((o) => ({
						name: t.name,
						operation: o[0],
						schema_name: "public",
						table_name: t.table,
						when_clause: o[1],
						column_names: t.columns.split(","),
						extra_when_clause: t.extra?.when,
						extra_context_query: t.extra?.query,
						app_name: this.appName,
						destination: "async_trigger",
					})),
				),
			})
			.throwOnError();
	}

	async destroy() {
		await this.opts.dependencies.supabase
			.rpc("set_subscriptions", {
				app: this.appName,
				subscriptions: [],
			})
			.throwOnError();

		// cleanup pending events
		const publish_events: TypedTask<{ __destination: string }> = async (p) => {
			const payload = Array.isArray(p) ? p : [p];

			return payload.map(() => {
				return Promise.resolve();
			});
		};

		const taskList: TypedTaskList = {
			[`publish_events_${this.appName}`]: publish_events,
		};

		await runOnce({
			connectionString: this.opts.databaseConnectionString,
			taskList,
		});
	}

	async runTrigger<P>(
		trigger:
			| Trigger<Functions, Dependencies, P>
			| Trigger<Functions, Dependencies, any>[],
		override?: Partial<Dependencies & Helpers<Functions>>,
	) {
		const publish_events: TypedTask<{ __destination: string }> = async (p) => {
			const payload = Array.isArray(p) ? p : [p];

			return payload.map(async (p) => {
				const tg_name = p.tg_name as string | undefined;

				if (!tg_name) {
					throw new Error("Missing tg_name");
				}

				const t = (Array.isArray(trigger) ? trigger : [trigger]).find(
					(t) => t.name === tg_name,
				);

				if (!t) {
					throw new Error(`Trigger not found: ${tg_name}`);
				}

				try {
					return await t.handler(p, { ...this.opts.dependencies, ...override });
				} catch (e) {
					console.error(e);
					throw e;
				}
			});
		};

		const taskList: TypedTaskList = {
			[`publish_events_${this.appName}`]: publish_events,
		};

		await runOnce({
			connectionString: this.opts.databaseConnectionString,
			taskList,
		});
	}
}
