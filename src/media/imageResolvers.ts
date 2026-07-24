import { ImageSourcePropType } from "react-native";

import { outlets } from "../constants/outlets";
import { getConfiguredOutletMediaMode } from "./outletMediaConfig";
import {
  getImageSource,
  getOutletCardHeroImage,
  getOutletHeroImage,
  getOutletMediaImages,
} from "./outletMedia";
import { heroAssets } from "./heroAssets";

export type HomeFeatureImageKey =
  | "discover-outlets"
  | "plan-trip"
  | "savings-guide"
  | "offline-availability";

export const nativePopularCityIds = [
  "istanbul",
  "paris",
  "milan",
  "london",
  "munich",
  "vienna",
] as const;

export const nativeRecommendedOutletIds = [
  "la-vallee-village",
  "bicester-village",
  "serravalle-designer-outlet",
  "the-mall-firenze",
  "designer-outlet-parndorf",
] as const;

const outletMediaMode = getConfiguredOutletMediaMode();
const cityImageMap: Record<string, ImageSourcePropType> = {
  istanbul: require("../../assets/city-images/Istanbul.webp"),
  paris: require("../../assets/city-images/Paris.webp"),
  milan: require("../../assets/city-images/Milano.webp"),
  london: require("../../assets/city-images/London.webp"),
  munich: require("../../assets/city-images/Munich.webp"),
  vienna: require("../../assets/city-images/Vienna.webp"),
};

const homeFeatureImageMap: Record<HomeFeatureImageKey, ImageSourcePropType> = {
  "discover-outlets": require("../../assets/home/featured-discover-outlets.png"),
  "plan-trip": require("../../assets/home/featured-plan-trip.png"),
  "savings-guide": require("../../assets/home/featured-savings-guide.png"),
  "offline-availability": require("../../assets/home/featured-offline-availability.png"),
};

export function getHomeHeroImage(): ImageSourcePropType {
  // Kept in sync with HomeHeader, which is the native source of truth.
  return require("../../assets/home/home-hero-premium.png");
}

export function getExploreHeroImage(): ImageSourcePropType {
  // Kept in sync with ExploreScreen, which is the native source of truth.
  return require("../../assets/explore/explore-hero-premium.png");
}

export function getTripHeroImage(): ImageSourcePropType {
  return heroAssets.trips;
}

export function getSavingsHeroImage(): ImageSourcePropType {
  return heroAssets.savings;
}

export function getProfileHeroImage(): ImageSourcePropType {
  return heroAssets.profile;
}

export function getFlightDealsHeroImage(): ImageSourcePropType {
  return heroAssets.flightDeals;
}

export function getOfflineHeroImage(): ImageSourcePropType {
  return heroAssets.offline;
}

export function getLanguageHeroImage(): ImageSourcePropType {
  return heroAssets.language;
}

export function getCurrencyHeroImage(): ImageSourcePropType {
  return heroAssets.currency;
}

export function getNotificationsHeroImage(): ImageSourcePropType {
  return heroAssets.notifications;
}

export function getHomeFeatureImage(
  featureKey: HomeFeatureImageKey,
): ImageSourcePropType {
  return homeFeatureImageMap[featureKey];
}

export function getPopularCityImage(
  city: { cityId?: string } | string,
): ImageSourcePropType | undefined {
  const cityId = typeof city === "string" ? city : city.cityId;
  return cityId ? cityImageMap[cityId] : undefined;
}

type ImageResolvableOutlet = { [key: string]: unknown };

export function getRecommendedOutletImage(
  outlet: ImageResolvableOutlet,
): ImageSourcePropType {
  const heroImage = getOutletCardHeroImage(outlet, { mode: outletMediaMode });
  if (!heroImage) {
    throw new Error(
      `Missing native recommended outlet image for ${String(outlet.outletId ?? "unknown outlet")}`,
    );
  }
  return getImageSource(heroImage);
}

export function getOutletPrimaryImage(
  outlet: ImageResolvableOutlet,
): ImageSourcePropType {
  const image = getOutletHeroImage(outlet, { mode: outletMediaMode });
  if (!image) {
    throw new Error(
      `Missing native outlet primary image for ${String(outlet.outletId ?? "unknown outlet")}`,
    );
  }
  return getImageSource(image);
}

export function getOutletGalleryImages(
  outlet: ImageResolvableOutlet,
): ImageSourcePropType[] {
  const images = getOutletMediaImages(outlet, { mode: outletMediaMode });
  if (!images.length) {
    throw new Error(
      `Missing native outlet gallery images for ${String(outlet.outletId ?? "unknown outlet")}`,
    );
  }
  return images.map(getImageSource);
}

export function getRecommendedOutlets() {
  return nativeRecommendedOutletIds
    .map((id) => outlets.find((outlet) => outlet.outletId === id))
    .filter(Boolean);
}
