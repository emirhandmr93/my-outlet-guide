import { searchApp } from "./searchEngine";

export function getExploreVisibleSearchResults(
  query: string,
  activeFilters: string[] = [],
) {
  const normalizedSearch = query.trim();
  if (!normalizedSearch) return [];

  return searchApp(normalizedSearch, 40).filter((item) => {
    if (item.type === "category") return false;
    if (activeFilters.length === 0) return true;
    return activeFilters.includes(item.type);
  });
}
