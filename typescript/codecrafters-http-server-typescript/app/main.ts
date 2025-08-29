import { createServer, type Socket } from "node:net";
import { HttpRequest } from "./infrastructure/messaging/http/HttpRequest.ts";
import { HttpResponses } from "./infrastructure/messaging/http/HttpResponses.ts";

import type { HttpResponse } from "./infrastructure/messaging/http/HttpResponse.ts";
import { router } from "./infrastructure/messaging/http/HttpRouter.ts";
import { routes } from "./presentation/routing/http/HttpRoutes.ts";
import { ServerConfigurtaion } from "./ServerConfigurtaion.ts";

const sendSocketHttpResponse = (socket: Socket, response: HttpResponse) => {
  response.toSocket(socket);
};

type Encoder = (response: HttpResponse) => HttpResponse;

const encodeGzip: Encoder = (response) => {
  response.headers["Content-Encoding"] = "gzip";

  return response;
};

const encoders = new Map<string, Encoder>([
  ["gzip", encodeGzip],
]);

const maybeEncode = (response: HttpResponse, encodings: string[]) => {
  for (let i = 0; i < encodings.length; ++i) {
    const encoder = encoders.get(encodings[i]);
    if (!encoder) continue;

    return encoder(response);
  }
};

const maybeClose = (response: HttpResponse, shouldClose: boolean) => {
  if (!shouldClose) return;
  response.headers["Connection"] = "close";
};

const server = createServer();
server.on("connection", (socket) => {
  socket.on("data", (data) => {
    const request = HttpRequest.fromBuffer(data);

    const response = router(request, routes);

    const encodings = (request.headers["Accept-Encoding"] ?? "").toString().split(", ");
    maybeEncode(response, encodings);
    const shouldClose = request.headers["Connection"] === "close";
    maybeClose(response, shouldClose);

    sendSocketHttpResponse(socket, response);
    if (shouldClose) socket.end();
  }).on("close", () => {
    socket.end();
    console.log("socket closed.");
  }).on("timeout", () => {
    console.log("connection timed-out.");
    const response = HttpResponses.timeout();

    sendSocketHttpResponse(socket, response);
  }).setTimeout(500);
}).listen({ host: ServerConfigurtaion.host, port: ServerConfigurtaion.port });
