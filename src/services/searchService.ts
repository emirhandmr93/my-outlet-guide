import { brands } from "../constants/brands/index";
import { outletBrands } from "../constants/outletBrands/index";
import { outlets } from "../constants/outlets";
import {
  buildSearchIndex,
  type SearchIndexItem,
  type SearchItemType,
} from "./searchIndex";
import { getCityName, getCountryName } from "./locationService";
import {
  expandSearchValues,
  getExactLocalizedCountryIntent,
  normalizeSearchText,
} from "./searchAliases";
import { getBrandSearchAliases } from "./brandAliases";

function normalizeSearchValue(value: string) {
  return normalizeSearchText(value);
}

function matchesSearchValue(value: string, queries: string[]) {
  const normalizedValue = normalizeSearchValue(value);
  return queries.some((query) => normalizedValue.includes(query));
}

export function searchAll(query: string, limit = 10): SearchIndexItem[] {
  const value = normalizeSearchValue(query);
  const queryValues = expandSearchValues(query).map(normalizeSearchValue);
  const countryIntent = getExactLocalizedCountryIntent(query);

  if (!value) {
    return [];
  }

  return buildSearchIndex()
    .map((item) => {
      const matches = [item.title, item.subtitle, ...item.keywords].some((keyword) =>
        matchesSearchValue(keyword, queryValues)
      );
      const countryIntentBonus = countryIntent
        ? item.type === "country" && item.id === countryIntent.countryId
          ? 5000
          : item.keywords.some((keyword) => normalizeSearchValue(keyword) === countryIntent.countryId)
            ? item.type === "city"
              ? 4000
              : item.type === "outlet"
                ? 3000
                : 0
            : 0
        : 0;
      return { item, score: (matches ? 1 : 0) + countryIntentBonus };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .slice(0, limit);
}

export function searchByType(
  query: string,
  type: SearchItemType,
  limit = 10
): SearchIndexItem[] {
  return searchAll(query, 100)
    .filter((item) => item.type === type)
    .slice(0, limit);
}

export function searchOutlets(query: string) {
  const value = normalizeSearchValue(query);
  const queryValues = expandSearchValues(query).map(normalizeSearchValue);
  const countryIntent = getExactLocalizedCountryIntent(query);

  if (!value) {
    return outlets;
  }

  return outlets
    .map((outlet) => {
      const cityName = getCityName(outlet.cityId);
      const countryName = getCountryName(outlet.countryId);

      const outletBrandNames = outletBrands
        .filter(
          (item) =>
            item.outletId === outlet.outletId && item.relationStatus === "active"
        )
        .map((item) => {
          const brand = brands.find(
            (brand) =>
              brand.brandId === item.brandId && brand.brandStatus === "active"
          );

          return brand ? [brand.brandName, ...(Array.isArray(brand.aliases) ? brand.aliases : []), ...getBrandSearchAliases(brand)].join(" ") : "";
        });

      const outletAliases = Array.isArray(outlet.aliases) ? outlet.aliases : [];
      const countryAliases = expandSearchValues(countryName);
      const cityAliases = expandSearchValues(cityName);
      const exactCountryIntentBonus =
        countryIntent && outlet.countryId === countryIntent.countryId ? 5000 : 0;
      const scoreParts = [
        { values: [outlet.name, ...outletAliases], score: 900 },
        { values: [cityName, ...cityAliases], score: 800 },
        { values: [countryName, ...countryAliases], score: 700 },
        { values: outletBrandNames, score: 350 },
      ];
      const score = scoreParts.reduce((total, part) => {
        if (part.values.some((entry) => matchesSearchValue(entry, queryValues))) {
          return total + part.score;
        }
        return total;
      }, exactCountryIntentBonus);

      return { outlet, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.outlet.name.localeCompare(b.outlet.name))
    .map((item) => item.outlet);
}
