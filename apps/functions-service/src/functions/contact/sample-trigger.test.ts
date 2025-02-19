import { type Functions } from "@pg-async-trigger/functions-schema";
import { FunctionsTestApp } from "@pg-async-trigger/functions-test";
import { describe, it, beforeAll, afterAll } from "bun:test";

import { type Dependencies } from "../../dependencies";
import { buildTestDependenciesWithHelpers } from "../../utils";
import sampleTrigger from "./sample-trigger";

describe("sample-trigger", async () => {
	let testApp: FunctionsTestApp<Dependencies, Functions>;

	beforeAll(async () => {
		testApp = new FunctionsTestApp("sample_trigger", {
			dependencies: buildTestDependenciesWithHelpers(),
			databaseConnectionString: process.env.DB_CONNECTION_STRING as string,
		});

		await testApp.setSubscriptions([sampleTrigger]);
	});

	afterAll(async () => {
		if (testApp) await testApp.destroy();
	});

	it("should run", async () => {
		const { data } = await testApp.opts.dependencies.supabase
			.from("contact")
			.insert({
				first_name: "John",
				last_name: "Doe",
			})
			.select("id")
			.single()
			.throwOnError();

		const contactId = data!.id;

		await testApp.runTrigger(sampleTrigger);

		await testApp.opts.dependencies.supabase
			.from("contact")
			.update({ first_name: "Jane" })
			.eq("id", contactId)
			.throwOnError();

		await testApp.runTrigger(sampleTrigger);
	});
});
