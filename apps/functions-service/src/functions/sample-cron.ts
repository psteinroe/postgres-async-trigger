import { builder } from "../builder";

export default builder.createRepeated(
	"repeated-sample",
	async (_payload, _dependencies) => {
		console.log("Repeated Sample Function");
	},
	{ cron: "* * * * *", concurrency: 300 },
);
