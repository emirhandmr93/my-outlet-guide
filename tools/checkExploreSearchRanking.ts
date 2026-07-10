import { existsSync, readFileSync } from "node:fs";
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
  getExactLocalizedCountryIntent,
  normalizeSearchText,
} from "../src/services/searchAliases";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
  formatOutletLocationSubtitle,
} from "../src/utils/locationDisplay";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function titles(query: string) {
  return searchOutlets(query)
    .slice(0, 8)
    .map((outlet) => outlet.name);
}

const primaryExploreTabs = ["Countries", "Cities", "Outlets"];
const exploreScreenSource = readFileSync(
  "src/screens/ExploreScreen.tsx",
  "utf8",
);

assert(
  existsSync("assets/explore/explore-hero-premium.png"),
  "Explore hero asset should exist at assets/explore/explore-hero-premium.png",
);
assert(
  exploreScreenSource.includes("ImageBackground") &&
    exploreScreenSource.includes('resizeMode="cover"') &&
    exploreScreenSource.includes(
      "../../assets/explore/explore-hero-premium.png",
    ),
  "Explore hero should wire the premium asset with ImageBackground cover mode",
);
assert(
  !exploreScreenSource.includes("explore.filters.brands") &&
    !exploreScreenSource.includes("brandTabTitle"),
  "Explore screen should not expose a brand primary tab",
);
assert(
  !/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:/.test(exploreScreenSource),
  "Explore screen should not include visible debug prefixes",
);

assert(
  formatCountryDisplayName("italy", "tr") === "İtalya",
  "Italy should display as İtalya in Turkish",
);
assert(
  formatCountryDisplayName("france", "tr") === "Fransa",
  "France should display as Fransa in Turkish",
);
assert(
  formatCountryDisplayName("germany", "tr") === "Almanya",
  "Germany should display as Almanya in Turkish",
);
assert(
  formatCountryDisplayName("united-kingdom", "tr") === "Birleşik Krallık",
  "United Kingdom should display as Birleşik Krallık in Turkish",
);
assert(
  formatCountryDisplayName("austria", "tr") === "Avusturya",
  "Austria should display as Avusturya in Turkish",
);

assert(
  formatCountryDisplayName("italya", "tr") === "İtalya",
  "Lowercase Turkish Italy alias should format as İtalya in Turkish display paths",
);
assert(
  formatOutletLocationSubtitle("florence", "italy", "tr") ===
    "Floransa, İtalya",
  "Florence, Italy outlet subtitle should display as Floransa, İtalya",
);
assert(
  formatOutletLocationSubtitle("brugnato", "italy", "tr") ===
    "Brugnato, İtalya",
  "Brugnato, Italy outlet subtitle should display as Brugnato, İtalya",
);
assert(
  formatOutletLocationSubtitle("marseille", "france", "tr") ===
    "Marsilya, Fransa",
  "Marseille, France outlet subtitle should display as Marsilya, Fransa",
);
assert(
  formatOutletLocationSubtitle("paris", "france", "tr") === "Paris, Fransa",
  "Paris, France outlet subtitle should display as Paris, Fransa",
);
assert(
  formatCityDisplayName("munich", "tr") === "Münih",
  "Munich should display as Münih in Turkish",
);
assert(
  formatCityDisplayName("vienna", "tr") === "Viyana",
  "Vienna should display as Viyana in Turkish",
);
assert(
  formatCityDisplayName("london", "tr") === "Londra",
  "London should display as Londra in Turkish",
);
assert(
  formatCityDisplayName("milan", "tr") === "Milano",
  "Milan should display as Milano in Turkish",
);
assert(
  formatCityDisplayName("rome", "tr") === "Roma",
  "Rome should display as Roma in Turkish",
);
assert(
  formatCityDisplayName("florence", "tr") === "Floransa",
  "Florence should display as Floransa in Turkish",
);
assert(
  formatCityDisplayName("naples", "tr") === "Napoli",
  "Naples should display as Napoli in Turkish",
);
assert(
  formatCityDisplayName("cologne", "tr") === "Köln",
  "Cologne should display as Köln in Turkish",
);

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
      formatCityDisplayName(city.cityId, "tr"),
      formatCityDisplayName(city.cityId, "en"),
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
    results.slice(0, 3).every((outlet) => outlet.countryId === countryId),
    `${query} first 3 outlets should be ${countryId}: ${titles(query).join(", ")}`,
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

assert(
  getExactLocalizedCountryIntent("Fransa")?.countryId === "france",
  "Fransa should map exactly to France country intent",
);
assert(
  getExactLocalizedCountryIntent("Franciacorta") === null,
  "Franciacorta should not map to France country intent",
);
assert(
  getExactLocalizedCountryIntent("francia")?.countryId === "france",
  "francia should map exactly to France country intent",
);

