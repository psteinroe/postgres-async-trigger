import { IMessagePayload } from "@pg-async-trigger/integrations-meta";

import { FunctionDefinition } from "../types";

export type HandleMetaMessagingEventPayload = IMessagePayload;

export type HandleMetaMessagingEventFunction = FunctionDefinition<
	"meta/handle-messaging-event",
	HandleMetaMessagingEventPayload
>;
