import { cities } from "../constants/cities";
import { countries } from "../constants/countries";

export function getCityById(cityId: string) {
  return cities.find((city) => city.cityId === cityId) || null;
}

export function getCountryById(countryId: string) {
  return countries.find((country) => country.countryId === countryId) || null;
}

export function getCityName(cityId: string) {
  return getCityById(cityId)?.cityName || cityId;
}

export function getCountryName(countryId: string) {
  return getCountryById(countryId)?.countryName || countryId;
}

export function getCountryFlag(countryId: string) {
  return getCountryById(countryId)?.countryFlag || "🌍";
}

export function getCityCountryText(cityId: string, countryId: string) {
  return `${getCityName(cityId)}, ${getCountryName(countryId)}`;
}
