import type { GitObjectManager } from "../../app/filesystems/GitObjectManager.ts";
import type { IFileSystem } from "../filesystems/IFileSystem.ts";
import { Result } from "../utils/Result.ts";
import type { Prettify } from "../utils/types.ts";

export interface CommandContext<TRecord extends CommandOptionRecord = CommandOptionRecord> {
  filesystem: IFileSystem;
  manager: GitObjectManager;
  options: Prettify<ValuesOf<TRecord>>;
  parameters: string[];
}

export interface CommandOption<TName extends string = string, TValue = unknown> {
  name: TName;
  shortname: string;
  description: string;
  optional?: boolean;
  flag?: boolean;
  parse: (values: string[]) => Result<TValue, string> | TValue;
}

type ValueOf<C> = C extends {
  optional?: infer O;
  parse: (values: string[]) => Result<infer TValue, string> | infer TValue;
} ? (O extends true ? TValue | undefined : TValue)
  : never;

export type CommandOptionRecord = Record<string, CommandOption<string, unknown>>;

export interface CommandOptions<
  TOptions extends CommandOptionRecord = CommandOptionRecord,
  TResult = void,
> {
  name: string;
  description: string;
  options?: TOptions;
  onDispatch: (context: CommandContext<TOptions>) => TResult;
}

export type ValuesOf<T extends CommandOptionRecord> = { [K in keyof T]: ValueOf<T[K]> };

export class Command<TRecord extends CommandOptionRecord = CommandOptionRecord, TResult = void> {
  static new<TRecord extends CommandOptionRecord = CommandOptionRecord, TResult = void>(
    { name, description, options = {} as TRecord, onDispatch }: CommandOptions<TRecord, TResult>,
  ): Command<TRecord, TResult> {
    return new Command(name, description, options, onDispatch);
  }

  private constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly options: TRecord,
    public readonly dispatch: (context: CommandContext<TRecord>) => TResult,
  ) {}
}
