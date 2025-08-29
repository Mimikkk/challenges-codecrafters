import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { useFileSystems } from "../../lib/testing/useFileSystems.ts";
import { useSilentLogger } from "../../lib/testing/useSilentLogger.ts";
import { Result } from "../../lib/utils/Result.ts";
import { GitObjectManager } from "../filesystems/GitObjectManager.ts";
import { CatFileCommand, CatFileCommandErrorNs } from "./CatFileCommand.ts";
import { HashObjectCommand } from "./HashObjectCommand.ts";

describe("CatFileCommand", () => {
  useSilentLogger();
  const filesystem = useFileSystems("git-commands-cat-file");

  it("should read existing file", () => {
    const fs = filesystem();

    const expectedContent = "orange pineapple strawberry apple banana pear";
    const expectedHash = "f1333c3dc951d16e5612e389778dfee40bc0d273";
    fs.writeFile("test.txt", expectedContent);

    const hash = HashObjectCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: { path: "test.txt" },
      parameters: [],
    });

    expect(hash).toEqual(Result.ok(expectedHash));

    const cat = CatFileCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: { hash: expectedHash },
      parameters: [],
    });

    expect(cat).toEqual(Result.ok(expectedContent));
  });

  it("should return error for non-existent file", () => {
    const fs = filesystem();

    const result = CatFileCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: { hash: "invalid-hash" },
      parameters: [],
    });

    expect(result).toEqual(Result.err(CatFileCommandErrorNs.notFound("invalid-hash")));
  });
});
