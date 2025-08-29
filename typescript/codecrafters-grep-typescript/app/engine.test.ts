import { expect } from "@std/expect/expect";
import { describe, it } from "@std/testing/bdd";
import { matches } from "./engine.ts";

interface Case {
  input: string;
  pattern: string;
  expected: boolean;
  only?: boolean;
}

const cases = (...cases: Case[]): Case[] => cases;

describe("tokenizer", () => {
  for (
    const { pattern, input, expected, only } of cases(
      {
        input: "aabb",
        pattern: "((.)(\\2))",
        expected: true,
      },
      {
        input: "3 red squares and 3 red circles",
        pattern: "(\\d+) (\\w+) squares and \\1 \\2 circles",
        expected: true,
      },
      {
        input: "3 red squares and 4 red circles",
        pattern: "(\\d+) (\\w+) squares and \\1 \\2 circles",
        expected: false,
      },
      {
        input: "ba",
        pattern: "^(a)$",
        expected: false,
      },
      {
        input: "'cat and cat' is the same as 'cat and cat'",
        pattern: "('(cat) and \\2') is the same as \\1",
        expected: true,
      },
      {
        input: "grep 101 is doing grep 101 times, and again grep 101 times",
        pattern: "((\\w\\w\\w\\w) (\\d\\d\\d)) is doing \\2 \\3 times, and again \\1 times",
        expected: true,
      },
      {
        input: "a b a b a b",
        pattern: "^((a) (b)) \\2 \\3 \\1$",
        expected: true,
      },
      {
        input: "abc-def is abc-def, not efg, abc, or def",
        pattern: "^(([abc]+)-([def]+)) is \\1, not ([^xyz]+), \\2, or \\3$",
        expected: true,
      },
      {
        input: "abc-def is abc-def, not abc, ",
        pattern: "^(([abc]+)-([def]+)) is \\1, not ([^xyz]+), $",
        expected: true,
      },
      {
        input: "a, ",
        pattern: "([^x]+), ",
        expected: true,
        only: true,
      },
      {
        input: "a, b, c",
        pattern: "([^xyz]+)",
        expected: true,
      },
      {
        input: "pineapple pie, pineapple and pie",
        pattern: "^(apple) (\\w+), \\1 and \\2$",
        expected: false,
      },
      {
        input: "aaaa",
        pattern: "(a)(.+)+",
        expected: true,
      },
      {
        input: "I see 1 cat, 2 dogs and 3 cows",
        pattern: "^I see (\\d (cat|dog|cow)s?(, | and )?)+$",
        expected: true,
      },
      {
        input: "b",
        pattern: "(a|b)",
        expected: true,
      },
      {
        input: "a",
        pattern: "a|b",
        expected: true,
      },
      {
        input: "ac",
        pattern: ".+bc",
        expected: false,
      },
      {
        input: "abc",
        pattern: "^abc$",
        expected: true,
      },
      {
        input: "abc",
        pattern: "^cab$",
        expected: false,
      },
      {
        input: "cab",
        pattern: "ab$",
        expected: true,
      },
      {
        input: "abc",
        pattern: "ab$",
        expected: false,
      },
      {
        input: "ab",
        pattern: "^ab",
        expected: true,
      },
      {
        input: "ba",
        pattern: "^ab",
        expected: false,
      },
      {
        input: "b",
        pattern: "[abc]",
        expected: true,
      },
      {
        input: "d",
        pattern: "[abc]",
        expected: false,
      },
      {
        input: "d",
        pattern: "[^abc]",
        expected: true,
      },
      {
        input: "c",
        pattern: "[^abc]",
        expected: false,
      },
      {
        input: "2",
        pattern: "\\d",
        expected: true,
      },
      {
        input: "a",
        pattern: "\\d",
        expected: false,
      },
      {
        input: "a",
        pattern: "\\w",
        expected: true,
      },
      {
        input: ";",
        pattern: "\\w",
        expected: false,
      },
      {
        input: ";",
        pattern: "\\w",
        expected: false,
      },
      {
        input: "aaa",
        pattern: "a+",
        expected: true,
      },
      {
        input: "ava",
        pattern: "a+va",
        expected: true,
      },
      {
        input: "aa",
        pattern: "a+aa",
        expected: false,
      },
      {
        input: "aaaaaa",
        pattern: "a+aa+aaa",
        expected: true,
      },
      {
        input: "abc",
        pattern: "ab?c",
        expected: true,
      },
      {
        input: "ac",
        pattern: "ab?c",
        expected: true,
      },
    )
  ) {
    if (only) {
      it.only(`should parse '${input}' with '${pattern}' as ${expected ? "a match" : "not a match"}`, () => {
        expect(matches(input, pattern)).toBe(expected);
      });
    } else {
      it(`should parse '${input}' with '${pattern}' as ${expected ? "a match" : "not a match"}`, () => {
        expect(matches(input, pattern)).toBe(expected);
      });
    }
  }
});
