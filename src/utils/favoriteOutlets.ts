import { outlets } from "../constants/outlets";
import type { Outlet } from "../types/outlet";

function isVisibleFavoriteOutlet(outlet: Outlet) {
  return outlet.status !== "inactive";
}

export function resolveVisibleFavoriteOutlets(favoriteIds: string[]): Outlet[] {
  const requestedOutletIds = new Set(
    favoriteIds.filter((outletId) => outletId.trim().length > 0),
  );
  const allOutlets = outlets as Outlet[];

  return allOutlets.filter(
    (outlet) =>
      requestedOutletIds.has(outlet.outletId) &&
      isVisibleFavoriteOutlet(outlet),
  );
}
