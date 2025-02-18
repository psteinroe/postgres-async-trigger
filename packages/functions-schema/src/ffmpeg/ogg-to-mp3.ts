import { FfmpegPayload } from "./payload";
import { FunctionDefinition } from "../types";

export type FfmpegOggToMp3Function = FunctionDefinition<
	"ffmpeg/ogg-to-mp3",
	FfmpegPayload,
	{ modified: boolean }
>;
