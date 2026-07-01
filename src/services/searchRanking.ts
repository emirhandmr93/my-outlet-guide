function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
