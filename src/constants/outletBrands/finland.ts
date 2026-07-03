import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const ideaparkLempaalaOutletBrandIds = [
  "bik-bok",
  "bjorn-borg",
  "budget-sport",
  "carlings",
  "change-lingerie",
  "cropp",
  "cubus",
  "dressmann",
  "familon",
  "finlayson",
  "gant",
  "glitter",
  "guess",
  "h-and-m",
  "halonen",
  "iittala",
  "intersport",
  "jack-and-jones",
  "kappahl",
  "kicks",
  "lindex",
  "luhta",
  "marimekko",
  "name-it",
  "nanso",
  "new-yorker",
  "only",
  "partioaitta",
  "pentik",
  "rituals",
  "skechers",
  "stadium",
  "tommy-hilfiger",
  "vero-moda",
  "vila",
  "zizzi",
].sort();

export const finlandOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("ideapark-lempaala-outlet", ideaparkLempaalaOutletBrandIds),
];
