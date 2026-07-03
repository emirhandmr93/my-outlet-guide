export type BrandStatus = "active" | "inactive" | "coming-soon" | "discontinued";

export type BrandLuxuryLevel = "luxury" | "premium" | "fashion" | "sports" | "lifestyle";

export type Brand = {
  brandId: string;
  brandName: string;
  aliases?: string[];
  categoryId: string;
  logo?: string;
  website?: string;
  originCountryId?: string;
  luxuryLevel?: BrandLuxuryLevel | string;
  description?: string;
  rankingWeight: number;
  brandStatus: BrandStatus | string;
};

export type BrandCategory = {
  categoryId: string;
  categoryName: string;
  icon?: string;
  rankingWeight?: number;
};

export type OutletBrandRelation = {
  outletId: string;
  brandId: string;
  storeName?: string;
  categoryId?: string;
  status?: "active" | "inactive" | "coming-soon";
};
