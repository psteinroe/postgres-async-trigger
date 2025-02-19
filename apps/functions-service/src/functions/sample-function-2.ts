import { builder } from "../builder";

export default builder.createFunction(
	"sample-2",
	async (_payload, {}) => {
		console.log("function called");
	},
	{ concurrency: 300 },
);
