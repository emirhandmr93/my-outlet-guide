import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const zsarOutletVillageBrandIds = [
  "adidas",
  "armani",
  "bagatt",
  "braccialini",
  "ecco",
  "guess",
  "boss",
  "iceberg",
  "kappa",
  "le-creuset",
  "lindt",
  "reima",
  "roberto-cavalli",
].sort();

export const finlandOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("zsar-outlet-village", zsarOutletVillageBrandIds),
];
