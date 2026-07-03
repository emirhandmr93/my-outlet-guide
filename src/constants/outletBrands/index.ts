import { austriaOutletBrands } from "./austria";
import { belgiumOutletBrands } from "./belgium";
import { denmarkOutletBrands } from "./denmark";
import { franceOutletBrands } from "./france";
import { germanyOutletBrands } from "./germany";
import { italyOutletBrands } from "./italy";
import { netherlandsOutletBrands } from "./netherlands";
import { portugalOutletBrands } from "./portugal";
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
  denmarkOutletBrands,
  franceOutletBrands,
  germanyOutletBrands,
  italyOutletBrands,
  netherlandsOutletBrands,
  portugalOutletBrands,
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
  ...portugalOutletBrands,
  ...denmarkOutletBrands,
];
