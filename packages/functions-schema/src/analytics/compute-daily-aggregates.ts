import { FunctionDefinition } from "../types";

export type ComputeDailyAggregatesPayload = {
	organisationId: string;
};

export type ComputeDailyAggregatesFunction = FunctionDefinition<
	"analytics/compute-daily-aggregates",
	ComputeDailyAggregatesPayload
>;
