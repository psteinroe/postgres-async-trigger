import { FunctionDefinition } from "@pg-async-trigger/functions-schema";

export type MemoryStoreConfig<TValue> = {
	persistentMap: Map<string, TValue>;
};

export type FunctionCacheMap = Map<string, { expires: number; data: object }>;

export type FunctionCacheEntry<Data extends object | void> = {
	data: Data;
	staleUntil: number;
};

export class FunctionCache<
	Functions extends FunctionDefinition = FunctionDefinition,
> {
	private readonly state: FunctionCacheMap = new Map();

	private buildCacheKey<N extends Functions["name"]>(
		fnName: N,
		jobId: string,
	): string {
		return [fnName, jobId].join("::");
	}

	public get<N extends Functions["name"]>(
		fnName: N,
		jobId: string,
	): Extract<Functions, { name: N }>["returns"] | null {
		const value = this.state.get(this.buildCacheKey(fnName, jobId));
		if (!value) {
			return null;
		}
		if (value.expires <= Date.now()) {
			this.remove(fnName, jobId);
			return null;
		}
		return value.data;
	}

	public set<N extends Functions["name"]>(
		fnName: N,
		jobId: string,
		entry: FunctionCacheEntry<Extract<Functions, { name: N }>["returns"]>,
	): void {
		if (!entry.data) throw new Error("entry.data is required");

		this.state.set(this.buildCacheKey(fnName, jobId), {
			expires: entry.staleUntil,
			data: entry.data,
		});
	}

	public remove<N extends Functions["name"]>(fnName: N, jobId: string): void {
		this.state.delete(this.buildCacheKey(fnName, jobId));
	}
}
