import type { Buffer } from "node:buffer";
import { crlf } from "../../../common.ts";
import type { HeadersRecord, HttpMethod, HttpVersion } from "./HttpEnums.ts";

export interface IHttpRequest {
  version: HttpVersion;
  method: HttpMethod;
  pathname: string;
  headers: HeadersRecord;
  content: any | null;
}

export interface HttpRequestOptions {
  version: HttpVersion;
  method: HttpMethod;
  pathname: string;
  headers?: HeadersRecord;
  content?: any;
}

export class HttpRequest implements IHttpRequest {
  static create({ version, method, pathname, headers = {}, content }: HttpRequestOptions): HttpRequest {
    return new HttpRequest(version, method, pathname, headers, content ?? null);
  }

  private constructor(
    public readonly version: HttpVersion,
    public readonly method: HttpMethod,
    public readonly pathname: string,
    public readonly headers: HeadersRecord,
    public readonly content: any | null,
  ) {}

  static fromBuffer(buffer: Buffer<ArrayBufferLike>) {
    return HttpRequest.fromString(buffer.toString());
  }
  static fromString(string: string) {
    const lines = string.split(crlf);

    const [method, pathname, version] = lines[0].split(" ") as [HttpVersion, string, HttpMethod];

    const headers: HeadersRecord = {};
    for (let i = 1; i < lines.length - 2; ++i) {
      const [key, value] = lines[i].split(": ");

      headers[key] = value;
    }
    const content = lines[lines.length - 1] ?? null;

    return HttpRequest.create({ version, pathname: sanitize(pathname), method, headers, content });
  }
}

const sanitize = (pathname: string) => pathname.replace(/\/$/, "");
