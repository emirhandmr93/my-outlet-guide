import type { TransportationGuide } from "./index";

export const taiwanTransportationGuides: TransportationGuide[] = [
{
guideId: "tpe-to-mitsui-outlet-park-linkou-airport-mrt",
outletId: "mitsui-outlet-park-linkou",
originType: "airport",
originId: "TPE",
transportationType: "train",
title: "Taiwan Taoyuan International Airport to MITSUI OUTLET PARK Linkou",
estimatedDuration: "Approx. 15 min by Airport MRT to A9, then about 5 min on foot",
estimatedCost: "",
recommended: true,
steps: [
{ order: 1, description: "Follow signs to the Taoyuan Airport MRT." },
{ order: 2, description: "Take the Airport MRT toward A9 Linkou Station." },
{ order: 3, description: "The Airport MRT journey to A9 Linkou takes approximately 15 minutes." },
{ order: 4, description: "From A9 Linkou Station, walk approximately 5 minutes to MITSUI OUTLET PARK Linkou." },
{ order: 5, description: "A free shuttle service from A9 Linkou Station may also be used when operating." },
],
updatedAt: "2026-08-14",
},
{
guideId: "taipei-main-station-to-mitsui-outlet-park-linkou",
outletId: "mitsui-outlet-park-linkou",
originType: "city_center",
originId: "taipei-main-station",
transportationType: "train",
title: "Taipei Main Station to MITSUI OUTLET PARK Linkou",
estimatedDuration: "Approx. 20 min by Airport MRT to A9, then about 5 min on foot",
estimatedCost: "",
recommended: true,
steps: [
{ order: 1, description: "Go to Taoyuan Airport MRT A1 Taipei Main Station." },
{ order: 2, description: "Take the Airport MRT to A9 Linkou Station." },
{ order: 3, description: "The journey from A1 to A9 takes approximately 20 minutes." },
{ order: 4, description: "Walk approximately 5 minutes from A9 Linkou Station to the outlet." },
{ order: 5, description: "A free shuttle from A9 Linkou Station may also be used when operating." },
],
updatedAt: "2026-08-14",
},
];
