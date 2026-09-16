import type { Brand } from "../../types/brand";
import { finalExpansionStoreDirectories } from "../finalExpansionStoreDirectories";
import { expansionBrands } from "./brands-expansion";
import { brandsAE } from "./brands-a-e";
import { brandsFK } from "./brands-f-k";
import { brandsLP } from "./brands-l-p";
import { brandsQT } from "./brands-q-t";
import { brandsUZ } from "./brands-u-z";
import { yeojuBrands } from "./brands-yeoju";
import { finalExpansionBrands } from "./final-expansion";

export type FinalExpansionStoreResolution = {
  outletId: string;
  storeName: string;
  brandIds: readonly string[];
};

const baseBrands: Brand[] = [
  ...expansionBrands,
  ...brandsAE,
  ...brandsFK,
  ...brandsLP,
  ...brandsQT,
  ...brandsUZ,
  ...yeojuBrands,
  ...finalExpansionBrands,
];

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

const stripStoreQualifier = (value: string) =>
  value
    .replace(/[®™]/g, "")
    .replace(/\s+(?:factory\s+(?:store|outlet|shop|house)|outlet\s+store|clearance\s+store|company\s+store|factory|outlet)$/i, "")
    .trim();

const stripAudienceQualifier = (value: string) =>
  value
    .replace(/\s+(?:kids|kid|children|childrenswear|men|mens|women|womens|men's|women's|men’s|women’s)$/i, "")
    .replace(/\s+(?:men(?:'s|’s)?\s+and\s+women(?:'s|’s)?)$/i, "")
    .trim();

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const baseBrandIds = new Set(baseBrands.map((brand) => brand.brandId));
const idsByLookupKey = new Map<string, Set<string>>();
const registerLookup = (key: string, brandId: string) => {
  const normalized = normalize(key);
  if (!normalized) return;
  const current = idsByLookupKey.get(normalized) ?? new Set<string>();
  current.add(brandId);
  idsByLookupKey.set(normalized, current);
};

for (const brand of baseBrands) {
  registerLookup(brand.brandId, brand.brandId);
  registerLookup(brand.brandName, brand.brandId);
  for (const alias of brand.aliases ?? []) registerLookup(alias, brand.brandId);
}

// Only identity aliases are listed here. Entries whose canonical ID is not in
// the base registry are ignored and safely become a directory-generated brand.
const explicitIdentityAliases: Record<string, readonly string[]> = {
  "a|x armani exchange": ["armani-exchange"],
  "adidas factory outlet": ["adidas"],
  "adidas factory store": ["adidas"],
  "adidas outlet store": ["adidas"],
  "adidas kids": ["adidas"],
  "armani exchange outlet": ["armani-exchange"],
  "boss outlet": ["boss"],
  "calvin klein outlet": ["calvin-klein"],
  "coach men": ["coach"],
  "coach men's": ["coach"],
  "coach outlet": ["coach"],
  "columbia clearance store": ["columbia"],
  "ermenegildo zegna": ["zegna"],
  "fila kids": ["fila"],
  "guess kids": ["guess"],
  "guess outlet": ["guess"],
  "hugo boss": ["boss"],
  "kate spade": ["kate-spade-new-york"],
  "kate spade new york outlet": ["kate-spade-new-york"],
  "lacoste kids": ["lacoste"],
  "levi's outlet": ["levis"],
  "levi's outlet store": ["levis"],
  "michael kors men": ["michael-kors"],
  "nike clearance store": ["nike"],
  "nike factory outlet": ["nike"],
  "nike factory store": ["nike"],
  "polo ralph lauren children": ["polo-ralph-lauren"],
  "polo ralph lauren childrenswear factory store": ["polo-ralph-lauren"],
  "puma kids": ["puma"],
  "skechers kids": ["skechers"],
  "skechers outlet": ["skechers"],
  "tommy hilfiger kids": ["tommy-hilfiger"],
  "tommy hilfiger outlet": ["tommy-hilfiger"],
  "under armour factory house": ["under-armour"],
  "victoria's secret": ["victorias-secret"],
};

