import { AsyncTriggerDestination } from "./AsyncTriggerDestination";
import { ExporterServer } from "./ExporterServer";
import { InngestDestination } from "./InngestDestination";
import { envSchema } from "./env";

export const buildServer = async () => {
	const env = envSchema.parse(process.env);

	const server = new ExporterServer({
		onError: (err, ctx) => console.error(err),
		destinations: [
			new InngestDestination({
				id: "job-exporter-service",
				eventKey: env.INNGEST_EVENT_KEY,
			}),
			new AsyncTriggerDestination({
				host: env.REDIS_HOST,
				port: env.REDIS_PORT,
				username: env.REDIS_USERNAME,
				password: env.REDIS_PASSWORD,
				tls: {},
			}),
		],
		redis: {
			host: env.REDIS_HOST,
			port: env.REDIS_PORT,
			username: env.REDIS_USERNAME,
			password: env.REDIS_PASSWORD,
			tls: {},
		},
		runner: {
			preset: {
				worker: {
					connectionString: env.DB_CONNECTION_STRING,
					schema: "graphile_worker",
					concurrentJobs: 10,
					// pollInterval is only relevant for scheduled jobs (after now()) and retries
					pollInterval: 120_000,
					maxPoolSize: 10,
					localQueue: { size: 500 },
					completeJobBatchDelay: 0, // milliseconds
					failJobBatchDelay: 0, // milliseconds
				},
			},
		},
	});

	server.registerShutdownHooks();

	return server;
};
