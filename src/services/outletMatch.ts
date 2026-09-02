import { brands } from "../constants/brands";
import { outletBrands } from "../constants/outletBrands";
import { outlets } from "../constants/outlets";
import { getDistanceKm, isValidCoordinates, type UserCoordinates } from "./nearbyOutlets";

export type OutletMatchResult = {
  outletId: string;
  name: string;
  cityId: string;
  countryId: string;
  storesCountText: string;
  rating: number;
  matchedBrandIds: string[];
  missingBrandIds: string[];
  coveragePercent: number;
  distanceKm?: number;
};

const activeBrandIds = new Set(brands.filter((brand) => brand.brandStatus === "active").map((brand) => brand.brandId));
const relationBrandIdsByOutlet = new Map<string, Set<string>>();
for (const relation of outletBrands) {
  if (relation.relationStatus !== "active" || !activeBrandIds.has(relation.brandId)) continue;
  const set = relationBrandIdsByOutlet.get(relation.outletId) ?? new Set<string>();
  set.add(relation.brandId);
  relationBrandIdsByOutlet.set(relation.outletId, set);
}

function uniqueKnownIds(ids: readonly string[], known: Set<string>, limit: number) {
  return Array.from(new Set(ids.filter((id) => known.has(id)))).slice(0, limit);
}

function coordinate(value: unknown) {
  const result = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(result) ? result : null;
}

export function getOutletMatches(selectedIds: readonly string[], userLocation?: UserCoordinates | null) {
  const selectedBrandIds = uniqueKnownIds(selectedIds, activeBrandIds, 8);
  if (!selectedBrandIds.length) return [];
  const selected = new Set(selectedBrandIds);

  return outlets.flatMap((outlet): OutletMatchResult[] => {
    if (outlet.status !== "active") return [];
    const outletId = String(outlet.outletId ?? "");
    const relations = relationBrandIdsByOutlet.get(outletId) ?? new Set<string>();
    const matchedBrandIds = selectedBrandIds.filter((brandId) => relations.has(brandId));
    if (!matchedBrandIds.length) return [];
    const missingBrandIds = selectedBrandIds.filter((brandId) => !relations.has(brandId));
    const latitude = coordinate(outlet.latitude);
    const longitude = coordinate(outlet.longitude);
    const outletCoordinates = latitude === null || longitude === null ? null : { latitude, longitude };
    const distanceKm = userLocation && isValidCoordinates(userLocation) && outletCoordinates && isValidCoordinates(outletCoordinates)
      ? getDistanceKm(userLocation, outletCoordinates)
      : undefined;
    return [{
      outletId,
      name: String(outlet.outletName ?? outlet.name ?? outletId),
      cityId: String(outlet.cityId ?? ""),
      countryId: String(outlet.countryId ?? ""),
      storesCountText: String(outlet.storesCountText ?? ""),
      rating: typeof outlet.rating === "number" && Number.isFinite(outlet.rating) ? outlet.rating : 0,
      matchedBrandIds,
      missingBrandIds,
      coveragePercent: Math.round((matchedBrandIds.length / selected.size) * 100),
      ...(distanceKm !== undefined && Number.isFinite(distanceKm) ? { distanceKm } : {}),
    }];
  }).sort((left, right) =>
    right.coveragePercent - left.coveragePercent ||
    right.matchedBrandIds.length - left.matchedBrandIds.length ||
    (left.distanceKm ?? Number.POSITIVE_INFINITY) - (right.distanceKm ?? Number.POSITIVE_INFINITY) ||
    right.rating - left.rating ||
    left.name.localeCompare(right.name),
  );
}

const SELECTION_PATTERN = /^[a-z0-9,;=_-]{1,700}$/;

export function serializeOutletMatchSelection(brandIds: readonly string[], outletIds: readonly string[] = []) {
  const knownOutletIds = new Set(outlets.map((outlet) => String(outlet.outletId ?? "")));
  const safeBrands = uniqueKnownIds(brandIds, activeBrandIds, 8);
  const safeOutlets = uniqueKnownIds(outletIds, knownOutletIds, 3);
  return safeBrands.length ? `v1;b=${safeBrands.join(",")};o=${safeOutlets.join(",")}` : "start";
}

export function parseOutletMatchSelection(value: unknown) {
  if (typeof value !== "string" || value === "start" || !value.startsWith("v1;") || !SELECTION_PATTERN.test(value)) {
    return { brandIds: [] as string[], outletIds: [] as string[] };
  }
  const fields = Object.fromEntries(value.split(";").slice(1).map((part) => {
    const index = part.indexOf("=");
    return index > 0 ? [part.slice(0, index), part.slice(index + 1)] : ["", ""];
  }));
  const knownOutletIds = new Set(outlets.map((outlet) => String(outlet.outletId ?? "")));
  return {
    brandIds: uniqueKnownIds((fields.b ?? "").split(",").filter(Boolean), activeBrandIds, 8),
    outletIds: uniqueKnownIds((fields.o ?? "").split(",").filter(Boolean), knownOutletIds, 3),
  };
}
