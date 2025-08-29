import type { QueryParse } from "./HttpRouter.ts";

export const parseString: QueryParse<string> = (value) => value;
