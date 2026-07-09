import type { Brand } from "../types/brand";
import { normalizeSearchText } from "./searchAliases";

const safeBrandAliases: Array<{ patterns: string[]; aliases: string[] }> = [
  { patterns: ["yves saint laurent", "saint laurent", "ysl"], aliases: ["ysl", "saint laurent", "yves saint laurent"] },
  { patterns: ["louis vuitton"], aliases: ["lv", "louis vuitton"] },
  { patterns: ["dolce gabbana", "dolce and gabbana", "dolce&gabbana"], aliases: ["d&g", "dg", "dolce gabbana", "dolce and gabbana"] },
  { patterns: ["michael kors"], aliases: ["mk", "michael kors"] },
  { patterns: ["ralph lauren", "polo ralph lauren"], aliases: ["rl", "ralph lauren", "polo ralph lauren"] },
  { patterns: ["calvin klein"], aliases: ["ck", "calvin klein"] },
  { patterns: ["armani exchange", "ax armani exchange"], aliases: ["ax", "armani exchange", "ax armani exchange"] },
];

function normalizedBrandValues(brand: Brand) {
  return [brand.brandName, ...(Array.isArray(brand.aliases) ? brand.aliases : [])].map((value) => normalizeSearchText(value).replace(/&/g, " and "));
}

export function getBrandSearchAliases(brand: Brand) {
  const values = normalizedBrandValues(brand);
  return Array.from(new Set(
    safeBrandAliases
      .filter((entry) => entry.patterns.some((pattern) => values.some((value) => value.includes(normalizeSearchText(pattern).replace(/&/g, " and ")))))
      .flatMap((entry) => entry.aliases),
  ));
}
