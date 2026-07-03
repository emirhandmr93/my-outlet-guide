import { austriaTransportationGuides } from "./austria";
import { belgiumTransportationGuides } from "./belgium";
import { denmarkTransportationGuides } from "./denmark";
import { franceTransportationGuides } from "./france";
import { germanyTransportationGuides } from "./germany";
import { italyTransportationGuides } from "./italy";
import { netherlandsTransportationGuides } from "./netherlands";
import { portugalTransportationGuides } from "./portugal";
import { spainTransportationGuides } from "./spain";
import { switzerlandTransportationGuides } from "./switzerland";
import { ukTransportationGuides } from "./uk";

export type TransportationType =
  | "train"
  | "metro"
  | "bus"
  | "shuttle"
  | "taxi"
  | "uber"
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
  franceTransportationGuides,
  germanyTransportationGuides,
  italyTransportationGuides,
  netherlandsTransportationGuides,
  portugalTransportationGuides,
  spainTransportationGuides,
  switzerlandTransportationGuides,
  ukTransportationGuides,
};

export const transportationGuides: TransportationGuide[] = [
  ...italyTransportationGuides,
  ...germanyTransportationGuides,
  ...franceTransportationGuides,
  ...ukTransportationGuides,
  ...spainTransportationGuides,
  ...switzerlandTransportationGuides,
  ...netherlandsTransportationGuides,
  ...belgiumTransportationGuides,
  ...portugalTransportationGuides,
  ...denmarkTransportationGuides,
  ...austriaTransportationGuides,
];
