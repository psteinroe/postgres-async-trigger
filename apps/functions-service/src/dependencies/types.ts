import type { Env } from "../env";

export type TypedDependencyBuilder<D> = (envs: Env) => D;
