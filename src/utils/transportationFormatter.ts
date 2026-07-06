import type { TransportationType } from "../constants/transportationGuides";

type TransportationTranslator = (key: string) => string;

function withIcon(icon: string, key: string, fallback: string, t?: TransportationTranslator) {
  return `${icon} ${t ? t(key) : fallback}`;
}

export function getTransportationLabel(type: TransportationType | string, t?: TransportationTranslator) {
  switch (type) {
    case "train":
      return withIcon("🚆", "transportation.type.train", "Train", t);
    case "metro":
      return withIcon("🚇", "transportation.type.metro", "Metro", t);
    case "bus":
      return withIcon("🚌", "transportation.type.bus", "Bus", t);
    case "shuttle":
      return withIcon("🚐", "transportation.type.shuttle", "Shuttle", t);
    case "taxi":
      return withIcon("🚖", "transportation.type.taxi", "Taxi", t);
    case "uber":
      return withIcon("🚘", "transportation.type.uber", "Uber", t);
    case "walking":
      return withIcon("🚶", "transportation.type.walking", "Walking", t);
    default:
      return withIcon("🚗", "transportation.type.transport", "Transport", t);
  }
}
