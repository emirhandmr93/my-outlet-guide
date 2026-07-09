import { searchApp } from "../src/services/searchEngine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const fransa = searchApp("fransa", 20);
const franceIndex = fransa.findIndex(
  (item) => item.type === "country" && item.title === "France",
);
const unrelatedBrandIndex = fransa.findIndex(
  (item) =>
    item.type === "brand" && /frances|francesco|france/i.test(item.title),
);

assert(franceIndex >= 0, "fransa should return France");
assert(
  unrelatedBrandIndex === -1 || franceIndex < unrelatedBrandIndex,
  "France should rank before France-like brand matches",
);
assert(
  fransa
    .slice(0, 8)
    .some((item) => item.type === "city" || item.type === "outlet"),
  "fransa should include French city/outlet results near the top",
);

const france = searchApp("france", 20);
assert(
  france.some((item) => item.type === "country" && item.title === "France"),
  "france should return France",
);

const burber = searchApp("burber", 20);
assert(
  burber.some((item) => /burberry/i.test(item.title)),
  "burber should keep fuzzy Burberry search working",
);

console.log("Search ranking checks passed", {
  fransaTop: fransa.slice(0, 5).map((item) => `${item.type}:${item.title}`),
  franceTop: france.slice(0, 5).map((item) => `${item.type}:${item.title}`),
  burberTop: burber.slice(0, 5).map((item) => `${item.type}:${item.title}`),
});
