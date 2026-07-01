import type { TransportationGuide } from "./index";

export const belgiumTransportationGuides: TransportationGuide[] = [
{
guideId: "brussels-to-maasmechelen",
outletId: "maasmechelen-village",
originType: "city_center",
originId: "brussels-city-center",
transportationType: "shuttle",
title: "Brussels to Maasmechelen Village",
estimatedDuration: "80-100 min",
estimatedCost: "€20-30",
recommended: true,
steps: [
{ order: 1, description: "Go to the official Shopping Express departure point." },
{ order: 2, description: "Board the shuttle to Maasmechelen Village." },
{ order: 3, description: "Arrive directly at the village entrance." }
],
updatedAt: "2026-07-01",
},
{
guideId: "maastricht-airport-to-maasmechelen",
outletId: "maasmechelen-village",
originType: "airport",
originId: "maastricht-airport",
transportationType: "taxi",
title: "Maastricht Airport to Maasmechelen Village",
estimatedDuration: "25-30 min",
estimatedCost: "Varies",
recommended: true,
steps: [
{ order: 1, description: "Exit Maastricht Aachen Airport." },
{ order: 2, description: "Take a taxi or rental car to Maasmechelen Village." }
],
updatedAt: "2026-07-01",
},
];
