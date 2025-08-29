import { readFileSync } from "node:fs";
import process, { stdin } from "node:process";
import { parseArgs } from "node:util";
import { matches } from "./engine.ts";

const input = readFileSync(stdin.fd, "utf-8").trimEnd();

const { values: { extended }, positionals: [pattern] } = parseArgs({
  allowPositionals: true,
  options: {
    extended: {
      type: "boolean",
      short: "E",
      default: false,
    },
  },
});

console.debug({
  features: {
    extended,
  },
  pattern,
  input,
});

if (matches(input, pattern)) {
  console.log("match found.");
  process.exit(0);
} else {
  console.log("no match found.");
  process.exit(1);
}
