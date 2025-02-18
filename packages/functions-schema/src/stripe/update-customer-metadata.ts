import { FunctionDefinition } from "../types";

export type UpdateCustomerMetadataPayload = {
	stripe_customer_id: string;
	metadata: Record<string, string>;
};

export type UpdateCustomerMetadataFunction = FunctionDefinition<
	"stripe/update-customer-metadata",
	UpdateCustomerMetadataPayload
>;
