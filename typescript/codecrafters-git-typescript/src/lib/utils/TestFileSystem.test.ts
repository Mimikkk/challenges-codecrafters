import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import process from "node:process";
import { TestFileSystem, withTestFileSystem } from "./TestFileSystem.ts";

describe("TestFileSystem Examples", () => {
  it("should demonstrate basic TestFileSystem usage", () => {
    const fs = TestFileSystem.new("basic-example");

    try {
      fs.mkdir("test-dir");
      fs.writeFile("test-file.txt", "Hello, World!");
      fs.writeFileRecursive("nested/path/file.txt", "Nested content");

      expect(fs.exists("test-dir")).toBe(true);
      expect(fs.exists("test-file.txt")).toBe(true);
      expect(fs.exists("nested/path/file.txt")).toBe(true);

      expect(fs.isDirectory("test-dir")).toBe(true);
      expect(fs.isFile("test-file.txt")).toBe(true);

      expect(fs.readFile("test-file.txt")).toBe("Hello, World!");
      expect(fs.readFile("nested/path/file.txt")).toBe("Nested content");

      expect(fs.getDir()).toContain("test-basic-example");
      expect(fs.getPath("test-file.txt")).toContain("test-basic-example");
    } finally {
      fs.cleanup();
    }
  });

  it("should demonstrate withTestFileSystem helper", () => {
    const result = withTestFileSystem("helper-example", (fs) => {
      fs.writeFile("example.txt", "Test content");
      expect(fs.readFile("example.txt")).toBe("Test content");
      return "success";
    });

    expect(result).toBe("success");
  });

  it("should demonstrate async withTestFileSystem helper", async () => {
    const result = await withTestFileSystem("async-example", async (fs) => {
      fs.writeFile("async.txt", "Async content");
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fs.readFile("async.txt")).toBe("Async content");
      return "async success";
    });

    expect(result).toBe("async success");
  });

  it("should demonstrate runInTestDir context", () => {
    const fs = TestFileSystem.new("context-example");

    try {
      const result = fs.runInTestDir(() => {
        fs.writeFile("context.txt", "Context content");
        return process.cwd();
      });

      expect(result).toContain("test-context-example");
      expect(fs.exists("context.txt")).toBe(true);
    } finally {
      fs.cleanup();
    }
  });
});
