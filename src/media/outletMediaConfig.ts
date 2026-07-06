import { type OutletMediaResolverMode } from "./outletMedia";

export const OUTLET_MEDIA_MODE_ENV = "EXPO_PUBLIC_OUTLET_MEDIA_MODE";

/**
 * Runtime media mode selected from Expo public env.
 *
 * Set EXPO_PUBLIC_OUTLET_MEDIA_MODE=production to enable production-safe media
 * resolution. Missing, empty, or any other value intentionally keeps inventory
 * mode so development behavior remains unchanged.
 */
export function getConfiguredOutletMediaMode(): OutletMediaResolverMode {
  return process.env.EXPO_PUBLIC_OUTLET_MEDIA_MODE === "production"
    ? "production"
    : "inventory";
}

export function isConfiguredOutletMediaProductionMode(): boolean {
  return getConfiguredOutletMediaMode() === "production";
}
