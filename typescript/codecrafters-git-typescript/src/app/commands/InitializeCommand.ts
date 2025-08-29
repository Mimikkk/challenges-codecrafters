import { Command } from "../../lib/commands/Command.ts";
import { Result } from "../../lib/utils/Result.ts";

export const InitializeCommand = Command.new({
  name: "init",
  description: "initializes a git repository.",
  onDispatch({ filesystem }) {
    filesystem.createDirectory(".git");
    filesystem.createDirectory(".git/objects");
    filesystem.createDirectory(".git/refs");
    filesystem.createFile(".git/HEAD", "ref: refs/heads/main\n");

    return Result.ok("Initialized git directory.");
  },
});
