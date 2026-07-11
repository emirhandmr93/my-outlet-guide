import { outlets } from "../constants/outlets";
import { getCityById, getCountryById } from "./locationService";

export type FlightDealDestinationOption = {
  destinationCityKey: string;
  destinationCityName: string;
  destinationCountryCode: string;
  destinationCountryName: string;
};

export function getFlightDealDestinationOptions(): FlightDealDestinationOption[] {
  const byKey = new Map<string, FlightDealDestinationOption>();

  outlets.forEach((outlet) => {
    const cityId = String(outlet.cityId ?? "").trim();
    const countryId = String(outlet.countryId ?? "").trim();
    if (!cityId || !countryId) return;
    const key = `${countryId}_${cityId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    if (byKey.has(key)) return;
    const city = getCityById(cityId);
    const country = getCountryById(countryId);
    byKey.set(key, {
      destinationCityKey: key,
      destinationCityName: city?.cityName ?? cityId,
      destinationCountryCode: countryId.toUpperCase(),
      destinationCountryName: country?.countryName ?? countryId,
    });
  });

  return Array.from(byKey.values()).sort((a, b) =>
    `${a.destinationCityName} ${a.destinationCountryName}`.localeCompare(
      `${b.destinationCityName} ${b.destinationCountryName}`,
    ),
  );
}
