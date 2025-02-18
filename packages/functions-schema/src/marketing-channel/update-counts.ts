import { FunctionDefinition } from "../types";

export type UpdateMarketingChannelCountsPayload = {
	marketingChannelId: string;
	organisationId: string;
};

export type UpdateMarketingChannelCountsFunction = FunctionDefinition<
	"marketing-channel/update-counts",
	UpdateMarketingChannelCountsPayload
>;
