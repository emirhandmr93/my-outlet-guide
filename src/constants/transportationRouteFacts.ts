import type { TransportationType } from "./transportationGuides";

export type TransportationRouteOriginType =
  | "airport"
  | "cityCenter"
  | "shuttle"
  | "taxiUber";

export type TransportationRouteConfidence = "exact" | "partial" | "estimateOnly";

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
    walkNote: "Use the official station bus from Parndorf Ort to Designer Outlet Parndorf when operating.",
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
    officialCheckNote: "Confirm live RER A service with RATP, Île-de-France Mobilités, or SNCF.",
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
    boardingPoint: "Paris Charles de Gaulle Airport Terminal 2 SNCF/TGV station",
    transferPoints: ["Marne-la-Vallée Chessy"],
    alightingPoint: "Val d'Europe / Serris-Montévrain",
    destination: "La Vallée Village",
    walkNote: "Walk through Val d'Europe shopping centre to La Vallée Village.",
    estimatedDurationMin: 25,
    estimatedDurationMax: 45,
    estimatedFareMin: 5,
    estimatedFareMax: 25,
    currency: "EUR",
    officialCheckNote: "Confirm SNCF/TGV and RER A times before buying tickets.",
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
    officialCheckNote: "Reservation is required; confirm departure and return times on the official booking page.",
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
    officialCheckNote: "Book the official partner shuttle and confirm the return departure on your ticket.",
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
    officialCheckNote: "Confirm the combined Trenitalia train and Outlet Link bus timetable.",
    confidence: "partial",
  },
];

export function getTransportationRouteFact(guideId: string | undefined) {
  return transportationRouteFacts.find((fact) => fact.guideId === guideId);
}
