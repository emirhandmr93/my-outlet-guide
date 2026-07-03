import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const fashionArenaPragueOutletBrandIds = [
  "alpine-pro",
  "bata",
  "calvin-klein",
  "celio",
  "crocs",
  "furla",
  "gant",
  "lacoste",
  "nike",
  "only",
  "outly",
  "pepe-jeans",
  "puma",
  "regatta",
  "salomon",
  "swarovski",
  "the-brands-outlet",
  "tommy-hilfiger",
].sort();

export const czechRepublicOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("fashion-arena-prague-outlet", fashionArenaPragueOutletBrandIds),
];
