import { constants } from "node:fs";
import { FileHandler } from "../files/FileHandler.ts";

export interface DatabaseOptions {
  path: string;
}

export class Database {
  static async new({ path }: DatabaseOptions): Promise<Database> {
    return new Database(await FileHandler.open(path, constants.O_RDWR | constants.O_CREAT));
  }

  private constructor(
    private readonly filehandler: FileHandler,
  ) {}

  async read(buffer: Uint8Array, offset: number, length: number, position: number) {
    return this.filehandler.read(buffer, offset, length, position);
  }

  async write(buffer: Uint8Array, offset: number, length: number, position: number) {
    return this.filehandler.write(buffer, offset, length, position);
  }

  [Symbol.asyncDispose]() {
    return this.filehandler[Symbol.asyncDispose]();
  }
}
