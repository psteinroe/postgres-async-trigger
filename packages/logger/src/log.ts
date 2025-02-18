export interface ILog {
	message: string;
	error?: string;
	level: string;
	timestamp: number;
	[key: string]: unknown;
}
