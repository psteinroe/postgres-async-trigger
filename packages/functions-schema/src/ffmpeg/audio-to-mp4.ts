import { FfmpegPayload } from "./payload";
import { FunctionDefinition } from "../types";

export type FfmpegAudioToMp4Function = FunctionDefinition<
	"ffmpeg/audio-to-mp4",
	FfmpegPayload,
	{ modified: boolean }
>;
