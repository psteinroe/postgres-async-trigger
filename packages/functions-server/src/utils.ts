import { FunctionDefinition } from "@pg-async-trigger/functions-schema";
import { Logger } from "@pg-async-trigger/logger";
import { Job, RepeatOptions } from "bullmq";

import {
	CallFunctionOpts,
	Handler,
	Helpers,
	TriggerFunctionOpts,
	WorkerServerLogger,
} from "./types";

export type OverwriteHelpers<
	Functions extends FunctionDefinition,
	Dependencies extends Record<string, any> = never,
> = {
	fnMocks?: {
		[K in Functions["name"]]?: Handler<
			Extract<Functions, { name: K }>["payload"],
			Dependencies,
			Extract<Functions, { name: K }>["returns"],
			Functions
		>;
	};
	scheduleFor?: (ts: Date) => Promise<void>;
	rescheduleNextDay?: () => Promise<void>;
	logger?: WorkerServerLogger;
};

export const buildTestHelpers = <
	Functions extends FunctionDefinition,
	Dependencies extends Record<string, any> = never,
>({
	overwrite,
	deps,
}: {
	deps: Dependencies;
	overwrite?: OverwriteHelpers<Functions, Dependencies>;
}): Helpers<Functions> => {
	return {
		attemptsStarted: 0,
		isLastAttempt: false,
		isFirstAttempt: true,
		schedule: async <FName extends Functions["name"]>(
			name: FName,
			id: string,
			opts: Omit<RepeatOptions, "key">,
			payload: Extract<Functions, { name: FName }>["payload"],
		) => {
			throw new Error("Not implemented");
		},
		unschedule: async <FName extends Functions["name"]>(
			name: FName,
			id: string,
		) => {
			throw new Error("Not implemented");
		},
		findJobById: async <FName extends Functions["name"]>(
			name: FName,
			id: string,
		): ReturnType<typeof Job.fromId> => {
			return undefined;
		},
		reportError: (err: Error, ctx?: Record<string, unknown>) =>
			console.error(err, ctx),
		scheduleFor: overwrite?.scheduleFor
			? overwrite?.scheduleFor
			: async () => {},
		rescheduleNextDay: overwrite?.rescheduleNextDay
			? overwrite?.rescheduleNextDay
			: async () => {},
		triggerFunctions: async <FName extends Functions["name"]>(
			name: FName,
			jobs: {
				data: Extract<Functions, { name: FName }>["payload"];
				opts?: TriggerFunctionOpts;
			}[],
		) => {
			const fn = overwrite?.fnMocks?.[name];

			if (typeof fn !== "function") {
				throw new Error(`Function ${name} not found in mocks`);
			}

			await Promise.all(
				jobs.map(async ({ data }) =>
					fn(data, {
						...deps,
						...buildTestHelpers({ deps, overwrite }),
					}),
				),
			);
		},
		callFunction: async <FName extends Functions["name"]>(
			name: FName,
			payload: Extract<Functions, { name: FName }>["payload"],
			_?: CallFunctionOpts,
		) => {
			const fn = overwrite?.fnMocks?.[name];

			if (typeof fn !== "function") {
				throw new Error(`Function ${name} not found in mocks`);
			}
			return await fn(payload, {
				...deps,
				...buildTestHelpers({ deps, overwrite }),
			});
		},
		triggerFunction: async <FName extends Functions["name"]>(
			name: FName,
			payload: Extract<Functions, { name: FName }>["payload"],
			_?: CallFunctionOpts,
		) => {
			const fn = overwrite?.fnMocks?.[name];

			if (typeof fn !== "function") {
				throw new Error(`Function ${name} not found in mocks`);
			}

			await fn(payload, {
				...deps,
				...buildTestHelpers({ deps, overwrite }),
			});
		},
		logger: overwrite?.logger ? overwrite.logger : new Logger(),
	};
};
