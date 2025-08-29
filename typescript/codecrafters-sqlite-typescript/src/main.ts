import { exit } from "node:process";
import { parseArgs } from "node:util";
import { cliCommandRegistry } from "./app/commands/CliCommandRegistry.ts";

const {
  positionals: [databaseStr, commandStr],
} = parseArgs({ allowPositionals: true });

if (!databaseStr) {
  throw new Error("Database file path is required.");
}

if (!commandStr) {
  throw new Error("Command is required.");
}

if (!cliCommandRegistry.has(commandStr)) {
  console.error(`Command ${commandStr} not found.`);

  exit(1);
}

await cliCommandRegistry.get(commandStr).invoke({ path: databaseStr });
