import { allCities, cities } from "../constants/cities";
import { allCountries, countries } from "../constants/countries";
import { outletBrands } from "../constants/outletBrands";
import {
  allOutlets,
  getUserVisibleOutletById,
  outlets,
  turkeyOutlets,
} from "../constants/outlets";
import { turkeyOutletBrands } from "../constants/outletBrands/turkey";
import { supportedFlightDealAirports } from "../constants/flightDealAirports";
import { isUserVisibleOutletCountryCode } from "./outletVisibility";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const turkeyOutletIds = new Set(turkeyOutlets.map((outlet) => outlet.outletId));
const nonTurkeySourceOutlets = allOutlets.filter(
  (outlet) => outlet.countryId !== "turkey",
);

assert(turkeyOutlets.length > 0, "Turkey outlet source records are missing.");
assert(turkeyOutletBrands.length > 0, "Turkey outlet-brand source records are missing.");
assert(
  allOutlets.filter((outlet) => outlet.countryId === "turkey").length ===
    turkeyOutlets.length,
  "Turkey outlet source records changed while applying visibility filtering.",
);
assert(
  outlets.length === nonTurkeySourceOutlets.length &&
    outlets.every((outlet) => outlet.countryId !== "turkey"),
  "A Turkey outlet is exposed or a non-Turkey outlet count changed.",
);
assert(
  countries.every((country) => country.countryId !== "turkey"),
  "Turkey country option is exposed.",
);
assert(
  cities.every((city) => city.countryId !== "turkey"),
  "Turkey city option is exposed.",
);
assert(
  allCountries.some((country) => country.countryId === "turkey") &&
    allCities.some((city) => city.countryId === "turkey"),
  "Turkey country or city source records are missing.",
);
assert(
  [...turkeyOutletIds].every((outletId) => !getUserVisibleOutletById(outletId)),
  "A direct Turkey outlet lookup resolves to a visible outlet.",
);
assert(
  supportedFlightDealAirports
    .filter((airport) => isUserVisibleOutletCountryCode(airport.countryCode))
    .every((airport) => airport.countryCode !== "TR"),
  "Turkey travel options are exposed by the visibility rule.",
);
assert(
  turkeyOutletBrands.every((relation) => outletBrands.includes(relation)),
  "Turkey outlet-brand relations were deleted.",
);

console.log(
  `Outlet visibility validation passed: ${outlets.length} visible outlets, ${turkeyOutlets.length} Turkey source outlets retained.`,
);
