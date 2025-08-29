import process, { argv, exit } from "node:process";
import { GitObjectManager } from "../app/filesystems/GitObjectManager.ts";
import { gitCommandRegistry } from "../app/GitCommandRegistry.ts";
import { FileSystem } from "../lib/filesystems/FileSystem.ts";
import { logger } from "../lib/utils/Logger.ts";
import { Result } from "../lib/utils/Result.ts";
import { createHelpStr } from "./createHelp.ts";
import { parseArgs, ParseErrorNs } from "./parseArguments.ts";

const filesystem = FileSystem.new();
const manager = GitObjectManager.new(filesystem);

Result.when(argv.length > 2, () => argv.slice(2), ParseErrorNs.tooFewArguments)
  .map((args) => parseArgs(args, gitCommandRegistry))
  .map(({ command, options, parameters }) => ({
    command,
    options,
    parameters,
    result: command.dispatch({ filesystem, manager, options, parameters }),
  }))
  .match(
    ({ result: value }) => {
      const result = value as unknown;

      if (result instanceof Result) {
        if (result.isOk()) {
          if (typeof result.value === "string") {
            process.stdout.write(result.value);
          } else if (result.value !== undefined) {
            process.stdout.write(String(result.value));
          }
        } else if (result.isErr()) {
          logger.error("[error] ", result.error);
          exit(1);
        }
      }
    },
    (error) => {
      if (error.type === "too-few-arguments") {
        logger.error("[error] too few arguments.");
      } else if (error.type === "unknown-command") {
        logger.error(`[error] unknown command ${error.command}.`);
      } else if (error.type === "unknown-option") {
        logger.error(`[error] unknown command ${error.option}.`);
      } else if (error.type === "invalid-command") {
        logger.error(
          `[error] invalid command 
          - ${error.errors.map(({ name: option, description: reason }) => `${option} - ${reason}`).join("\n - ")}.`,
        );
      }

      logger.info(createHelpStr());
      exit(1);
    },
  );
