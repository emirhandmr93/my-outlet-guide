import type { TransportationGuide } from "./index";

export const hongKongTransportationGuides: TransportationGuide[] = [
{
guideId: "hkg-to-citygate-outlets-bus",
outletId: "citygate-outlets",
originType: "airport",
originId: "HKG",
transportationType: "bus",
title: "Hong Kong International Airport to Citygate Outlets by bus",
estimatedDuration: "Approx. 10 min",
estimatedCost: "",
recommended: true,
steps: [
{ order: 1, description: "Follow airport signs to the public bus area." },
{ order: 2, description: "Take bus S1 or S64 toward Tung Chung." },
{ order: 3, description: "Alight at the Citygate Outlets / Tung Chung stop." },
{ order: 4, description: "Follow signs into Citygate Outlets." },
{ order: 5, description: "Confirm the current bus timetable before travel." },
],
updatedAt: "2026-08-14",
},
{
guideId: "central-hong-kong-to-citygate-outlets-mtr",
outletId: "citygate-outlets",
originType: "city_center",
originId: "hong-kong-station",
transportationType: "metro",
title: "Central Hong Kong to Citygate Outlets by MTR",
estimatedDuration: "",
estimatedCost: "",
recommended: true,
steps: [
{ order: 1, description: "Enter the MTR network at Hong Kong Station." },
{ order: 2, description: "Take the Tung Chung Line toward Tung Chung." },
{ order: 3, description: "Alight at Tung Chung Station." },
{ order: 4, description: "Use Exit C for the direct connection to Citygate Outlets." },
],
updatedAt: "2026-08-14",
},
];
