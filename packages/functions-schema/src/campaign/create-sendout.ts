import { FunctionDefinition } from "../types";

export type CreateCampaignSendoutPayload = {
	campaignId: string;
};

export type CreateCampaignSendoutFunction = FunctionDefinition<
	"campaign/create-sendout",
	CreateCampaignSendoutPayload
>;
