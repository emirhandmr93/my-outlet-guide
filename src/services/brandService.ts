import { brands, Brand } from "../constants/brands";
import { categories } from "../constants/categories";
import { outletBrands } from "../constants/outletBrands";

export type BrandCategoryGroup = {
  categoryId: string;
  categoryName: string;
  icon: string;
  order: number;
  brands: Brand[];
};

export function getActiveBrands(): Brand[] {
  return brands
    .filter((brand) => brand.brandStatus === "active")
    .sort((a, b) => a.brandName.localeCompare(b.brandName));
}

export function getPopularBrands(limit = 6): Brand[] {
  return getActiveBrands().slice(0, limit);
}

export function getBrandsForOutlet(outletId: string): Brand[] {
  const activeBrandIds = new Set(
    outletBrands
      .filter((item) => item.outletId === outletId && item.relationStatus === "active")
      .map((item) => item.brandId)
  );

  return getActiveBrands().filter((brand) => activeBrandIds.has(brand.brandId));
}

export function groupBrandsByCategory(brandList: Brand[]): BrandCategoryGroup[] {
  return categories
    .map((category) => {
      const categoryBrands = brandList.filter(
        (brand) => brand.categoryId === category.categoryId
      );

      return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        icon: category.icon,
        order: Number(category.order),
        brands: categoryBrands,
      };
    })
    .filter((group) => group.brands.length > 0)
    .sort((a, b) => a.order - b.order);
}

export function getBrandCategoryGroupsForOutlet(outletId: string): BrandCategoryGroup[] {
  return groupBrandsByCategory(getBrandsForOutlet(outletId));
}
