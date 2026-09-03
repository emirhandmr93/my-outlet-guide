import type { PremiumOutletMap } from "./types";
import type { PremiumOutletMapId } from "./catalog";

/**
 * Generated/verified exact maps are registered here. Keep the registry explicit so Metro, web bundling and
 * offline builds all consume the same immutable spatial snapshot. Importers must never put a partially
 * verified map in this object; the release validator treats every entry as a production candidate.
 */
export const exactPremiumOutletMaps: Partial<Record<PremiumOutletMapId, PremiumOutletMap>> = {};
