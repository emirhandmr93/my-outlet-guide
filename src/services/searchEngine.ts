import { parseSearchQuery } from "./searchParser";
import { getSearchProviderItems } from "./searchProviders";
import { calculateSearchScore } from "./searchRanking";
import { expandSearchValues } from "./searchAliases";
import type { SearchResult } from "./searchTypes";

export function searchApp(query: string, limit = 12): SearchResult[] {
  const tokens = Array.from(
    new Set(expandSearchValues(query).flatMap((value) => parseSearchQuery(value))),
  );

  if (tokens.length === 0) {
    return [];
  }

  return getSearchProviderItems()
    .map((item) => {
      const score = calculateSearchScore(tokens, [
        item.title,
        item.subtitle,
        item.type,
        item.id,
        ...(item.keywords || []),
      ]);

      return {
        ...item,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
