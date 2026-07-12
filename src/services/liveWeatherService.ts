import { httpsCallable } from "firebase/functions";

import { getCityCoordinate } from "../constants/cityCoordinates";
import type { Trip } from "../contexts/TripsContext";
import { functions } from "../firebase/config";

export type WeatherStatus = "ready" | "partial" | "unavailable" | "provider_not_configured" | "out_of_range" | "missing_coordinates";

export type TripWeatherDay = { date: string; weatherCode?: number; conditionLabel: string; tempMax?: number; tempMin?: number; precipitationProbabilityMax?: number; precipitationSum?: number; windSpeedMax?: number; status?: WeatherStatus };
export type TripWeatherLocation = { key: string; label: string; status?: WeatherStatus; daily: TripWeatherDay[] };
export type TripWeatherResult = { provider: "Open-Meteo"; updatedAt?: string; status: WeatherStatus; locations: TripWeatherLocation[] };

type WeatherCallableResponse = TripWeatherResult;
const getTripWeatherCallable = httpsCallable<{ locations: Array<{ key: string; label: string; latitude: number; longitude: number; startDate: string; endDate: string }>; locale?: string }, WeatherCallableResponse>(functions, "getTripWeather");

export function mapWeatherCodeToLabel(code: number | undefined, locale = "tr") {
  const labels = locale === "tr" ? { clear: "Açık", partly: "Parçalı bulutlu", cloudy: "Bulutlu", fog: "Sisli", drizzle: "Çiseleme", rain: "Yağmurlu", snow: "Karlı", shower: "Sağanak", thunder: "Gök gürültülü", unknown: "Bilinmiyor" } : { clear: "Clear", partly: "Partly cloudy", cloudy: "Cloudy", fog: "Fog", drizzle: "Drizzle", rain: "Rain", snow: "Snow", shower: "Showers", thunder: "Thunderstorm", unknown: "Unknown" };
  if (code === 0) return labels.clear;
  if (code === 1 || code === 2) return labels.partly;
  if (code === 3) return labels.cloudy;
  if (code === 45 || code === 48) return labels.fog;
  if ([51, 53, 55, 56, 57].includes(code ?? -1)) return labels.drizzle;
  if ([61, 63, 65, 66, 67].includes(code ?? -1)) return labels.rain;
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return labels.snow;
  if ([80, 81, 82].includes(code ?? -1)) return labels.shower;
  if ([95, 96, 99].includes(code ?? -1)) return labels.thunder;
  return labels.unknown;
}

export function normalizeWeatherResponse(response: WeatherCallableResponse, locale = "tr"): TripWeatherResult {
  return { provider: "Open-Meteo", status: response.status, updatedAt: response.updatedAt, locations: (response.locations || []).map((location) => ({ ...location, daily: (location.daily || []).map((day) => ({ ...day, conditionLabel: day.conditionLabel || mapWeatherCodeToLabel(day.weatherCode, locale) })) })) };
}

export async function getTripWeatherForecast(trip: Trip, locale = "tr"): Promise<TripWeatherResult> {
  const locations = trip.segments.map((segment) => {
    const coordinate = getCityCoordinate(segment.cityName || segment.title || segment.outletName);
    return coordinate ? { key: `${coordinate.key}_${segment.startDate}_${segment.endDate}`, label: segment.cityName || coordinate.label, latitude: coordinate.latitude, longitude: coordinate.longitude, startDate: segment.startDate, endDate: segment.endDate } : null;
  });

  if (locations.length > 0 && locations.every((item) => item == null)) return { provider: "Open-Meteo", status: "missing_coordinates", locations: [] };

  const result = await getTripWeatherCallable({ locations: locations.filter(Boolean) as NonNullable<(typeof locations)[number]>[], locale });
  return normalizeWeatherResponse(result.data, locale);
}
