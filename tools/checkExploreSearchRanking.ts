import { getExploreVisibleSearchResults } from "../src/services/exploreSearchResults";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertCountryBeforeFranceLikeBrands(query: string) {
  const results = getExploreVisibleSearchResults(query);
  const franceIndex = results.findIndex(
    (item) => item.type === "country" && item.title === "France",
  );
  const franceLikeBrandIndex = results.findIndex(
    (item) =>
      item.type === "brand" && /frances|francesco|france/i.test(item.title),
  );

  assert(franceIndex >= 0, `${query} should return the France country result`);
  assert(
    franceLikeBrandIndex === -1 || franceIndex < franceLikeBrandIndex,
    `${query} should rank France before France-like brand substring results`,
  );
  assert(
    results
      .slice(0, 8)
      .some((item) => item.type === "city" || item.type === "outlet"),
    `${query} should include French city/outlet entities near the top`,
  );

  return results.slice(0, 8).map((item) => `${item.type}:${item.title}`);
}

const fransaTop = assertCountryBeforeFranceLikeBrands("fransa");
const franceTop = assertCountryBeforeFranceLikeBrands("france");
const burber = getExploreVisibleSearchResults("burber");
assert(
  burber.some((item) => /burberry/i.test(item.title)),
  "burber should still return Burberry",
);

console.log("Explore visible search ranking checks passed", {
  fransaTop,
  franceTop,
  burberTop: burber.slice(0, 5).map((item) => `${item.type}:${item.title}`),
});
