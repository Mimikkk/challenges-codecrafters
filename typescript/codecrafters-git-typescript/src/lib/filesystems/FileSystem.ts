import type { Buffer } from "node:buffer";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import type { BufferEncoding, IFileSystem } from "./IFileSystem.ts";

interface IFileSystemOptions {
  onCleanup?: (filesystem: FileSystem) => void;
}

export class FileSystem implements IFileSystem {
  static new(location: string = process.cwd(), options: IFileSystemOptions = {}): FileSystem {
    return new FileSystem(resolve(location), options.onCleanup);
  }

  private constructor(
    public readonly location: string,
    private onCleanup?: (filesystem: FileSystem) => void,
  ) {
  }

  path(path: string): string {
    return path.startsWith(this.location) ? path : resolve(this.location, path);
  }

  removeFile(path: string): void {
    const to = this.path(path);
    if (!this.exists(to)) return;
    unlinkSync(to);
  }

  ensureDirectory(path: string, options: { recursive?: boolean } = { recursive: true }): void {
    const to = this.path(path);

    if (this.exists(to)) {
      if (this.isDirectory(to)) return;

      const sub = join(to, "..");
      this.ensureDirectory(sub, options);
    }

    mkdirSync(to, options);
  }

  createDirectory(path: string, options: { recursive?: boolean } = { recursive: true }): void {
    this.ensureDirectory(path, options);
  }

  createFile(path: string, content: string = ""): void {
    this.writeFile(path, content);
  }

  removeDirectory(path: string, options: { recursive?: boolean } = { recursive: true }): void {
    const to = this.path(path);
    if (!this.exists(to)) return;
    rmSync(to, options);
  }

  writeFile(path: string, content: string | Buffer): void {
    const to = this.path(path);
    this.ensureDirectory(join(to, ".."));
    writeFileSync(to, content);
  }

  readFile<E extends BufferEncoding>(
    path: string,
    encoding?: E,
  ): (E extends "utf-8" ? string : Buffer) | undefined {
    if (!this.exists(path)) return undefined;

    return readFileSync(this.path(path), encoding ? { encoding } : undefined) as (E extends "utf-8" ? string : Buffer);
  }

  stats(path: string): ReturnType<typeof statSync> | undefined {
    const to = this.path(path);

    return this.exists(to) ? statSync(to) : undefined;
  }

  exists(path: string): boolean {
    return existsSync(this.path(path));
  }

  isDirectory(path: string): boolean {
    return this.stats(this.path(path))?.isDirectory() ?? false;
  }

  isFile(path: string): boolean {
    return this.stats(this.path(path))?.isFile() ?? false;
  }

  list(path: string = "", options?: { recursive: boolean }): { type: "file" | "directory"; path: string }[] {
    const to = this.path(path);
    if (!this.exists(to)) return [];

    const stat = this.stats(to);
    if (!stat) return [];

    if (stat.isFile()) {
      return [{ type: "file", path }];
    }

    if (!stat.isDirectory()) {
      return [];
    }

    const results: { type: "file" | "directory"; path: string }[] = [];
    const entries = readdirSync(to, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(path, entry.name);
      if (entry.isDirectory()) {
        results.push({ type: "directory", path: entryPath });
        if (options?.recursive) {
          results.push(...this.list(entryPath, options));
        }
      } else if (entry.isFile()) {
        results.push({ type: "file", path: entryPath });
      }
    }

    return results;
  }

  [Symbol.dispose](): void {
    this.onCleanup?.(this);
  }
}
