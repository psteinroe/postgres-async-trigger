import { CreateCampaignSendoutFunction } from "./create-sendout";
import { UpdateCampaignCountsFunction } from "./update-counts";

export type CampaignFunctions =
	| UpdateCampaignCountsFunction
	| CreateCampaignSendoutFunction;
