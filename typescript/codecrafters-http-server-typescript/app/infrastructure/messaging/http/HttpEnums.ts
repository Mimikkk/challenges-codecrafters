export const enum HttpVersion {
  Version11 = "HTTP/1.1",
}

export const enum HttpMethod {
  Get = "GET",
  Post = "POST",
}

export const enum HttpStatus {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  NotFound = 404,
  Timeout = 408,
  ServiceUnavailable = 503,
}

export const HttpStatusReason: Record<HttpStatus, string> = {
  [HttpStatus.Ok]: "OK",
  [HttpStatus.Created]: "Created",
  [HttpStatus.BadRequest]: "Bad Request",
  [HttpStatus.NotFound]: "Not Found",
  [HttpStatus.Timeout]: "Timeout",
  [HttpStatus.ServiceUnavailable]: "Service Unavailable",
};

export type HeadersRecord = Record<string, string | number>;
