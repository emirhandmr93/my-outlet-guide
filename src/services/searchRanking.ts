import { normalizeSearchText } from "./searchAliases";

function normalizeSearchValue(value: string) {
  return normalizeSearchText(value);
}

export function calculateSearchScore(
  queryTokens: string[],
  targetValues: string[]
): number {
  let score = 0;

  const normalizedTargets = targetValues
    .filter(Boolean)
    .map((value) => normalizeSearchValue(value));

  queryTokens.forEach((token) => {
    const normalizedToken = normalizeSearchValue(token);

    normalizedTargets.forEach((target) => {
      if (target === normalizedToken) {
        score += 100;
        return;
      }

      if (target.startsWith(normalizedToken)) {
        score += 75;
        return;
      }

      if (target.includes(normalizedToken)) {
        score += 50;
      }
    });
  });

  return score;
}
