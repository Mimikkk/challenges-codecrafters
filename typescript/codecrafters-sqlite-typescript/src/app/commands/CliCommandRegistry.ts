import { CommandRegistry } from "../../lib/commands/CommandRegistry.ts";
import { databaseInfoCommand } from "./DatabaseInfoCommand.ts";

export const cliCommandRegistry = CommandRegistry.new({
  commands: {
    ".dbinfo": databaseInfoCommand,
  },
});
