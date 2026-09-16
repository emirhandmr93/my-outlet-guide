import { expansionBrands } from "./brands-expansion";
import { brandsAE } from "./brands-a-e";
import { brandsFK } from "./brands-f-k";
import { brandsLP } from "./brands-l-p";
import { brandsQT } from "./brands-q-t";
import { brandsUZ } from "./brands-u-z";
import { yeojuBrands } from "./brands-yeoju";
import { finalExpansionBrands } from "./final-expansion";
import { finalExpansionDirectoryBrands } from "./final-expansion-directory";
import type { Brand } from "../../types/brand";

export {
  brandsAE,
  brandsFK,
  brandsLP,
  brandsQT,
  brandsUZ,
  yeojuBrands,
  finalExpansionBrands,
  finalExpansionDirectoryBrands,
};

const allBrands: Brand[] = [
  ...expansionBrands,
  ...brandsAE,
  ...brandsFK,
  ...brandsLP,
  ...brandsQT,
  ...brandsUZ,
  ...yeojuBrands,
  ...finalExpansionBrands,
  ...finalExpansionDirectoryBrands,
];

const uniqueBrands = new Map<string, Brand>();
for (const brand of allBrands) {
  if (!uniqueBrands.has(brand.brandId)) uniqueBrands.set(brand.brandId, brand);
}

export const brands: Brand[] = Array.from(uniqueBrands.values());

export type { Brand } from "../../types/brand";
