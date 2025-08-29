import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { useFileSystems } from "../../lib/testing/useFileSystems.ts";
import { useSilentLogger } from "../../lib/testing/useSilentLogger.ts";
import { GitObjectManager } from "../filesystems/GitObjectManager.ts";
import { InitializeCommand } from "./InitializeCommand.ts";

describe("Git Commands - InitializeCommand", () => {
  useSilentLogger();
  const filesystem = useFileSystems("git-commands-init");

  it("should have correct name and description", () => {
    expect(InitializeCommand.name).toBe("init");
    expect(InitializeCommand.description).toBe("initializes a git repository.");
  });

  it("should create .git directory structure", () => {
    const fs = filesystem();
    InitializeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: {},
      parameters: [],
    });

    expect(fs.exists(".git")).toBe(true);
    expect(fs.exists(".git/objects")).toBe(true);
    expect(fs.exists(".git/refs")).toBe(true);
  });

  it("should create HEAD file with correct content", () => {
    const fs = filesystem();
    InitializeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: {},
      parameters: [],
    });

    expect(fs.exists(".git/HEAD")).toBe(true);
    const content = fs.readFile(".git/HEAD", "utf-8");
    expect(content).toBe("ref: refs/heads/main\n");
  });

  it("should create all required directories recursively", () => {
    const fs = filesystem();
    InitializeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: {},
      parameters: [],
    });

    expect(fs.exists(".git")).toBe(true);
    expect(fs.exists(".git/objects")).toBe(true);
    expect(fs.exists(".git/refs")).toBe(true);

    expect(fs.isDirectory(".git")).toBe(true);
    expect(fs.isDirectory(".git/objects")).toBe(true);
    expect(fs.isDirectory(".git/refs")).toBe(true);
  });

  it("should not overwrite existing .git directory", () => {
    const fs = filesystem();
    fs.createDirectory(".git", { recursive: true });
    fs.writeFile(".git/custom-file", "test content");
    InitializeCommand.dispatch({
      manager: GitObjectManager.new(fs),
      filesystem: fs,
      options: {},
      parameters: [],
    });

    expect(fs.exists(".git/custom-file")).toBe(true);
    expect(fs.readFile(".git/custom-file", "utf-8")).toBe("test content");

    expect(fs.exists(".git/objects")).toBe(true);
    expect(fs.exists(".git/refs")).toBe(true);
    expect(fs.exists(".git/HEAD")).toBe(true);
  });
});
