import type { TransportationGuide } from "./index";

export const kuwaitTransportationGuides: TransportationGuide[] = [
  {
    guideId: "kuwait-city-to-al-khiran-hybrid-outlet-mall-taxi",
    outletId: "al-khiran-hybrid-outlet-mall",
    originType: "city_center",
    originId: "kuwait-city-kuwait-towers",
    transportationType: "taxi",
    title: "Kuwait City to Al Khiran Hybrid Outlet Mall by taxi",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Request a licensed taxi or ride-hailing pickup in Kuwait City." },
      { order: 2, description: "Select Al Khiran Hybrid Outlet Mall and verify the waterfront mall pin, not Khiran Square or Norma Mall." },
      { order: 3, description: "Confirm the quoted or app fare before the long trip and arrange the return journey." },
    ],
    updatedAt: "2026-08-09",
  },
  {
    guideId: "kwi-to-al-khiran-hybrid-outlet-mall-taxi",
    outletId: "al-khiran-hybrid-outlet-mall",
    originType: "airport",
    originId: "KWI",
    transportationType: "taxi",
    title: "KWI to Al Khiran Hybrid Outlet Mall by taxi",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Follow terminal signs to an official Kuwait International Airport taxi or use a licensed ride-hailing pickup." },
      { order: 2, description: "Select Al Khiran Hybrid Outlet Mall and verify the destination pin before leaving KWI." },
      { order: 3, description: "Confirm the fare and arrange a return pickup because no scheduled direct public transport was verified." },
    ],
    updatedAt: "2026-08-09",
  },
];
