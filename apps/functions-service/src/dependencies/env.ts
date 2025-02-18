import { TypedDependencyBuilder } from "./types";
import { Env } from "../env";

export const env: TypedDependencyBuilder<Env> = (e) => {
	return e;
};
