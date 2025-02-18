import { type ILogger, Logger } from "@pg-async-trigger/logger";

import type { TypedDependencyBuilder } from "./types";

export const logger: TypedDependencyBuilder<ILogger> = () => {
	return new Logger();
};
