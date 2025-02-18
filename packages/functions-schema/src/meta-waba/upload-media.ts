import { FileObject } from "@supabase/storage-js";

import { FunctionDefinition } from "../types";

export type UploadMetaWabaMediaPayload = {
	file: FileObject;
	accessToken: string;
	phoneNumberId: string;
};

export type UploadMetaWabaMediaFunction = FunctionDefinition<
	"meta-waba/upload-media",
	UploadMetaWabaMediaPayload,
	{ mediaId: string }
>;
