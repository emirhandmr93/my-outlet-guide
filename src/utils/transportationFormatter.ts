import type { TransportationType } from "../constants/transportationGuides";

export function getTransportationLabel(type: TransportationType | string) {
  switch (type) {
    case "train":
      return "🚆 Train";
    case "metro":
      return "🚇 Metro";
    case "bus":
      return "🚌 Bus";
    case "shuttle":
      return "🚐 Shuttle";
    case "taxi":
      return "🚖 Taxi";
    case "uber":
      return "🚘 Uber";
    case "walking":
      return "🚶 Walking";
    default:
      return "🚗 Transport";
  }
}
