import { Functions } from "@pg-async-trigger/functions-schema";
import { FunctionsServerFactory } from "@pg-async-trigger/functions-server";
import { Database } from "@pg-async-trigger/supabase";
import * as Sentry from "@sentry/node";

import buildDependencies from "./dependencies";
import { envSchema } from "./env";
import { analyticsFunctions } from "./functions/analytics";
import { campaignFunctions } from "./functions/campaign";
import { channelFunctions } from "./functions/channel";
import { commonFunctions } from "./functions/common";
import { contactFunctions } from "./functions/contact";
import { conversationFunctions } from "./functions/conversation";
import { dialogFunctions } from "./functions/dialog";
import { employeesFunctions } from "./functions/employees";
import { exportFunctions } from "./functions/export";
import { facebookFunctions } from "./functions/facebook";
import { ffmpegFunctions } from "./functions/ffmpeg";
import { formsFunctions } from "./functions/forms";
import { googleFunctions } from "./functions/google";
import heartbeat from "./functions/heartbeat";
import { importFunctions } from "./functions/import";
import { journeyFunctions } from "./functions/journeys";
import { marketingChannelFunctions } from "./functions/marketing-channel";
import { messagingFunctions } from "./functions/messaging";
import { metaFunctions } from "./functions/meta";
import { metaWabaFunctions } from "./functions/meta-waba";
import { novuFunctions } from "./functions/novu";
import { nylasFunctions } from "./functions/nylas";
import { posthogFunctions } from "./functions/posthog";
import { providerTemplateApprovalFunctions } from "./functions/provider-template-approval";
import { rulesFunctions } from "./functions/rules";
import { segmentFunctions } from "./functions/segment";
import { sendoutFunctions } from "./functions/sendout";
import { storageFunctions } from "./functions/storage";
import { stripeFunctions } from "./functions/stripe";
import { twilioFunctions } from "./functions/twilio";
import { webhookFunctions } from "./functions/webhooks";
import { mergeFunctions } from "./types";

export const buildServer = async () => {
	const server = await new FunctionsServerFactory<Database, Functions>(
		"FunctionsService",
		{
			onError: (e, ctx) =>
				process.env.SENTRY_DSN
					? Sentry.captureException(e, { extra: ctx })
					: console.error(e, ctx),
		},
	)
		.withEnv(envSchema)
		.withDependencies(buildDependencies)
		.serve(
			mergeFunctions([
				{
					functions: [],
					triggers: [],
					repeated: [heartbeat],
				},
				dialogFunctions,
				googleFunctions,
				metaFunctions,
				metaWabaFunctions,
				nylasFunctions,
				twilioFunctions,
				ffmpegFunctions,
				posthogFunctions,
				commonFunctions,
				webhookFunctions,
				employeesFunctions,
				facebookFunctions,
				exportFunctions,
				importFunctions,
				novuFunctions,
				rulesFunctions,
				stripeFunctions,
				storageFunctions,
				analyticsFunctions,
				messagingFunctions,
				campaignFunctions,
				segmentFunctions,
				marketingChannelFunctions,
				contactFunctions,
				providerTemplateApprovalFunctions,
				formsFunctions,
				sendoutFunctions,
				conversationFunctions,
				channelFunctions,
				journeyFunctions,
			]),
		);

	server.registerShutdownHooks();

	return server;
};
