import { brands } from "../constants/brands/index";
import { outletBrands } from "../constants/outletBrands/index";
import { outlets } from "../constants/outlets";
import {
  buildSearchIndex,
  type SearchIndexItem,
  type SearchItemType,
} from "./searchIndex";
import { getCityName, getCountryName } from "./locationService";

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function searchAll(query: string, limit = 10): SearchIndexItem[] {
  const value = normalizeSearchValue(query);

  if (!value) {
    return [];
  }

  return buildSearchIndex()
    .filter((item) =>
      [item.title, item.subtitle, ...item.keywords].some((keyword) =>
        keyword.toLowerCase().includes(value)
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
      outlet.name.toLowerCase().includes(value) ||
      outletAliases.some((alias) => alias.toLowerCase().includes(value)) ||
      cityName.toLowerCase().includes(value) ||
      countryName.toLowerCase().includes(value) ||
      outletBrandNames.some((brandName) =>
        brandName.toLowerCase().includes(value)
      )
    );
  });
}
