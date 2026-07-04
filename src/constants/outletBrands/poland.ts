import type { OutletBrand } from "./index";

const makeOutletBrands = (outletId: string, brandIds: string[]): OutletBrand[] =>
  brandIds.map((brandId) => ({
    outletId,
    brandId,
    featured: false,
    relationStatus: "active",
  }));

const factoryUrsusBrandIds = [
  "4f", "adidas", "albione", "alpine-pro", "apart", "bagatelle", "big-star", "boss", "brand-collection", "brand-collection-for-ladies", "bytom", "calvin-klein", "calzedonia", "change-lingerie", "cloud-shop", "crocs", "cross-jeans", "d-s-damat", "dajar", "desigual", "digel", "diverse", "ecco", "empik", "etam", "family-optic", "franco-feruzzi", "gant", "gatta", "giacomo-conti", "guess", "guess-accessories", "haribo", "inmedio", "iqos", "italian-fashion", "jack-and-jones", "joop", "kamalion", "kubenz", "kulig", "lacoste", "lancerto", "lavard", "lee-cooper", "lee-wrangler", "levis", "lindt", "marc-opolo", "marilyn", "mastersport", "medicine", "mother-earth", "mountain-warehouse", "mustang", "new-balance", "nike", "ochnik", "only", "outly", "pako-lorente", "pandora", "pepe-jeans", "pierre-cardin", "puma", "regatta", "rossmann", "rylko", "salomon", "samsonite", "skechers", "smyk", "solar", "sorvella", "soul-converse", "sunset-suits", "tchibo", "tefal", "teletorium", "time-trend", "trespass", "triumph", "under-armour", "unisono", "vans", "venezia", "vistula", "volcano", "w-kruk", "wakacje-pl", "willsoor", "wittchen", "yes", "ziaja",
].sort();

const factoryAnnopolBrandIds = [
  "4f", "adidas", "adventure-sports-rossignol", "albione", "alpine-pro", "aw-fashion", "bagatelle", "big-star", "borgio", "bytom", "calvin-klein", "change-lingerie", "clarks", "converse", "crocs", "cross-jeans", "czas-na-herbate", "dajar", "digel", "diverse", "ecco", "empik", "family-optic", "filippo", "franco-feruzzi", "gatta", "giacomo-conti", "guess", "guess-accessories", "helly-hansen", "italian-fashion", "jack-and-jones", "jack-wolfskin", "kamalion", "kazar", "kubenz", "kulig", "lancerto", "lavard", "lee-cooper", "lee-wrangler", "levis", "lindt", "liquid-jungle", "marc-opolo", "mastersport-reebok", "medicine", "molton", "mother-earth", "mountain-warehouse", "mustang", "new-balance", "nike", "ochnik", "only", "outly", "pako-lorente", "pepe-jeans", "pierre-cardin", "puccini", "puma", "regatta", "rossmann", "rtv-euro-agd", "salewa", "samsonite", "skechers", "smyk", "sorvella", "sunset-suits", "tefal", "teletorium", "timberland", "time-trend", "trespass", "triumph", "under-armour", "vans", "venezia", "vestus", "villeroy-and-boch", "vistula", "volcano", "w-kruk", "wakacje-pl", "wittchen", "wittchen-travel", "yes", "ziaja",
].sort();

export const polandOutletBrands: OutletBrand[] = [
  ...makeOutletBrands("factory-annopol", factoryAnnopolBrandIds),
  ...makeOutletBrands("factory-ursus", factoryUrsusBrandIds),
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "tommy-hilfiger",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "ochnik",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "triumph",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "calvin-klein",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "puma",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "gap",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "guess",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "boss",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "adidas",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "nike",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "levi-s",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "new-balance",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "pepe-jeans",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "mustang",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "lacoste",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "calzedonia",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "tefal",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "wmf",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "le-creuset",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "apart",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "w-kruk",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "marc-opolo",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "asics",
    featured: false,
    relationStatus: "active",
  },
  {
    outletId: "wroclaw-fashion-outlet",
    brandId: "trussardi",
    featured: false,
    relationStatus: "active",
  },
];
