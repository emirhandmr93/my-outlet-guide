import type { TransportationGuide } from "./index";

// Conservative car guides use only each outlet’s official address.
export const turkeyTransportationGuides: TransportationGuide[] = [
  {
    guideId: "olivium-outlet-center-car",
    outletId: "olivium-outlet-center",
    originType: "city_center",
    originId: "olivium-outlet-center-official-address",
    transportationType: "taxi",
    title: "Drive to Olivium Outlet Center",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Navigate to the outlet’s official address: Prof. Dr. Muammer Aksoy Cad. No:30, Zeytinburnu, İstanbul, Türkiye" },
      { order: 2, description: "Follow current road signs and local traffic directions for the final approach." },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "starcity-outlet-car",
    outletId: "starcity-outlet",
    originType: "city_center",
    originId: "starcity-outlet-official-address",
    transportationType: "taxi",
    title: "Drive to StarCity Outlet",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Navigate to the outlet’s official address: Yenibosna Merkez Mahallesi, Değirmenbahçe Caddesi No:34, 34197 Bahçelievler, İstanbul, Türkiye" },
      { order: 2, description: "Follow current road signs and local traffic directions for the final approach." },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "optimum-premium-outlet-istanbul-car",
    outletId: "optimum-premium-outlet-istanbul",
    originType: "city_center",
    originId: "optimum-premium-outlet-istanbul-official-address",
    transportationType: "taxi",
    title: "Drive to Optimum Premium Outlet",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Navigate to the outlet’s official address: Yenisahra Mahallesi, Elibol Sokak No:2/B, 34746 Ataşehir, İstanbul, Türkiye" },
      { order: 2, description: "Follow current road signs and local traffic directions for the final approach." },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "izmir-optimum-car",
    outletId: "izmir-optimum",
    originType: "city_center",
    originId: "izmir-optimum-official-address",
    transportationType: "taxi",
    title: "Drive to İzmir Optimum",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Navigate to the outlet’s official address: Akçay Caddesi No:101, 35410 Gaziemir, İzmir, Türkiye" },
      { order: 2, description: "Follow current road signs and local traffic directions for the final approach." },
    ],
    updatedAt: "2026-07-22",
  },
];
