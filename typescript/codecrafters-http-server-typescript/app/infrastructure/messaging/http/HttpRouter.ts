import type { HttpMethod } from "./HttpEnums.ts";
import type { HttpRequest } from "./HttpRequest.ts";
import type { HttpResponse } from "./HttpResponse.ts";
import { HttpResponses } from "./HttpResponses.ts";

export type ParamParseRecord = Record<string, QueryParse<any>>;

type ParamRecordFromParamParseRecord<T extends ParamParseRecord> = {
  [key in keyof T]: ReturnType<T[key]>;
};

export interface RouteOptions<TParams extends ParamParseRecord = ParamParseRecord> {
  method: HttpMethod;
  path: string;
  params?: TParams;
  handle: (request: HttpRequest, params: ParamRecordFromParamParseRecord<TParams>) => HttpResponse;
}

export interface Route<TParams extends ParamParseRecord = ParamParseRecord> {
  method: HttpMethod;
  path: string;
  params: TParams;
  handle: (request: HttpRequest) => HttpResponse;
  matches: (request: HttpRequest) => boolean;
}

export type QueryParse<T = any> = (value: string) => T;

export const parseString: QueryParse<string> = (value) => value;

export const defineRoute = <TParams extends ParamParseRecord = {}>(
  { handle: handler, method, params, path }: RouteOptions<TParams>,
): Route<TParams> => {
  const parts = path.split("/");
  const expectedParams: {
    type: "dynamic" | "static";
    value: string;
  }[] = [];

  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];

    if (part[0] === "{" && part[part.length - 1] === "}") {
      expectedParams.push({ value: part.substring(1, part.length - 1), type: "dynamic" });
    } else {
      expectedParams.push({ value: part, type: "static" });
    }
  }

  return ({
    handle: (request) => {
      const parsedParams: ParamRecordFromParamParseRecord<TParams> = {};
      const parts = request.pathname.split("/");

      for (let i = 0, it = expectedParams.length; i < it; ++i) {
        const expected = expectedParams[i];
        const part = parts[i];

        if (expected.type === "dynamic") {
          parsedParams[expected.value] = params[expected.value](part);
        }
      }

      return handler(request, parsedParams);
    },
    matches: (request) => {
      if (request.method !== method) {
        return false;
      }

      const parts = request.pathname.split("/");
      if (expectedParams.length !== parts.length) {
        return false;
      }

      for (let i = 0, it = expectedParams.length; i < it; ++i) {
        const expected = expectedParams[i];
        const part = parts[i];

        if (expected.type === "static" && expected.value !== part) {
          return false;
        }
      }

      return true;
    },
    params: params ?? {} as TParams,
    method,
    path,
  });
};

export const defineRoutes = <const R extends Route<any>[]>(...routes: R): R => routes;

const matches = (request: HttpRequest, routes: Route[]): Route | undefined =>
  routes.find((route) => route.matches(request));

export const router = (request: HttpRequest, routes: Route[]): HttpResponse => {
  const route = matches(request, routes);

  if (route) {
    return route.handle(request);
  }

  return HttpResponses.notfound();
};
