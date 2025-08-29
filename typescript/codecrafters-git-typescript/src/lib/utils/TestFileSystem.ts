import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

export class TestFileSystem {
  private location: string;
  private originalCwd: string;

  static new(name: string): TestFileSystem {
    return new TestFileSystem(name);
  }

  private constructor(name: string) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);

    this.location = join(process.cwd(), `test-${name}-${timestamp}-${randomId}`);
    this.originalCwd = process.cwd();
    mkdirSync(this.location, { recursive: true });
    process.chdir(this.location);
  }

  getDir(): string {
    return this.location;
  }

  getPath(relativePath: string): string {
    return join(this.location, relativePath);
  }

  mkdir(path: string, options?: { recursive?: boolean }): void {
    mkdirSync(path, options);
  }

  writeFile(path: string, content: string): void {
    writeFileSync(path, content);
  }

  readFile(path: string, encoding: string = "utf-8"): string {
    return readFileSync(path, { encoding: encoding as any }).toString();
  }

  exists(path: string): boolean {
    return existsSync(path);
  }

  stat(path: string) {
    return statSync(path);
  }

  isDirectory(path: string): boolean {
    return this.stat(path).isDirectory();
  }

  isFile(path: string): boolean {
    return this.stat(path).isFile();
  }

  cleanup(): void {
    process.chdir(this.originalCwd);

    if (existsSync(this.location)) {
      rmSync(this.location, { recursive: true, force: true });
    }
  }

  runInTestDir<T>(fn: () => T): T {
    return fn();
  }

  mkdirRecursive(path: string): void {
    mkdirSync(path, { recursive: true });
  }

  writeFileRecursive(path: string, content: string): void {
    const dir = join(path, "..");
    if (!this.exists(dir)) {
      this.mkdirRecursive(dir);
    }
    this.writeFile(path, content);
  }
}

export function withTestFileSystem<T>(
  name: string,
  fn: (fs: TestFileSystem) => T | Promise<T>,
): T | Promise<T> {
  const fs = TestFileSystem.new(name);

  try {
    const result = fn(fs);

    if (result instanceof Promise) {
      return result.finally(() => fs.cleanup());
    } else {
      fs.cleanup();
      return result;
    }
  } catch (error) {
    fs.cleanup();
    throw error;
  }
}
