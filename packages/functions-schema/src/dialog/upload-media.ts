import { FileObject } from "@supabase/storage-js";

import { FunctionDefinition } from "../types";

export type UploadDialogMediaPayload = {
	file: FileObject;
	channelId: string;
};

export type UploadDialogMediaFunction = FunctionDefinition<
	"dialog/upload-media",
	UploadDialogMediaPayload,
	{ mediaId: string }
>;
