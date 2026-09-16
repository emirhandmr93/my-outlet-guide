import assert from "node:assert/strict";

import { brands } from "../src/constants/brands";
import { finalExpansionStoreResolutions } from "../src/constants/brands/final-expansion-directory";
import { finalExpansionStoreDirectories } from "../src/constants/finalExpansionStoreDirectories";
import { outletBrands } from "../src/constants/outletBrands";

const expectedOutletIds = [
  "one-salonica-outlet-mall",
  "m3-outlet-polgar",
  "mitsui-outlet-park-tainan",
  "changi-city-point",
  "central-village-bangkok",
  "orlando-international-premium-outlets",
  "the-mills-at-jersey-gardens",
  "chicago-premium-outlets",
  "seattle-premium-outlets",
  "wrentham-village-premium-outlets",
  "san-marcos-premium-outlets",
  "waikele-premium-outlets",
  "las-vegas-south-premium-outlets",
  "las-americas-premium-outlets",
  "factory-krakow",
  "mega-outlet-thessaloniki",
  "barari-outlet-mall",
] as const;

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

const sameSet = (actual: Iterable<string>, expected: Iterable<string>, message: string) => {
  assert.deepEqual([...new Set(actual)].sort(), [...new Set(expected)].sort(), message);
};

sameSet(
  finalExpansionStoreDirectories.map((directory) => directory.outletId),
  expectedOutletIds,
  "Final expansion store-directory scope drifted from the approved 17 outlets",
);
assert.equal(finalExpansionStoreDirectories.length, expectedOutletIds.length, "Final expansion directory count must remain 17");

const brandIds = new Set(brands.map((brand) => brand.brandId));
let storefrontCount = 0;
let mappedIdentityCount = 0;

for (const directory of finalExpansionStoreDirectories) {
  assert(directory.sourceUrls.length > 0, `${directory.outletId}: official store-directory source URL missing`);
  assert(directory.sourceUrls.every((url) => url.startsWith("https://")), `${directory.outletId}: non-HTTPS source URL`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(directory.checkedAt), `${directory.outletId}: checkedAt must be ISO date`);
  assert(
    directory.storeNames.length >= directory.minimumRetailStoreCount,
    `${directory.outletId}: retail/storefront snapshot fell below source-backed minimum (${directory.storeNames.length} < ${directory.minimumRetailStoreCount})`,
  );

  const normalizedNames = directory.storeNames.map(normalize);
  assert.equal(
    new Set(normalizedNames).size,
    normalizedNames.length,
    `${directory.outletId}: duplicate storefront name in source snapshot`,
  );
  storefrontCount += directory.storeNames.length;

  const resolutions = finalExpansionStoreResolutions.filter((item) => item.outletId === directory.outletId);
  assert.equal(
    resolutions.length,
    directory.storeNames.length,
    `${directory.outletId}: every source storefront must have exactly one resolution record`,
  );

  const resolutionByStore = new Map(resolutions.map((resolution) => [resolution.storeName, resolution]));
  const expectedBrandIds = new Set<string>();
  for (const storeName of directory.storeNames) {
    const resolution = resolutionByStore.get(storeName);
    assert(resolution, `${directory.outletId}/${storeName}: source storefront has no resolution`);
    assert(resolution.brandIds.length > 0, `${directory.outletId}/${storeName}: storefront resolved to zero brands`);
    for (const brandId of resolution.brandIds) {
      assert(brandIds.has(brandId), `${directory.outletId}/${storeName}: unresolved canonical brand ${brandId}`);
      expectedBrandIds.add(brandId);
      mappedIdentityCount += 1;
    }
  }

  const activeRelations = outletBrands.filter(
    (relation) => relation.outletId === directory.outletId && relation.relationStatus === "active",
  );
  assert.equal(
    activeRelations.length,
    new Set(activeRelations.map((relation) => relation.brandId)).size,
    `${directory.outletId}: duplicate active outlet-brand relation`,
  );
  sameSet(
    activeRelations.map((relation) => relation.brandId),
    expectedBrandIds,
    `${directory.outletId}: runtime brand coverage is not an exact projection of the official store-directory snapshot`,
  );
}

assert(
  storefrontCount >= 1_600,
  `Final 17 directory snapshot unexpectedly shrank to ${storefrontCount} storefronts; expected at least 1,600`,
);
assert(mappedIdentityCount >= storefrontCount, "Every storefront must map to at least one canonical brand identity");

console.log(
  `Final expansion store-directory coverage passed: ${finalExpansionStoreDirectories.length} outlets; ${storefrontCount} source storefronts; ${mappedIdentityCount} mapped brand identities; runtime outletBrands exactly match the source snapshots.`,
);
