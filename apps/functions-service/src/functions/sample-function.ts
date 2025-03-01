import { builder } from "../builder";

export default builder.createFunction(
	"sample",
	async (payload, {}) => {
		return { returns: payload.sample };
	},
	{ concurrency: 300 },
);
