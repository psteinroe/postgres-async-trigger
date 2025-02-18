import { FunctionDefinition } from "../types";

export type DeleteEntityPayload = {
	table: string;
	pkValue: string;
	level?: number;
};

export type DeleteEntityFunction = FunctionDefinition<
	"delete-entity",
	DeleteEntityPayload
>;
