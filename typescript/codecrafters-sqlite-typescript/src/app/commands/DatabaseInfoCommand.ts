import { Buffer } from "node:buffer";
import { Command } from "../../lib/commands/Command.ts";
import { Database } from "../../lib/storage/Database.ts";
import { DatabaseHeader } from "../../lib/storage/DatabaseHeader.ts";

export const databaseInfoCommand = Command.new({
  name: "database-info",
  description: "Get database information",
  options: { path: { type: "string", required: true } },
  async onInvoke({ path }) {
    await using database = await Database.new({ path });

    const buffer = Buffer.allocUnsafe(100);
    await database.read(buffer, 0, 100, 0);

    const header = DatabaseHeader.fromBuffer(buffer);
    console.log(`database page size: ${header.pageSize}`);
  },
});
