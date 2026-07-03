import type { TransportationGuide } from "./index";

export const finlandTransportationGuides: TransportationGuide[] = [
  {
    guideId: "tampere-to-ideapark-lempaala-outlet-bus",
    outletId: "ideapark-lempaala-outlet",
    originType: "city_center",
    originId: "tampere-city-center",
    transportationType: "bus",
    title: "Tampere City Centre to Ideapark Lempäälä Outlet by Bus",
    estimatedDuration: "Check official Nysse timetable",
    estimatedCost: "Check official Nysse fare",
    recommended: true,
    steps: [
      { order: 1, description: "Use the official Tampere regional transport planner and set the destination to Ideapark Lempäälä or Ideaparkinkatu 4." },
      { order: 2, description: "Board the listed regional bus from Tampere and confirm the stop closest to your preferred Ideapark entrance." },
      { order: 3, description: "For the return journey, check the last bus before shopping because evening and weekend frequencies can vary." },
    ],
    updatedAt: "2026-07-03",
  },
  {
    guideId: "ideapark-lempaala-outlet-car-parking-guide",
    outletId: "ideapark-lempaala-outlet",
    originType: "city_center",
    originId: "driving",
    transportationType: "taxi",
    title: "Driving and Parking at Ideapark Lempäälä Outlet",
    estimatedDuration: "≈20 min from Tampere city centre (estimated)",
    estimatedCost: "Road costs vary; customer parking is free",
    recommended: true,
    steps: [
      { order: 1, description: "Set navigation to Ideaparkinkatu 4, 37570 Lempäälä." },
      { order: 2, description: "Drive via Highway 3 / E12 and follow signs for Ideapark customer parking." },
      { order: 3, description: "Choose the parking area nearest your planned entrance and note the same entrance for your return." },
    ],
    updatedAt: "2026-07-03",
  },
];
