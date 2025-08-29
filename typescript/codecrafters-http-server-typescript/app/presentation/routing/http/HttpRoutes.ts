import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { sanitize } from "../../../common.ts";
import { HttpMethod, HttpStatus } from "../../../infrastructure/messaging/http/HttpEnums.ts";
import { HttpResponse } from "../../../infrastructure/messaging/http/HttpResponse.ts";
import { HttpResponses } from "../../../infrastructure/messaging/http/HttpResponses.ts";
import { defineRoute, defineRoutes, parseString } from "../../../infrastructure/messaging/http/HttpRouter.ts";
import { ServerConfigurtaion } from "../../../ServerConfigurtaion.ts";

export const routes = defineRoutes(
  defineRoute({
    method: HttpMethod.Get,
    path: "",
    handle: HttpResponses.ok,
  }),
  defineRoute({
    method: HttpMethod.Get,
    path: "/echo/{value}",
    params: { value: parseString },
    handle: (_, { value }) => {
      return HttpResponse.create({
        status: HttpStatus.Ok,
        content: value,
      });
    },
  }),
  defineRoute({
    method: HttpMethod.Get,
    path: "/user-agent",
    handle: ({ headers }) => {
      const agent = headers["User-Agent"];

      if (agent === undefined) {
        return HttpResponses.badrequest();
      }

      return HttpResponse.create({
        status: HttpStatus.Ok,
        content: agent,
      });
    },
  }),
  defineRoute({
    method: HttpMethod.Get,
    path: "/files/{filename}",
    params: { filename: parseString },
    handle: (_, { filename }) => {
      const feature = ServerConfigurtaion.features.files;
      if (!feature.enabled) {
        return HttpResponse.create({
          status: HttpStatus.ServiceUnavailable,
          content: { message: "Files feature is not enabled on this server.", status: HttpStatus.ServiceUnavailable },
        });
      }

      const url = sanitize(feature.url + "/" + filename);
      if (existsSync(url)) {
        const file = readFileSync(url);

        return HttpResponse.create({ status: HttpStatus.Ok, content: file });
      }

      return HttpResponses.notfound();
    },
  }),
  defineRoute({
    method: HttpMethod.Post,
    path: "/files/{filename}",
    params: { filename: parseString },
    handle: (request, { filename }) => {
      const feature = ServerConfigurtaion.features.files;

      if (!feature.enabled) {
        return HttpResponse.create({
          status: HttpStatus.ServiceUnavailable,
          content: { message: "Files feature is not enabled on this server.", status: HttpStatus.ServiceUnavailable },
        });
      }

      const url = sanitize(feature.url + "/" + filename);

      writeFileSync(url, request.content);

      return HttpResponse.create({ status: HttpStatus.Created });
    },
  }),
);
