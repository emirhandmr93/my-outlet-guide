import type { TransportationType } from "./transportationGuides";

export type TransportationRouteOriginType =
  | "airport"
  | "cityCenter"
  | "shuttle"
  | "taxiUber";

export type TransportationRouteConfidence =
  | "exact"
  | "partial"
  | "estimateOnly";

export type TransportationRouteFact = {
  guideId?: string;
  outletId: string;
  originType: TransportationRouteOriginType;
  mode: TransportationType;
  titleKey?: string;
  provider?: string;
  operator?: string;
  line?: string;
  boardingPoint?: string;
  transferPoints?: string[];
  alightingPoint?: string;
  destination?: string;
  walkNote?: string;
  estimatedDurationMin?: number;
  estimatedDurationMax?: number;
  displayDuration?: string;
  estimatedFareMin?: number;
  estimatedFareMax?: number;
  currency?: string;
  displayFare?: string;
  sourceNote?: string;
  officialCheckNote?: string;
  confidence: TransportationRouteConfidence;
  officialProviderUrl?: string;
};

export const transportationRouteFacts: TransportationRouteFact[] = [
  {
    guideId: "vienna-to-parndorf-train-bus",
    outletId: "designer-outlet-parndorf",
    originType: "cityCenter",
    mode: "train",
    provider: "ÖBB",
    operator: "ÖBB",
    line: "ÖBB",
    alightingPoint: "Parndorf Ort",
    destination: "Designer Outlet Parndorf",
    walkNote:
      "Use the official station bus from Parndorf Ort to Designer Outlet Parndorf when operating.",
    estimatedDurationMin: 60,
    estimatedDurationMax: 90,
    estimatedFareMin: 5,
    estimatedFareMax: 20,
    currency: "EUR",
    officialCheckNote: "Confirm ÖBB train and station-bus times before travel.",
    confidence: "partial",
  },
  {
    guideId: "paris-to-la-vallee-rer-a",
    outletId: "la-vallee-village",
    originType: "cityCenter",
    mode: "train",
    provider: "RATP / SNCF",
    operator: "RATP / SNCF",
    line: "RER A",
    boardingPoint: "Central Paris RER A station",
    alightingPoint: "Val d'Europe / Serris-Montévrain",
    destination: "La Vallée Village",
    walkNote: "Walk through Val d'Europe shopping centre to La Vallée Village.",
    estimatedDurationMin: 45,
    estimatedDurationMax: 60,
    estimatedFareMin: 5,
    estimatedFareMax: 5,
    currency: "EUR",
    officialCheckNote:
      "Confirm live RER A service with RATP, Île-de-France Mobilités, or SNCF.",
    confidence: "exact",
  },
  {
    guideId: "cdg-to-la-vallee-tgv-rer",
    outletId: "la-vallee-village",
    originType: "airport",
    mode: "train",
    provider: "SNCF / RATP",
    operator: "SNCF / RATP",
    line: "TGV / RER A",
    boardingPoint:
      "Paris Charles de Gaulle Airport Terminal 2 SNCF/TGV station",
    transferPoints: ["Marne-la-Vallée Chessy"],
    alightingPoint: "Val d'Europe / Serris-Montévrain",
    destination: "La Vallée Village",
    walkNote: "Walk through Val d'Europe shopping centre to La Vallée Village.",
    estimatedDurationMin: 25,
    estimatedDurationMax: 45,
    estimatedFareMin: 5,
    estimatedFareMax: 25,
    currency: "EUR",
    officialCheckNote:
      "Confirm SNCF/TGV and RER A times before buying tickets.",
    confidence: "exact",
  },
  {
    guideId: "paris-to-la-vallee-shopping-express",
    outletId: "la-vallee-village",
    originType: "shuttle",
    mode: "shuttle",
    provider: "Shopping Express",
    boardingPoint: "Hotel Pullman Paris Bercy",
    destination: "La Vallée Village",
    estimatedDurationMin: 45,
    estimatedDurationMax: 60,
    estimatedFareMin: 25,
    estimatedFareMax: 30,
    currency: "EUR",
    officialCheckNote:
      "Reservation is required; confirm departure and return times on the official booking page.",
    confidence: "exact",
  },
  {
    guideId: "serravalle-milan-official-shuttle",
    outletId: "serravalle-designer-outlet",
    originType: "shuttle",
    mode: "shuttle",
    provider: "Zani Viaggi / Frigerio Viaggi",
    boardingPoint: "Milano Centrale / Largo Cairoli",
    destination: "Serravalle Designer Outlet",
    estimatedDurationMin: 60,
    estimatedDurationMax: 90,
    estimatedFareMin: 25,
    estimatedFareMax: 35,
    currency: "EUR",
    officialCheckNote:
      "Book the official partner shuttle and confirm the return departure on your ticket.",
    confidence: "exact",
  },
  {
    guideId: "serravalle-train-bus",
    outletId: "serravalle-designer-outlet",
    originType: "cityCenter",
    mode: "train",
    provider: "Trenitalia",
    line: "Outlet Link",
    transferPoints: ["Arquata Scrivia / Serravalle Scrivia / Novi Ligure"],
    destination: "Serravalle Designer Outlet",
    estimatedDurationMin: 90,
    estimatedDurationMax: 120,
    estimatedFareMin: 2,
    estimatedFareMax: 25,
    currency: "EUR",
    officialCheckNote:
      "Confirm the combined Trenitalia train and Outlet Link bus timetable.",
    confidence: "partial",
  },

  {
    guideId: "istanbul-to-viaport-asia-iett",
    outletId: "viaport-asia-outlet-shopping",
    originType: "cityCenter",
    mode: "bus",
    provider: "İETT",
    operator: "İETT",
    line: "132K / KM25 / KM27 / 16KH / 134 / 130H",
    destination: "Viaport Asia Outlet Shopping",
    officialCheckNote:
      "Confirm the current İETT line, stop, and timetable before travel.",
    confidence: "exact",
  },
  {
    guideId: "pendik-area-to-viaport-asia-minibus",
    outletId: "viaport-asia-outlet-shopping",
    originType: "cityCenter",
    mode: "bus",
    provider: "Public minibus",
    line: "Pendik–Kurtköy–Viaport / Pendik–Velibaba–Viaport / Kartal–Sultanbeyli–Viaport / Dudullu–Yedpa–Viaport / Çekmeköy–Madenler–Viaport",
    destination: "Viaport Asia Outlet Shopping",
    officialCheckNote:
      "Confirm the current local minibus boarding and return arrangements.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-viaport-asia-car",
    outletId: "viaport-asia-outlet-shopping",
    originType: "taxiUber",
    mode: "taxi",
    destination: "Viaport Asia Outlet Shopping",
    sourceNote:
      "Verified road access includes free visitor parking for drivers.",
    officialCheckNote:
      "Check traffic, taxi fare, and return pickup before travel.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-olivium-marmaray",
    outletId: "olivium-outlet-center",
    originType: "cityCenter",
    mode: "train",
    provider: "Marmaray",
    line: "Marmaray",
    alightingPoint: "Kazlıçeşme",
    destination: "Olivium Outlet Center",
    walkNote: "Approximately five-minute final walk.",
    officialCheckNote:
      "Confirm the current Marmaray service to Kazlıçeşme before travel.",
    confidence: "exact",
  },
  {
    guideId: "zeytinburnu-to-olivium-local-connection",
    outletId: "olivium-outlet-center",
    originType: "cityCenter",
    mode: "bus",
    line: "M1A / T1 / Metrobüs + bus or minibus",
    boardingPoint: "Zeytinburnu",
    transferPoints: ["Zeytinburnu"],
    destination: "Olivium Outlet Center",
    officialCheckNote:
      "Confirm the current local connection and return service at Zeytinburnu.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-olivium-iett",
    outletId: "olivium-outlet-center",
    originType: "cityCenter",
    mode: "bus",
    provider: "İETT",
    operator: "İETT",
    line: "93 / 93C / 93M / 93T / BN3 / MR11 / MR20 / 97E",
    destination: "Olivium Outlet Center",
    officialCheckNote:
      "Confirm the current İETT boarding point, stop, and timetable before travel.",
    confidence: "exact",
  },
  {
    guideId: "istanbul-asian-side-to-olivium-ferry-rail",
    outletId: "olivium-outlet-center",
    originType: "cityCenter",
    mode: "ferry",
    line: "Ferry or sea bus + T1 or Marmaray",
    transferPoints: ["Eminönü / T1", "Yenikapı / Marmaray"],
    destination: "Olivium Outlet Center",
    officialCheckNote:
      "Choose one complete ferry and rail alternative and confirm return services.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-olivium-car",
    outletId: "olivium-outlet-center",
    originType: "taxiUber",
    mode: "taxi",
    destination: "Olivium Outlet Center",
    officialCheckNote:
      "Check traffic, taxi fare, and return pickup before travel.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-starcity-m9",
    outletId: "starcity-outlet",
    originType: "cityCenter",
    mode: "metro",
    operator: "Metro İstanbul",
    line: "M9",
    alightingPoint: "Doğu Sanayi",
    destination: "StarCity Outlet",
    walkNote: "Approximately 500 metres from the station.",
    officialCheckNote:
      "Confirm the current M9 service and return timetable before travel.",
    confidence: "exact",
  },
  {
    guideId: "metrobus-to-starcity-local-connection",
    outletId: "starcity-outlet",
    originType: "cityCenter",
    mode: "bus",
    line: "Metrobüs + local bus/minibus/M9 connection",
    boardingPoint: "Şirinevler / Yenibosna / Sefaköy",
    alightingPoint: "Şirinevler / Yenibosna / Sefaköy",
    destination: "StarCity Outlet",
    officialCheckNote:
      "Confirm the most convenient current local and return connection.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-starcity-iett",
    outletId: "starcity-outlet",
    originType: "cityCenter",
    mode: "bus",
    provider: "İETT",
    operator: "İETT",
    line: "31 / 31E / 36AY / 78B / 79F / 79G / 79K / 79Ş / 89YB / 98B / 98H / 98T",
    alightingPoint:
      "Dr. Enver Ören Kültür Merkezi / Alışveriş Merkezi – Bahçelievler",
    destination: "StarCity Outlet",
    officialCheckNote:
      "Confirm the current İETT boarding point, nearby stop, and timetable.",
    confidence: "exact",
  },
  {
    guideId: "sirinevler-sefakoy-to-starcity-minibus",
    outletId: "starcity-outlet",
    originType: "cityCenter",
    mode: "bus",
    provider: "Public minibus",
    line: "Şirinevler–Yenibosna / Küçükçekmece–Sefaköy",
    destination: "StarCity Outlet",
    officialCheckNote:
      "Confirm the current local minibus boarding and return arrangements.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-starcity-car",
    outletId: "starcity-outlet",
    originType: "taxiUber",
    mode: "taxi",
    destination: "StarCity Outlet",
    sourceNote:
      "Verified road access includes free visitor parking for drivers.",
    officialCheckNote:
      "Check traffic, taxi fare, and return pickup before travel.",
    confidence: "partial",
  },
  {
    guideId: "istanbul-to-venezia-t4",
    outletId: "venezia-mega-outlet",
    originType: "cityCenter",
    mode: "train",
    operator: "Metro İstanbul",
    line: "T4",
    alightingPoint: "Kiptaş–Venezia",
    destination: "Venezia Mega Outlet",
    officialCheckNote:
      "Confirm the current T4 service and return timetable before travel.",
    confidence: "exact",
  },
  {
    guideId: "istanbul-to-venezia-m7",
    outletId: "venezia-mega-outlet",
    originType: "cityCenter",
    mode: "metro",
    operator: "Metro İstanbul",
    line: "M7",
    alightingPoint: "Karadeniz Mahallesi",
    destination: "Venezia Mega Outlet",
    officialCheckNote:
      "Confirm the current M7 service and return timetable before travel.",
    confidence: "exact",
  },
  {
    guideId: "metrobus-to-venezia-t4",
    outletId: "venezia-mega-outlet",
    originType: "cityCenter",
    mode: "bus",
    line: "Metrobüs + T4",
    transferPoints: ["Edirnekapı / Şehitlik"],
    alightingPoint: "Kiptaş–Venezia",
    destination: "Venezia Mega Outlet",
    officialCheckNote:
      "Confirm both current Metrobüs and T4 connections before travel.",
    confidence: "exact",
  },
  {
    guideId: "yenikapi-to-venezia-m1a-t4",
    outletId: "venezia-mega-outlet",
    originType: "cityCenter",
    mode: "train",
    line: "Marmaray / M1A / T4",
    boardingPoint: "Yenikapı",
    transferPoints: ["M1A", "Topkapı–Ulubatlı", "T4"],
    alightingPoint: "Kiptaş–Venezia",
    destination: "Venezia Mega Outlet",
    officialCheckNote:
      "Confirm all current Marmaray, M1A, and T4 connections before travel.",
    confidence: "exact",
  },
  {
    guideId: "istanbul-to-venezia-iett",
    outletId: "venezia-mega-outlet",
    originType: "cityCenter",
    mode: "bus",
    provider: "İETT",
    operator: "İETT",
    line: "36A / 36E / 36M / 36V / 36CY / 36EM / 336 / 336E / 336M / 336Y / 79KM",
    destination: "Venezia Mega Outlet",
    officialCheckNote:
      "Confirm the current İETT boarding point, stop, and timetable before travel.",
    confidence: "exact",
  },
  {
    guideId: "istanbul-to-venezia-car-taxi",
    outletId: "venezia-mega-outlet",
    originType: "taxiUber",
    mode: "taxi",
    provider: "Venezia Mega Taxi / Karadeniz Taxi",
    destination: "Venezia Mega Outlet",
    officialCheckNote:
      "Confirm taxi pickup and return arrangements before travel.",
    confidence: "partial",
  },
];

export function getTransportationRouteFact(guideId: string | undefined) {
  return transportationRouteFacts.find((fact) => fact.guideId === guideId);
}
