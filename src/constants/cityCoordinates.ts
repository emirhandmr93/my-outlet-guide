export type CityCoordinate = {
  key: string;
  label: string;
  latitude: number;
  longitude: number;
};

export const supportedCityCoordinates: Record<string, CityCoordinate> = {
  paris: { key: "paris", label: "Paris", latitude: 48.8566, longitude: 2.3522 },
  milano: { key: "milano", label: "Milano", latitude: 45.4642, longitude: 9.19 },
  milan: { key: "milano", label: "Milano", latitude: 45.4642, longitude: 9.19 },
  floransa: { key: "floransa", label: "Floransa", latitude: 43.7696, longitude: 11.2558 },
  florence: { key: "floransa", label: "Floransa", latitude: 43.7696, longitude: 11.2558 },
  roma: { key: "roma", label: "Roma", latitude: 41.9028, longitude: 12.4964 },
  rome: { key: "roma", label: "Roma", latitude: 41.9028, longitude: 12.4964 },
  venedik: { key: "venedik", label: "Venedik", latitude: 45.4408, longitude: 12.3155 },
  venice: { key: "venedik", label: "Venedik", latitude: 45.4408, longitude: 12.3155 },
  london: { key: "london", label: "London", latitude: 51.5072, longitude: -0.1276 },
  vienna: { key: "vienna", label: "Vienna", latitude: 48.2082, longitude: 16.3738 },
  amsterdam: { key: "amsterdam", label: "Amsterdam", latitude: 52.3676, longitude: 4.9041 },
  berlin: { key: "berlin", label: "Berlin", latitude: 52.52, longitude: 13.405 },
  munich: { key: "munich", label: "Munich", latitude: 48.1351, longitude: 11.582 },
  frankfurt: { key: "frankfurt", label: "Frankfurt", latitude: 50.1109, longitude: 8.6821 },
  barcelona: { key: "barcelona", label: "Barcelona", latitude: 41.3874, longitude: 2.1686 },
  madrid: { key: "madrid", label: "Madrid", latitude: 40.4168, longitude: -3.7038 },
  lisbon: { key: "lisbon", label: "Lisbon", latitude: 38.7223, longitude: -9.1393 },
  porto: { key: "porto", label: "Porto", latitude: 41.1579, longitude: -8.6291 },
  brussels: { key: "brussels", label: "Brussels", latitude: 50.8503, longitude: 4.3517 },
  zurich: { key: "zurich", label: "Zurich", latitude: 47.3769, longitude: 8.5417 },
  geneva: { key: "geneva", label: "Geneva", latitude: 46.2044, longitude: 6.1432 },
  prague: { key: "prague", label: "Prague", latitude: 50.0755, longitude: 14.4378 },
  budapest: { key: "budapest", label: "Budapest", latitude: 47.4979, longitude: 19.0402 },
  warsaw: { key: "warsaw", label: "Warsaw", latitude: 52.2297, longitude: 21.0122 },
  krakow: { key: "krakow", label: "Krakow", latitude: 50.0647, longitude: 19.945 },
  athens: { key: "athens", label: "Athens", latitude: 37.9838, longitude: 23.7275 },
  bucharest: { key: "bucharest", label: "Bucharest", latitude: 44.4268, longitude: 26.1025 },
};

export function normalizeCityCoordinateKey(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getCityCoordinate(value?: string | null) {
  if (!value) return null;
  return supportedCityCoordinates[normalizeCityCoordinateKey(value)] ?? null;
}
