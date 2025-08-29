import { Buffer } from "node:buffer";
import type { Socket } from "node:net";
import { gzipSync } from "node:zlib";
import { crlf } from "../../../common.ts";
import { type HeadersRecord, type HttpStatus, HttpStatusReason, HttpVersion } from "./HttpEnums.ts";

export interface IHttpResponse {
  version: HttpVersion;
  status: HttpStatus;
  headers: HeadersRecord;
  content: any | null;
}

export interface HttpResponseOptions {
  version?: HttpVersion;
  status: HttpStatus;
  headers?: HeadersRecord;
  content?: any;
}

export enum HttpContentType {
  Json = "application/json",
  File = "application/octet-stream",
  Text = "text/plain",
}

export class HttpResponse implements IHttpResponse {
  static create({ status, version = HttpVersion.Version11, headers, content }: HttpResponseOptions) {
    return new HttpResponse(version, status, headers ?? {}, content ?? null);
  }

  private constructor(
    public readonly version: HttpVersion,
    public readonly status: HttpStatus,
    public readonly headers: HeadersRecord,
    public readonly content: any | null,
  ) {}

  toSocket(socket: Socket) {
    const statusline = `${this.version} ${this.status} ${HttpStatusReason[this.status]}`;

    let bodyStr: string | undefined;

    if (this.content) {
      this.headers["Content-Type"] ??= this.content instanceof Buffer
        ? HttpContentType.File
        : typeof this.content === "object"
        ? HttpContentType.Json
        : HttpContentType.Text;
      const type = this.headers["Content-Type"];

      if (type === HttpContentType.Json) {
        bodyStr = JSON.stringify(this.content);
      } else if (type === HttpContentType.File) {
        bodyStr = this.content.toString();
      } else {
        bodyStr = (this.content ?? "").toString();
      }

      if (this.headers["Content-Encoding"]) {
        bodyStr = new Uint8Array(gzipSync(new TextEncoder().encode(bodyStr)));

        console.log(bodyStr);
      }

      this.headers["Content-Length"] ??= bodyStr!.length;
    }

    const headersStr = Object.entries(this.headers).map(([key, value]) => `${key}: ${value}`).join(crlf) + crlf;

    socket.write(statusline + crlf + headersStr + crlf);
    socket.write(bodyStr);
  }
}
