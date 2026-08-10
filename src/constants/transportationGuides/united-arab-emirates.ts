import type { TransportationGuide } from "./index";

export const unitedArabEmiratesTransportationGuides: TransportationGuide[] = [
  {
    guideId: "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66",
    outletId: "dubai-outlet-mall",
    originType: "station",
    originId: "al-ghubaiba-bus-station",
    transportationType: "bus",
    title: "Al Ghubaiba to Dubai Outlet Mall by RTA Bus 66",
    estimatedDuration: "",
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
        description: "Confirm the Bus 66 return service toward Al Ghubaiba Bus Station before shopping.",
      },
    ],
    updatedAt: "2026-08-04",
  },
  {
    guideId: "downtown-dubai-to-the-outlet-village-taxi", outletId: "the-outlet-village", originType: "city_center", originId: "downtown-dubai",
    transportationType: "taxi", title: "Downtown Dubai to The Outlet Village by taxi", estimatedDuration: "Approx. 40–55 min; traffic varies", estimatedCost: "Approx. AED 115–145 by taxi; app fares vary", recommended: true,
    steps: [
      { order: 1, description: "Request a licensed taxi or ride-hailing pickup in Downtown Dubai." },
      { order: 2, description: "Set The Outlet Village at Dubai Parks and Resorts as the destination and verify the pin before departure." },
      { order: 3, description: "Confirm the meter or app estimate, then follow the driver to the signed destination entrance." },
    ],
    updatedAt: "2026-08-10",
  },
  {
    guideId: "dxb-to-the-outlet-village-taxi", outletId: "the-outlet-village", originType: "airport", originId: "DXB",
    transportationType: "taxi", title: "DXB to The Outlet Village by taxi", estimatedDuration: "Approx. 50–65 min; traffic varies", estimatedCost: "Approx. AED 150–190 by airport taxi", recommended: true,
    steps: [
      { order: 1, description: "Follow signs to the official taxi rank at your DXB terminal." },
      { order: 2, description: "Tell the dispatcher The Outlet Village at Dubai Parks and Resorts in Jebel Ali." },
      { order: 3, description: "Verify the destination pin and use the metered airport taxi service." },
    ],
    updatedAt: "2026-08-10",
  },
  {
    guideId: "dwc-to-the-outlet-village-taxi", outletId: "the-outlet-village", originType: "airport", originId: "DWC",
    transportationType: "taxi", title: "DWC to The Outlet Village by taxi", estimatedDuration: "Approx. 25–35 min; traffic varies", estimatedCost: "Approx. AED 55–80 by airport taxi", recommended: true,
    steps: [
      { order: 1, description: "Follow signs to the official taxi rank at Al Maktoum International Airport." },
      { order: 2, description: "Request The Outlet Village at Dubai Parks and Resorts and verify the map pin." },
      { order: 3, description: "Travel by metered taxi to the signed mall drop-off." },
    ],
    updatedAt: "2026-08-10",
  },
  {
    guideId: "ibn-battuta-to-the-outlet-village-connection", outletId: "the-outlet-village", originType: "station", originId: "ibn-battuta-metro-station",
    transportationType: "bus", title: "Ibn Battuta Metro Station connection to The Outlet Village", estimatedDuration: "Approx. 35–55 min after boarding; verify current timetable", estimatedCost: "Approx. AED 5–10 with a nol card; confirm current fare", recommended: false,
    steps: [
      { order: 1, description: "Travel on the Dubai Metro Red Line to Ibn Battuta Metro Station." },
      { order: 2, description: "At the station, check RTA journey planning or ask station staff for the current bus connection to The Outlet Village." },
      { order: 3, description: "Board only after confirming the destination, timetable and return service; no route number is asserted because the mall FAQ does not publish one." },
      { order: 4, description: "Alight at the confirmed destination stop and follow signs to The Outlet Village." },
    ],
    updatedAt: "2026-08-10",
  },
];
