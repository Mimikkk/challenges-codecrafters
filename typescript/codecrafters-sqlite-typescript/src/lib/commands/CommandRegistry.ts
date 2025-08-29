import type { Command } from "../commands/Command.ts";

interface CommandRegistryOptions<TRecord extends Record<string, Command<Record<string, string>>>> {
  commands: TRecord;
}

export class CommandRegistry<TRecord extends Record<string, Command<Record<string, string>>>> {
  static new<TRecord extends Record<string, Command<Record<string, string>>>>(
    { commands }: CommandRegistryOptions<TRecord>,
  ): CommandRegistry<TRecord> {
    return new CommandRegistry(new Map(Object.entries(commands)));
  }

  private constructor(
    private readonly commands: Map<string, Command<Record<string, string>>>,
  ) {}

  get<K extends keyof TRecord>(name: K): TRecord[K] {
    return this.commands.get(name as string) as TRecord[K];
  }

  has(name: string): name is keyof TRecord & string {
    return this.commands.has(name);
  }
}
