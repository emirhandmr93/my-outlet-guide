import { brands } from "../constants/brands/index";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { outlets } from "../constants/outlets";
import { getCityName, getCountryName } from "./locationService";
import { searchFeatureIndex } from "./searchFeatureIndex";
import { getLocalizedSearchAliases } from "./searchAliases";
import type { SearchResult } from "./searchTypes";

type SearchProviderTranslator = (key: string) => string;

export function getSearchProviderItems(
  t?: SearchProviderTranslator,
): SearchResult[] {
  const outletResults: SearchResult[] = outlets.map((outlet) => ({
    id: outlet.outletId,
    title: outlet.name,
    subtitle: `${getCityName(outlet.cityId)}, ${getCountryName(outlet.countryId)}`,
    type: "outlet",
    routeName: "OutletDetail",
    routeParams: {
      outletId: outlet.outletId,
    },
    keywords: [
      ...(Array.isArray(outlet.aliases) ? outlet.aliases : []),
      getCityName(outlet.cityId),
      getCountryName(outlet.countryId),
      ...getLocalizedSearchAliases(getCountryName(outlet.countryId)),
    ],
    score: 0,
  }));

  const brandResults: SearchResult[] = brands
    .filter((brand) => brand.brandStatus === "active")
    .map((brand) => ({
      id: brand.brandId,
      title: brand.brandName,
      subtitle: "Brand",
      type: "brand",
      routeName: "BrandResults",
      routeParams: {
        brandId: brand.brandId,
      },
      score: 0,
    }));

  const cityResults: SearchResult[] = cities.map((city) => ({
    id: city.cityId,
    title: city.cityName,
    subtitle: "City",
    type: "city",
    routeName: "CityResults",
    routeParams: {
      cityId: city.cityId,
    },
    keywords: [
      city.cityName,
      getCountryName(city.countryId),
      ...getLocalizedSearchAliases(getCountryName(city.countryId)),
    ],
    score: 0,
  }));

  const countryResults: SearchResult[] = countries.map((country) => ({
    id: country.countryId,
    title: country.countryName,
    subtitle: "Country",
    type: "country",
    routeName: "Country",
    routeParams: {
      countryId: country.countryId,
    },
    keywords: [country.countryName, ...getLocalizedSearchAliases(country.countryName)],
    score: 0,
  }));

  const categoryResults: SearchResult[] = categories.map((category) => ({
    id: category.categoryId,
    title: category.categoryName,
    subtitle: "Category",
    type: "category",
    routeName: "Explore",
    routeParams: {
      categoryId: category.categoryId,
    },
    score: 0,
  }));

  const featureResults: SearchResult[] = searchFeatureIndex.map((feature) => ({
    id: feature.id,
    title: t ? t(feature.titleKey) : feature.title,
    subtitle: t ? t(feature.subtitleKey) : feature.subtitle,
    type: "feature",
    routeName: feature.routeName,
    score: 0,
  }));

  return [
    ...outletResults,
    ...brandResults,
    ...cityResults,
    ...countryResults,
    ...categoryResults,
    ...featureResults,
  ];
}
