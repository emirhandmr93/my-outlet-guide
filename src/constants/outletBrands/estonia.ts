import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const t1TallinnOutletBrandIds = [
  "aanda",
  "cotton-box",
  "denim-dream-outlet",
  "easy-travel",
  "flambrex",
  "froddo",
  "halfprice",
  "hc-pro-outlet",
  "mandarina-duck",
  "ns-king-bonus-outlet",
  "ohoo-outlet",
  "petroff",
  "premium-sneaker-outlet",
  "rademar-outlet",
  "salamander-outlet",
  "sinsay",
  "sokisahtel-outlet",
  "sportland-outlet",
  "sportplus-outlet",
  "tally-weijl",
  "terranova",
  "tomas-gold",
  "upgreat",
  "xs-manguasjad",
  "yves-rocher",
];

export const estoniaOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("t1-tallinn-outlet", t1TallinnOutletBrandIds),
];