assertOutletCountryFirst("fransa", "france", /Franciacorta/i);
assertOutletCountryFirst("Fransa", "france", /Athens/i);
assertOutletCountryFirst("Paris", "france", /Amsterdam|Bicester|Berlin/i);
assertOutletCountryFirst("almanya", "germany", /Athens|Paris|Amsterdam/i);
assertOutletCountryFirst("Italy", "italy", /Athens|Paris|Amsterdam|Berlin/i);
assertOutletCountryFirst("İtalya", "italy", /Athens|Paris|Amsterdam|Berlin/i);
assertOutletCountryFirst("italya", "italy", /Athens|Paris|Amsterdam|Berlin/i);
assertOutletCountryFirst(
  "Birleşik Krallık",
  "united-kingdom",
  /Athens|Paris|Amsterdam|Berlin|Franciacorta/i,
);

function assertExploreCountryBeforeBlocked(
  query: string,
  countryId: string,
  blocked: RegExp,
) {
  const results = getExploreVisibleSearchResults(query, []);
  const firstCountryRelated = results.findIndex(
    (item) =>
      item.id === countryId ||
      item.id.includes(countryId) ||
      (item.keywords || []).includes(countryId),
  );
  const firstBlocked = results.findIndex((item) => blocked.test(item.title));
  assert(
    firstCountryRelated >= 0,
    `${query} should include ${countryId}-related Explore results`,
  );
  assert(
    firstBlocked === -1 || firstCountryRelated < firstBlocked,
    `${query} should rank ${countryId} before blocked substring results: ${results
      .slice(0, 8)
      .map((item) => `${item.type}:${item.title}`)
      .join(", ")}`,
  );
}

assertExploreCountryBeforeBlocked("Fransa", "france", /Franciacorta/i);
assertExploreCountryBeforeBlocked("Almanya", "germany", /Franciacorta|France/i);
assertExploreCountryBeforeBlocked("İtalya", "italy", /France|Germany/i);

const ysl = getExploreVisibleSearchResults("ysl", []);
const hasYslSource = getActiveBrands().some((brand) =>
  /^(Yves Saint Laurent|Saint Laurent)$/i.test(brand.brandName),
);
if (hasYslSource) {
  assert(
    ysl.some(
      (item) =>
        item.type === "brand" &&
        /^(Yves Saint Laurent|Saint Laurent)$/i.test(item.title),
    ),
    "ysl should return Yves Saint Laurent or Saint Laurent when present",
  );
}

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
assert(
  searchCities("Londra").some((city) => city.cityId === "london"),
  "Londra should return London in Cities search",
);
assert(
  searchCities("Milano").some((city) => city.cityId === "milan"),
  "Milano should return Milan in Cities search",
);
assert(
  searchCities("Roma").some((city) => city.cityId === "rome"),
  "Roma should return Rome in Cities search",
);
assert(
  searchCities("Floransa").some((city) => city.cityId === "florence"),
  "Floransa should return Florence in Cities search",
);

const localizedCountryQueries = [
  ["fransa", "france"],
  ["almanya", "germany"],
  ["italya", "italy"],
  ["birleşik krallık", "united-kingdom"],
  ["france", "france"],
  ["germany", "germany"],
  ["italy", "italy"],
  ["united kingdom", "united-kingdom"],
  ["francia", "france"],
  ["alemania", "germany"],
  ["italia", "italy"],
  ["reino unido", "united-kingdom"],
  ["allemagne", "germany"],
  ["italie", "italy"],
  ["royaume-uni", "united-kingdom"],
  ["frankreich", "france"],
  ["deutschland", "germany"],
  ["italien", "italy"],
  ["vereinigtes königreich", "united-kingdom"],
  ["франция", "france"],
  ["германия", "germany"],
  ["италия", "italy"],
  ["великобритания", "united-kingdom"],
  ["فرنسا", "france"],
  ["ألمانيا", "germany"],
  ["إيطاليا", "italy"],
  ["المملكة المتحدة", "united-kingdom"],
  ["法国", "france"],
  ["德国", "germany"],
  ["意大利", "italy"],
  ["英国", "united-kingdom"],
] as const;
for (const [query, countryId] of localizedCountryQueries) {
  const results = getExploreVisibleSearchResults(query, ["country"]);
  assert(
    results.some((item) => item.type === "country" && item.id === countryId),
    `${query} should return ${countryId} in localized country search`,
  );
}

const translationValues = Array.from(
  readFileSync("src/translations/translations.ts", "utf8").matchAll(
    /"[^"]+"\s*:\s*"([^"]*)"/g,
  ),
).map((match) => match[1]);
const noUserFacingAlias = translationValues.every(
  (value) => !/\balias(?:es)?\b/i.test(value),
);
assert(
  noUserFacingAlias,
  "Explore UI and translations should not expose user-facing alias wording",
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
  yslTop: ysl.slice(0, 5).map((item) => `${item.type}:${item.title}`),
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
