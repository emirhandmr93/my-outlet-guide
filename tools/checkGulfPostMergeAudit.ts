import { createHash } from "node:crypto";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const assertUnique = (values: string[], label: string) => {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  assert(duplicates.length === 0, `${label} duplicates: ${[...new Set(duplicates)].join(", ")}`);
};

assertUnique(brands.map(({ brandId }) => brandId), "global brandId");
assertUnique(outletBrands.map(({ outletId, brandId }) => `${outletId}:${brandId}`), "outletId + brandId");
assertUnique(restaurants.map(({ restaurantId }) => restaurantId), "restaurantId");
assertUnique(transportation.map(({ transportationId }) => transportationId), "transportationId");
assertUnique(transportationGuides.map(({ guideId }) => guideId), "transportationGuideId");

const brandCounts = new Map<string, number>();
brands.forEach(({ brandId }) => brandCounts.set(brandId, (brandCounts.get(brandId) ?? 0) + 1));
outletBrands.forEach(({ brandId }) => assert(brandCounts.get(brandId) === 1, `${brandId} must resolve exactly once`));

const countRelations = (outletId: string) => outletBrands.filter((row) => row.outletId === outletId).length;
const countRestaurants = (outletId: string) => restaurants.filter((row) => row.outletId === outletId).length;
assert(countRelations("al-khiran-hybrid-outlet-mall") === 44, "Al Khiran must have 44 verified brand mappings");
assert(countRestaurants("al-khiran-hybrid-outlet-mall") === 21, "Al Khiran must have 21 verified restaurant rows");
assert(countRelations("the-outlet-village") === 73, "The Outlet Village must retain 73 Retail mappings");
assert(countRestaurants("the-outlet-village") === 10, "The Outlet Village must retain 10 restaurant rows");

const dubaiOutletMallIds = outletBrands
  .filter(({ outletId }) => outletId === "dubai-outlet-mall")
  .map(({ brandId }) => brandId)
  .sort();
const dubaiOutletMallDigest = createHash("sha256").update(JSON.stringify(dubaiOutletMallIds)).digest("hex");
assert(dubaiOutletMallIds.length === 228, "Dubai Outlet Mall mapping count changed");
assert(
  dubaiOutletMallDigest === "59a3575f8a09f164ce3642ce54e9087fcb8d491d06d6e1d62a95ee87cd9c1090",
  "Dubai Outlet Mall mapping identities changed",
);

console.log("Gulf post-merge integrity audit passed", {
  alKhiranBrands: countRelations("al-khiran-hybrid-outlet-mall"),
  alKhiranRestaurants: countRestaurants("al-khiran-hybrid-outlet-mall"),
  outletVillageRetail: countRelations("the-outlet-village"),
  outletVillageRestaurants: countRestaurants("the-outlet-village"),
  activeOutlets: outlets.filter((outlet) => outlet.status === "active").length,
  dubaiOutletMallMappings: dubaiOutletMallIds.length,
});
