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
        title: "Outlet guide data",
        description: `${outlets.length} outlets across ${countryCount} countries are bundled in the app for offline browsing.`,
      },
      {
        title: "Brands, restaurants and transportation notes",
        description: `${brands.length} brand records, ${restaurants.length} restaurant records and ${transportation.length} transportation records are bundled locally.`,
      },
      {
        title: "Local outlet photos",
        description: `${localMediaAssetCount} production-safe outlet image assets are packaged with the app and do not require a network request.`,
      },
      {
        title: "Tax Free rules",
        description: `${taxFreeRules.length} source-backed tax-free rule records are bundled for supported countries. Unsupported countries still show the existing unsupported-country state.`,
      },
    ],
    requiresInternet: [
      {
        title: "Reviews and ratings",
        description: "Review lists, review writes, helpful votes and reports are Firestore-backed and require network access.",
      },
      {
        title: "Favorites and trips sync",
        description: "Favorites and saved trips are Firestore-backed. This release does not create a local offline sync queue.",
      },
      {
        title: "Notifications and flight alerts",
        description: "Push token registration, reminder settings and release-gated flight alert services require network-backed infrastructure.",
      },
      {
        title: "Currency converter",
        description: "Exchange rates are live Frankfurter rates. No offline exchange-rate fallback is claimed unless a dated cached rate is implemented later.",
      },
    ],
  };
}
