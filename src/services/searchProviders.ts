import { brands } from "../constants/brands/index";
import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { outlets } from "../constants/outlets";
import { getCityName, getCountryName } from "./locationService";
import { searchFeatureIndex } from "./searchFeatureIndex";
import type { SearchResult } from "./searchTypes";

export function getSearchProviderItems(): SearchResult[] {
  const outletResults: SearchResult[] = outlets.map((outlet) => ({
    id: outlet.outletId,
    title: outlet.name,
    subtitle: `${getCityName(outlet.cityId)}, ${getCountryName(outlet.countryId)}`,
    type: "outlet",
    routeName: "OutletDetail",
    routeParams: {
      outletId: outlet.outletId,
    },
    keywords: Array.isArray(outlet.aliases) ? outlet.aliases : [],
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
    title: feature.title,
    subtitle: feature.subtitle,
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
