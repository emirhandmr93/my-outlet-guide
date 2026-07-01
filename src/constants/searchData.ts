import { brands } from "./brands";
import { categories } from "./categories";
import { countries } from "./countries";
import { outlets } from "./outlets";

export type SearchItemType =
| "brand"
| "category"
| "country"
| "outlet";

export type SearchItem = {
id: string;
name: string;
type: SearchItemType;
};

export const searchData: SearchItem[] = [
...brands.map((brand) => ({
id: brand.brandId,
name: brand.brandName,
type: "brand" as const,
})),

...categories.map((category) => ({
id: category.categoryId,
name: category.categoryName,
type: "category" as const,
})),

...countries.map((country) => ({
id: country.countryId,
name: country.countryName,
type: "country" as const,
})),

...outlets.map((outlet) => ({
id: outlet.outletId,
name: outlet.name,
type: "outlet" as const,
})),
];