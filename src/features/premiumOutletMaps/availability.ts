export const premiumOutletMapIds = [
  "bicester-village",
  "la-vallee-village",
  "serravalle-designer-outlet",
  "la-roca-village",
  "las-rozas-village",
  "designer-outlet-roermond",
  "outletcity-metzingen",
  "the-mall-firenze",
  "noventa",
  "fidenza-village",
  "ingolstadt-village",
  "wertheim-village",
  "maasmechelen-village",
  "kildare-village",
  "designer-outlet-parndorf",
  "designer-outlet-salzburg",
  "designer-outlet-roosendaal",
  "designer-outlet-neumunster",
  "designer-outlet-ochtrup",
  "castel-romano",
] as const;

export type PremiumOutletMapId = (typeof premiumOutletMapIds)[number];

const premiumOutletMapIdSet = new Set<string>(premiumOutletMapIds);

export function isPremiumOutletMapId(outletId: string): outletId is PremiumOutletMapId {
  return premiumOutletMapIdSet.has(outletId);
}

/**
 * Lightweight availability check for UI entry points. The release validator guarantees that every ID in
 * this curated list resolves to a verified production map, so callers do not need to import map geometry.
 */
export function hasPremiumOutletMap(outletId: string): outletId is PremiumOutletMapId {
  return isPremiumOutletMapId(outletId);
}
