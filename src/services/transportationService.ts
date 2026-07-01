import { transportation } from "../constants/transportation";

export type TransportationItem = {
  transportationId: string;
  outletId: string;
  transportType: string;
  title: string;
  duration: string;
  cost: string;
  tip: string;
  status: string;
  displayOrder: string;
};

export function getTransportationForOutlet(outletId: string): TransportationItem[] {
  return transportation
    .filter((item) => item.outletId === outletId && item.status === "active")
    .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)) as TransportationItem[];
}

export function hasTransportationForOutlet(outletId: string): boolean {
  return getTransportationForOutlet(outletId).length > 0;
}
