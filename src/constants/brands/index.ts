export type { Brand, BrandLuxuryLevel, BrandStatus } from "../../types/brand";

import { brandsAE } from "./brands-a-e";
import { brandsFK } from "./brands-f-k";
import { brandsLP } from "./brands-l-p";
import { brandsQT } from "./brands-q-t";
import { brandsUZ } from "./brands-u-z";
import type { Brand } from "../../types/brand";

export { brandsAE, brandsFK, brandsLP, brandsQT, brandsUZ };

export const brands: Brand[] = [
  ...brandsAE,
  ...brandsFK,
  ...brandsLP,
  ...brandsQT,
  ...brandsUZ,
];
