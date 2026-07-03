import type { OutletBrand } from "./index";

const freeportBrandIds = [
  "adidas",
  "adolfo-dominguez",
  "aldo",
  "armani",
  "asics",
  "calvin-klein-underwear",
  "converse",
  "fila",
  "furla",
  "invicta",
  "karl-lagerfeld",
  "lacoste",
  "le-creuset",
  "lefties",
  "levis",
  "lion-of-porches",
  "longchamp",
  "lottusse",
  "mango",
  "michael-kors",
  "new-balance",
  "nike",
  "polo-ralph-lauren",
  "puma",
  "seaside",
  "skechers",
  "sunglass-hut",
  "the-body-shop",
  "tommy-hilfiger",
  "vans",
  "zadig-voltaire",
];

const vilaDoCondeBrandIds = [
  "adidas",
  "american-tourister",
  "ambitious",
  "birkenstock",
  "fred-perry",
  "karl-lagerfeld",
  "lindt",
  "lottusse",
  "michael-kors",
  "nike",
  "tommy-hilfiger",
];

export const portugalOutletBrands: OutletBrand[] = [
  ...freeportBrandIds.map((brandId) => ({
    outletId: "freeport-lisboa-fashion-outlet",
    brandId,
    featured: ["adidas", "karl-lagerfeld", "michael-kors", "tommy-hilfiger"].includes(brandId),
    relationStatus: "active",
  })),
  ...vilaDoCondeBrandIds.map((brandId) => ({
    outletId: "vila-do-conde-porto-fashion-outlet",
    brandId,
    featured: ["adidas", "michael-kors", "tommy-hilfiger"].includes(brandId),
    relationStatus: "active",
  })),
];
