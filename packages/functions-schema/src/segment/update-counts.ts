import { FunctionDefinition } from "../types";

export type UpdateSegmentCountsPayload = { segmentId: string };

export type UpdateSegmentCountsFunction = FunctionDefinition<
	"segment/update-counts",
	UpdateSegmentCountsPayload
>;
