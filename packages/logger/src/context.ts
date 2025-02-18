import stackTrace, { type StackFrame } from "stack-trace";

import type { Logger } from "./logger";

/**
 * Determines the file name and the line number from which the log
 * was initiated (if we're able to tell).
 *
 * @returns Context The caller's filename and the line number
 */
export function getStackContext(logtail: Logger): Record<string, any> {
	const stackFrame = getCallingFrame(logtail);
	if (stackFrame === null) return {};

	return {
		runtime: {
			file: stackFrame.getFileName(),
			type: stackFrame.getTypeName(),
			method: stackFrame.getMethodName(),
			function: stackFrame.getFunctionName(),
			line: stackFrame.getLineNumber(),
			column: stackFrame.getColumnNumber(),
		},
	};
}

function getCallingFrame(logtail: Logger): StackFrame | null {
	for (const fn of [logtail.warn, logtail.error, logtail.info, logtail.debug]) {
		const stack = stackTrace.get(fn as any);
		if (stack?.length > 0) return getRelevantStackFrame(stack);
	}

	return null;
}

function getRelevantStackFrame(frames: StackFrame[]): StackFrame {
	const reversedFrames = frames.reverse();
	const index = reversedFrames.findIndex(
		(frame) => frame.getTypeName() === "Logger",
	);

	if (index > 0) return reversedFrames[index - 1];

	return frames[0];
}
