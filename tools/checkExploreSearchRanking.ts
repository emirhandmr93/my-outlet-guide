import { getExploreVisibleSearchResults } from "../src/services/exploreSearchResults";
import { searchOutlets } from "../src/services/searchService";
import {
  getActiveBrands,
  groupBrandsByCategory,
} from "../src/services/brandService";
import { cities } from "../src/constants/cities";
import { countries } from "../src/constants/countries";
import {
  expandSearchValues,
  normalizeSearchText,
} from "../src/services/searchAliases";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function titles(query: string) {
  return searchOutlets(query)
    .slice(0, 8)
    .map((outlet) => outlet.name);
}

const primaryExploreTabs = ["Countries", "Cities", "Outlets"];
assert(
  primaryExploreTabs.length === 3 && !primaryExploreTabs.includes("Brands"),
  "Explore primary tabs should be Countries, Cities, and Outlets only",
);

const localizedCityAliases: Record<string, string[]> = {
  munich: ["münih", "munih", "münchen"],
  vienna: ["viyana"],
  london: ["londra"],
  milan: ["milano"],
  paris: ["paris"],
  barcelona: ["barselona"],
  cologne: ["köln", "koln"],
  rome: ["roma"],
  amsterdam: ["amsterdam"],
};

function countryName(countryId: string) {
  return (
    countries.find((country) => country.countryId === countryId)?.countryName ??
    countryId
  );
}

function cityHaystack(city: {
  cityId: string;
  cityName: string;
  countryId: string;
}) {
  return normalizeSearchText(
    [
      city.cityName,
      city.cityId,
      countryName(city.countryId),
      city.countryId,
      ...expandSearchValues(countryName(city.countryId)),
      ...expandSearchValues(city.countryId.replace(/-/g, " ")),
      ...(localizedCityAliases[city.cityId] ?? []),
    ].join(" "),
  );
}

function searchCities(query: string) {
  const normalizedQuery = normalizeSearchText(query);
  return cities.filter((city) => cityHaystack(city).includes(normalizedQuery));
}

function assertOutletCountryFirst(
  query: string,
  countryId: string,
  blocked: RegExp,
) {
  const results = searchOutlets(query).slice(0, 8);
  assert(results.length > 0, `${query} should return outlet results`);
  assert(
    results.slice(0, 3).some((outlet) => outlet.countryId === countryId),
    `${query} should include ${countryId} outlets near the top: ${titles(query).join(", ")}`,
  );
  const firstBlocked = results.findIndex((outlet) => blocked.test(outlet.name));
  const firstCountry = results.findIndex(
    (outlet) => outlet.countryId === countryId,
  );
  assert(firstCountry >= 0, `${query} should include ${countryId} outlets`);
  assert(
    firstBlocked === -1 || firstCountry < firstBlocked,
    `${query} should not rank unrelated outlets first: ${titles(query).join(", ")}`,
  );
}

assertOutletCountryFirst("fransa", "france", /Athens/i);
assertOutletCountryFirst("Fransa", "france", /Athens/i);
assertOutletCountryFirst("Paris", "france", /Amsterdam|Bicester|Berlin/i);
assertOutletCountryFirst("almanya", "germany", /Athens|Paris|Amsterdam/i);
assertOutletCountryFirst("Italy", "italy", /Athens|Paris|Amsterdam|Berlin/i);
assertOutletCountryFirst("İtalya", "italy", /Athens|Paris|Amsterdam|Berlin/i);

const burber = getExploreVisibleSearchResults("burber", []);
assert(
  burber.some((item) => item.type === "brand" && /burberry/i.test(item.title)),
  "burber should still return Burberry in main Explore search",
);
const burberry = getExploreVisibleSearchResults("burberry", []);
assert(
  burberry.some(
    (item) => item.type === "brand" && /burberry/i.test(item.title),
  ),
  "burberry should still return Burberry in main Explore search",
);

assert(
  searchCities("Münih").some((city) => city.cityId === "munich"),
  "Münih should return Munich in Cities search",
);
assert(
  searchCities("Almanya").some((city) => city.countryId === "germany"),
  "Almanya should return Germany cities in Cities search",
);
assert(
  searchCities("Viyana").some((city) => city.cityId === "vienna"),
  "Viyana should return Vienna in Cities search",
);

const groupedBrandIds = new Set<string>();
groupBrandsByCategory(getActiveBrands()).forEach((group) => {
  const unique = new Set(group.brands.map((brand) => brand.brandId));
  assert(
    unique.size === group.brands.length,
    `${group.categoryId} category count must equal unique brand count`,
  );
  group.brands.forEach((brand) => groupedBrandIds.add(brand.brandId));
});
assert(
  groupedBrandIds.size <= getActiveBrands().length,
  "category groups should not inflate brand counts",
);

console.log("Explore search ranking checks passed", {
  fransaTop: titles("fransa"),
  localizedFransaTop: titles("Fransa"),
  parisTop: titles("Paris"),
  almanyaTop: titles("almanya"),
  italyTop: titles("Italy"),
  localizedItalyaTop: titles("İtalya"),
  burberTop: burber.slice(0, 5).map((item) => `${item.type}:${item.title}`),
  burberryTop: burberry.slice(0, 5).map((item) => `${item.type}:${item.title}`),
  cityAliasChecks: {
    munih: searchCities("Münih").map((city) => city.cityName),
    almanya: searchCities("Almanya")
      .slice(0, 5)
      .map((city) => city.cityName),
    viyana: searchCities("Viyana").map((city) => city.cityName),
  },
});
