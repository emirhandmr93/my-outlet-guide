import type { SupportedFlightDealAirport } from "../constants/flightDealAirports";
import type { FlightDealAlertSaveInput, FlightDealThreshold, FlightDealTripClass, FlightDealTripType } from "./flightDealAlertService";
import { isValidFlightDealDate } from "./flightDealAlertService";

type SaveFlightDealAlert = (userId: string, input: FlightDealAlertSaveInput, previousAlertId?: string) => Promise<string>;
export type FlightDealAlertSubmissionResult =
  | { status: "saved" | "saved_pending_provider" }
  | { status: "sign_in_required" | "origin_required" | "destination_required" | "same_airport_error" | "depart_date_required" | "return_date_required" | "past_date_error" | "return_before_departure" | "passenger_error" | "threshold_required" | "save_failed" };

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function submitFlightDealAlert({ providerEnabled, userId, origin, destination, thresholds, tripType, departDate, returnDate, adults, children, infants, tripClass, directOnly, previousAlertId, active = true, save }: {
  providerEnabled: boolean; userId?: string; origin: SupportedFlightDealAirport | null; destination: SupportedFlightDealAirport | null; thresholds: FlightDealThreshold[]; tripType: FlightDealTripType; departDate: string; returnDate?: string; adults: number; children: number; infants: number; tripClass: FlightDealTripClass; directOnly: boolean; previousAlertId?: string; active?: boolean; save: SaveFlightDealAlert;
}): Promise<FlightDealAlertSubmissionResult> {
  if (!userId) return { status: "sign_in_required" };
  if (!origin) return { status: "origin_required" };
  if (!destination) return { status: "destination_required" };
  if (origin.airportCode.trim().toUpperCase() === destination.airportCode.trim().toUpperCase()) return { status: "same_airport_error" };
  if (!isValidFlightDealDate(departDate)) return { status: "depart_date_required" };
  if (departDate < todayString()) return { status: "past_date_error" };
  if (tripType === "round_trip" && (!returnDate || !isValidFlightDealDate(returnDate))) return { status: "return_date_required" };
  if (tripType === "round_trip" && returnDate! < departDate) return { status: "return_before_departure" };
  if (tripType === "one_way" && returnDate !== undefined) return { status: "return_date_required" };
  if (!Number.isInteger(adults) || adults < 1 || adults > 9 || !Number.isInteger(children) || children < 0 || children > 8 || !Number.isInteger(infants) || infants < 0 || infants > 9 || adults + children > 9 || infants > adults) return { status: "passenger_error" };
  if (thresholds.length === 0) return { status: "threshold_required" };
  try {
    await save(userId, {
      originLabel: `${origin.cityName} (${origin.airportCode})`, originAirportCode: origin.airportCode, originAirportName: origin.airportName, originCityName: origin.cityName, originCountryCode: origin.countryCode, originCountryName: origin.countryName,
      destinationType: "airport", destinationKey: destination.airportCode, destinationAirportCode: destination.airportCode, destinationAirportName: destination.airportName, destinationCityName: destination.cityName, destinationCountryCode: destination.countryCode, destinationCountryName: destination.countryName, destinationLabel: `${destination.cityName} (${destination.airportCode})`,
      selectedThresholds: thresholds, active, tripType, departDate, ...(returnDate ? { returnDate } : {}), adults, children, infants, tripClass, directOnly, currency: "EUR",
    }, previousAlertId);
    return { status: providerEnabled ? "saved" : "saved_pending_provider" };
  } catch { return { status: "save_failed" }; }
}
