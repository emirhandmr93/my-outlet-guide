import { outlets } from "../constants/outlets";
import { transportationGuides, type TransportationGuide } from "../constants/transportationGuides";
import { getTransportationForOutlet } from "./transportationService";

const UNSAFE_VALUE_PATTERN = /\b(confirm|check|varies|vary|provider|timetable|availability|unknown|not verified)\b/i;
const PROHIBITED_MAIN_LABEL_PATTERN = /private transfer|by car|parking|car \+ town parking|free parking/i;
const PUBLIC_TYPES = new Set(["train", "metro", "bus", "ferry", "walking"]);

export type TransportationV2Option = {
  id: string;
  originGroup: "airport" | "city" | "shuttle";
  originLabel: string;
  mode: string;
  duration?: string;
  fare?: string;
  note?: string;
  guide: TransportationGuide;
};

export function isSourceBackedValue(value: string | undefined): boolean {
  const normalized = String(value || "").trim();
  return Boolean(normalized) && !UNSAFE_VALUE_PATTERN.test(normalized);
}

export function isSourceBackedGuide(guide: TransportationGuide): boolean {
  return isSourceBackedValue(guide.estimatedDuration) || isSourceBackedValue(guide.estimatedCost) || guide.steps.length > 0;
}

function isPublicTransport(guide: TransportationGuide): boolean {
  return PUBLIC_TYPES.has(guide.transportationType);
}

function getOriginLabel(guide: TransportationGuide): string {
  if (guide.originType === "city_center") return "city";
  if (guide.originType === "airport") return guide.originId;
  return guide.originId || guide.originType;
}

function toOption(guide: TransportationGuide): TransportationV2Option {
  const isShuttle = guide.transportationType === "shuttle";
  return {
    id: guide.guideId,
    originGroup: isShuttle ? "shuttle" : guide.originType === "airport" ? "airport" : "city",
    originLabel: getOriginLabel(guide),
    mode: guide.transportationType,
    duration: isSourceBackedValue(guide.estimatedDuration) ? guide.estimatedDuration : undefined,
    fare: isSourceBackedValue(guide.estimatedCost) ? guide.estimatedCost : undefined,
    guide,
  };
}

export function getTransportationV2Options(outletId: string): TransportationV2Option[] {
  return transportationGuides
    .filter((guide) => guide.outletId === outletId)
    .filter((guide) => !PROHIBITED_MAIN_LABEL_PATTERN.test(guide.title))
    .filter(isSourceBackedGuide)
    .map(toOption);
}

export function getRecommendedTransportationV2Option(outletId: string): TransportationV2Option | undefined {
  const options = getTransportationV2Options(outletId);
  return (
    options.find((option) => option.mode === "shuttle" && (option.duration || option.fare)) ||
    options.find((option) => option.originGroup === "city" && isPublicTransport(option.guide)) ||
    options.find((option) => option.originGroup === "airport" && isPublicTransport(option.guide)) ||
    options.find((option) => ["taxi", "uber"].includes(option.mode)) ||
    options[0]
  );
}

export function getOutletTransportationV2Summary(outletId: string): TransportationV2Option[] {
  const options = getTransportationV2Options(outletId);
  const airport = options.find((option) => option.originGroup === "airport");
  const city = options.find((option) => option.originGroup === "city" && isPublicTransport(option.guide)) || options.find((option) => option.originGroup === "city");
  const shuttle = options.find((option) => option.originGroup === "shuttle" && (option.duration || option.fare));
  return [airport, city, shuttle].filter(Boolean) as TransportationV2Option[];
}

export function hasLegacyTransportationClutter(outletId: string): boolean {
  return getTransportationForOutlet(outletId).some((item) => PROHIBITED_MAIN_LABEL_PATTERN.test(`${item.title} ${item.cost}`));
}

export function getOutletMapLinks(outletId: string) {
  const outlet = outlets.find((item) => item.outletId === outletId);
  return outlet ? { googleMapsUrl: outlet.googleMapsUrl, appleMapsUrl: outlet.appleMapsUrl, yandexMapsUrl: outlet.yandexMapsUrl } : undefined;
}
