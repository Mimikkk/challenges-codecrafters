import { matchLongest } from "./core/matchers.ts";

export const enum TokenType {
  AnchorStart = "anchor-start",
  Character = "character",
  NegativeCharacterGroup = "negative-character-group",
  PositiveCharacterGroup = "positive-character-group",
  EscapeGroup = "escape-group",
  Group = "group",
  AnchorEnd = "anchor-end",
  OneOrMore = "one-or-more",
  ZeroOrMore = "zero-or-more",
  Optional = "optional",
  Wildcard = "wildcard",
  Alternative = "alternative",
  Backreference = "backreference",
}

export type MapToken<T extends TokenType> = Token extends infer Y ? Y extends { type: T } ? Y : never : never;
export type Token =
  | { type: TokenType.EscapeGroup; characters: string[] }
  | { type: TokenType.PositiveCharacterGroup; characters: string }
  | { type: TokenType.NegativeCharacterGroup; characters: string }
  | { type: TokenType.Group; alternatives: MapToken<TokenType.Alternative>[]; index: number }
  | { type: TokenType.AnchorEnd }
  | { type: TokenType.OneOrMore; token: Token }
  | { type: TokenType.ZeroOrMore; token: Token }
  | { type: TokenType.Optional; token: Token }
  | { type: TokenType.Wildcard }
  | { type: TokenType.AnchorStart }
  | { type: TokenType.Character; character: string }
  | { type: TokenType.Backreference; groupIndex: number }
  | { type: TokenType.Alternative; tokens: Token[] };

export namespace TokenNs {
  export const escapeGroup = (characters: string[]): MapToken<TokenType.EscapeGroup> => ({
    type: TokenType.EscapeGroup,
    characters,
  });

  export const character = (character: string): MapToken<TokenType.Character> => ({
    type: TokenType.Character,
    character,
  });
  export const characters = (characters: string): MapToken<TokenType.Character>[] =>
    Array.from(characters).map(character);

  export const anchorStart = (): MapToken<TokenType.AnchorStart> => ({
    type: TokenType.AnchorStart,
  });

  export const anchorEnd = (): MapToken<TokenType.AnchorEnd> => ({
    type: TokenType.AnchorEnd,
  });

  export const positiveCharacterGroup = (characters: string): MapToken<TokenType.PositiveCharacterGroup> => ({
    type: TokenType.PositiveCharacterGroup,
    characters,
  });

  export const negativeCharacterGroup = (characters: string): MapToken<TokenType.NegativeCharacterGroup> => ({
    type: TokenType.NegativeCharacterGroup,
    characters,
  });

  export const group = (alternatives: MapToken<TokenType.Alternative>[], index: number): MapToken<TokenType.Group> => ({
    type: TokenType.Group,
    alternatives,
    index,
  });

  export const oneOrMore = (token: Token): MapToken<TokenType.OneOrMore> => ({
    type: TokenType.OneOrMore,
    token,
  });

  export const zeroOrMore = (token: Token): MapToken<TokenType.ZeroOrMore> => ({
    type: TokenType.ZeroOrMore,
    token,
  });

  export const optional = (token: Token): MapToken<TokenType.Optional> => ({
    type: TokenType.Optional,
    token,
  });

  export const wildcard = (): MapToken<TokenType.Wildcard> => ({
    type: TokenType.Wildcard,
  });

  export const backreference = (groupIndex: number): MapToken<TokenType.Backreference> => ({
    type: TokenType.Backreference,
    groupIndex: groupIndex - 1,
  });

  export const alternative = (tokens: Token[]): MapToken<TokenType.Alternative> => ({
    type: TokenType.Alternative,
    tokens,
  });
}

export interface EscapeGroup {
  name: string;
  description: string;
  pattern: string;
  characters: string[];
}

export const escapeGroups = {
  digits: {
    name: "digits",
    description: "matches digits: 0-9",
    characters: Array.from("0123456789"),
    pattern: "d",
  },
  alphanum: {
    name: "alphanumeric",
    description: "Matches alphanumeric values: 0-9, a-z, A-Z, _",
    characters: Array.from("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"),
    pattern: "w",
  },
} satisfies Record<string, EscapeGroup>;

const list: EscapeGroup[] = Object.values(escapeGroups);

const byPattern = (group: EscapeGroup): string => group.pattern;
export const matchEscapeGroup = (pattern: string, offset: number): EscapeGroup | undefined =>
  matchLongest(pattern, offset, list, byPattern);

export const tokenize = (pattern: string): MapToken<TokenType.Alternative>[] => {
  let groupIndex = 0;

  const createTokens = (pattern: string, startAt: number, endAt: number): MapToken<TokenType.Alternative>[] => {
    let offset = startAt;

    const tokens: Token[] = [];

    while (offset < endAt) {
      const character = pattern.charAt(offset);

      if (character === "^") {
        tokens.push(TokenNs.anchorStart());
        offset += 1;
      } else if (character === "|") {
        return [
          TokenNs.alternative(tokens),
          ...createTokens(pattern, offset + 1, endAt),
        ];
      } else if (character === "+") {
        tokens.push(TokenNs.oneOrMore(tokens.pop()!));
        offset += 1;
      } else if (character === "*") {
        tokens.push(TokenNs.zeroOrMore(tokens.pop()!));
        offset += 1;
      } else if (character === "?") {
        tokens.push(TokenNs.optional(tokens.pop()!));
        offset += 1;
      } else if (character === ".") {
        tokens.push(TokenNs.wildcard());
        offset += 1;
      } else if (character === "$") {
        tokens.push(TokenNs.anchorEnd());
        offset += 1;
      } else if (character === "[" && character && pattern.charAt(offset + 1) === "^") {
        offset += 2;

        const startAt = offset;
        while (pattern.charAt(offset) !== "]") offset += 1;
        const endAt = offset;

        tokens.push(TokenNs.negativeCharacterGroup(pattern.slice(startAt, endAt)));
        offset += 1;
      } else if (character === "(") {
        offset += 1;
        let depth = 1;

        const startAt = offset;
        while (true) {
          const character = pattern.charAt(offset);

          if (character === "(") {
            depth += 1;
          } else if (character === ")") {
            depth -= 1;
          }

          if (depth === 0) break;

          offset += 1;
        }

        const endAt = offset;

        const index = groupIndex;
        groupIndex += 1;
        tokens.push(TokenNs.group(createTokens(pattern, startAt, endAt), index));

        offset += 1;
      } else if (character === "[") {
        offset += 1;

        const startAt = offset;
        while (pattern.charAt(offset) !== "]") offset += 1;
        const endAt = offset;

        tokens.push(TokenNs.positiveCharacterGroup(pattern.slice(startAt, endAt)));
        offset += 1;
      } else if (character === "\\") {
        offset += 1;

        const group = matchEscapeGroup(pattern, offset);
        if (group) {
          tokens.push(TokenNs.escapeGroup(group.characters));
          offset += group.pattern.length;
        } else {
          const character = pattern.charAt(offset);

          if (escapeGroups.digits.characters.includes(character)) {
            tokens.push(TokenNs.backreference(+character));
          } else {
            tokens.push(TokenNs.character(character));
          }

          offset += 1;
        }
      } else {
        tokens.push(TokenNs.character(character));
        offset += 1;
      }
    }

    return tokens.length ? [TokenNs.alternative(tokens)] : [];
  };

  return createTokens(pattern, 0, pattern.length);
};
