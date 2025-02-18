export type FunctionDefinition<
	Name extends string = string,
	Payload extends object | null = object | null,
	Returns extends object | void = object | void,
> = {
	name: Name;
	payload: Payload;
	returns: Returns;
};
