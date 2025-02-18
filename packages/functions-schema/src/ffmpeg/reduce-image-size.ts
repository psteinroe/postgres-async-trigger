import { FfmpegPayload } from "./payload";
import { FunctionDefinition } from "../types";

export type FfmpegReduceImageSizeFunction = FunctionDefinition<
	"ffmpeg/reduce-image-size",
	FfmpegPayload & { maxFileSize: number },
	{ modified: boolean }
>;
