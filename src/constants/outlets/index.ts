import { austriaOutlets } from "./austria";
import { belgiumOutlets } from "./belgium";
import { croatiaOutlets } from "./croatia";
import { bulgariaOutlets } from "./bulgaria";
import { czechRepublicOutlets } from "./czech-republic";
import { denmarkOutlets } from "./denmark";
import { estoniaOutlets } from "./estonia";
import { finlandOutlets } from "./finland";
import { franceOutlets } from "./france";
import { germanyOutlets } from "./germany";
import { greeceOutlets } from "./greece";
import { hungaryOutlets } from "./hungary";
import { irelandOutlets } from "./ireland";
import { italyOutlets } from "./italy";
import { netherlandsOutlets } from "./netherlands";
import { norwayOutlets } from "./norway";
import { polandOutlets } from "./poland";
import { portugalOutlets } from "./portugal";
import { romaniaOutlets } from "./romania";
import { slovakiaOutlets } from "./slovakia";
import { spainOutlets } from "./spain";
import { swedenOutlets } from "./sweden";
import { switzerlandOutlets } from "./switzerland";
import { ukOutlets } from "./uk";

export {
  austriaOutlets,
  belgiumOutlets,
  bulgariaOutlets,
  croatiaOutlets,
  czechRepublicOutlets,
  denmarkOutlets,
  estoniaOutlets,
  finlandOutlets,
  franceOutlets,
  germanyOutlets,
  greeceOutlets,
  hungaryOutlets,
  irelandOutlets,
  italyOutlets,
  netherlandsOutlets,
  norwayOutlets,
  polandOutlets,
  portugalOutlets,
  romaniaOutlets,
  slovakiaOutlets,
  spainOutlets,
  swedenOutlets,
  switzerlandOutlets,
  ukOutlets,
};

type OutletAirport = { code: string; name: string; distanceKm: number };
type Outlet = { airports?: OutletAirport[]; [key: string]: any };

export const outlets: Outlet[] = [
  ...italyOutlets,
  ...germanyOutlets,
  ...franceOutlets,
  ...ukOutlets,
  ...spainOutlets,
  ...netherlandsOutlets,
  ...polandOutlets,
  ...portugalOutlets,
  ...romaniaOutlets,
  ...denmarkOutlets,
  ...estoniaOutlets,
  ...belgiumOutlets,
  ...bulgariaOutlets,
  ...croatiaOutlets,
  ...hungaryOutlets,
  ...greeceOutlets,
  ...irelandOutlets,
  ...slovakiaOutlets,
  ...norwayOutlets,
  ...finlandOutlets,
  ...czechRepublicOutlets,
  ...austriaOutlets,
  ...swedenOutlets,
  ...switzerlandOutlets,
];
