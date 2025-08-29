import { Buffer } from "node:buffer";
import * as zlib from "node:zlib";
import { Command } from "../../lib/commands/Command.ts";
import type { IFileSystem } from "../../lib/filesystems/IFileSystem.ts";
import { Hash } from "../../lib/utils/Hash.ts";
import { Result } from "../../lib/utils/Result.ts";
import { GitObjectManager } from "../filesystems/GitObjectManager.ts";

type FileNotFound = { type: "file-not-found"; path: string };

export type HashObjectCommandError = FileNotFound;

export namespace HashObjectCommandErrorNs {
  export const notFound = (path: string): HashObjectCommandError => ({
    type: "file-not-found",
    path,
  });
}

export const HashObjectCommand = Command.new({
  name: "hash-object",
  description: "hashes an object into 40 character hash (sha-1). stores the object in the object store.",
  options: {
    path: {
      name: "path",
      shortname: "w",
      description: "path to the file to hash.",
      parse: ([path]) => path,
    },
  },
  onDispatch({ options: { path }, filesystem, manager }) {
    return Result
      .maybe(filesystem.readFile(path, "utf-8"), () => HashObjectCommandErrorNs.notFound(path))
      .map((content) => manager.intoFile({ type: "blob", content }));
  },
});
