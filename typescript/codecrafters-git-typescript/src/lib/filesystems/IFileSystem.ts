import type { Buffer } from "node:buffer";
import { statSync } from "node:fs";

export type BufferEncoding = NonNullable<
  Parameters<typeof Buffer.byteLength>[1]
>;

export interface IFileOperations {
  createFile(path: string, content?: string | Buffer): void;
  removeFile(path: string): void;
  writeFile(path: string, content: string | Buffer): void;
  readFile<E extends BufferEncoding>(
    path: string,
    encoding?: E,
  ): (E extends "utf-8" ? string : Buffer) | undefined;
}

export interface IDirectoryOperations {
  createDirectory(path: string, options?: { recursive?: boolean }): void;
  removeDirectory(path: string, options?: { recursive?: boolean }): void;
  ensureDirectory(path: string, options?: { recursive?: boolean }): void;
}

export interface IPathOperations {
  list(path?: string, options?: { recursive?: boolean }): { type: "file" | "directory"; path: string }[];
  path(path: string): string;
  exists(path: string): boolean;
  stats(path: string): ReturnType<typeof statSync> | undefined;
  isFile(path: string): boolean;
  isDirectory(path: string): boolean;
}

export interface IFileSystem extends IFileOperations, IDirectoryOperations, IPathOperations {
  readonly location: string;
  [Symbol.dispose](): void;
}
