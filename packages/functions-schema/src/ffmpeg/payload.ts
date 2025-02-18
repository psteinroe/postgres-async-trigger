import { type FileObject } from "@supabase/storage-js";

export type FfmpegPayload = {
	file: Pick<FileObject, "id" | "name" | "bucket_id" | "metadata">;
};
