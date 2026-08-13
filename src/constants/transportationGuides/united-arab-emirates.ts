import type { TransportationGuide } from "./index";

export const unitedArabEmiratesTransportationGuides: TransportationGuide[] = [
  {
    guideId: "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66",
    outletId: "dubai-outlet-mall",
    originType: "station",
    originId: "al-ghubaiba-bus-station",
    transportationType: "bus",
    title: "Al Ghubaiba to Dubai Outlet Mall by RTA Bus 66",
    estimatedDuration: "Approx. 65–80 min",
    estimatedCost: "Approx. AED 5–7.50",
    recommended: true,
    steps: [
      {
        order: 1,
        description: "Start at Al Ghubaiba Bus Station, the official RTA boarding station for Bus 66 toward Faqa, Terminus.",
      },
      {
        order: 2,
        description: "Board only RTA Bus 66 in the Faqa, Terminus direction.",
      },
      {
        order: 3,
        description: "Remain on Bus 66 along Dubai–Al Ain Road to Dubai Outlet Mall 01.",
      },
      {
        order: 4,
        description: "Alight at Dubai Outlet Mall 01, the official mall stop for the selected direction.",
      },
      {
        order: 5,
        description: "Follow the signed pedestrian access from the stop to Dubai Outlet Mall’s easternmost entrance.",
      },
      {
        order: 6,
        description: "For the return trip, board Bus 66 at Dubai Outlet Mall 02 in the Al Ghubaiba Bus Station direction.",
      },
    ],
    updatedAt: "2026-08-04",
  },
  {
    guideId: "downtown-dubai-to-dubai-outlet-mall-taxi", outletId: "dubai-outlet-mall", originType: "city_center", originId: "downtown-dubai",
    transportationType: "taxi", title: "Downtown Dubai to Dubai Outlet Mall by taxi", estimatedDuration: "Approx. 25–40 min; traffic may affect travel time", estimatedCost: "Approx. AED 65–90 by metered taxi", recommended: false,
    steps: [
      { order: 1, description: "Start at an official taxi rank in Downtown Dubai or request a licensed ride-hailing pickup." },
      { order: 2, description: "Set Dubai Outlet Mall on Dubai–Al Ain Road as the destination." },
      { order: 3, description: "Travel via Dubai–Al Ain Road and alight at the mall’s signed taxi drop-off." },
    ], updatedAt: "2026-08-10",
  },
  {
    guideId: "dxb-to-dubai-outlet-mall-taxi", outletId: "dubai-outlet-mall", originType: "airport", originId: "DXB",
    transportationType: "taxi", title: "DXB to Dubai Outlet Mall by taxi", estimatedDuration: "Approx. 25–40 min; traffic may affect travel time", estimatedCost: "Approx. AED 75–100 by airport taxi", recommended: false,
    steps: [
      { order: 1, description: "Follow signs from arrivals to the official taxi rank at your DXB terminal." },
      { order: 2, description: "Tell the dispatcher Dubai Outlet Mall on Dubai–Al Ain Road." },
      { order: 3, description: "Use the metered airport taxi and alight at the mall’s signed taxi drop-off." },
    ], updatedAt: "2026-08-10",
  },
  {
   guideId: "ibn-battuta-to-the-outlet-village-dpr1-bus",
   outletId: "the-outlet-village",
   originType: "station",
   originId: "ibn-battuta-metro-station",
   transportationType: "bus",
   title: "Ibn Battuta Metro Station to The Outlet Village by DPR1 bus",
   estimatedDuration: "",
   estimatedCost: "",
   recommended: true,
   steps: [
     { order: 1, description: "Go to the bus stop at Ibn Battuta Metro Station." },
     { order: 2, description: "Board RTA Bus DPR1 for Dubai Parks and Resorts." },
     { order: 3, description: "Remain on DPR1 until Dubai Parks and Resorts." },
     { order: 4, description: "Alight at the Dubai Parks and Resorts transport stop." },
     { order: 5, description: "Follow the signed access to The Outlet Village." },
     { order: 6, description: "Confirm the current DPR1 return timetable before shopping." },
   ],
   updatedAt: "2026-08-13",
 },
  {
    guideId: "downtown-dubai-to-the-outlet-village-taxi", outletId: "the-outlet-village", originType: "city_center", originId: "downtown-dubai",
    transportationType: "taxi", title: "Downtown Dubai to The Outlet Village by taxi", estimatedDuration: "Approx. 40–55 min; traffic varies", estimatedCost: "Approx. AED 115–145 by taxi; app fares vary", recommended: true,
    steps: [
      { order: 1, description: "Request a licensed taxi or ride-hailing pickup in Downtown Dubai." },
      { order: 2, description: "Set The Outlet Village at Dubai Parks and Resorts as the destination." },
      { order: 3, description: "Use the metered taxi or displayed app fare and alight at the signed destination entrance." },
    ],
    updatedAt: "2026-08-10",
  },
  {
    guideId: "dxb-to-the-outlet-village-taxi", outletId: "the-outlet-village", originType: "airport", originId: "DXB",
    transportationType: "taxi", title: "DXB to The Outlet Village by taxi", estimatedDuration: "Approx. 50–65 min; traffic varies", estimatedCost: "Approx. AED 150–190 by airport taxi", recommended: true,
    steps: [
      { order: 1, description: "Follow signs to the official taxi rank at your DXB terminal." },
      { order: 2, description: "Tell the dispatcher The Outlet Village at Dubai Parks and Resorts in Jebel Ali." },
      { order: 3, description: "Use the metered airport taxi service to the mall’s signed drop-off." },
    ],
    updatedAt: "2026-08-10",
  },
  {
    guideId: "dwc-to-the-outlet-village-taxi", outletId: "the-outlet-village", originType: "airport", originId: "DWC",
    transportationType: "taxi", title: "DWC to The Outlet Village by taxi", estimatedDuration: "Approx. 25–35 min; traffic varies", estimatedCost: "Approx. AED 55–80 by airport taxi", recommended: true,
    steps: [
      { order: 1, description: "Follow signs to the official taxi rank at Al Maktoum International Airport." },
      { order: 2, description: "Request The Outlet Village at Dubai Parks and Resorts." },
      { order: 3, description: "Travel by metered taxi to the signed mall drop-off." },
    ],
    updatedAt: "2026-08-10",
  },
];
