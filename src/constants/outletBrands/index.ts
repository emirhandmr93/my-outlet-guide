import { austriaOutletBrands } from "./austria";
import { belgiumOutletBrands } from "./belgium";
import { croatiaOutletBrands } from "./croatia";
import { denmarkOutletBrands } from "./denmark";
import { romaniaOutletBrands } from "./romania";
import { estoniaOutletBrands } from "./estonia";
import { franceOutletBrands } from "./france";
import { czechRepublicOutletBrands } from "./czech-republic";
import { finlandOutletBrands } from "./finland";
import { norwayOutletBrands } from "./norway";
import { germanyOutletBrands } from "./germany";
import { hungaryOutletBrands } from "./hungary";
import { irelandOutletBrands } from "./ireland";
import { greeceOutletBrands } from "./greece";
import { italyOutletBrands } from "./italy";
import { latviaOutletBrands } from "./latvia";
import { lithuaniaOutletBrands } from "./lithuania";
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
  romaniaOutletBrands,
  estoniaOutletBrands,
  franceOutletBrands,
  croatiaOutletBrands,
  czechRepublicOutletBrands,
  finlandOutletBrands,
  norwayOutletBrands,
  germanyOutletBrands,
  hungaryOutletBrands,
  irelandOutletBrands,
  greeceOutletBrands,
  italyOutletBrands,
  latviaOutletBrands,
  lithuaniaOutletBrands,
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
  ...romaniaOutletBrands,
  ...estoniaOutletBrands,
  ...polandOutletBrands,
  ...swedenOutletBrands,
  ...czechRepublicOutletBrands,
  ...hungaryOutletBrands,
  ...irelandOutletBrands,
  ...greeceOutletBrands,
  ...slovakiaOutletBrands,
  ...croatiaOutletBrands,
  ...finlandOutletBrands,
  ...norwayOutletBrands,
  ...latviaOutletBrands,
  ...lithuaniaOutletBrands,
];
