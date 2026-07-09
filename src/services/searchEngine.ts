import { parseSearchQuery } from "./searchParser";
import { getSearchProviderItems } from "./searchProviders";
import { calculateSearchScore } from "./searchRanking";
import {
  expandSearchValues,
  getStrongLocalizedCountryMatch,
} from "./searchAliases";
import type { SearchResult } from "./searchTypes";

function getLocalizedCountryPriority(
  item: SearchResult,
  matchedCountry: string | null,
) {
  if (!matchedCountry) return 0;

  const countryValue = matchedCountry.toLowerCase();
  const values = [item.title, item.subtitle, ...(item.keywords || [])].map(
    (value) => String(value).toLowerCase(),
  );
  const belongsToMatchedCountry = values.some((value) =>
    value.includes(countryValue),
  );

  if (!belongsToMatchedCountry) return item.type === "brand" ? -500 : 0;
  if (item.type === "country") return 10000;
  if (item.type === "city") return 8000;
  if (item.type === "outlet") return 6000;
  if (item.type === "brand") return -1000;
  return 0;
}

export function searchApp(query: string, limit = 12): SearchResult[] {
  const strongCountryMatch = getStrongLocalizedCountryMatch(query);
  const tokens = Array.from(
    new Set(
      expandSearchValues(query).flatMap((value) => parseSearchQuery(value)),
    ),
  );

  if (tokens.length === 0) {
    return [];
  }

  return getSearchProviderItems()
    .map((item) => {
      const score =
        calculateSearchScore(tokens, [
          item.title,
          item.subtitle,
          item.type,
          item.id,
          ...(item.keywords || []),
        ]) + getLocalizedCountryPriority(item, strongCountryMatch);

      return {
        ...item,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
