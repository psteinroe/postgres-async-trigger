import { HandleNylasGrantDeletedFunction } from "./handle-grant-deleted";
import { HandleNylasGrantExpiredFunction } from "./handle-grant-expired";
import { HandleNylasGrantUpdatedFunction } from "./handle-grant-updated";
import { HandleNylasMessageCreatedFunction } from "./handle-message-created";
import { HandleNylasMessageOpenedFunction } from "./handle-message-opened";

export type NylasFunctions =
	| HandleNylasGrantDeletedFunction
	| HandleNylasGrantUpdatedFunction
	| HandleNylasGrantExpiredFunction
	| HandleNylasMessageCreatedFunction
	| HandleNylasMessageOpenedFunction;
