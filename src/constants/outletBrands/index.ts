import { austriaOutletBrands } from "./austria";
import { belgiumOutletBrands } from "./belgium";
import { franceOutletBrands } from "./france";
import { germanyOutletBrands } from "./germany";
import { italyOutletBrands } from "./italy";
import { netherlandsOutletBrands } from "./netherlands";
import { spainOutletBrands } from "./spain";
import { switzerlandOutletBrands } from "./switzerland";
import { ukOutletBrands } from "./uk";

export type OutletBrand = {
  outletId: string;
  brandId: string;
  featured: boolean;
  relationStatus: string;
};

export {
  austriaOutletBrands,
  belgiumOutletBrands,
  franceOutletBrands,
  germanyOutletBrands,
  italyOutletBrands,
  netherlandsOutletBrands,
  spainOutletBrands,
  switzerlandOutletBrands,
  ukOutletBrands,
};

export const outletBrands: OutletBrand[] = [
  ...italyOutletBrands,
  ...germanyOutletBrands,
  ...franceOutletBrands,
  ...ukOutletBrands,
  ...spainOutletBrands,
  ...netherlandsOutletBrands,
  ...belgiumOutletBrands,
  ...austriaOutletBrands,
  ...switzerlandOutletBrands,
];
