import type { TransportationGuide } from "./index";

export const netherlandsTransportationGuides: TransportationGuide[] = [
{
guideId: "amsterdam-to-roermond-train",
outletId: "designer-outlet-roermond",
originType: "city_center",
originId: "amsterdam-city-center",
transportationType: "train",
title: "Amsterdam City Center to Designer Outlet Roermond",
estimatedDuration: "120-150 min",
estimatedCost: "€25-45",
recommended: true,
steps: [
{ order: 1, description: "Go to Amsterdam Centraal station." },
{ order: 2, description: "Take an Intercity train to Roermond." },
{ order: 3, description: "Exit Roermond station." },
{ order: 4, description: "Walk approximately 10 minutes to Designer Outlet Roermond." }
],
updatedAt: "2026-07-01",
},
{
guideId: "eindhoven-airport-to-roermond",
outletId: "designer-outlet-roermond",
originType: "airport",
originId: "eindhoven-airport",
transportationType: "taxi",
title: "Eindhoven Airport to Designer Outlet Roermond",
estimatedDuration: "45-60 min",
estimatedCost: "€70-120",
recommended: true,
steps: [
{ order: 1, description: "Leave Eindhoven Airport." },
{ order: 2, description: "Take a taxi, rental car or airport transfer." },
{ order: 3, description: "Drive towards Roermond via the A2 motorway." },
{ order: 4, description: "Follow signs for Designer Outlet Roermond." }
],
updatedAt: "2026-07-01",
},
{
guideId: "roermond-station-to-outlet",
outletId: "designer-outlet-roermond",
originType: "station",
originId: "roermond-station",
transportationType: "walking",
title: "Roermond Station to Designer Outlet Roermond",
estimatedDuration: "10-15 min",
estimatedCost: "Free",
recommended: true,
steps: [
{ order: 1, description: "Exit Roermond railway station." },
{ order: 2, description: "Follow signs towards the city centre and Designer Outlet." },
{ order: 3, description: "Cross the bridge and continue to the outlet entrance." }
],
updatedAt: "2026-07-01",
},
{
guideId: "rotterdam-to-roosendaal-train",
outletId: "designer-outlet-roosendaal",
originType: "city_center",
originId: "rotterdam-city-center",
transportationType: "train",
title: "Rotterdam City Center to Designer Outlet Roosendaal",
estimatedDuration: "60-90 min",
estimatedCost: "€15-30",
recommended: true,
steps: [
{ order: 1, description: "Go to Rotterdam Centraal station." },
{ order: 2, description: "Take a train towards Roosendaal." },
{ order: 3, description: "Get off at Roosendaal station." },
{ order: 4, description: "Continue to Designer Outlet Roosendaal by local bus or taxi." }
],
updatedAt: "2026-07-01",
},
{
guideId: "roosendaal-station-to-outlet",
outletId: "designer-outlet-roosendaal",
originType: "station",
originId: "roosendaal-station",
transportationType: "bus",
title: "Roosendaal Station to Designer Outlet Roosendaal",
estimatedDuration: "10-20 min",
estimatedCost: "€2-5",
recommended: true,
steps: [
{ order: 1, description: "Exit Roosendaal station." },
{ order: 2, description: "Take a local bus or taxi towards Designer Outlet Roosendaal." },
{ order: 3, description: "Arrive at the outlet entrance." }
],
updatedAt: "2026-07-01",
},
{
guideId: "rotterdam-airport-to-roosendaal",
outletId: "designer-outlet-roosendaal",
originType: "airport",
originId: "rotterdam-airport",
transportationType: "taxi",
title: "Rotterdam Airport to Designer Outlet Roosendaal",
estimatedDuration: "55-75 min",
estimatedCost: "€100-160",
recommended: true,
steps: [
{ order: 1, description: "Exit Rotterdam The Hague Airport." },
{ order: 2, description: "Take a taxi, rental car or private transfer." },
{ order: 3, description: "Drive towards Roosendaal." },
{ order: 4, description: "Follow signs to Designer Outlet Roosendaal." }
],
updatedAt: "2026-07-01",
},
];
