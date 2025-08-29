import { CommandRegistry } from "../lib/commands/CommandRegistry.ts";
import { CatFileCommand } from "./commands/CatFileCommand.ts";
import { CommitTreeCommand } from "./commands/CommitTreeCommand.ts";
import { HashObjectCommand } from "./commands/HashObjectCommand.ts";
import { InitializeCommand } from "./commands/InitializeCommand.ts";
import { LsTreeCommand } from "./commands/LsTreeCommand.ts";
import { WriteTreeCommand } from "./commands/WriteTreeCommand.ts";

export const gitCommandRegistry = CommandRegistry.new([
  InitializeCommand,
  CatFileCommand,
  HashObjectCommand,
  LsTreeCommand,
  WriteTreeCommand,
  CommitTreeCommand,
]);
