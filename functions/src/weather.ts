import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const MAX_LOCATIONS = 8;
const MAX_FORECAST_DAYS = 16;
const DEFAULT_BASE_URL = "https://customer-api.open-meteo.com/v1/forecast";

type WeatherLocationRequest = { key?: unknown; label?: unknown; latitude?: unknown; longitude?: unknown; startDate?: unknown; endDate?: unknown };
type WeatherStatus = "ready" | "partial" | "unavailable" | "provider_not_configured" | "out_of_range" | "missing_coordinates";

type DailyWeather = { date: string; weatherCode?: number; conditionLabel: string; tempMax?: number; tempMin?: number; precipitationProbabilityMax?: number; precipitationSum?: number; windSpeedMax?: number; status?: WeatherStatus };
type OpenMeteoConfig = { apiKey: string; baseUrl: string };

function parseDate(value: unknown, field: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpsError("invalid-argument", `${field}_invalid`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new HttpsError("invalid-argument", `${field}_invalid`);
  return value;
}
function daysBetween(start: string, end: string) { return Math.floor((new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) / 86400000) + 1; }
function conditionLabel(code?: number) { if (code === 0) return "Clear"; if (code === 1 || code === 2) return "Partly cloudy"; if (code === 3) return "Cloudy"; if (code === 45 || code === 48) return "Fog"; if ([51,53,55,56,57].includes(code ?? -1)) return "Drizzle"; if ([61,63,65,66,67].includes(code ?? -1)) return "Rain"; if ([71,73,75,77,85,86].includes(code ?? -1)) return "Snow"; if ([80,81,82].includes(code ?? -1)) return "Showers"; if ([95,96,99].includes(code ?? -1)) return "Thunderstorm"; return "Unknown"; }
function cacheId(key: string, start: string, end: string) { return `${key}_${start}_${end}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 240); }
function providerNotConfigured() { return { provider: "Open-Meteo", updatedAt: new Date().toISOString(), status: "provider_not_configured" as WeatherStatus, locations: [] }; }
function resolveOpenMeteoConfig(): OpenMeteoConfig | null {
  const apiKey = process.env.OPEN_METEO_API_KEY?.trim();
  const baseUrl = (process.env.OPEN_METEO_BASE_URL || DEFAULT_BASE_URL).trim();
  if (!apiKey || !baseUrl) return null;
  try {
    new URL(baseUrl);
  } catch {
    return null;
  }
  return { apiKey, baseUrl };
}

function validateLocations(input: unknown) {
  if (!Array.isArray(input)) throw new HttpsError("invalid-argument", "locations_required");
  if (input.length > MAX_LOCATIONS) throw new HttpsError("invalid-argument", "too_many_locations");
  return input.map((raw: WeatherLocationRequest) => {
    const key = typeof raw.key === "string" && raw.key.trim() ? raw.key.trim() : "";
    const label = typeof raw.label === "string" && raw.label.trim() ? raw.label.trim() : key;
    const latitude = Number(raw.latitude);
    const longitude = Number(raw.longitude);
    const startDate = parseDate(raw.startDate, "startDate");
    const endDate = parseDate(raw.endDate, "endDate");
    if (!key || !Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new HttpsError("invalid-argument", "location_coordinates_invalid");
    if (daysBetween(startDate, endDate) < 1 || daysBetween(startDate, endDate) > MAX_FORECAST_DAYS) throw new HttpsError("invalid-argument", "date_range_invalid");
    return { key, label, latitude, longitude, startDate, endDate };
  });
}

async function fetchLocation(db: Firestore, location: ReturnType<typeof validateLocations>[number], config: OpenMeteoConfig) {
  const cacheRef = db.collection("weatherCache").doc(cacheId(location.key, location.startDate, location.endDate));
  const cached = await cacheRef.get();
  const cachedData = cached.data();
  if (cached.exists && typeof cachedData?.updatedAt === "string" && Date.now() - Date.parse(cachedData.updatedAt) < 60 * 60 * 1000) return cachedData.result;

  const url = new URL(config.baseUrl);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("start_date", location.startDate);
  url.searchParams.set("end_date", location.endDate);
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("apikey", config.apiKey);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
  const body = await response.json() as { daily?: Record<string, unknown[]> };
  const time = body.daily?.time as string[] | undefined;
  const daily: DailyWeather[] = (time || []).map((date, index) => ({ date, weatherCode: (body.daily?.weather_code as number[] | undefined)?.[index], conditionLabel: conditionLabel((body.daily?.weather_code as number[] | undefined)?.[index]), tempMax: (body.daily?.temperature_2m_max as number[] | undefined)?.[index], tempMin: (body.daily?.temperature_2m_min as number[] | undefined)?.[index], precipitationProbabilityMax: (body.daily?.precipitation_probability_max as number[] | undefined)?.[index], precipitationSum: (body.daily?.precipitation_sum as number[] | undefined)?.[index], windSpeedMax: (body.daily?.wind_speed_10m_max as number[] | undefined)?.[index] }));
  const result = { key: location.key, label: location.label, status: daily.length ? "ready" : "out_of_range", daily };
  await cacheRef.set({ provider: "Open-Meteo", updatedAt: new Date().toISOString(), startDate: location.startDate, endDate: location.endDate, result, touchedAt: FieldValue.serverTimestamp() }, { merge: true });
  return result;
}

export const getTripWeather = onCall({ region: "us-central1", memory: "256MiB", timeoutSeconds: 30 }, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication is required.");
  const locations = validateLocations((request.data as { locations?: unknown } | undefined)?.locations);
  const config = resolveOpenMeteoConfig();
  if (!config) return providerNotConfigured();
  try {
    const db = getFirestore();
    const results = await Promise.all(locations.map((location) => fetchLocation(db, location, config)));
    const status: WeatherStatus = results.every((item: { status: WeatherStatus }) => item.status === "ready") ? "ready" : "partial";
    return { provider: "Open-Meteo", updatedAt: new Date().toISOString(), status, locations: results };
  } catch {
    return { provider: "Open-Meteo", updatedAt: new Date().toISOString(), status: "unavailable" as WeatherStatus, locations: [] };
  }
});
