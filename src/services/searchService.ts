import { brands } from "../constants/brands/index";
import { outletBrands } from "../constants/outletBrands/index";
import { outlets } from "../constants/outlets";
import {
  buildSearchIndex,
  type SearchIndexItem,
  type SearchItemType,
} from "./searchIndex";
import { getCityName, getCountryName } from "./locationService";
import { expandSearchValues, normalizeSearchText } from "./searchAliases";
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

  if (!value) {
    return [];
  }

  return buildSearchIndex()
    .filter((item) =>
      [item.title, item.subtitle, ...item.keywords].some((keyword) =>
        matchesSearchValue(keyword, queryValues)
      )
    )
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
      }, 0);

      return { outlet, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.outlet.name.localeCompare(b.outlet.name))
    .map((item) => item.outlet);
}
