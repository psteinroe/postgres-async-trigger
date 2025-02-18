import { FfmpegPayload } from "./payload";
import { FunctionDefinition } from "../types";

export type FfmpegVideoToMp4Function = FunctionDefinition<
	"ffmpeg/video-to-mp4",
	FfmpegPayload,
	{ modified: boolean }
>;
