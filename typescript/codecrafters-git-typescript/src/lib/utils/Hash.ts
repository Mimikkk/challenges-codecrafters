import { type BinaryLike, createHash } from "node:crypto";

export namespace Hash {
  type Hashable = BinaryLike;

  export const from = (hashable: Hashable): string => createHash("sha1").update(hashable).digest("hex");
}
