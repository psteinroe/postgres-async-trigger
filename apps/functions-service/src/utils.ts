import type { Functions } from "@pg-async-trigger/functions-schema";
import {
	type Helpers,
	type OverwriteHelpers,
	buildTestHelpers,
} from "@pg-async-trigger/functions-server";

import { type Dependencies, buildTestDependencies } from "./dependencies";

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
