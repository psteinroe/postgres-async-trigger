import { Tables } from "@pg-async-trigger/supabase";

import { FunctionDefinition } from "../types";

export type CompleteNodeExecutionPayload = {
	nodeExecutionId: string;
	properties?: Partial<
		Pick<
			Tables<"journey_node_execution">,
			"timeout_reached" | "relative_duration_seconds"
		>
	>;
};

export type CompleteNodeExecutionFunction = FunctionDefinition<
	"journeys/complete-node-execution",
	CompleteNodeExecutionPayload
>;
