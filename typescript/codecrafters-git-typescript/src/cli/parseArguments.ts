import type { Command } from "../lib/commands/Command.ts";
import type { CommandRegistry } from "../lib/commands/CommandRegistry.ts";
import { Result } from "../lib/utils/Result.ts";

export type TooFewArguments = { type: "too-few-arguments" };
export type UnknownOption = { type: "unknown-option"; option: string };
export type UnknownCommand = { type: "unknown-command"; command: string };
export type InvalidCommand = { type: "invalid-command"; errors: { name: string; description: string }[] };

export type ParseError = TooFewArguments | UnknownCommand | UnknownOption | InvalidCommand;

export namespace ParseErrorNs {
  export const tooFewArguments: TooFewArguments = {
    type: "too-few-arguments",
  };

  export const invalidCommand = (errors: { name: string; description: string }[]): InvalidCommand => ({
    type: "invalid-command",
    errors,
  });

  export const unknownOption = (option: string): UnknownOption => ({
    type: "unknown-option",
    option,
  });

  export const unknownCommand = (command: string): UnknownCommand => ({
    type: "unknown-command",
    command,
  });
}

const prepareKwargs = (command: Command, parameters: string[]): Record<string, string[]> => {
  const kwargs: Record<string, string[]> = {};
  const options = Object.values(command.options);

  let args: string[] = [];
  for (let i = 0; i < parameters.length; ++i) {
    const val = parameters[i];

    if (val[0] === "-") {
      const name = val.substring(val[1] === "-" ? 2 : 1);

      args = [];
      const option = options.find((option) => option.name === name || option.shortname === name);
      if (option?.flag) {
        kwargs[name] = [];
      } else {
        kwargs[name] = args;
      }
    } else {
      args.push(val);
    }
  }

  return kwargs;
};

const parseCommandArgs = (
  command: Command,
  parameters: string[],
): Result<{ options: Record<string, unknown>; parameters: string[] }, ParseError> => {
  if (!command.options) return Result.ok({ options: {}, parameters: [] });
  const kwargs = prepareKwargs(command, parameters);
  const used = Object.values(kwargs).flat();
  const params = parameters.filter((p) => !p.startsWith("-")).filter((p) => !used.includes(p));

  const errors: { name: string; description: string }[] = [];
  const entries = Object.entries(command.options);

  const record: Record<string, unknown> = {};
  for (const [name, option] of entries) {
    const raw = kwargs[option.shortname] || kwargs[option.name];

    if (raw === undefined) continue;

    Result.ok(option.parse(raw)).match(
      (value) => record[name] = value,
      (description) => errors.push({ name, description }),
    );
  }

  for (const name in kwargs) {
    if (entries.some(([_, option]) => option.name === name || option.shortname === name)) continue;

    errors.push({ name: name, description: "unknown option" });
  }

  return Result.when(
    !errors.length,
    () => ({ options: record, parameters: params }),
    () => ParseErrorNs.invalidCommand(errors),
  );
};

const parseCommandStr = (str: string, registry: CommandRegistry): Result<Command, UnknownCommand> =>
  Result.maybe(registry.get(str), ParseErrorNs.unknownCommand(str));

export const parseArgs = (
  values: string[],
  registry: CommandRegistry,
): Result<{ command: Command; options: Record<string, unknown>; parameters: string[] }, ParseError> =>
  Result.maybe(values[0], ParseErrorNs.tooFewArguments)
    .map((str) => parseCommandStr(str, registry))
    .map((command) => {
      const args = parseCommandArgs(command, values.slice(1));

      if (args.isErr()) {
        return args;
      }

      return ({ command, options: args.value.options, parameters: args.value.parameters });
    });
