import type { OpenMode } from "fs";
import { type FileHandle, open } from "fs/promises";

export class FileHandler {
  static async open(path: string, mode: OpenMode) {
    const filehandler = await open(path, mode);
    return new FileHandler(filehandler);
  }

  private constructor(private readonly filehandler: FileHandle) {
  }

  async [Symbol.asyncDispose]() {
    await this.filehandler.close();
  }

  read(buffer: Uint8Array, offset: number, length: number, position: number) {
    return this.filehandler.read(buffer, offset, length, position);
  }

  write(buffer: Uint8Array, offset: number, length: number, position: number) {
    return this.filehandler.write(buffer, offset, length, position);
  }
}
