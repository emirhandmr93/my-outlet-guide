import { brands } from "../constants/brands/index";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { outlets } from "../constants/outlets";
import { getCityName, getCountryName } from "./locationService";
import { getLocalizedSearchAliases } from "./searchAliases";
import { getBrandSearchAliases } from "./brandAliases";
import { getLocalizedLocationSearchValues } from "../utils/locationDisplay";

export type SearchItemType =
  | "outlet"
  | "brand"
  | "city"
  | "country"
  | "category";

export type SearchIndexItem = {
  id: string;
  title: string;
  subtitle: string;
  type: SearchItemType;
  keywords: string[];
};

function compactKeywords(values: Array<string | undefined | null>) {
  return values.filter((value): value is string => Boolean(value));
}

function getOutletAliases(outlet: { aliases?: string[]; [key: string]: unknown }) {
  return Array.isArray(outlet.aliases) ? outlet.aliases : [];
}

export function buildSearchIndex(): SearchIndexItem[] {
  const outletItems: SearchIndexItem[] = outlets.map((outlet) => ({
    id: outlet.outletId,
    title: outlet.name,
    subtitle: `${getCityName(outlet.cityId)}, ${getCountryName(outlet.countryId)}`,
    type: "outlet",
    keywords: compactKeywords([
      outlet.name,
      ...getOutletAliases(outlet),
      getCityName(outlet.cityId),
      getCountryName(outlet.countryId),
      ...getLocalizedSearchAliases(getCountryName(outlet.countryId)),
      ...getLocalizedLocationSearchValues(getCityName(outlet.cityId)),
      outlet.countryId,
      outlet.cityId,
      outlet.status,
      outlet.taxFreeAvailable ? "tax free" : "limited tax free",
    ]),
  }));

  const brandItems: SearchIndexItem[] = brands
    .filter((brand) => brand.brandStatus === "active")
    .map((brand) => ({
      id: brand.brandId,
      title: brand.brandName,
      subtitle: "Brand",
      type: "brand",
      keywords: compactKeywords([
        brand.brandName,
        ...(Array.isArray(brand.aliases) ? brand.aliases : []),
        ...getBrandSearchAliases(brand),
        brand.categoryId,
      ]),
    }));

  const cityItems: SearchIndexItem[] = cities.map((city) => ({
    id: city.cityId,
    title: city.cityName,
    subtitle: "City",
    type: "city",
    keywords: compactKeywords([
      city.cityName,
      city.countryId,
      ...getLocalizedSearchAliases(getCountryName(city.countryId)),
      ...getLocalizedLocationSearchValues(city.cityName),
    ]),
  }));

  const countryItems: SearchIndexItem[] = countries.map((country) => ({
    id: country.countryId,
    title: country.countryName,
    subtitle: "Country",
    type: "country",
    keywords: compactKeywords([
      country.countryName,
      ...getLocalizedSearchAliases(country.countryName),
      country.countryId,
      country.currency,
      country.continent,
    ]),
  }));

  const categoryItems: SearchIndexItem[] = categories.map((category) => ({
    id: category.categoryId,
    title: category.categoryName,
    subtitle: "Category",
    type: "category",
    keywords: compactKeywords([category.categoryName, category.categoryId]),
  }));

  return [
    ...outletItems,
    ...brandItems,
    ...cityItems,
    ...countryItems,
    ...categoryItems,
  ];
}
