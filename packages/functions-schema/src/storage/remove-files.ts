import { FunctionDefinition } from "../types";

export type RemoveFilesPayload = {
	bucketId: string;
	paths: string[];
};

export type RemoveFilesFunction = FunctionDefinition<
	"storage/remove-files",
	RemoveFilesPayload
>;
