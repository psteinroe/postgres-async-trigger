import { CheckIfSendoutIsDoneFunction } from "./check-if-done";
import { ScheduleMessageFunction } from "./schedule-message";

export type SendoutFunctions =
	| CheckIfSendoutIsDoneFunction
	| ScheduleMessageFunction;
