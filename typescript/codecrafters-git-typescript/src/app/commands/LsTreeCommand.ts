import * as zlib from "node:zlib";
import { Command } from "../../lib/commands/Command.ts";
import { Result } from "../../lib/utils/Result.ts";

type FileNotFound = { type: "file-not-found"; hash: string };
export type LsTreeCommandError = FileNotFound;

export namespace LsTreeCommandErrorNs {
  export const notFound = (hash: string): LsTreeCommandError => ({
    type: "file-not-found",
    hash,
  });
}

export const LsTreeCommand = Command.new({
  name: "ls-tree",
  description: "lists the contents of a tree.",
  options: {
    isNameOnly: {
      name: "name-only",
      shortname: "n",
      description: "only list the names of the files.",
      flag: true,
      parse: () => Result.ok(true),
    },
  },
  onDispatch({ parameters: [hash], manager, filesystem }) {
    const object = manager.fromHash(hash);

    const directory = hash.substring(0, 2);
    const filename = hash.substring(2);

    return Result.maybe(
      filesystem.readFile(`.git/objects/${directory}/${filename}`),
      () => LsTreeCommandErrorNs.notFound(hash),
    ).map((blob) => {
      const objects: { name: string; mode: string; sha1: string }[] = [];

      const item = zlib.unzipSync(blob);

      let offset = item.indexOf(0);
      while (true) {
        const nextNullbyteOffset = item.indexOf(0, offset + 1);
        if (nextNullbyteOffset === -1) break;

        const whitespaceOffset = item.indexOf(" ".charAt(0), offset + 1);
        const mode = item.subarray(offset + 1, whitespaceOffset).toString();
        const name = item.subarray(whitespaceOffset + 1, nextNullbyteOffset).toString();
        const sha1 = item.subarray(nextNullbyteOffset + 1, nextNullbyteOffset + 1 + 20).toString();
        objects.push({ mode, name, sha1 });

        offset = nextNullbyteOffset + 20;
      }

      return objects.length > 0 ? objects.map((o) => o.name).join("\n") + "\n" : "";
    });
  },
});
