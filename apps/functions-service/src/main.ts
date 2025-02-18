import { buildServer } from "./server";

async function start() {
	const port = process.env.PORT || 3000;

	const server = await buildServer();

	await server.listen({
		port: Number(port),
	});
}

start();
