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
  "boss",
  "brands-hub",
  "bsb",
  "calvin-klein",
  "diesel",
  "dika",
  "gap",
  "guess",
  "guess-accessories",
  "hervis",
  "kenvelo",
  "levi-s",
  "liujo",
  "marc-opolo",
  "numero-uno",
  "randr-boutique",
  "sofiaman",
  "the-cosmetics-company-store",
  "tom-tailor",
  "under-armour"
];

export const romaniaOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("fashion-house-outlet-centre-bucharest", fashionHouseOutletCentreBucharestBrandIds),
];
