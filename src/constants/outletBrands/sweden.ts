import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const hedeFashionOutletBrandIds = [
  "adidas",
  "bjorn-borg",
  "boss",
  "bruun-stengade",
  "calvin-klein",
  "didriksons",
  "ecco",
  "filippa-k",
  "gant",
  "gina-tricot",
  "helly-hansen",
  "iittala",
  "jack-and-jones",
  "le-creuset",
  "lee",
  "lekia",
  "levis",
  "lindt",
  "lyle-scott",
  "michael-kors",
  "morris",
  "name-it",
  "only",
  "peak-performance",
  "selected",
  "tommy-hilfiger",
  "triumph",
  "under-armour",
  "varg",
  "vero-moda",
].sort();

export const swedenOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("hede-fashion-outlet", hedeFashionOutletBrandIds),
];
