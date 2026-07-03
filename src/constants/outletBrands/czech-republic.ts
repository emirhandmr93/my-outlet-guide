import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const fashionArenaPragueOutletBrandIds = [
  "adidas",
  "alpine-pro",
  "bata",
  "boss",
  "calvin-klein",
  "celio",
  "crocs",
  "ecco",
  "furla",
  "gant",
  "lacoste",
  "levis",
  "luxury-zone",
  "milano-brands",
  "nike",
  "only",
  "outly",
  "pepe-jeans",
  "polo-ralph-lauren",
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
