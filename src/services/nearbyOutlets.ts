export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export type NearbyOutlet = UserCoordinates & {
  outletId: string;
  name: string;
  cityId: string;
  countryId: string;
  address: string;
  openingHours: string;
  googleMapsUrl?: string;
  appleMapsUrl?: string;
  distanceKm: number;
};

type OutletRecord = Record<string, unknown>;

const EARTH_RADIUS_KM = 6_371.0088;

function toFiniteCoordinate(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidCoordinates(value: UserCoordinates) {
  return (
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(from: UserCoordinates, to: UserCoordinates) {
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) return Number.POSITIVE_INFINITY;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const startLatitude = radians(from.latitude);
  const endLatitude = radians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function requiredString(record: OutletRecord, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(record: OutletRecord, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeOutlet(value: unknown, userLocation: UserCoordinates): NearbyOutlet | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as OutletRecord;
  if (record.status !== "active") return null;
  const latitude = toFiniteCoordinate(record.latitude);
  const longitude = toFiniteCoordinate(record.longitude);
  const outletId = requiredString(record, "outletId");
  const name = requiredString(record, "name");
  const cityId = requiredString(record, "cityId");
  const countryId = requiredString(record, "countryId");
  if (latitude === null || longitude === null || !outletId || !name || !cityId || !countryId) return null;
  if (!isValidCoordinates({ latitude, longitude })) return null;

  return {
    outletId,
    name,
    cityId,
    countryId,
    address: optionalString(record, "address") ?? "",
    openingHours: optionalString(record, "openingHours") ?? "",
    googleMapsUrl: optionalString(record, "googleMapsUrl"),
    appleMapsUrl: optionalString(record, "appleMapsUrl"),
    latitude,
    longitude,
    distanceKm: getDistanceKm(userLocation, { latitude, longitude }),
  };
}

export function getNearbyOutlets(
  source: readonly unknown[],
  userLocation: UserCoordinates,
  limit = 30,
) {
  if (!isValidCoordinates(userLocation)) return [];
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 30;
  return source
    .map((outlet) => normalizeOutlet(outlet, userLocation))
    .filter((outlet): outlet is NearbyOutlet => outlet !== null)
    .sort((left, right) => left.distanceKm - right.distanceKm || left.name.localeCompare(right.name))
    .slice(0, safeLimit);
}

export function getOutletMapsUrl(outlet: NearbyOutlet, preferAppleMaps = false) {
  if (preferAppleMaps && outlet.appleMapsUrl) return outlet.appleMapsUrl;
  if (outlet.googleMapsUrl) return outlet.googleMapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${outlet.latitude},${outlet.longitude}`)}`;
}
