import { brands } from "../constants/brands";

const MAX_BRAND_KEYS = 1000;

export function normalizeFavoriteBrandCampaignKey(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80)
    .trim();
}

export function getFavoriteBrandCampaignKeys(brandIds: readonly string[]) {
  const selected = new Set(brandIds);
  const keys = brands.flatMap((brand) => {
    if (!selected.has(brand.brandId) || brand.brandStatus !== "active") return [];
    return [brand.brandId, brand.brandName, ...(brand.aliases ?? [])]
      .map(normalizeFavoriteBrandCampaignKey)
      .filter(Boolean);
  });
  return Array.from(new Set(keys)).sort().slice(0, MAX_BRAND_KEYS);
}
