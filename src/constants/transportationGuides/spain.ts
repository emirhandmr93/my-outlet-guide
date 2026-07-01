import type { TransportationGuide } from "./index";

export const spainTransportationGuides: TransportationGuide[] = [
{
guideId: "malaga-city-center-to-outlet",
outletId: "designer-outlet-malaga",
originType: "city_center",
originId: "malaga-city-center",
transportationType: "train",
title: "Málaga City Center to Designer Outlet Málaga",
estimatedDuration: "15-20 min",
estimatedCost: "€2-4",
recommended: true,
steps: [
{ order: 1, description: "Go to Málaga Centro Alameda station." },
{ order: 2, description: "Take the C1 suburban train to Plaza Mayor." },
{ order: 3, description: "Walk a few minutes to the outlet entrance." }
],
updatedAt: "2026-07-01",
},
{
guideId: "malaga-airport-to-outlet",
outletId: "designer-outlet-malaga",
originType: "airport",
originId: "malaga-airport",
transportationType: "walking",
title: "Málaga Airport to Designer Outlet Málaga",
estimatedDuration: "10-15 min",
estimatedCost: "Free",
recommended: true,
steps: [
{ order: 1, description: "Exit Málaga Airport." },
{ order: 2, description: "Walk or take the C1 train one stop to Plaza Mayor." },
{ order: 3, description: "Follow signs to McArthurGlen Designer Outlet Málaga." }
],
updatedAt: "2026-07-01",
},
{
guideId: "madrid-to-las-rozas",
outletId: "las-rozas-village",
originType: "city_center",
originId: "madrid-city-center",
transportationType: "bus",
title: "Madrid City Center to Las Rozas Village",
estimatedDuration: "30-40 min",
estimatedCost: "€2-5",
recommended: true,
steps: [
{ order: 1, description: "Board the direct bus from Madrid." },
{ order: 2, description: "Get off at Las Rozas Village." }
],
updatedAt: "2026-07-01",
},
{
guideId: "madrid-airport-to-las-rozas",
outletId: "las-rozas-village",
originType: "airport",
originId: "madrid-airport",
transportationType: "taxi",
title: "Madrid Airport to Las Rozas Village",
estimatedDuration: "25-35 min",
estimatedCost: "€25-40",
recommended: true,
steps: [
{ order: 1, description: "Exit Madrid-Barajas Airport." },
{ order: 2, description: "Take a taxi or rental car to Las Rozas Village." }
],
updatedAt: "2026-07-01",
},
];
