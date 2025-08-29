import { afterAll } from "@std/testing/bdd";
import { FileSystem } from "../filesystems/FileSystem.ts";
import type { IFileSystem } from "../filesystems/IFileSystem.ts";

export function useFileSystems(name: string): () => IFileSystem {
  afterAll(() => {
    const fs = FileSystem.new("tests");
    fs.removeDirectory(fs.location);
  });

  return () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);

    return FileSystem.new(`tests/${name}/${timestamp}-${randomId}`, {
      onCleanup(fs) {
        fs.removeDirectory(fs.location);
      },
    });
  };
}
