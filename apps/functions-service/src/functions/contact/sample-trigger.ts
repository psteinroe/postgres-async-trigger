import { builder } from "../../builder";

export default builder
	.createTrigger("contact/sample-trigger")
	.on("contact")
	.withColumns("first_name,last_name")
	.afterUpdate("new.first_name is distinct from old.first_name")
	.execute(
		async (
			payload,
			{
				supabase,
				logger,
				sql,
				triggerFunction,
				triggerFunctions,
				schedule,
				scheduleFor,
			},
		) => {
			// typed payload
			logger.info("First Name Changed", {
				from: payload.old.first_name,
				to: payload.new.first_name,
			});
			// current role + user id
			logger.info("Updated by", payload.auth);
			// supabase client
			await supabase.from("contact").select("*");
			// run raw sql
			await sql`select 1`;
			// trigger other function(s) in a typesafe way
			await triggerFunction("sample", { sample: "trigger" });
			await triggerFunctions("sample", [
				{ data: { sample: "trigger" } },
				{ data: { sample: "trigger2" } },
			]);
			// schedule a function
			await schedule(
				"sample",
				"myscheduledjob",
				{ pattern: "* * * * *" },
				{ sample: "cron" },
			);
			// reschedule the current job for tomorrow
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			scheduleFor(tomorrow);
		},
		{ concurrency: 300 },
	);
