import { FfmpegPayload } from "./payload";
import { FunctionDefinition } from "../types";

export type FfmpegGenerateVideoThumbnailFunction = FunctionDefinition<
	"ffmpeg/generate-video-thumbnail",
	FfmpegPayload,
	{ path: string }
>;
