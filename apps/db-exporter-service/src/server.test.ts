import { describe, it, expect } from "vitest";

import { ExporterServer } from "./ExporterServer";
import { buildServer } from "./server";

describe("server", async () => {
	let server: ExporterServer;

	it("should start", async () => {
		server = await buildServer();

		await server.listen({ port: 3000 });

		expect(server).toBeDefined();

		const res = await fetch("http://localhost:3000/health");

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			status: "OK",
		});

		await server.close();
	});
});
