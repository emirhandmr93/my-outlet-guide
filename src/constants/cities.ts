import { cities as baseCities } from "./cities-base";

const finalExpansionCities = [
  { cityId: "thessaloniki", cityName: "Thessaloniki", countryId: "greece" },
  { cityId: "polgar", cityName: "Polgár", countryId: "hungary" },
  { cityId: "tainan", cityName: "Tainan", countryId: "taiwan" },
  { cityId: "singapore", cityName: "Singapore", countryId: "singapore" },
  { cityId: "elizabeth", cityName: "Elizabeth", countryId: "united-states" },
  { cityId: "chicago", cityName: "Chicago", countryId: "united-states" },
  { cityId: "seattle", cityName: "Seattle", countryId: "united-states" },
  { cityId: "boston", cityName: "Boston", countryId: "united-states" },
  { cityId: "san-diego", cityName: "San Diego", countryId: "united-states" },
  { cityId: "los-angeles", cityName: "Los Angeles", countryId: "united-states" },
  { cityId: "austin", cityName: "Austin", countryId: "united-states" },
  { cityId: "honolulu", cityName: "Honolulu", countryId: "united-states" },
  { cityId: "krakow", cityName: "Kraków", countryId: "poland" },
  { cityId: "al-ain", cityName: "Al Ain", countryId: "united-arab-emirates" },
];

const unique = new Map<string, (typeof baseCities)[number] | (typeof finalExpansionCities)[number]>();
for (const city of [...baseCities, ...finalExpansionCities]) unique.set(city.cityId, city);
export const cities = Array.from(unique.values());
