import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const t1TallinnOutletBrandIds = [
  "aanda-tally-weijl",
  "denim-dream-outlet",
  "halfprice",
  "hc-pro-outlet",
  "ns-king-bonus-outlet",
  "ohoo-outlet",
  "pere-optika-outlet",
  "premium-sneaker-outlet",
  "rademar-outlet",
  "rahva-raamat",
  "salamander-outlet",
  "sokisahtel-outlet",
  "sportland-outlet",
  "sportplus-outlet",
  "terranova",
  "upgreat"
];

export const estoniaOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("t1-tallinn-outlet", t1TallinnOutletBrandIds),
];
