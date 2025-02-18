import { FfmpegPayload } from "./payload";
import { FunctionDefinition } from "../types";

export type FfmpegEnsureVideoEncodingFunction = FunctionDefinition<
	"ffmpeg/ensure-video-encoding",
	FfmpegPayload,
	{ modified: boolean }
>;
