import {
  flightDealDestinationAirportGroups,
  FlightDealDestinationAirportGroup,
} from "../constants/flightDealAirports";
import { outlets } from "../constants/outlets";
import { getCityById, getCountryById } from "./locationService";

export type FlightDealDestinationOption = {
  destinationCityKey: string;
  destinationCityName: string;
  destinationCountryCode: string;
  destinationCountryName: string;
  destinationAirportCodes: string[];
  destinationAirportNames: string[];
  airportCodes: string[];
  airports: FlightDealDestinationAirportGroup["airports"];
  searchAliases?: string[];
};

function destinationKey(countryId: string, cityId: string) {
  return `${countryId}_${cityId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const airportGroupsByKey = new Map(
  flightDealDestinationAirportGroups.map((group) => [
    group.destinationCityKey,
    group,
  ]),
);

export function getFlightDealDestinationOptions(): FlightDealDestinationOption[] {
  const byKey = new Map<string, FlightDealDestinationOption>();

  outlets.forEach((outlet) => {
    const cityId = String(outlet.cityId ?? "").trim();
    const countryId = String(outlet.countryId ?? "").trim();
    if (!cityId || !countryId) return;
    const key = destinationKey(countryId, cityId);
    if (byKey.has(key)) return;
    const airportGroup = airportGroupsByKey.get(key);
    if (!airportGroup || airportGroup.destinationAirportCodes.length === 0)
      return;
    const city = getCityById(cityId);
    const country = getCountryById(countryId);
    byKey.set(key, {
      destinationCityKey: key,
      destinationCityName: city?.cityName ?? airportGroup.destinationCityName,
      destinationCountryCode: airportGroup.destinationCountryCode,
      destinationCountryName:
        country?.countryName ?? airportGroup.destinationCountryName,
      destinationAirportCodes: airportGroup.destinationAirportCodes,
      destinationAirportNames: airportGroup.destinationAirportNames,
      airportCodes: airportGroup.destinationAirportCodes,
      airports: airportGroup.airports,
      searchAliases: airportGroup.searchAliases,
    });
  });

  return Array.from(byKey.values()).sort((a, b) =>
    `${a.destinationCityName} ${a.destinationCountryName}`.localeCompare(
      `${b.destinationCityName} ${b.destinationCountryName}`,
    ),
  );
}
