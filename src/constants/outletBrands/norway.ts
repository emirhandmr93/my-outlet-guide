import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const norwegianOutletBrandIds = [
  "adidas",
  "bergans",
  "brgn",
  "devold",
  "ecco",
  "follestad",
  "gant",
  "helly-hansen",
  "hoyer",
  "jack-and-jones",
  "kari-traa",
  "lexington",
  "lindt",
  "norrona",
  "only",
  "skechers",
  "swix",
  "viking-of-norway",
].sort();

export const norwayOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("norwegian-outlet", norwegianOutletBrandIds),
];
