import type { TransportationGuide } from "./index";

export const kuwaitTransportationGuides: TransportationGuide[] = [
  {
    guideId: "kuwait-city-to-al-khiran-hybrid-outlet-mall-taxi",
    outletId: "al-khiran-hybrid-outlet-mall",
    originType: "city_center",
    originId: "kuwait-city-kuwait-towers",
    transportationType: "taxi",
    title: "Kuwait City to Al Khiran Hybrid Outlet Mall by taxi",
    estimatedDuration: "Approx. 80–100 min; traffic varies",
    estimatedCost: "Approx. KWD 27–35 by taxi; app quotes vary",
    recommended: true,
    steps: [
      { order: 1, description: "Request a licensed taxi or ride-hailing pickup in Kuwait City." },
      { order: 2, description: "Select Al Khiran Hybrid Outlet Mall, using the waterfront mall pin rather than Khiran Square or Norma Mall." },
      { order: 3, description: "Use the quoted app fare or taxi meter and schedule a return pickup from the mall’s main taxi point." },
    ],
    updatedAt: "2026-08-10",
  },
  {
    guideId: "kwi-to-al-khiran-hybrid-outlet-mall-taxi",
    outletId: "al-khiran-hybrid-outlet-mall",
    originType: "airport",
    originId: "KWI",
    transportationType: "taxi",
    title: "KWI to Al Khiran Hybrid Outlet Mall by taxi",
    estimatedDuration: "Approx. 65–85 min; traffic varies",
    estimatedCost: "KWD 19 by official airport taxi; ride-hailing/app quotes may vary",
    recommended: true,
    steps: [
      { order: 1, description: "Follow terminal signs to an official Kuwait International Airport taxi or use a licensed ride-hailing pickup." },
      { order: 2, description: "Select Al Khiran Hybrid Outlet Mall, using the saved destination pin before leaving KWI." },
      { order: 3, description: "Use the airport-taxi fare and schedule a return pickup from the mall’s main taxi point." },
    ],
    updatedAt: "2026-08-10",
  },
];
