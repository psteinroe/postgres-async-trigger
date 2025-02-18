import { FfmpegAudioToMp4Function } from "./audio-to-mp4";
import { FfmpegEnsureVideoEncodingFunction } from "./ensure-video-encoding";
import { FfmpegGenerateVideoThumbnailFunction } from "./generate-video-thumbnail";
import { FfmpegOggToMp3Function } from "./ogg-to-mp3";
import { FfmpegReduceImageSizeFunction } from "./reduce-image-size";
import { FfmpegVideoToMp4Function } from "./video-to-mp4";

export type FfmpegFunctions =
	| FfmpegAudioToMp4Function
	| FfmpegVideoToMp4Function
	| FfmpegEnsureVideoEncodingFunction
	| FfmpegOggToMp3Function
	| FfmpegGenerateVideoThumbnailFunction
	| FfmpegReduceImageSizeFunction;
