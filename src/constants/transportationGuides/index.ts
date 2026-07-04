import { austriaTransportationGuides } from "./austria";
import { belgiumTransportationGuides } from "./belgium";
import { denmarkTransportationGuides } from "./denmark";
import { czechRepublicTransportationGuides } from "./czech-republic";
import { franceTransportationGuides } from "./france";
import { germanyTransportationGuides } from "./germany";
import { greeceTransportationGuides } from "./greece";
import { hungaryTransportationGuides } from "./hungary";
import { irelandTransportationGuides } from "./ireland";
import { croatiaTransportationGuides } from "./croatia";
import { italyTransportationGuides } from "./italy";
import { latviaTransportationGuides } from "./latvia";
import { lithuaniaTransportationGuides } from "./lithuania";
import { romaniaTransportationGuides } from "./romania";
import { estoniaTransportationGuides } from "./estonia";
import { netherlandsTransportationGuides } from "./netherlands";
import { finlandTransportationGuides } from "./finland";
import { portugalTransportationGuides } from "./portugal";
import { norwayTransportationGuides } from "./norway";
import { slovakiaTransportationGuides } from "./slovakia";
import { spainTransportationGuides } from "./spain";
import { polandTransportationGuides } from "./poland";
import { swedenTransportationGuides } from "./sweden";
import { switzerlandTransportationGuides } from "./switzerland";
import { ukTransportationGuides } from "./uk";

export type TransportationType =
  | "train"
  | "metro"
  | "bus"
  | "shuttle"
  | "taxi"
  | "uber"
  | "ferry"
  | "walking";

export type TransportationStep = {
  order: number;
  description: string;
};

export type TransportationGuide = {
  guideId: string;
  outletId: string;
  originType: "city_center" | "airport" | "station";
  originId: string;
  transportationType: TransportationType;
  title: string;
  estimatedDuration: string;
  estimatedCost: string;
  recommended: boolean;
  steps: TransportationStep[];
  updatedAt: string;
};

export {
  austriaTransportationGuides,
  belgiumTransportationGuides,
  denmarkTransportationGuides,
  czechRepublicTransportationGuides,
  franceTransportationGuides,
  germanyTransportationGuides,
  greeceTransportationGuides,
  hungaryTransportationGuides,
  irelandTransportationGuides,
  croatiaTransportationGuides,
  italyTransportationGuides,
  latviaTransportationGuides,
  lithuaniaTransportationGuides,
  romaniaTransportationGuides,
  estoniaTransportationGuides,
  netherlandsTransportationGuides,
  finlandTransportationGuides,
  portugalTransportationGuides,
  norwayTransportationGuides,
  slovakiaTransportationGuides,
  spainTransportationGuides,
  polandTransportationGuides,
  swedenTransportationGuides,
  switzerlandTransportationGuides,
  ukTransportationGuides,
};

export const transportationGuides: TransportationGuide[] = [
  ...italyTransportationGuides,
  ...latviaTransportationGuides,
  ...lithuaniaTransportationGuides,
  ...germanyTransportationGuides,
  ...greeceTransportationGuides,
  ...franceTransportationGuides,
  ...ukTransportationGuides,
  ...spainTransportationGuides,
  ...switzerlandTransportationGuides,
  ...netherlandsTransportationGuides,
  ...belgiumTransportationGuides,
  ...portugalTransportationGuides,
  ...denmarkTransportationGuides,
  ...austriaTransportationGuides,
  ...polandTransportationGuides,
  ...swedenTransportationGuides,
  ...norwayTransportationGuides,
  ...finlandTransportationGuides,
  ...czechRepublicTransportationGuides,
  ...hungaryTransportationGuides,
  ...irelandTransportationGuides,
  ...slovakiaTransportationGuides,
  ...croatiaTransportationGuides,
  ...romaniaTransportationGuides,
  ...estoniaTransportationGuides,
];
