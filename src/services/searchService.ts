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

  return outlets.filter((outlet) => {
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

        return brand?.brandName || "";
      });

    const outletAliases = Array.isArray(outlet.aliases) ? outlet.aliases : [];

    return (
      matchesSearchValue(outlet.name, queryValues) ||
      outletAliases.some((alias) => matchesSearchValue(alias, queryValues)) ||
      matchesSearchValue(cityName, queryValues) ||
      matchesSearchValue(countryName, queryValues) ||
      outletBrandNames.some((brandName) =>
        matchesSearchValue(brandName, queryValues)
      )
    );
  });
}
