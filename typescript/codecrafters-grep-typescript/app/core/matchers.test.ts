import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { matchLongest } from "../core/matchers.ts";

describe("core - matchers", () => {
  it("should not match empty candidates", () => {
    const match = matchLongest("\\d", 0, [], () => "");

    expect(match).toBeUndefined();
  });

  it("should not match bad candidates", () => {
    const match = matchLongest("matching", 0, ["non-matching"], (item) => item);

    expect(match).toBeUndefined();
  });

  it("should match", () => {
    const value = "abc";
    const match = matchLongest(value, 0, [value], (item) => item);

    expect(match).toBe(value);
  });

  it("should match longest", () => {
    const shorter = "ab";
    const longer = "abc";

    const match = matchLongest(longer, 0, [shorter, longer], (item) => item);
    expect(match).toBe(longer);
  });
});
