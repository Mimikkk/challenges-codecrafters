import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { Command } from "../lib/commands/Command.ts";
import { CommandRegistry } from "../lib/commands/CommandRegistry.ts";
import { parseArgs, ParseErrorNs } from "./parseArguments.ts";

describe("CLI - Parse arguments", () => {
  const testCommandWithoutOptions = Command.new({
    name: "test-1",
    description: "test command without options",
    onDispatch: () => {},
  });

  const testCommandWithOptions = Command.new({
    name: "test-2",
    description: "test command with options",
    options: {
      parameter: {
        name: "parameter",
        shortname: "s",
        description: "parameter command option",
        parse: ([value]) => value,
      },
      parameters: {
        name: "parameters",
        shortname: "m",
        description: "parameters command option",
        parse: (values) => values.join("-"),
      },
      isFlag: {
        name: "flag",
        shortname: "f",
        description: "flag command option",
        flag: true,
        parse: () => true,
      },
    },
    onDispatch: () => {},
  });
  const registry = CommandRegistry.new([testCommandWithOptions, testCommandWithoutOptions]);

  it("should parse existing command without options", () => {
    const Command = testCommandWithoutOptions;

    const { value: { command } } = parseArgs([Command.name], registry);
    expect(command.name).toBe(Command.name);
  });

  it("should parse existing command with options", () => {
    const Command = testCommandWithOptions;

    const { value: { command, options: args } } = parseArgs(
      [Command.name, "-s", "0", "-m", "1", "2", "--flag"],
      registry,
    );

    expect(command.name).toBe(Command.name);
    expect(args).toEqual({ parameter: "0", parameters: "1-2", isFlag: true });
  });

  it("should fail to parse unknown command name", () => {
    const { error } = parseArgs(["unknown"], registry);

    expect(error).toEqual(ParseErrorNs.unknownCommand("unknown"));
  });

  it("should expect at least one argument", () => {
    const { error } = parseArgs([], registry);

    expect(error).toEqual(ParseErrorNs.tooFewArguments);
  });

  it("should pass remaining arguments to the command", () => {
    const { value: { command, options, parameters } } = parseArgs(
      [testCommandWithOptions.name, "-s", "0", "-m", "1", "2", "--flag", "3", "4"],
      registry,
    );

    expect(command.name).toBe(testCommandWithOptions.name);
    expect(options).toEqual({ parameter: "0", parameters: "1-2", isFlag: true });
    expect(parameters).toEqual(["3", "4"]);
  });

  it("should pass remaining arguments to the command without options", () => {
    const { value: { command, options, parameters } } = parseArgs(
      [testCommandWithoutOptions.name, "3", "4"],
      registry,
    );

    expect(command.name).toBe(testCommandWithoutOptions.name);
    expect(options).toEqual({});
    expect(parameters).toEqual(["3", "4"]);
  });
});
