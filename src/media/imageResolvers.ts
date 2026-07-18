import { ImageSourcePropType } from "react-native";

import { outlets } from "../constants/outlets";
import { getConfiguredOutletMediaMode } from "./outletMediaConfig";
import {
  getImageSource,
  getOutletCardHeroImage,
  getOutletHeroImage,
  getOutletMediaImages,
  type OutletMediaImage,
} from "./outletMedia";

export type HomeFeatureImageKey =
  | "discover-outlets"
  | "plan-trip"
  | "savings-guide"
  | "offline-availability";

export const nativePopularCityIds = [
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
const recommendedOutletFallbackImage = require("../../assets/home/recommended-outlet-generic.png");

const cityImageMap: Record<string, ImageSourcePropType> = {
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
  return require("../../assets/home/home-hero-premium.png");
}

export function getExploreHeroImage(): ImageSourcePropType {
  return require("../../assets/explore/explore-hero-premium.png");
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
  return heroImage ? getImageSource(heroImage) : recommendedOutletFallbackImage;
}

export function getOutletPrimaryImage(
  outlet: ImageResolvableOutlet,
): OutletMediaImage | undefined {
  return getOutletHeroImage(outlet, { mode: outletMediaMode });
}

export function getOutletGalleryImages(
  outlet: ImageResolvableOutlet,
): OutletMediaImage[] {
  return getOutletMediaImages(outlet, { mode: outletMediaMode });
}

export function getRecommendedOutlets() {
  return nativeRecommendedOutletIds
    .map((id) => outlets.find((outlet) => outlet.outletId === id))
    .filter(Boolean);
}
