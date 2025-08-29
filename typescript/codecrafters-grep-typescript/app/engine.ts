import { type MapToken, type Token, tokenize, TokenNs, TokenType } from "./tokenizer.ts";

export const matches = (input: string, pattern: string): boolean => {
  const alternatives = tokenize(pattern);

  return alternatives.some(({ tokens }) => {
    return matchTokens(input, tokens).type === MatchType.Match;
  });
};

const matchTokens = (
  input: string,
  tokens: Token[],
  groups: Record<number, string> = {},
  path: TokenMatch[] = [],
  inputStartAt: number = 0,
  inputEndAt: number = input.length,
): Match => {
  const candidates: Candidate[] = Array
    .from({ length: input.length })
    .fill(null)
    .map((_, i) => [i, 0, groups, path])
    .reverse() as [];

  const tokenEndAt = tokens.length;

  while (candidates.length) {
    const candidate = candidates.pop()!;
    const [inputAt, tokenAt, groups, path] = candidate;
    const context: MatchContext = {
      input,
      inputAt,
      inputStartAt,
      inputEndAt,
      groups: groups,
      path,
    };

    if (tokenAt === tokenEndAt) {
      return MatchNs.match(0, inputAt, context.groups, path);
    }

    const matches = matchToken(context, tokens[tokenAt]);
    if (!matches?.length) continue;

    candidates.push(...matches.map((match) => {
      const newPath = [...path, match];

      const newGroups: Record<number, string> = { ...groups };
      if (match.group !== undefined && match.groupIndex !== undefined) {
        newGroups[match.groupIndex] = match.group;
      }

      for (const { group, groupIndex } of match.path) {
        if (group !== undefined && groupIndex !== undefined) {
          newGroups[groupIndex] = group;
        }
      }

      console.log(newGroups);

      return [match.endAt, tokenAt + 1, newGroups, newPath] as Candidate;
    }));
  }

  return MatchNs.empty();
};
const matchToken = (context: MatchContext, token: Token): TokenMatch[] | undefined => {
  console.count("tok-" + token.type);
  return map[token.type as Exclude<TokenType, TokenType.Alternative>](context, token as never);
};

const map: MatchRecord = {
  [TokenType.AnchorStart]: ({ inputAt, inputStartAt, path }) => {
    return inputAt === inputStartAt ? [{ startAt: inputAt, endAt: inputAt, path }] : undefined;
  },
  [TokenType.AnchorEnd]: ({ inputAt, inputEndAt, path }) =>
    inputAt === inputEndAt ? [{ startAt: inputAt, endAt: inputAt, path }] : undefined,
  [TokenType.Character]: ({ input, inputAt, path }, { character }) =>
    input.charAt(inputAt) === character ? [{ startAt: inputAt, endAt: inputAt + 1, path }] : undefined,
  [TokenType.Wildcard]: ({ inputAt, path }) => [{ startAt: inputAt, endAt: inputAt + 1, path }],
  [TokenType.PositiveCharacterGroup]: ({ input, inputAt, path }, { characters }) => {
    return characters.includes(input.charAt(inputAt)) ? [{ path, startAt: inputAt, endAt: inputAt + 1 }] : undefined;
  },
  [TokenType.NegativeCharacterGroup]: ({ input, inputAt, path }, { characters }) => {
    return !characters.includes(input.charAt(inputAt)) ? [{ path, startAt: inputAt, endAt: inputAt + 1 }] : undefined;
  },
  [TokenType.EscapeGroup]: ({ input, inputAt, path }, { characters }) => {
    return characters.includes(input.charAt(inputAt)) ? [{ path, startAt: inputAt, endAt: inputAt + 1 }] : undefined;
  },
  [TokenType.OneOrMore]: (context, { token }) => {
    const firstMatches = matchToken(context, token);

    if (!firstMatches) return;
    const results = firstMatches;

    let { endAt: at } = results[0];
    while (true) {
      const matches = matchToken({ ...context, inputAt: at }, token);

      if (!matches?.length) break;

      results.push(...matches);

      at = matches[0].endAt;
      if (at > context.inputEndAt) break;
    }

    return results;
  },
  [TokenType.ZeroOrMore]: (context, { token }) => {
    const results = [];
    let at = context.inputAt;

    while (true) {
      const matches = matchToken({ ...context, inputAt: at }, token);
      if (!matches) break;

      results.push(...matches);

      at = matches[0]?.endAt;
    }

    return results;
  },
  [TokenType.Optional]: (context, { token }) => {
    const matches = matchToken(context, token);

    return matches
      ? [{ startAt: context.inputAt, endAt: context.inputAt, path: context.path }, ...matches]
      : [{ startAt: context.inputAt, endAt: context.inputAt, path: context.path }];
  },
  [TokenType.Group]: (context, token) => {
    const input = context.input.substring(context.inputAt);

    for (const { tokens } of token.alternatives) {
      if (tokens[0].type === TokenType.Character) {
        tokens.unshift(TokenNs.anchorStart());
      }

      const match = matchTokens(input, tokens, context.groups, context.path, context.inputStartAt, context.inputEndAt);

      if (match.type === MatchType.Empty) continue;

      return [{
        startAt: context.inputAt,
        endAt: context.inputAt + match.endAt,
        groupIndex: token.index,
        group: input.substring(0, match.endAt),
        path: match.path,
      }];
    }

    return [];
  },
  [TokenType.Backreference]: (context, token) => {
    const group = context.groups[token.groupIndex];

    if (!context.input.startsWith(group, context.inputAt)) return;
    return [{ startAt: context.inputAt, endAt: context.inputAt + group.length, path: context.path }];
  },
};

type TokenMatch = { startAt: number; endAt: number; groupIndex?: number; group?: string; path: TokenMatch[] };

type Candidate = [inputOffset: number, tokensOffset: number, groups: Record<number, string>, path: TokenMatch[]];

type MatchContext = {
  input: string;
  inputAt: number;
  inputStartAt: number;
  inputEndAt: number;
  groups: Record<number, string>;
  path: TokenMatch[];
};
type MatchFn<T extends TokenType> = (context: MatchContext, token: MapToken<T>) => TokenMatch[] | undefined;

type MatchRecord = { [T in Exclude<TokenType, TokenType.Alternative>]: MatchFn<T> };

const enum MatchType {
  Empty = "empty",
  Match = "match",
}

type Match =
  | { type: MatchType.Match; startAt: number; endAt: number; groups: Record<number, string>; path: TokenMatch[] }
  | { type: MatchType.Empty };

export namespace MatchNs {
  export const match = (startAt: number, endAt: number, groups: Record<number, string>, path: TokenMatch[]): Match => ({
    type: MatchType.Match,
    startAt,
    endAt,
    groups,
    path,
  });
  export const empty = (): Match => ({ type: MatchType.Empty });
}
