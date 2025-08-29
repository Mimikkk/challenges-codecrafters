import { expect } from "@std/expect/expect";
import { describe, it } from "@std/testing/bdd";
import { escapeGroups, type Token, tokenize, TokenNs } from "./tokenizer.ts";

interface Case {
  pattern: string;
  tokens: Token[];
  only?: boolean;
}

const cases = (...cases: Case[]): Case[] => cases;

describe("tokenizer", () => {
  for (
    const { pattern, tokens, only } of cases(
      {
        pattern: "((.)(\\2))",
        tokens: [
          TokenNs.alternative([
            TokenNs.group([
              TokenNs.alternative([
                TokenNs.group([TokenNs.alternative([TokenNs.wildcard()])], 1),
                TokenNs.group([TokenNs.alternative([TokenNs.backreference(2)])], 2),
              ]),
            ], 0),
          ]),
        ],
      },
      {
        pattern: "((a) (b)) \\2 \\3 \\1",
        tokens: [
          TokenNs.alternative([
            TokenNs.group([
              TokenNs.alternative([
                TokenNs.group([TokenNs.alternative([TokenNs.character("a")])], 1),
                TokenNs.character(" "),
                TokenNs.group([TokenNs.alternative([TokenNs.character("b")])], 2),
              ]),
            ], 0),
            TokenNs.character(" "),
            TokenNs.backreference(2),
            TokenNs.character(" "),
            TokenNs.backreference(3),
            TokenNs.character(" "),
            TokenNs.backreference(1),
          ]),
        ],
      },
      {
        pattern: "(([abc]+)-([def]+)) is \\1, not ([^xyz]+), \\2, or \\3",
        tokens: [
          TokenNs.alternative([
            TokenNs.group([
              TokenNs.alternative([
                TokenNs.group([TokenNs.alternative([
                  TokenNs.oneOrMore(TokenNs.positiveCharacterGroup("abc")),
                ])], 1),
                TokenNs.character("-"),
                TokenNs.group([TokenNs.alternative([
                  TokenNs.oneOrMore(TokenNs.positiveCharacterGroup("def")),
                ])], 2),
              ]),
            ], 0),
            ...TokenNs.characters(" is "),
            TokenNs.backreference(1),
            ...TokenNs.characters(", not "),
            TokenNs.group([TokenNs.alternative([
              TokenNs.oneOrMore(TokenNs.negativeCharacterGroup("xyz")),
            ])], 3),
            ...TokenNs.characters(", "),
            TokenNs.backreference(2),
            ...TokenNs.characters(", or "),
            TokenNs.backreference(3),
          ]),
        ],
      },
      {
        pattern: "^(apple) (\\w+), \\1 and \\2$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            TokenNs.group([
              TokenNs.alternative(TokenNs.characters("apple")),
            ], 0),
            TokenNs.character(" "),
            TokenNs.group([
              TokenNs.alternative([TokenNs.oneOrMore(TokenNs.escapeGroup(escapeGroups.alphanum.characters))]),
            ], 1),
            ...TokenNs.characters(", "),
            TokenNs.backreference(1),
            ...TokenNs.characters(" and "),
            TokenNs.backreference(2),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "(\\d+) (\\w+) squares and \\1 \\2 circles",
        tokens: [
          TokenNs.alternative([
            TokenNs.group([
              TokenNs.alternative([
                TokenNs.oneOrMore(TokenNs.escapeGroup(escapeGroups.digits.characters)),
              ]),
            ], 0),
            TokenNs.character(" "),
            TokenNs.group([
              TokenNs.alternative([
                TokenNs.oneOrMore(TokenNs.escapeGroup(escapeGroups.alphanum.characters)),
              ]),
            ], 1),
            ...TokenNs.characters(" squares and "),
            TokenNs.backreference(1),
            TokenNs.character(" "),
            TokenNs.backreference(2),
            ...TokenNs.characters(" circles"),
          ]),
        ],
      },
      {
        pattern: "^abc$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            ...TokenNs.characters("abc"),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "((a)b)",
        tokens: [
          TokenNs.alternative([
            TokenNs.group([
              TokenNs.alternative([
                TokenNs.group([
                  TokenNs.alternative(TokenNs.characters("a")),
                ], 1),
                TokenNs.character("b"),
              ]),
            ], 0),
          ]),
        ],
      },
      {
        pattern: "a|b",
        tokens: [
          TokenNs.alternative(TokenNs.characters("a")),
          TokenNs.alternative(TokenNs.characters("b")),
        ],
      },
      {
        pattern: "^I see (\\d (cat|dog|cow)s?(, | and )?)+$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            ...TokenNs.characters("I see "),
            TokenNs.oneOrMore(
              TokenNs.group([
                TokenNs.alternative([
                  TokenNs.escapeGroup(escapeGroups.digits.characters),
                  TokenNs.character(" "),
                  TokenNs.group([
                    TokenNs.alternative(TokenNs.characters("cat")),
                    TokenNs.alternative(TokenNs.characters("dog")),
                    TokenNs.alternative(TokenNs.characters("cow")),
                  ], 1),
                  TokenNs.optional(TokenNs.character("s")),
                  TokenNs.optional(
                    TokenNs.group([
                      TokenNs.alternative(TokenNs.characters(", ")),
                      TokenNs.alternative(TokenNs.characters(" and ")),
                    ], 2),
                  ),
                ]),
              ], 0),
            ),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "^\\d$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            TokenNs.escapeGroup(escapeGroups.digits.characters),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "^\\w$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            TokenNs.escapeGroup(escapeGroups.alphanum.characters),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "^[abc]$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            TokenNs.positiveCharacterGroup("abc"),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "^[^abc]$",
        tokens: [
          TokenNs.alternative([
            TokenNs.anchorStart(),
            TokenNs.negativeCharacterGroup("abc"),
            TokenNs.anchorEnd(),
          ]),
        ],
      },
      {
        pattern: "a+c",
        tokens: [
          TokenNs.alternative([
            TokenNs.oneOrMore(TokenNs.character("a")),
            TokenNs.character("c"),
          ]),
        ],
      },
      {
        pattern: "a*c",
        tokens: [
          TokenNs.alternative([
            TokenNs.zeroOrMore(TokenNs.character("a")),
            TokenNs.character("c"),
          ]),
        ],
      },
      {
        pattern: "a?c",
        tokens: [
          TokenNs.alternative([
            TokenNs.optional(TokenNs.character("a")),
            TokenNs.character("c"),
          ]),
        ],
      },
      {
        pattern: "a.c",
        tokens: [
          TokenNs.alternative([
            TokenNs.character("a"),
            TokenNs.wildcard(),
            TokenNs.character("c"),
          ]),
        ],
      },
      {
        pattern: "(a)",
        tokens: [
          TokenNs.alternative([
            TokenNs.group([
              TokenNs.alternative([TokenNs.character("a")]),
            ], 0),
          ]),
        ],
      },
    )
  ) {
    if (only) {
      it.only(`should tokenize '${pattern}'`, () => {
        const result = tokenize(pattern);

        expect(result).toEqual(tokens);
      });
    } else {
      it(`should tokenize '${pattern}'`, () => {
        const result = tokenize(pattern);

        expect(result).toEqual(tokens);
      });
    }
  }
});
