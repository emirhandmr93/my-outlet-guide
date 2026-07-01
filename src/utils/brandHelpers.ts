import type { Brand } from "../types/brand";

export function getBrandById(brands: Brand[], brandId: string) {
  return brands.find((brand) => brand.brandId === brandId);
}

export function getBrandsByCategory(brands: Brand[], categoryId: string) {
  return brands.filter((brand) => brand.categoryId === categoryId);
}

export function getActiveBrands(brands: Brand[]) {
  return brands.filter((brand) => brand.brandStatus === "active");
}

export function sortBrandsByRanking(brands: Brand[]) {
  return [...brands].sort((a, b) => b.rankingWeight - a.rankingWeight);
}
