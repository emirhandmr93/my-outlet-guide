import type { TranslationLanguage } from "../../translations/locale";

export type Coordinate = [longitude: number, latitude: number];
export type Polygon = Coordinate[][];
export type MapDetailMode = "premium" | "simple";
export type SpatialAccuracy = "schematic-reference" | "licensed-exact" | "surveyed-exact";

export const premiumMapPoiKinds = [
  "parking",
  "entrance",
  "exit",
  "wc",
  "accessible-wc",
  "tax-free",
  "information",
  "restaurant",
  "atm",
  "prayer-room",
  "baby-care",
  "ev-charging",
  "stairs",
] as const;

export type PremiumMapPoiKind = (typeof premiumMapPoiKinds)[number];

export type LocalizedLabel = Record<TranslationLanguage, string>;

export type PremiumMapStore = {
  id: string;
  brandId: string;
  brandName: string;
  aliases: string[];
  categoryId: string;
  floorId: string;
  openingHours: string;
  polygon: Polygon;
  center: Coordinate;
};

export type PremiumMapPoi = {
  id: string;
  kind: PremiumMapPoiKind;
  floorId: string;
  coordinate: Coordinate;
};

export type PremiumMapFloor = {
  id: string;
  level: number;
  label: LocalizedLabel;
};

export type PremiumMapEnvironment = {
  siteBoundary: Polygon;
  roads: Coordinate[][];
  walkways: Coordinate[][];
  landscapeAreas: Polygon[];
  trees: Coordinate[];
};

export type PremiumMapSource = {
  url: string;
  host: string;
  checkedOn: string;
  purpose: "directory-reference";
  redrawPolicy: "original-editorial-redraw";
  redistributionStatus: "original-data-only";
};

export type PremiumOutletMap = {
  schemaVersion: 1;
  outletId: string;
  outletName: string;
  center: Coordinate;
  defaultBearing: number;
  defaultPitch: number;
  defaultZoom: number;
  spatialAccuracy: SpatialAccuracy;
  lastUpdated: string;
  floors: PremiumMapFloor[];
  stores: PremiumMapStore[];
  pois: PremiumMapPoi[];
  environment: PremiumMapEnvironment;
  source: PremiumMapSource;
};

export type PremiumMapCampaign = {
  campaignId: string;
  brandName: string;
  endsOn: string;
  discountLabel: string;
};
