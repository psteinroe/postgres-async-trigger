import postgres from "postgres";

import { TypedDependencyBuilder } from "./types";

export const sql: TypedDependencyBuilder<ReturnType<typeof postgres>> = (e) => {
	return postgres(e.DB_CONNECTION_STRING);
};
