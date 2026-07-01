import { austriaOutletBrands } from "./austria";
import { belgiumOutletBrands } from "./belgium";
import { franceOutletBrands } from "./france";
import { germanyOutletBrands } from "./germany";
import { italyOutletBrands } from "./italy";
import { netherlandsOutletBrands } from "./netherlands";
import { spainOutletBrands } from "./spain";
import { ukOutletBrands } from "./uk";

export type OutletBrand = {
  outletId: string;
  brandId: string;
  featured: boolean;
  relationStatus: string;
};

export { austriaOutletBrands } from "./austria";
export { belgiumOutletBrands } from "./belgium";
export { franceOutletBrands } from "./france";
export { germanyOutletBrands } from "./germany";
export { italyOutletBrands } from "./italy";
export { netherlandsOutletBrands } from "./netherlands";
export { spainOutletBrands } from "./spain";
export { ukOutletBrands } from "./uk";

export const outletBrands: OutletBrand[] = [
  ...italyOutletBrands,
  ...germanyOutletBrands,
  ...franceOutletBrands,
  ...ukOutletBrands,
  ...spainOutletBrands,
  ...netherlandsOutletBrands,
  ...belgiumOutletBrands,
  ...austriaOutletBrands,
];
