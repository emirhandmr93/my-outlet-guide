const brandCategoryLabelKeys: Record<string, string> = {
  beauty: "explore.categories.beauty.title",
  children: "explore.categories.kids.title",
  fashion: "explore.categories.fashion.title",
  "food & confectionery": "explore.categories.foodChocolate.title",
  "food & chocolate": "explore.categories.foodChocolate.title",
  home: "explore.categories.homeLifestyle.title",
  "home & lifestyle": "explore.categories.homeLifestyle.title",
  "jewelry & watches": "explore.categories.jewelryWatches.title",
  kids: "explore.categories.kids.title",
  luxury: "explore.categories.luxury.title",
  "shoes & bags": "explore.categories.shoesBags.title",
  sportswear: "explore.categories.sportswear.title",
  eyewear: "brandCategory.eyewear",
};

export function formatBrandCategoryLabel(
  category: string,
  t: (key: string) => string,
) {
  const translationKey = brandCategoryLabelKeys[category.trim().toLowerCase()];
  return translationKey ? t(translationKey) : category;
}
