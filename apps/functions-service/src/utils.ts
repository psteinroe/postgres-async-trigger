import { Functions } from "@pg-async-trigger/functions-schema";
import {
	OverwriteHelpers,
	buildTestHelpers,
	Helpers,
} from "@pg-async-trigger/functions-server";

import { Dependencies, buildTestDependencies } from "./dependencies";

export const buildTestDependenciesWithHelpers = (
	overwrite?: OverwriteHelpers<Functions, Dependencies> & {
		deps?: Partial<Dependencies>;
	},
): Dependencies & Helpers<Functions> => {
	const deps = buildTestDependencies(overwrite?.deps);
	return {
		...buildTestHelpers({ deps, overwrite: overwrite as any }),
		...deps,
	};
};

export function retryWithExponentialBackoff<R>(
	fn: () => Promise<R>,
	maxAttempts = 5,
	baseDelayMs = 1000,
) {
	let attempt = 1;

	const execute = async (): Promise<R> => {
		try {
			return await fn();
		} catch (error) {
			if (attempt >= maxAttempts) {
				throw error;
			}

			const delayMs = baseDelayMs * 2 ** attempt;
			console.log(`Retry attempt ${attempt} after ${delayMs}ms`);
			await new Promise((resolve) => setTimeout(resolve, delayMs));

			attempt++;
			return execute();
		}
	};

	return execute();
}
