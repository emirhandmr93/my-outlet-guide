import { brandsAE } from "./brands-a-e";
import { brandsFK } from "./brands-f-k";
import { brandsLP } from "./brands-l-p";
import { brandsQT } from "./brands-q-t";
import { brandsUZ } from "./brands-u-z";
import { yeojuBrands } from "./brands-yeoju";
import type { Brand } from "../../types/brand";

export { brandsAE, brandsFK, brandsLP, brandsQT, brandsUZ, yeojuBrands };

const allBrands: Brand[] = [
  ...brandsAE,
  ...brandsFK,
  ...brandsLP,
  ...brandsQT,
  ...brandsUZ,
  ...yeojuBrands,
];

const uniqueBrands = new Map<string, Brand>();
for (const brand of allBrands) {
  if (!uniqueBrands.has(brand.brandId)) uniqueBrands.set(brand.brandId, brand);
}

export const brands: Brand[] = Array.from(uniqueBrands.values());

export type { Brand } from "../../types/brand";
