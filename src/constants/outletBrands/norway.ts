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
  "allsport-fashion",
  "bergans",
  "bjorn-borg",
  "boss",
  "brgn",
  "calvin-klein",
  "devold",
  "didriksons",
  "ecco",
  "follestad",
  "gant",
  "helly-hansen",
  "hoyer",
  "j-lindeberg",
  "jack-and-jones",
  "kari-traa",
  "le-creuset",
  "lee",
  "lexington",
  "lindt",
  "lyko",
  "nike",
  "norrona",
  "only",
  "peak-performance",
  "reima",
  "samsonite",
  "skechers",
  "skomax",
  "stormberg",
  "swix",
  "tommy-hilfiger",
  "viking-of-norway",
].sort();

export const norwayOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("norwegian-outlet", norwegianOutletBrandIds),
];
