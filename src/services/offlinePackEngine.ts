import { brands } from "../constants/brands";
import { outlets } from "../constants/outlets";
import { restaurants } from "../constants/restaurants";
import { taxFreeRules } from "../constants/taxFreeRules";
import { transportation } from "../constants/transportation";
import { countProductionResolvedLocalImages } from "../media/outletMedia";

export type OfflineAvailabilityItem = {
  title: string;
  description: string;
};

export type OfflineAvailabilitySummary = {
  outletCount: number;
  countryCount: number;
  brandCount: number;
  restaurantRecordCount: number;
  transportationRecordCount: number;
  taxFreeRuleCount: number;
  localMediaAssetCount: number;
  availableOffline: OfflineAvailabilityItem[];
  requiresInternet: OfflineAvailabilityItem[];
};

export function getOfflineAvailabilitySummary(): OfflineAvailabilitySummary {
  const countryCount = new Set(outlets.map((outlet) => outlet.countryId)).size;
  const localMediaAssetCount = countProductionResolvedLocalImages();

  return {
    outletCount: outlets.length,
    countryCount,
    brandCount: brands.length,
    restaurantRecordCount: restaurants.length,
    transportationRecordCount: transportation.length,
    taxFreeRuleCount: taxFreeRules.length,
    localMediaAssetCount,
    availableOffline: [
      {
        title: "Outlet guide",
        description: `${outlets.length} outlets across ${countryCount} countries are bundled in the app for offline browsing.`,
      },
      {
        title: "Brand lists",
        description: `${brands.length} brand records are bundled locally.`,
      },
      {
        title: "Restaurant and transportation notes",
        description: `${restaurants.length} restaurant records and ${transportation.length} transportation records are bundled locally.`,
      },
      {
        title: "Local outlet images",
        description: `${localMediaAssetCount} production-safe outlet image assets are packaged with the app and do not require a network request.`,
      },
      {
        title: "Supported Tax Free guide information",
        description: `${taxFreeRules.length} source-backed tax-free rule records are bundled for supported countries. Unsupported countries still show the existing unsupported-country state.`,
      },
    ],
    requiresInternet: [
      {
        title: "Sign-in and account sync",
        description: "Authentication and account-backed synchronization require network access.",
      },
      {
        title: "Favorites and trips",
        description: "Favorites and saved trips are Firestore-backed. This release does not create a local offline sync queue.",
      },
      {
        title: "Reviews, helpful votes and notifications",
        description: "Review lists, review writes, helpful votes, reports, push token registration and reminder settings require network-backed infrastructure.",
      },
      {
        title: "Flight deal alerts",
        description: "Flight alert services require network-backed infrastructure.",
      },
      {
        title: "Live currency data",
        description: "Exchange rates are live Frankfurter rates. No offline exchange-rate fallback is claimed unless a dated cached rate is implemented later.",
      },
      {
        title: "Account deletion",
        description: "Account deletion is handled by a backend callable and requires internet access.",
      },
    ],
  };
}
