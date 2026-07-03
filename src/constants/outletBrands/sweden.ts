import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const hedeFashionOutletBrandIds = [
  "boss",
  "calvin-klein",
  "didriksons",
  "jack-and-jones",
  "lee",
  "levis",
  "lindt",
  "michael-kors",
  "tommy-hilfiger",
  "triumph",
  "varg",
  "vero-moda",
].sort();

export const swedenOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("hede-fashion-outlet", hedeFashionOutletBrandIds),
];
