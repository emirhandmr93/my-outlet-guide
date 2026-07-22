import type { TransportationGuide } from "./index";

export const turkeyTransportationGuides: TransportationGuide[] = [
  {
    guideId: "istanbul-to-viaport-asia-iett",
    outletId: "viaport-asia-outlet-shopping",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "bus",
    title: "Istanbul to Viaport Asia by İETT Bus",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Identify the most convenient current boarding point through İETT before travelling.",
      },
      {
        order: 2,
        description:
          "Choose an officially listed Viaport line: 132K, KM25, KM27, 16KH, 134, or 130H.",
      },
      {
        order: 3,
        description:
          "Board the chosen service toward the Viaport or Kurtköy area.",
      },
      {
        order: 4,
        description:
          "Use the stop currently identified by İETT for Viaport Asia.",
      },
      {
        order: 5,
        description:
          "Confirm the return route and last practical service before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "pendik-area-to-viaport-asia-minibus",
    outletId: "viaport-asia-outlet-shopping",
    originType: "station",
    originId: "pendik-center",
    transportationType: "bus",
    title: "Pendik Area to Viaport Asia by Public Minibus",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      {
        order: 1,
        description:
          "Start at Pendik centre or the most convenient point on a listed corridor.",
      },
      {
        order: 2,
        description:
          "Confirm the current minibus boarding point locally before boarding.",
      },
      {
        order: 3,
        description:
          "Use Pendik–Kurtköy–Viaport, Pendik–Velibaba–Viaport, Kartal–Sultanbeyli–Viaport, Dudullu–Yedpa–Viaport, or Çekmeköy–Madenler–Viaport.",
      },
      {
        order: 4,
        description:
          "Alight at the Viaport Asia stop used by the current service.",
      },
      {
        order: 5,
        description:
          "Confirm the return minibus point and operating hours before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-viaport-asia-car",
    outletId: "viaport-asia-outlet-shopping",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "taxi",
    title: "Istanbul to Viaport Asia by Taxi or Road Access",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Set Yenişehir Mahallesi, Dedepaşa Caddesi No:19, Pendik, İstanbul as the destination.",
      },
      { order: 2, description: "Check current traffic before departure." },
      {
        order: 3,
        description: "Follow current road navigation to Viaport Asia.",
      },
      {
        order: 4,
        description: "Use the verified free visitor parking if driving.",
      },
      {
        order: 5,
        description:
          "For taxi or ride-hail return travel, arrange the pickup location before leaving the vehicle.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-olivium-marmaray",
    outletId: "olivium-outlet-center",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "train",
    title: "Istanbul to Olivium by Marmaray",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      { order: 1, description: "Reach a convenient Marmaray station." },
      {
        order: 2,
        description: "Confirm a current Marmaray service to Kazlıçeşme.",
      },
      { order: 3, description: "Alight at Kazlıçeşme station." },
      { order: 4, description: "Follow pedestrian directions to Olivium." },
      {
        order: 5,
        description:
          "The official Olivium page describes the final walk as approximately five minutes.",
      },
      {
        order: 6,
        description: "Confirm the return Marmaray service before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "zeytinburnu-to-olivium-local-connection",
    outletId: "olivium-outlet-center",
    originType: "station",
    originId: "zeytinburnu-transfer-hub",
    transportationType: "bus",
    title: "Zeytinburnu Transfer Hub to Olivium",
    estimatedDuration: "About 10 min onward by bus or minibus",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description: "Reach Zeytinburnu using M1A, T1, or Metrobüs.",
      },
      {
        order: 2,
        description: "Confirm the current onward bus or minibus connection.",
      },
      { order: 3, description: "Continue toward Olivium." },
      {
        order: 4,
        description:
          "Alight at the closest current stop identified by the operator.",
      },
      {
        order: 5,
        description:
          "Confirm the return connection to Zeytinburnu before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-olivium-iett",
    outletId: "olivium-outlet-center",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "bus",
    title: "Istanbul to Olivium by İETT Bus",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Check İETT for the most convenient current boarding point.",
      },
      {
        order: 2,
        description:
          "Select one of the officially listed Olivium lines: 93, 93C, 93M, 93T, BN3, MR11, MR20, or 97E.",
      },
      {
        order: 3,
        description: "Board toward Zeytinburnu or Kazlıçeşme as applicable.",
      },
      {
        order: 4,
        description:
          "Alight at the current stop identified by İETT for Olivium.",
      },
      {
        order: 5,
        description: "Confirm the return timetable before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-asian-side-to-olivium-ferry-rail",
    outletId: "olivium-outlet-center",
    originType: "city_center",
    originId: "istanbul-asian-side",
    transportationType: "ferry",
    title: "Istanbul Asian Side to Olivium by Ferry and Rail",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Choose one complete alternative rather than combining both routes.",
      },
      {
        order: 2,
        description:
          "For the first alternative, travel from Kadıköy or Üsküdar to Eminönü by ferry.",
      },
      {
        order: 3,
        description:
          "Continue on T1 toward Zeytinburnu and use the current local connection to Olivium.",
      },
      {
        order: 4,
        description:
          "For the second alternative, travel from Bostancı or Kadıköy to Yenikapı by ferry.",
      },
      {
        order: 5,
        description:
          "Continue by Marmaray to Kazlıçeşme and follow pedestrian directions to Olivium.",
      },
      {
        order: 6,
        description:
          "Confirm the return services for the alternative you selected before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-olivium-car",
    outletId: "olivium-outlet-center",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "taxi",
    title: "Istanbul to Olivium by Taxi or Road Access",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Set Prof. Dr. Muammer Aksoy Cad. No:30, Zeytinburnu, İstanbul as the destination.",
      },
      {
        order: 2,
        description: "Check current traffic or taxi fare before departure.",
      },
      { order: 3, description: "Follow current road navigation to Olivium." },
      {
        order: 4,
        description:
          "Confirm the return taxi or ride-hail pickup location before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-starcity-m9",
    outletId: "starcity-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "metro",
    title: "Istanbul to StarCity by M9 Metro",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      {
        order: 1,
        description:
          "Reach the M9 Ataköy–Olimpiyat line through the current metro network.",
      },
      { order: 2, description: "Take M9 toward Doğu Sanayi." },
      { order: 3, description: "Alight at Doğu Sanayi station." },
      {
        order: 4,
        description: "Follow the current pedestrian route to StarCity.",
      },
      {
        order: 5,
        description:
          "The official StarCity page places the outlet approximately 500 metres from the station.",
      },
      {
        order: 6,
        description: "Confirm the return M9 service before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "metrobus-to-starcity-local-connection",
    outletId: "starcity-outlet",
    originType: "station",
    originId: "sirinevler-yenibosna-sefakoy",
    transportationType: "bus",
    title: "Metrobüs to StarCity by Local Connection",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description: "Use Metrobüs to Şirinevler, Yenibosna, or Sefaköy.",
      },
      {
        order: 2,
        description: "Confirm the most convenient current local connection.",
      },
      {
        order: 3,
        description: "Continue by municipal bus, minibus, or M9 Metro.",
      },
      {
        order: 4,
        description: "Alight at the current stop or station serving StarCity.",
      },
      {
        order: 5,
        description:
          "Confirm the return local and Metrobüs connection before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-starcity-iett",
    outletId: "starcity-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "bus",
    title: "Istanbul to StarCity by İETT Bus",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Check İETT for the most convenient current boarding point.",
      },
      {
        order: 2,
        description:
          "Choose an official line: 31, 31E, 36AY, 78B, 79F, 79G, 79K, 79Ş, 89YB, 98B, 98H, or 98T.",
      },
      {
        order: 3,
        description:
          "Use the current İETT route and stop information for the selected line.",
      },
      {
        order: 4,
        description:
          "Alight near Dr. Enver Ören Kültür Merkezi or Alışveriş Merkezi – Bahçelievler as applicable.",
      },
      {
        order: 5,
        description: "Confirm the return timetable before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "sirinevler-sefakoy-to-starcity-minibus",
    outletId: "starcity-outlet",
    originType: "station",
    originId: "sirinevler-sefakoy",
    transportationType: "bus",
    title: "Şirinevler or Sefaköy to StarCity by Public Minibus",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      { order: 1, description: "Start at Şirinevler or Sefaköy." },
      {
        order: 2,
        description:
          "Confirm the current minibus boarding point locally before boarding.",
      },
      {
        order: 3,
        description:
          "Use the Şirinevler–Yenibosna or Küçükçekmece–Sefaköy public minibus corridor.",
      },
      { order: 4, description: "Alight at the current stop serving StarCity." },
      {
        order: 5,
        description: "Confirm the return service locally before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-starcity-car",
    outletId: "starcity-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "taxi",
    title: "Istanbul to StarCity by Taxi or Road Access",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Set Yenibosna Merkez Mahallesi, Değirmenbahçe Caddesi No:34, Bahçelievler, İstanbul as the destination.",
      },
      {
        order: 2,
        description: "Check current traffic or taxi fare before departure.",
      },
      { order: 3, description: "Follow current road navigation to StarCity." },
      { order: 4, description: "Use the free visitor parking if driving." },
      {
        order: 5,
        description:
          "Arrange the return taxi or ride-hail pickup separately, as free parking does not cover taxi fare.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-venezia-t4",
    outletId: "venezia-mega-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "train",
    title: "Istanbul to Venezia Mega Outlet by T4 Tram",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: true,
    steps: [
      {
        order: 1,
        description:
          "Reach a convenient T4 Topkapı–Mescid-i Selam or Habipler tram stop.",
      },
      { order: 2, description: "Board T4 toward Kiptaş–Venezia." },
      { order: 3, description: "Alight at Kiptaş–Venezia." },
      { order: 4, description: "Follow current signs to the outlet entrance." },
      {
        order: 5,
        description: "Confirm the return T4 timetable before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-venezia-m7",
    outletId: "venezia-mega-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "metro",
    title: "Istanbul to Venezia Mega Outlet by M7 Metro",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description: "Connect to the M7 Yıldız or Mecidiyeköy–Mahmutbey line.",
      },
      { order: 2, description: "Travel toward Karadeniz Mahallesi." },
      { order: 3, description: "Alight at Karadeniz Mahallesi." },
      { order: 4, description: "Follow current station and outlet signage." },
      { order: 5, description: "Confirm the return service before shopping." },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "metrobus-to-venezia-t4",
    outletId: "venezia-mega-outlet",
    originType: "station",
    originId: "edirnekapi-sehitlik",
    transportationType: "bus",
    title: "Metrobüs to Venezia Mega Outlet by T4",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      { order: 1, description: "Use Metrobüs to Edirnekapı or Şehitlik." },
      { order: 2, description: "Follow signs to the T4 transfer." },
      { order: 3, description: "Take T4 toward Kiptaş–Venezia." },
      { order: 4, description: "Alight at Kiptaş–Venezia." },
      {
        order: 5,
        description:
          "Use 34AS only as an alternative official connection when it is more convenient.",
      },
      {
        order: 6,
        description: "Confirm both return connections before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "yenikapi-to-venezia-m1a-t4",
    outletId: "venezia-mega-outlet",
    originType: "station",
    originId: "yenikapi",
    transportationType: "train",
    title: "Yenikapı to Venezia Mega Outlet by M1A and T4",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      { order: 1, description: "Arrive at Yenikapı by Marmaray." },
      { order: 2, description: "Transfer to M1A." },
      { order: 3, description: "Alight at Topkapı–Ulubatlı." },
      { order: 4, description: "Transfer to T4." },
      { order: 5, description: "Alight at Kiptaş–Venezia." },
      {
        order: 6,
        description: "Confirm all return connections before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-venezia-iett",
    outletId: "venezia-mega-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "bus",
    title: "Istanbul to Venezia Mega Outlet by İETT Bus",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Check İETT for current boarding points, stops, and schedules before travelling.",
      },
      {
        order: 2,
        description:
          "Select one of the officially listed lines: 36A, 36E, 36M, 36V, 36CY, 36EM, 336, 336E, 336M, 336Y, or 79KM.",
      },
      {
        order: 3,
        description:
          "Board the selected service using the current İETT route information.",
      },
      {
        order: 4,
        description:
          "Alight at the current stop identified by İETT for Venezia Mega Outlet.",
      },
      {
        order: 5,
        description: "Confirm the return timetable before shopping.",
      },
    ],
    updatedAt: "2026-07-22",
  },
  {
    guideId: "istanbul-to-venezia-car-taxi",
    outletId: "venezia-mega-outlet",
    originType: "city_center",
    originId: "istanbul-city-center",
    transportationType: "taxi",
    title: "Istanbul to Venezia Mega Outlet by Taxi or Road Access",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [
      {
        order: 1,
        description:
          "Set Karadeniz Mahallesi, Eski Edirne Asfaltı Caddesi No:408, Gaziosmanpaşa, İstanbul as the destination.",
      },
      {
        order: 2,
        description: "Check current traffic or taxi fare before departure.",
      },
      {
        order: 3,
        description: "Follow current road navigation to Venezia Mega Outlet.",
      },
      {
        order: 4,
        description:
          "Confirm the Venezia Mega Taxi or Karadeniz Taxi pickup arrangement when relevant.",
      },
      { order: 5, description: "Arrange the return pickup before shopping." },
    ],
    updatedAt: "2026-07-22",
  },
];
