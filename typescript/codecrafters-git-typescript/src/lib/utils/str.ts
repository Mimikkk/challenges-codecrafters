export namespace Str {
  const newlineRe = /\r\n|\r|\n/;
  const startNewlineRe = /^\r\n|\r|\n/;
  export const trim = (value: string): string => value.trim();
  export const lines = (value: string): string[] => {
    const lines = value.split(newlineRe);
    if (lines[lines.length - 1] === "") lines.pop();
    return lines;
  };

  export const trimlines = (template: TemplateStringsArray, ...values: unknown[]): string => {
    const str = String.raw({ raw: template }, ...values).replace(startNewlineRe, "");
    const lines = Str.lines(str);

    const offsets = lines.filter((l) => l.trimStart() !== "").map((l) => l.length - l.trimStart().length);
    const offset = offsets.length === 0 ? 0 : Math.min(...offsets);

    return lines
      .map((line) => line.trimEnd().substring(offset))
      .join("\n")
      .trimEnd();
  };
}
