import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { join } from "node:path";
import { useFileSystems } from "../testing/useFileSystems.ts";

describe("FileSystem", () => {
  const filesystem = useFileSystems("filesystem");

  it("should create a new FileSystem instance with resolved path", () => {
    using fs = filesystem();

    expect(fs).toBeDefined();

    expect(fs.exists(fs.location)).toBe(false);
    expect(fs.isDirectory(fs.location)).toBe(false);

    fs.createDirectory(fs.location);

    expect(fs.exists(fs.location)).toBe(true);
    expect(fs.isDirectory(fs.location)).toBe(true);
  });

  describe("createDirectory", () => {
    it("should create a directory", () => {
      using fs = filesystem();

      const dirPath = "test-dir";
      fs.createDirectory(dirPath);

      expect(fs.exists(dirPath)).toBe(true);
      expect(fs.isDirectory(dirPath)).toBe(true);
    });

    it("should create nested directories with recursive option", () => {
      using fs = filesystem();

      const nestedDir = "nested/deep/directory";
      fs.createDirectory(nestedDir, { recursive: true });

      expect(fs.exists(nestedDir)).toBe(true);
      expect(fs.isDirectory(nestedDir)).toBe(true);
    });
  });

  describe("createFile", () => {
    it("should create an empty file", () => {
      using fs = filesystem();

      const path = "empty-file.txt";
      fs.createFile(path);

      expect(fs.exists(path)).toBe(true);
      expect(fs.isFile(path)).toBe(true);
      expect(fs.readFile(path, "utf-8")).toBe("");
    });

    it("should create a file with content", () => {
      using fs = filesystem();

      const path = "content-file.txt";
      const content = "Hello, World!";
      fs.createFile(path, content);

      expect(fs.exists(path)).toBe(true);
      expect(fs.isFile(path)).toBe(true);
      expect(fs.readFile(path, "utf-8")).toBe(content);
    });
  });

  describe("writeFile", () => {
    it("should write content to a file", () => {
      using fs = filesystem();

      const path = "write-test.txt";
      const content = "This is test content";

      fs.writeFile(path, content);

      expect(fs.exists(path)).toBe(true);
      expect(fs.isFile(path)).toBe(true);
      expect(fs.readFile(path, "utf-8")).toBe(content);
    });

    it("should create parent directories automatically", () => {
      using fs = filesystem();

      const path = "nested/deep/auto-file.txt";
      const content = "Auto-created directories";

      fs.writeFile(path, content);

      expect(fs.exists(path)).toBe(true);
      expect(fs.isFile(path)).toBe(true);
      expect(fs.readFile(path, "utf-8")).toBe(content);

      expect(fs.exists("nested")).toBe(true);
      expect(fs.isDirectory("nested")).toBe(true);
      expect(fs.exists("nested/deep")).toBe(true);
      expect(fs.isDirectory("nested/deep")).toBe(true);
    });

    it("should overwrite existing file", () => {
      using fs = filesystem();

      const path = "overwrite.txt";
      const initialContent = "Initial content";
      const newContent = "New content";

      fs.writeFile(path, initialContent);
      expect(fs.readFile(path, "utf-8")).toBe(initialContent);

      fs.writeFile(path, newContent);
      expect(fs.readFile(path, "utf-8")).toBe(newContent);
    });
  });

  describe("readFile", () => {
    it("should read file content with default encoding", () => {
      using fs = filesystem();

      const path = "read-test.txt";
      const content = "Test content for reading";
      fs.writeFile(path, content);

      const readContent = fs.readFile(path, "utf-8");
      expect(readContent).toBe(content);
    });

    it("should read file content with specified encoding", () => {
      using fs = filesystem();

      const path = "encoding-test.txt";
      const content = "Content with encoding";
      fs.writeFile(path, content);

      const readContent = fs.readFile(path, "utf-8");
      expect(readContent).toBe(content);
    });
  });

  describe("removeFile", () => {
    it("should remove a file", () => {
      using fs = filesystem();

      const path = "remove-test.txt";
      fs.writeFile(path, "content");
      expect(fs.exists(path)).toBe(true);

      fs.removeFile(path);
      expect(fs.exists(path)).toBe(false);
    });

    it("should handle removing non-existent file gracefully", () => {
      using fs = filesystem();

      const path = "non-existent.txt";
      expect(fs.exists(path)).toBe(false);

      expect(() => fs.removeFile(path)).not.toThrow();
    });
  });

  describe("removeDirectory", () => {
    it("should remove an empty directory", () => {
      using fs = filesystem();

      const dirPath = "empty-dir";
      fs.createDirectory(dirPath);
      expect(fs.exists(dirPath)).toBe(true);

      fs.removeDirectory(dirPath);
      expect(fs.exists(dirPath)).toBe(false);
    });

    it("should remove directory with contents recursively", () => {
      using fs = filesystem();

      const dirPath = "nested-dir";
      const path = join(dirPath, "nested-file.txt");

      fs.createDirectory(dirPath);
      fs.writeFile(path, "content");

      expect(fs.exists(dirPath)).toBe(true);
      expect(fs.exists(path)).toBe(true);

      fs.removeDirectory(dirPath, { recursive: true });
      expect(fs.exists(dirPath)).toBe(false);
      expect(fs.exists(path)).toBe(false);
    });
  });

  describe("exists", () => {
    it("should return true for existing file", () => {
      using fs = filesystem();

      const path = "exists-test.txt";
      fs.writeFile(path, "content");
      expect(fs.exists(path)).toBe(true);
    });

    it("should return true for existing directory", () => {
      using fs = filesystem();

      const dirPath = "exists-dir";
      fs.createDirectory(dirPath);
      expect(fs.exists(dirPath)).toBe(true);
    });

    it("should return false for non-existent path", () => {
      using fs = filesystem();

      const nonExistentPath = "non-existent";
      expect(fs.exists(nonExistentPath)).toBe(false);
    });
  });

  describe("stat", () => {
    it("should return stats for file", () => {
      using fs = filesystem();

      const path = "stat-test.txt";
      fs.writeFile(path, "content");

      const stats = fs.stats(path);
      expect(stats).toBeDefined();
      expect(stats?.isFile()).toBe(true);
      expect(stats?.isDirectory()).toBe(false);
    });

    it("should return stats for directory", () => {
      using fs = filesystem();

      const dirPath = "stat-dir";
      fs.createDirectory(dirPath);

      const stats = fs.stats(dirPath);
      expect(stats).toBeDefined();
      expect(stats?.isDirectory()).toBe(true);
      expect(stats?.isFile()).toBe(false);
    });
  });

  describe("isDirectory", () => {
    it("should return true for directory", () => {
      using fs = filesystem();

      const dirPath = "dir-test";
      fs.createDirectory(dirPath);
      expect(fs.isDirectory(dirPath)).toBe(true);
    });

    it("should return false for file", () => {
      using fs = filesystem();

      const path = "file-test.txt";
      fs.writeFile(path, "content");
      expect(fs.isDirectory(path)).toBe(false);
    });

    it("should return false for non-existent path", () => {
      using fs = filesystem();

      const nonExistentPath = "non-existent";
      expect(fs.isDirectory(nonExistentPath)).toBe(false);
    });
  });

  describe("isFile", () => {
    it("should return true for file", () => {
      using fs = filesystem();

      const path = "file-test.txt";
      fs.writeFile(path, "content");
      expect(fs.isFile(path)).toBe(true);
    });

    it("should return false for directory", () => {
      using fs = filesystem();

      const dirPath = "dir-test";
      fs.createDirectory(dirPath);
      expect(fs.isFile(dirPath)).toBe(false);
    });

    it("should return false for non-existent path", () => {
      using fs = filesystem();

      const nonExistentPath = "non-existent";
      expect(fs.isFile(nonExistentPath)).toBe(false);
    });
  });

  describe("list", () => {
    it("should list files and directories in a directory", () => {
      using fs = filesystem();

      fs.createDirectory("dir");
      fs.createFile("dir/file1.txt", "content1");
      fs.createFile("dir/file2.txt", "content2");
      fs.createDirectory("dir/subdir");
      fs.createFile("dir/subdir/file3.txt", "content3");

      const entries = fs.list("dir", { recursive: true });
      const paths = entries.map((e) => e.path).sort();
      const types = Object.fromEntries(entries.map((e) => [e.path, e.type]));

      expect(paths).toEqual([
        "dir\\file1.txt",
        "dir\\file2.txt",
        "dir\\subdir",
        "dir\\subdir\\file3.txt",
      ]);

      expect(types["dir\\file1.txt"]).toBe("file");
      expect(types["dir\\file2.txt"]).toBe("file");
      expect(types["dir\\subdir"]).toBe("directory");
    });

    it("should list files and directories in a directory without recursion", () => {
      using fs = filesystem();

      fs.createDirectory("dir");
      fs.createFile("dir/file1.txt", "content1");
      fs.createFile("dir/file2.txt", "content2");
      fs.createDirectory("dir/subdir");
      fs.createFile("dir/subdir/file3.txt", "content3");

      const entries = fs.list("dir", { recursive: false });
      const paths = entries.map((e) => e.path).sort();
      const types = Object.fromEntries(entries.map((e) => [e.path, e.type]));

      expect(paths).toEqual([
        "dir\\file1.txt",
        "dir\\file2.txt",
        "dir\\subdir",
      ]);

      expect(types["dir\\file1.txt"]).toBe("file");
      expect(types["dir\\file2.txt"]).toBe("file");
      expect(types["dir\\subdir"]).toBe("directory");
    });

    it("should return an empty array for an empty directory", () => {
      using fs = filesystem();

      fs.createDirectory("emptydir");
      const entries = fs.list("emptydir", { recursive: true });
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBe(0);
    });

    it("should throw or return empty for non-existent directory", () => {
      using fs = filesystem();

      expect(() => fs.list("does-not-exist", { recursive: true })).not.toThrow();
      const entries = fs.list("does-not-exist", { recursive: true });
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBe(0);
    });

    it("should return an array with one file for a file path", () => {
      using fs = filesystem();

      fs.createFile("single.txt", "abc");
      const entries = fs.list("single.txt", { recursive: true });
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toBe("single.txt");
      expect(entries[0].type).toBe("file");
    });
  });
});
