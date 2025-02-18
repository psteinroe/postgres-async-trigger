import type { FunctionDefinition } from "@pg-async-trigger/functions-schema";
import type { ILogger } from "@pg-async-trigger/logger";
import type { Job, RepeatOptions } from "bullmq";

export type WorkerServerLogger = ILogger;

export type Handler<
	Payload = any,
	Dependencies = any,
	Result = any,
	Functions extends FunctionDefinition = FunctionDefinition,
> = (
	payload: Payload,
	dependencies: Dependencies & Helpers<Functions>,
) => Promise<Result>;

export type DependencyBuilder<E extends string, D> = (
	envs: {
		[K in E]: string;
	},
) => D;

export type CallFunctionOpts = {
	id?: string;
	dedupeForDays?: number;
};

export type TriggerFunctionOpts = CallFunctionOpts & {
	delay?: number;
};

export type Helpers<Functions extends FunctionDefinition> = {
	attemptsStarted: number;
	isLastAttempt: boolean;
	isFirstAttempt: boolean;
	schedule<FName extends Functions["name"]>(
		name: FName,
		id: string,
		opts: Omit<RepeatOptions, "key">,
		payload: Extract<Functions, { name: FName }>["payload"],
	): Promise<void>;
	unschedule<FName extends Functions["name"]>(
		name: FName,
		id: string,
	): Promise<void>;
	reportError(err: Error, ctx?: Record<string, unknown>): void;
	scheduleFor(ts: Date): Promise<void>;
	rescheduleNextDay(): Promise<void>;
	findJobById: <FName extends Functions["name"]>(
		name: FName,
		id: string,
	) => ReturnType<typeof Job.fromId>;
	callFunction: <FName extends Functions["name"]>(
		name: FName,
		payload: Extract<Functions, { name: FName }>["payload"],
		opts?: CallFunctionOpts,
	) => Promise<Extract<Functions, { name: FName }>["returns"]>;
	triggerFunctions: <FName extends Functions["name"]>(
		name: FName,
		jobs: {
			data: Extract<Functions, { name: FName }>["payload"];
			opts?: TriggerFunctionOpts;
		}[],
	) => Promise<void>;
	triggerFunction: <FName extends Functions["name"]>(
		name: FName,
		payload: Extract<Functions, { name: FName }>["payload"],
		opts?: TriggerFunctionOpts,
	) => Promise<void>;
	logger: WorkerServerLogger;
};

export type AsyncTrigger = {
	name: string;
	operation: TriggerOperation;
	schema_name: string;
	table_name: string;
	when_clause: string;
	column_names: string[];
};

export type TriggerOperation = "INSERT" | "UPDATE" | "DELETE";

export type TriggerConfig = {
	table: string;
	columns: string;
	ops: { [K in TriggerOperation]?: string };
	extra?: {
		query: string;
		when?: string;
		describe: Record<string, DataTypes>;
	};
};

export const SAMPLE_DATA = {
	text: "'Hello, world!'",
	uuid: "'f64b1e32-9e9c-4ed4-a343-45297bd3bcdf'::uuid",
	channel_status: "'active'::channel_status",
	provider_type: "'meta-waba'::provider_type",
	boolean: "true",
};

export type DataTypes = keyof typeof SAMPLE_DATA;

export type TriggerPayload<
	Operations extends TriggerOperation,
	T extends Record<string, unknown>,
	ExtraContext extends Record<string, any> = never,
> = {
	tg_op: Operations;
	new: Operations extends "INSERT" | "UPDATE"
		? Operations extends "DELETE"
			? T | null
			: T
		: null;
	old: Operations extends "DELETE" | "UPDATE"
		? Operations extends "INSERT"
			? T | null
			: T
		: null;
	auth: AuthContext;
	execution: ExecutionContext | null;
	timestamp: number;
	extra: [ExtraContext] extends [never] ? null : ExtraContext;
};

export type AuthContext =
	| ContactAuthContext
	| TokenAuthContext
	| UserAuthContext
	| EmployeeAuthContext
	| ServiceRoleContext;

export type ServiceRoleContext = {
	role: "service_role";
};

export const isServiceRoleContext = (c: AuthContext): c is ServiceRoleContext =>
	c.role === "service_role";

export type ContactAuthContext = {
	role: "contactauthed";
	contact_id: string;
	organisation_id: string;
};

export const isContactAuthContext = (c: AuthContext): c is ContactAuthContext =>
	c.role === "contactauthed";

export type TokenAuthContext = {
	role: "tokenauthed";
	token_id: string;
	organisation_id: string;
};

export const isTokenAuthContext = (c: AuthContext): c is TokenAuthContext =>
	c.role === "tokenauthed";

export type UserAuthContext = {
	role: "authenticated";
	user_id: string;
};

export const isUserAuthContext = (c: AuthContext): c is UserAuthContext =>
	c.role === "authenticated";

export type EmployeeAuthContext = UserAuthContext & {
	employee_id: string;
	organisation_id: string;
};

export const isEmployeeAuthContext = (
	c: AuthContext,
): c is EmployeeAuthContext => c.role === "authenticated" && "employee_id" in c;

export type ExecutionContext = RuleExecutionContext;

export type RuleExecutionContext = {
	type: "rule";
	rule_id: string;
};
