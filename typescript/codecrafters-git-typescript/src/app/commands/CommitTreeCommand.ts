import { Command } from "../../lib/commands/Command.ts";
import { Result } from "../../lib/utils/Result.ts";

export const CommitTreeCommand = Command.new({
  name: "commit-tree",
  description: "writes the contents of a provided tree as a commit object.",
  options: {
    parentHash: {
      name: "parent",
      shortname: "p",
      optional: true,
      description: "hash of a parent tree object to commit.",
      parse: ([path]) => path,
    },
    message: {
      name: "message",
      shortname: "m",
      optional: true,
      description: "message of a commit.",
      parse: ([path]) => path,
    },
  },
  onDispatch({ manager, options: { parentHash, message }, parameters: [hash] }) {
    const author = "ban ban";
    const email = "ban@ban.com";

    const content = `\
tree ${hash}
parent ${parentHash}
author ${author} <${email}> 946684800 -0800
comitter ${author} <${email}> 946684800 -0800

${message}
`;

    return Result.ok(manager.intoFile({ type: "commit", content }));
  },
});
