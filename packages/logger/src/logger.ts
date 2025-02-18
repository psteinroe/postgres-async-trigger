import { getStackContext } from "./context";
import type { ILog } from "./log";

export interface IBaseLogger {
	info(msg: string, data?: Record<string, unknown>): void;
	warn(msg: string, data?: Record<string, unknown>): void;
	error(msg: string | Error | unknown, data?: Record<string, unknown>): void;
	debug(msg: string, data?: Record<string, unknown>): void;
}

export interface ILogger extends IBaseLogger {
	child(metadata?: Record<string, unknown>): ILogger;
}

export type LoggerMetadata = Record<string, unknown> & {
	requestId?: string;
};

export class Logger implements ILogger {
	private metadata: LoggerMetadata = {};

	constructor(metadata?: LoggerMetadata) {
		this.metadata = metadata || {};
	}

	private async _log(
		message: string,
		level: string,
		data?: Record<string, unknown>,
	) {
		const log: ILog = {
			message,
			level: (data?.level as string) || level,
			timestamp: Date.now(),
			...this.metadata,
			...data,
			...getStackContext(this),
		};

		if (level === "error") {
			console.error(JSON.stringify(log));
		} else if (level === "warn") {
			console.warn(JSON.stringify(log));
		} else if (level === "info") {
			console.info(JSON.stringify(log));
		} else {
			console.log(JSON.stringify(log));
		}
	}

	info(msg: string, data?: Record<string, unknown>) {
		this._log(msg, "info", data);
	}

	warn(msg: string, data?: Record<string, unknown>) {
		this._log(msg, "warning", data);
	}

	error(msg: string | Error | unknown, data?: Record<string, unknown>) {
		let m = "";
		if (msg instanceof Error) {
			m = msg.message + (msg.stack ? `: ${msg.stack}` : "");
		} else if (typeof msg === "string") {
			m = msg;
		} else {
			m = JSON.stringify(msg);
		}
		this._log(m, "error", data);
	}

	debug(msg: string, data?: Record<string, unknown>) {
		this._log(msg, "debug", data);
	}

	child(metadata?: LoggerMetadata): Logger {
		return new Logger({
			...this.metadata,
			...metadata,
		});
	}
}
