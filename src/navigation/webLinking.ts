import type { InitialState, LinkingOptions } from "@react-navigation/native";

import { isTranslationLanguage, type TranslationLanguage } from "../translations/translations";
import type { RootStackParamList } from "./types";

type RouteDefinition = {
  name: keyof RootStackParamList | "Home" | "Explore" | "MyTrips" | "Savings" | "Profile";
  path: string;
  parameter?: string;
};

const routes: RouteDefinition[] = [
  { name: "Home", path: "" }, { name: "Explore", path: "explore" }, { name: "MyTrips", path: "trips" }, { name: "Savings", path: "savings" }, { name: "Profile", path: "profile" },
  { name: "OutletDetail", path: "outlet/:outletId", parameter: "outletId" }, { name: "BrandResults", path: "brand/:brandId", parameter: "brandId" }, { name: "Country", path: "country/:countryId", parameter: "countryId" }, { name: "CityResults", path: "city/:cityId", parameter: "cityId" }, { name: "Transportation", path: "transportation/:outletId", parameter: "outletId" },
  { name: "Favorites", path: "favorites" }, { name: "CreateTrip", path: "trips/create" }, { name: "TripDetail", path: "trip/:tripId", parameter: "tripId" }, { name: "TripSegmentEditor", path: "trip/:tripId/edit", parameter: "tripId" },
  { name: "SmartShoppingCalculator", path: "calculator/smart-shopping" }, { name: "PriceAdvantageCalculator", path: "calculator/price-advantage" }, { name: "TaxFreeCalculator", path: "calculator/tax-free" }, { name: "LanguageSettings", path: "language" }, { name: "CurrencySettings", path: "currency" }, { name: "NotificationSettings", path: "notifications" }, { name: "OfflinePacks", path: "offline" },
  { name: "WriteReview", path: "outlet/:outletId/review", parameter: "outletId" }, { name: "FlightDealSettings", path: "flight-deals/settings" }, { name: "FlightDeals", path: "flight-deals" }, { name: "FlightDealDetail", path: "flight-deals/:dealId", parameter: "dealId" },
  { name: "Login", path: "login" }, { name: "MyReviews", path: "reviews" }, { name: "ReviewModeration", path: "review-moderation" }, { name: "PrivacyPolicy", path: "privacy" }, { name: "TermsConditions", path: "terms" }, { name: "ContactUs", path: "contact" }, { name: "HelpFaq", path: "help" }, { name: "DeleteAccount", path: "delete-account" }, { name: "MediaCredits", path: "media-credits" },
];

const tabRoutes = new Set(["Home", "Explore", "MyTrips", "Savings", "Profile"]);

const canonicalNestedRootRoutes: Record<string, string> = {
  HomeRoot: "Home",
  ExploreRoot: "Explore",
  MyTripsRoot: "MyTrips",
};

function getCanonicalLeafName(name: string) {
  return canonicalNestedRootRoutes[name] ?? name;
}

function decode(segment: string) {
  try { return decodeURIComponent(segment); } catch { return segment; }
}

function getPathSegments(path: string) {
  return path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean).map(decode);
}

function routeForSegments(segments: string[]) {
  return routes.find((route) => {
    const pattern = route.path ? route.path.split("/") : [];
    return pattern.length === segments.length && pattern.every((part, index) => part.startsWith(":") || part === segments[index]);
  });
}

function pathForRoute(name: string, params: object | undefined) {
  const route = routes.find((candidate) => candidate.name === name);
  if (!route) return "";
  return route.path.replace(/:([A-Za-z]+)/g, (_, key: string) => {
    const value = params && key in params ? Reflect.get(params, key) : undefined
    return typeof value === "string" ? encodeURIComponent(value) : "";
  });
}

function getLeafRoute(state: InitialState | undefined): { name: string; params?: object } | undefined {
  let current = state;
  let route = current?.routes[current.index ?? current.routes.length - 1];
  while (route?.state) {
    current = route.state;
    route = current.routes[current.index ?? current.routes.length - 1];
  }
  return route ? { name: route.name, params: route.params } : undefined;
}

export function getLanguageFromPath(path: string): TranslationLanguage | undefined {
  const language = getPathSegments(path)[0];
  return isTranslationLanguage(language) ? language : undefined;
}

export function createWebLinking(language: TranslationLanguage): LinkingOptions<RootStackParamList> {
  return {
    prefixes: [],
    getStateFromPath(path): InitialState | undefined {
      const segments = getPathSegments(path);
      if (isTranslationLanguage(segments[0])) segments.shift();
      const route = routeForSegments(segments) ?? routes[0];
      const parameterValue = route.parameter ? segments[route.path.split("/").findIndex((part) => part.startsWith(":"))] : undefined;
      const params = route.parameter && parameterValue ? { [route.parameter]: parameterValue } : undefined;
      if (tabRoutes.has(route.name)) {
        return { routes: [{ name: "MainTabs", state: { routes: [{ name: route.name, params }] } }] };
      }
      return { routes: [{ name: route.name, params }] };
    },
    getPathFromState(state): string {
      const leaf = getLeafRoute(state);
      const path = leaf ? pathForRoute(getCanonicalLeafName(leaf.name), leaf.params) : "";
      return `/${language}${path ? `/${path}` : ""}`;
    },
  };
}
