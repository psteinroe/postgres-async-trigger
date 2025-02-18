import { FunctionsServer } from "@pg-async-trigger/functions-server";
import { describe, it, expect, afterAll } from "vitest";

import { buildServer } from "./server";

describe("server", async () => {
	let server: FunctionsServer<any, any>;

	afterAll(async () => {
		if (server) {
			await server.close();
		}
	});

	it("should start", { timeout: 20000 }, async () => {
		server = await buildServer();

		await server.listen({ port: 3003 });

		expect(server.functions()).toMatchSnapshot();

		expect(server).toBeDefined();
		expect(server.triggers).toBeDefined();

		const res = await fetch("http://localhost:3003/health");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			status: "OK",
			workersRunning: true,
		});
	});
});
