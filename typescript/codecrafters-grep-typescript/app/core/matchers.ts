export const matchLongest = <T>(
  input: string,
  inputOffset: number,
  candidates: T[],
  by: (candidate: T) => string,
) => {
  let longestCandidate: T | undefined;
  let longestLength: number | undefined;

  for (let i = 0; i < candidates.length; ++i) {
    const item = candidates[i];
    const candidate = by(item);

    for (let j = 0, jt = candidate.length; j < jt; ++j) {
      if (input.charCodeAt(j + inputOffset) !== candidate.charCodeAt(j)) break;

      if (longestLength === undefined || jt > longestLength) {
        longestLength = candidate.length;
        longestCandidate = item;
      }
    }
  }

  return longestCandidate;
};
