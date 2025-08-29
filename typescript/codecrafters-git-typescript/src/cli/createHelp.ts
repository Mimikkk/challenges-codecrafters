import type { Command } from "../lib/commands/Command.ts";
import { Str } from "../lib/utils/str.ts";
import { gitCommandRegistry } from "../app/GitCommandRegistry.ts";

const createCommandsStr = (commands: Command[]) => {
  if (commands.length === 0) {
    return "no commands available.";
  }

  return `- ${commands.map(createCommandStr).join("\n- ")}`;
};

const createCommandStr = (command: Command) => {
  return `${command.name} - ${command.description}`;
};

export const createHelpStr = () => {
  return Str.trimlines`
    Git - version control tool.

    available commands:
    ${createCommandsStr(Array.from(gitCommandRegistry.values()))}
  `;
};
