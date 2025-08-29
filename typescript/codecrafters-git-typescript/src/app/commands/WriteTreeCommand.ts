import { Buffer } from "node:buffer";
import { basename } from "node:path";
import { Command } from "../../lib/commands/Command.ts";
import { Result } from "../../lib/utils/Result.ts";
import { GitObjectManager } from "../filesystems/GitObjectManager.ts";
import { HashObjectCommand } from "./HashObjectCommand.ts";

type FileNotFound = { type: "file-not-found"; hash: string };
export type WriteTreeCommandError = FileNotFound;

export namespace WriteTreeCommandErrorNs {
  export const notFound = (hash: string): WriteTreeCommandError => ({
    type: "file-not-found",
    hash,
  });
}
/**
 * <size> is the size of the content (in bytes)
 * \0 is a null byte
 * <content> is the actual content of the file
 *
 * @example
 * tree <size>\0
 * <mode> <name>\0<20_byte_sha>
 * <mode> <name>\0<20_byte_sha>
 */

const enum Mode {
  File = 100644,
  Directory = 40000,
}

export const WriteTreeCommand = Command.new({
  name: "write-tree",
  description: "writes the contents of a current repository as a tree object.",
  options: {
    path: {
      name: "path",
      shortname: "p",
      optional: true,
      description: "path to the directory to write as a tree object.",
      parse: ([path]) => path,
    },
  },
  onDispatch({ filesystem, manager, options: { path } }) {
    const entries = filesystem
      .list(path)
      .filter(({ path }) => !path.startsWith(".git"))
      .map(({ path, type }) => {
        const command = type === "file" ? HashObjectCommand : WriteTreeCommand;
        const mode = type === "file" ? Mode.File : Mode.Directory;

        return {
          mode,
          name: basename(path),
          hash: command.dispatch({
            filesystem,
            manager: GitObjectManager.new(filesystem),
            options: { path: path },
            parameters: [],
          }).value,
        };
      })
      .map((r) => ({ mode: r.mode.toString(), name: r.name, sha1: r.hash }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const content = Buffer.concat(entries.flatMap((item) => [
      Buffer.from(`${item.mode} ${item.name}\0`, "utf8"),
      Buffer.from(item.sha1, "hex"),
    ]));

    const hash = manager.intoFile({ type: "tree", content });

    return Result.ok(hash);
  },
});
