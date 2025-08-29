import { expect } from "@std/expect/expect";
import { describe, it } from "@std/testing/bdd";
import { useFileSystems } from "../../lib/testing/useFileSystems.ts";
import { useSilentLogger } from "../../lib/testing/useSilentLogger.ts";
import { Result } from "../../lib/utils/Result.ts";
import { GitObjectManager } from "../filesystems/GitObjectManager.ts";
import { InitializeCommand } from "./InitializeCommand.ts";
import { LsTreeCommand } from "./LsTreeCommand.ts";
import { WriteTreeCommand } from "./WriteTreeCommand.ts";

describe("Git Commands - LsTree", () => {
  useSilentLogger();
  const filesystem = useFileSystems("git-commands-ls-tree");

  it.only("should write the contents of a tree as a tree", () => {
    const fs = filesystem();

    fs.writeFile("file-1.txt", "content");
    fs.writeFile("directory/file-2.txt", "content");

    const tree = WriteTreeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: { path: undefined },
      parameters: [],
    });

    expect(tree).toEqual(Result.ok("974aaccc5f94c7d3772b4477bb3b2a241d6604cb"));
  });

  it("should omit the contents of .git", () => {
    const fs = filesystem();

    InitializeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: {},
      parameters: [],
    });
    const { value: hash } = WriteTreeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: { path: undefined },
      parameters: [],
    });
    expect(hash).toBeDefined();

    const { value: tree } = LsTreeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: { isNameOnly: true },
      parameters: [hash],
    });

    expect(tree).toBe(undefined);
  });
});
