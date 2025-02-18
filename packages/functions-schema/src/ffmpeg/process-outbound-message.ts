import { Database } from "@pg-async-trigger/supabase";
import { FileObject } from "@supabase/storage-js";

import { FunctionDefinition } from "../types";

export type ProcessOutboundMessagePayload = {
	message: Pick<
		Database["public"]["Tables"]["message"]["Row"],
		"id" | "organisation_id" | "template_id" | "sendout_id"
	>;
	files: FileObject[] | null | undefined;
};

export type FfmpegAudioToMp4Function = FunctionDefinition<
	"ffmpeg/process-outbound-message",
	ProcessOutboundMessagePayload
>;
