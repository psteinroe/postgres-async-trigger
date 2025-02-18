import postgres from "postgres";

import type { TypedDependencyBuilder } from "./types";

export const sql: TypedDependencyBuilder<ReturnType<typeof postgres>> = (e) => {
	return postgres(e.DB_CONNECTION_STRING);
};
