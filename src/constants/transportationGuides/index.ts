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

import { italyTransportationGuides } from "./italy";
import { germanyTransportationGuides } from "./germany";
import { franceTransportationGuides } from "./france";
import { ukTransportationGuides } from "./uk";
import { spainTransportationGuides } from "./spain";
import { netherlandsTransportationGuides } from "./netherlands";
import { belgiumTransportationGuides } from "./belgium";
import { austriaTransportationGuides } from "./austria";

export { italyTransportationGuides } from "./italy";
export { germanyTransportationGuides } from "./germany";
export { franceTransportationGuides } from "./france";
export { ukTransportationGuides } from "./uk";
export { spainTransportationGuides } from "./spain";
export { netherlandsTransportationGuides } from "./netherlands";
export { belgiumTransportationGuides } from "./belgium";
export { austriaTransportationGuides } from "./austria";

export const transportationGuides: TransportationGuide[] = [
  ...italyTransportationGuides,
  ...germanyTransportationGuides,
  ...franceTransportationGuides,
  ...ukTransportationGuides,
  ...spainTransportationGuides,
  ...netherlandsTransportationGuides,
  ...belgiumTransportationGuides,
  ...austriaTransportationGuides,
];
