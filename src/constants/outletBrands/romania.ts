import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const fashionHouseOutletCentreBucharestBrandIds = [
  "acandco",
  "adidas",
  "brands-hub",
  "bsb",
  "calvin-klein",
  "dika",
  "guess",
  "kenvelo",
  "levi-s",
  "marc-opolo",
  "numero-uno",
  "randr-boutique",
  "sofiaman",
  "the-cosmetics-company-store"
];

export const romaniaOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("fashion-house-outlet-centre-bucharest", fashionHouseOutletCentreBucharestBrandIds),
];
