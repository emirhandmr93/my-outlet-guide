import { countries as baseCountries } from "./countries-base";

const singapore = {
  countryId: "singapore",
  taxFreeStatus: "available",
  countryName: "Singapore",
  countryFlag: "🇸🇬",
  continent: "Asia",
  currency: "SGD",
  taxFreeAvailable: "TRUE",
};

export const countries = baseCountries.some((country) => country.countryId === singapore.countryId)
  ? baseCountries
  : [...baseCountries, singapore];
