import { shanghaiVillageRetailSourceBrandIds } from "../shanghaiVillageSnapshot";

const canonicalBrandIds = [
  ...new Set(Object.values(shanghaiVillageRetailSourceBrandIds).flat()),
];

export const chinaOutletBrands = canonicalBrandIds.map((brandId) => ({
  outletId: "shanghai-village",
  brandId,
  featured: false,
  relationStatus: "active",
}));
