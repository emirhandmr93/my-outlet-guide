import type { OutletBrand } from "./index";

// Direct Al Khiran stores corroborated through current operator or brand location pages.
const alKhiranBrandIds = [
  "adidas",
  "aldo",
  "american-eagle",
  "bath-and-body-works",
  "boots",
  "calvin-klein",
  "charles-and-keith",
  "claires",
  "crocs",
  "dune-london",
  "foot-locker",
  "h-and-m",
  "levis",
  "mothercare",
  "new-balance",
  "nike",
  "skechers",
  "the-body-shop",
  "tommy-hilfiger",
  "victoria-s-secret",
  "xcite",
] as const;

export const kuwaitOutletBrands: OutletBrand[] = alKhiranBrandIds.map((brandId) => ({
  outletId: "al-khiran-hybrid-outlet-mall",
  brandId,
  featured: false,
  relationStatus: "active",
}));
