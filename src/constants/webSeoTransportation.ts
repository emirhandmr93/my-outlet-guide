import { transportation } from "./transportation";

export function hasWebSeoTransportation(outletId: string) {
  return transportation.some(
    (item) => item.outletId === outletId && item.status === "active" && (item.title.trim() || item.tip.trim()),
  );
}
