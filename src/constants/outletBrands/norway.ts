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
  "diesel",
  "ecco",
  "follestad",
  "gant",
  "guess",
  "helly-hansen",
  "hoyer",
  "hunkemoller",
  "j-lindeberg",
  "jack-and-jones",
  "kari-traa",
  "le-creuset",
  "lee",
  "levis",
  "lexington",
  "lindt",
  "lyko",
  "mammut",
  "nike",
  "norrona",
  "only",
  "peak-performance",
  "reima",
  "rituals",
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
