import { Command } from "../../lib/commands/Command.ts";
import { Result } from "../../lib/utils/Result.ts";

type FileNotFound = { type: "file-not-found"; hash: string };

export type CatFileCommandError = FileNotFound;

export namespace CatFileCommandErrorNs {
  export const notFound = (hash: string): CatFileCommandError => ({
    type: "file-not-found",
    hash,
  });
}

export const CatFileCommand = Command.new({
  name: "cat-file",
  description: "reads contents of a blob by hash.",
  options: {
    hash: {
      name: "hash",
      shortname: "p",
      description: "hash (sha-1) of the object to read.",
      parse: ([hash]) => hash,
    },
  },
  onDispatch({ options: { hash }, manager }) {
    return Result.maybe(
      manager.fromHash(hash)?.content,
      () => CatFileCommandErrorNs.notFound(hash),
    );
  },
});
