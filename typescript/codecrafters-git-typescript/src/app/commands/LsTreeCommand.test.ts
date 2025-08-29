import { expect } from "@std/expect/expect";
import { describe, it } from "@std/testing/bdd";
import { useFileSystems } from "../../lib/testing/useFileSystems.ts";
import { useSilentLogger } from "../../lib/testing/useSilentLogger.ts";
import { Result } from "../../lib/utils/Result.ts";
import { LsTreeCommand } from "./LsTreeCommand.ts";
import { GitObjectManager } from "../filesystems/GitObjectManager.ts";

describe("Git Commands - LsTree", () => {
  useSilentLogger();
  const filesystem = useFileSystems("git-commands-ls-tree");

  it("should list the contents of a tree", () => {
    const fs = filesystem();

    fs.writeFile("test.txt", "orange pineapple strawberry apple banana pear");
    fs.writeFile("test2.txt", "orange pineapple strawberry apple banana pear");

    const tree = LsTreeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: {
        isNameOnly: false,
      },
      parameters: ["f1333c3dc951d16e5612e389778dfee40bc0d273"],
    });

    expect(tree).toEqual(Result.ok([{
      hash: "f1333c3dc951d16e5612e389778dfee40bc0d273",
      type: "blob",
      name: "test.txt",
    }]));
  });
});
