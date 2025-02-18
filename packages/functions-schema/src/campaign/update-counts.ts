import { FunctionDefinition } from "../types";

export type UpdateCampaignCountsPayload = {
	campaignId: string;
	organisationId: string;
};

export type UpdateCampaignCountsFunction = FunctionDefinition<
	"campaign/update-counts",
	UpdateCampaignCountsPayload
>;
