import { getExploreVisibleSearchResults } from "../src/services/exploreSearchResults";
import { searchOutlets } from "../src/services/searchService";
import { getActiveBrands, groupBrandsByCategory } from "../src/services/brandService";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function titles(query: string) {
  return searchOutlets(query).slice(0, 8).map((outlet) => outlet.name);
}

function assertOutletCountryFirst(query: string, countryId: string, blocked: RegExp) {
  const results = searchOutlets(query).slice(0, 8);
  assert(results.length > 0, `${query} should return outlet results`);
  assert(results.slice(0, 3).some((outlet) => outlet.countryId === countryId), `${query} should include ${countryId} outlets near the top: ${titles(query).join(", ")}`);
  const firstBlocked = results.findIndex((outlet) => blocked.test(outlet.name));
  const firstCountry = results.findIndex((outlet) => outlet.countryId === countryId);
  assert(firstCountry >= 0, `${query} should include ${countryId} outlets`);
  assert(firstBlocked === -1 || firstCountry < firstBlocked, `${query} should not rank unrelated outlets first: ${titles(query).join(", ")}`);
}

assertOutletCountryFirst("fransa", "france", /Athens/i);
assertOutletCountryFirst("Paris", "france", /Amsterdam|Bicester|Berlin/i);
assertOutletCountryFirst("almanya", "germany", /Athens|Paris|Amsterdam/i);
assertOutletCountryFirst("İtalya", "italy", /Athens|Paris|Amsterdam|Berlin/i);

const burber = getExploreVisibleSearchResults("burber", ["brand"]);
assert(burber.some((item) => item.type === "brand" && /burberry/i.test(item.title)), "burber should still return Burberry in the brand path");

const groupedBrandIds = new Set<string>();
groupBrandsByCategory(getActiveBrands()).forEach((group) => {
  const unique = new Set(group.brands.map((brand) => brand.brandId));
  assert(unique.size === group.brands.length, `${group.categoryId} category count must equal unique brand count`);
  group.brands.forEach((brand) => groupedBrandIds.add(brand.brandId));
});
assert(groupedBrandIds.size <= getActiveBrands().length, "category groups should not inflate brand counts");

console.log("Explore search ranking checks passed", {
  fransaTop: titles("fransa"),
  parisTop: titles("Paris"),
  almanyaTop: titles("almanya"),
  italyaTop: titles("İtalya"),
  burberTop: burber.slice(0, 5).map((item) => `${item.type}:${item.title}`),
});
