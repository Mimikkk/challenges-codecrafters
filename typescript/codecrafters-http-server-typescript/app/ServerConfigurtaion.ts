import { parseArgs } from "node:util";
import { sanitize } from "./common.ts";

const { values: { directory, host, port } } = parseArgs({
  options: {
    port: { type: "string", default: "4221" },
    host: { type: "string", default: "localhost" },
    directory: { type: "string" },
  },
});

console.log("Server parameters:", {
  url: `http://${host}:${port}`,
  features: {
    files: {
      enabled: !!directory,
      url: directory,
    },
  },
});

export const ServerConfigurtaion = {
  port: +port,
  host: host,
  features: { files: { enabled: !!directory, url: sanitize(directory ?? "") } },
};
