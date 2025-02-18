import type { Env } from "../env";
import type { TypedDependencyBuilder } from "./types";

export const env: TypedDependencyBuilder<Env> = (e) => {
	return e;
};
