import type { SupportedFlightDealAirport } from "../constants/flightDealAirports";
import type { FlightDealAlertPreference, FlightDealThreshold } from "./flightDealAlertService";

type SaveFlightDealAlert = (
  userId: string,
  input: Omit<FlightDealAlertPreference, "alertId" | "userId" | "providerStatus" | "createdAt" | "updatedAt">,
) => Promise<string>;

export type FlightDealAlertSubmissionResult =
  | { status: "saved" }
  | { status: "provider_pending" | "sign_in_required" | "origin_required" | "destination_required" | "threshold_required" | "save_failed" };

export async function submitFlightDealAlert({
  providerEnabled,
  userId,
  origin,
  destination,
  thresholds,
  save,
}: {
  providerEnabled: boolean;
  userId?: string;
  origin: SupportedFlightDealAirport | null;
  destination: SupportedFlightDealAirport | null;
  thresholds: FlightDealThreshold[];
  save: SaveFlightDealAlert;
}): Promise<FlightDealAlertSubmissionResult> {
  if (!providerEnabled) return { status: "provider_pending" };
  if (!userId) return { status: "sign_in_required" };
  if (!origin) return { status: "origin_required" };
  if (!destination) return { status: "destination_required" };
  if (thresholds.length === 0) return { status: "threshold_required" };

  try {
    await save(userId, {
      originLabel: `${origin.cityName} (${origin.airportCode})`,
      originAirportCode: origin.airportCode,
      originAirportName: origin.airportName,
      originCityName: origin.cityName,
      originCountryCode: origin.countryCode,
      originCountryName: origin.countryName,
      destinationType: "airport",
      destinationKey: destination.airportCode,
      destinationAirportCode: destination.airportCode,
      destinationAirportName: destination.airportName,
      destinationCityName: destination.cityName,
      destinationCountryCode: destination.countryCode,
      destinationCountryName: destination.countryName,
      destinationLabel: `${destination.cityName} (${destination.airportCode})`,
      selectedThresholds: thresholds,
      active: true,
    });
    return { status: "saved" };
  } catch {
    return { status: "save_failed" };
  }
}
