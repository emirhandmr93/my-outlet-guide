import { austriaOutletBrands } from "./austria";
import { belgiumOutletBrands } from "./belgium";
import { croatiaOutletBrands } from "./croatia";
import { denmarkOutletBrands } from "./denmark";
import { franceOutletBrands } from "./france";
import { czechRepublicOutletBrands } from "./czech-republic";
import { finlandOutletBrands } from "./finland";
import { norwayOutletBrands } from "./norway";
import { germanyOutletBrands } from "./germany";
import { hungaryOutletBrands } from "./hungary";
import { italyOutletBrands } from "./italy";
import { netherlandsOutletBrands } from "./netherlands";
import { portugalOutletBrands } from "./portugal";
import { spainOutletBrands } from "./spain";
import { polandOutletBrands } from "./poland";
import { slovakiaOutletBrands } from "./slovakia";
import { swedenOutletBrands } from "./sweden";
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
  croatiaOutletBrands,
  czechRepublicOutletBrands,
  finlandOutletBrands,
  norwayOutletBrands,
  germanyOutletBrands,
  hungaryOutletBrands,
  italyOutletBrands,
  netherlandsOutletBrands,
  portugalOutletBrands,
  spainOutletBrands,
  polandOutletBrands,
  slovakiaOutletBrands,
  swedenOutletBrands,
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
  ...polandOutletBrands,
  ...swedenOutletBrands,
  ...czechRepublicOutletBrands,
  ...hungaryOutletBrands,
  ...slovakiaOutletBrands,
  ...croatiaOutletBrands,
  ...finlandOutletBrands,
  ...norwayOutletBrands,
];
