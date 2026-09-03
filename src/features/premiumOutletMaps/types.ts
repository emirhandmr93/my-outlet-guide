import type { TranslationLanguage } from "../../translations/locale";

export type Coordinate = [longitude: number, latitude: number];
export type Polygon = Coordinate[][];
export type MapDetailMode = "premium" | "simple";
export type SpatialAccuracy =
  | "schematic-reference"
  | "open-data-verified"
  | "licensed-exact"
  | "surveyed-exact";
export type PremiumMapVerificationStatus = "draft" | "verified";
export type PremiumMapDataLicense =
  | "proprietary-reference-only"
  | "ODbL-1.0"
  | "commercial-license"
  | "self-surveyed";

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
  purpose: "directory-reference" | "spatial-data" | "survey-evidence";
  redrawPolicy: "original-editorial-redraw" | "open-data-render" | "licensed-render" | "survey-render";
  redistributionStatus: "reference-only" | "open-data-licensed" | "commercially-licensed" | "owned-survey";
  dataLicense: PremiumMapDataLicense;
  commercialReuseAllowed: boolean;
  attribution?: string;
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
  verificationStatus: PremiumMapVerificationStatus;
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
