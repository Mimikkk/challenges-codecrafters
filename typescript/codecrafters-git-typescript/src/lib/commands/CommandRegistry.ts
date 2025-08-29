import type { Command } from "./Command.ts";

export class CommandRegistry {
  static new(commands: Command<any>[] = []): CommandRegistry {
    return new CommandRegistry(new Map(commands.map((command) => [command.name, command])));
  }

  private constructor(private readonly map: Map<string, Command>) {}

  register(command: Command): CommandRegistry {
    this.map.set(command.name, command);
    return this;
  }

  keys(): MapIterator<string> {
    return this.map.keys();
  }

  values(): MapIterator<Command> {
    return this.map.values();
  }

  get(name: string): Command | undefined {
    return this.map.get(name);
  }
}
