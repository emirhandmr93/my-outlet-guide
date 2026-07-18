const webHeroFallback = require("../../assets/explore/explore-hero-premium.png");

// Expo Web's Metro asset resolver is case-sensitive for file extensions in this
// repository. Keep native heroAssets.ts pointed at the existing uppercase source
// files, while this web-only registry avoids adding lowercase binary duplicates.
export const heroAssets = {
  explore: webHeroFallback,
  trips: webHeroFallback,
  savings: webHeroFallback,
  profile: webHeroFallback,
  login: webHeroFallback,
  flightDeals: webHeroFallback,
  offline: webHeroFallback,
  language: webHeroFallback,
  currency: webHeroFallback,
  notifications: webHeroFallback,
  security: webHeroFallback,
} as const;