const explicitMultiBrandStorefronts: Record<string, readonly string[]> = {
  "Fossil and Watch Station Outlet": ["Fossil", "Watch Station"],
  "Bath & Body Works | White Barn": ["Bath & Body Works", "White Barn"],
};

const expandStorefront = (storeName: string): string[] => {
  const explicit = explicitMultiBrandStorefronts[storeName];
  if (explicit) return [...explicit];
  if (/\s\|\s/.test(storeName)) return storeName.split(/\s+\|\s+/).map((part) => part.trim()).filter(Boolean);
  if (/\s*\/\s*/.test(storeName)) return storeName.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean);
  return [storeName.trim()];
};

const resolveKnownBrand = (value: string): string | null => {
  const explicit = explicitIdentityAliases[value.toLowerCase()] ?? explicitIdentityAliases[normalize(value)];
  if (explicit) {
    const valid = explicit.filter((brandId) => baseBrandIds.has(brandId));
    if (valid.length === 1) return valid[0];
  }

  const variants = [value, stripStoreQualifier(value), stripAudienceQualifier(stripStoreQualifier(value))];
  for (const variant of variants) {
    const ids = idsByLookupKey.get(normalize(variant));
    if (ids?.size === 1) return [...ids][0];
  }
  return null;
};

const categoryFor = (name: string) => {
  const value = normalize(name);
  if (/(sport|golf|outdoor|athletic|runner|running|fitness|cycling|bike|football|tennis)/.test(value)) return "sportswear";
  if (/(shoe|footwear|sneaker|bag|luggage|leather|wallet|travel|sandal)/.test(value)) return "shoes-bags";
  if (/(jewel|diamond|watch|timepiece|swarovski|pandora|gold)/.test(value)) return "jewelry-watches";
  if (/(beauty|cosmetic|perfume|parfum|fragrance|body shop|skincare|makeup)/.test(value)) return "beauty";
  if (/(kid|children|baby|toy|lego|sanrio)/.test(value)) return "kids";
  if (/(home|house|kitchen|cook|furniture|mattress|bedding|electronics|mobile|phone|optical|eyewear|gadget|book|hypermarket|market|department|appliance)/.test(value)) return "home-lifestyle";
  return "fashion";
};

const luxuryLevelFor = (categoryId: string) => {
  if (categoryId === "sportswear") return "sports";
  if (categoryId === "home-lifestyle" || categoryId === "beauty" || categoryId === "kids") return "lifestyle";
  return "fashion";
};

const generatedBrands = new Map<string, Brand>();
const generatedIdByLookupKey = new Map<string, string>();

const resolveOrCreateBrand = (rawName: string): string => {
  const known = resolveKnownBrand(rawName);
  if (known) return known;

  const displayName = stripStoreQualifier(rawName) || rawName.trim();
  const lookupKey = normalize(displayName);
  const reusedGenerated = generatedIdByLookupKey.get(lookupKey);
  if (reusedGenerated) return reusedGenerated;

  const baseSlug = slugify(displayName);
  const brandId = `directory-${baseSlug || `store-${stableHash(displayName)}`}`;
  const categoryId = categoryFor(displayName);
  generatedBrands.set(brandId, {
    brandId,
    brandName: displayName,
    aliases: displayName === rawName.trim() ? [] : [rawName.trim()],
    categoryId,
    logo: "",
    luxuryLevel: luxuryLevelFor(categoryId),
    rankingWeight: 45,
    brandStatus: "active",
  });
  generatedIdByLookupKey.set(lookupKey, brandId);
  return brandId;
};

const resolutions: FinalExpansionStoreResolution[] = [];
for (const directory of finalExpansionStoreDirectories) {
  for (const storeName of directory.storeNames) {
    const brandIds = [...new Set(expandStorefront(storeName).map(resolveOrCreateBrand))];
    resolutions.push({ outletId: directory.outletId, storeName, brandIds });
  }
}

export const finalExpansionDirectoryBrands: Brand[] = [...generatedBrands.values()]
  .sort((left, right) => left.brandName.localeCompare(right.brandName, "en"));

export const finalExpansionStoreResolutions: readonly FinalExpansionStoreResolution[] = resolutions;
