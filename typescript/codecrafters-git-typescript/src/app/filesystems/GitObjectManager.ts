import { Buffer } from "node:buffer";
import zlib from "node:zlib";
import type { IFileSystem } from "../../lib/filesystems/IFileSystem.ts";
import { Hash } from "../../lib/utils/Hash.ts";

export interface GitObject {
  type: string;
  content: string;
}
export interface IntoGitObjectOptions {
  type: string;
  content: Buffer | string;
}

export interface IGitObjectManager {
  intoFile(options: IntoGitObjectOptions): string;
  fromHash(path: string): GitObject | undefined;
}

export class GitObjectManager implements IGitObjectManager {
  static new(filesystem: IFileSystem) {
    return new GitObjectManager(filesystem);
  }

  private constructor(private readonly filesystem: IFileSystem) {}

  intoFile({ type, content }: IntoGitObjectOptions): string {
    const contentBuffer = Buffer.from(content);
    const headerBuffer = Buffer.from(`${type} ${contentBuffer.byteLength}\0`);

    const buffer = Buffer.concat([headerBuffer, contentBuffer]);
    const hash = Hash.from(buffer);

    const directory = hash.substring(0, 2);
    const filename = hash.substring(2);

    const compressed = zlib.deflateSync(buffer);
    this.filesystem.writeFile(`.git/objects/${directory}/${filename}`, compressed);
    return hash;
  }

  fromHash(hash: string): GitObject | undefined {
    const directory = hash.substring(0, 2);
    const filename = hash.substring(2);

    const content = this.filesystem.readFile(`.git/objects/${directory}/${filename}`);

    if (content === undefined) {
      return undefined;
    }

    const item = zlib.unzipSync(content);
    const typeEnd = item.indexOf(" ".charCodeAt(0));
    const nullbyte = item.indexOf(0);

    return {
      type: item.subarray(0, typeEnd).toString(),
      content: item.subarray(nullbyte + 1).toString(),
    };
  }
}
