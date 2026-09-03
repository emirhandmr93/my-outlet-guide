import { outlets } from "../../constants/outlets";
import { getBrandsForOutlet } from "../../services/brandService";
import type { TranslationLanguage } from "../../translations/locale";
import type {
  Coordinate,
  LocalizedLabel,
  Polygon,
  PremiumMapEnvironment,
  PremiumMapFloor,
  PremiumMapPoi,
  PremiumMapPoiKind,
  PremiumMapSource,
  PremiumMapStore,
  PremiumOutletMap,
} from "./types";

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
] as const;

export type PremiumOutletMapId = (typeof premiumOutletMapIds)[number];

const sourceUrls: Record<PremiumOutletMapId, string> = {
  "bicester-village": "https://www.thebicestercollection.com/bicester-village/en/map/",
  "la-vallee-village": "https://www.thebicestercollection.com/la-vallee-village/en/map/",
  "serravalle-designer-outlet": "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/plan-your-visit/map/",
  "la-roca-village": "https://www.thebicestercollection.com/la-roca-village/en/map/",
  "las-rozas-village": "https://www.thebicestercollection.com/las-rozas-village/en/map/",
  "designer-outlet-roermond": "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/plan-your-visit/map/",
  "outletcity-metzingen": "https://www.outletcity.com/en/metzingen/map/",
  "the-mall-firenze": "https://firenze.themall.it/en/visit-us",
  noventa: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-noventa-di-piave/plan-your-visit/map/",
  "fidenza-village": "https://www.thebicestercollection.com/fidenza-village/en/map/",
};

const floorLabels: Record<TranslationLanguage, string> = {
  en: "Ground floor", tr: "Zemin kat", es: "Planta baja", fr: "Rez-de-chaussée",
  de: "Erdgeschoss", ar: "الطابق الأرضي", ru: "Первый этаж", zh: "一层",
};

function offset(center: Coordinate, eastMeters: number, northMeters: number): Coordinate {
  const latitudeRadians = center[1] * Math.PI / 180;
  const longitude = center[0] + eastMeters / (111_320 * Math.max(0.2, Math.cos(latitudeRadians)));
  const latitude = center[1] + northMeters / 110_540;
  return [longitude, latitude];
}

function rectangle(center: Coordinate, eastMeters: number, northMeters: number, widthMeters: number, heightMeters: number): Polygon {
  const west = eastMeters - widthMeters / 2;
  const east = eastMeters + widthMeters / 2;
  const south = northMeters - heightMeters / 2;
  const north = northMeters + heightMeters / 2;
  return [[
    offset(center, west, south),
    offset(center, east, south),
    offset(center, east, north),
    offset(center, west, north),
    offset(center, west, south),
  ]];
}

function line(center: Coordinate, points: Array<[number, number]>): Coordinate[] {
  return points.map(([east, north]) => offset(center, east, north));
}

function buildStores(outletId: string, center: Coordinate, openingHours: string): PremiumMapStore[] {
  const brands = getBrandsForOutlet(outletId);
  const columns = 10;
  const cellWidth = 22;
  const cellHeight = 17;
  const gap = 6;
  return brands.map((brand, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const direction = row % 2 === 0 ? 1 : -1;
    const visualColumn = direction === 1 ? column : columns - column - 1;
    const east = (visualColumn - (columns - 1) / 2) * (cellWidth + gap);
    const north = 160 - row * (cellHeight + 10);
    const polygon = rectangle(center, east, north, cellWidth, cellHeight);
    return {
      id: `${outletId}:${brand.brandId}`,
      outletId,
      brandId: brand.brandId,
      brandName: brand.brandName,
      aliases: brand.aliases ?? [],
      categoryId: brand.categoryId,
      floorId: "ground",
      openingHours,
      geometryKind: "area",
      polygon,
      center: offset(center, east, north),
    };
  });
}

function buildPois(center: Coordinate): PremiumMapPoi[] {
  const placements: Array<[PremiumMapPoiKind, number, number]> = [
    ["parking", -180, -205], ["entrance", 0, -188], ["exit", 70, -188],
    ["wc", -100, 95], ["accessible-wc", -76, 95], ["tax-free", 108, 95],
    ["information", 0, -118], ["restaurant", 150, 15], ["atm", -135, 10],
    ["prayer-room", 105, -85], ["baby-care", -105, -85], ["ev-charging", 180, -205],
    ["stairs", 0, 25],
  ];
  return placements.map(([kind, east, north]) => ({
    id: `${kind}-ground`, kind, floorId: "ground", coordinate: offset(center, east, north),
  }));
}

function buildEnvironment(center: Coordinate): PremiumMapEnvironment {
  const landscapeAreas = [
    rectangle(center, -170, 155, 54, 72), rectangle(center, 170, 155, 54, 72),
    rectangle(center, -170, -120, 54, 60), rectangle(center, 170, -120, 54, 60),
  ];
  const trees: Coordinate[] = [];
  for (const east of [-190, -165, -140, 140, 165, 190]) {
    for (const north of [-130, -35, 60, 155]) trees.push(offset(center, east, north));
  }
  return {
    siteBoundary: rectangle(center, 0, -15, 440, 430),
    roads: [line(center, [[-240, -220], [240, -220]]), line(center, [[-225, -220], [-225, 215]])],
    walkways: [line(center, [[0, -190], [0, 205]]), line(center, [[-205, 20], [205, 20]])],
    landscapeAreas,
    trees,
  };
}

function buildSource(outletId: PremiumOutletMapId): PremiumMapSource {
  const url = sourceUrls[outletId];
  return {
    url,
    host: new URL(url).hostname,
    checkedOn: "2026-09-03",
    purpose: "directory-reference",
    redrawPolicy: "original-editorial-redraw",
    redistributionStatus: "reference-only",
    dataLicense: "proprietary-reference-only",
    commercialReuseAllowed: false,
  };
}

function buildMap(outletId: PremiumOutletMapId): PremiumOutletMap {
  const outlet = outlets.find(candidate => candidate.outletId === outletId);
  if (!outlet || !Number.isFinite(outlet.longitude) || !Number.isFinite(outlet.latitude)) {
    throw new Error(`Premium map outlet is missing or has invalid coordinates: ${outletId}`);
  }
  const center: Coordinate = [Number(outlet.longitude), Number(outlet.latitude)];
  const floor: PremiumMapFloor = { id: "ground", level: 0, label: floorLabels as LocalizedLabel };
  return {
    schemaVersion: 1,
    outletId,
    outletName: String(outlet.name),
    center,
    defaultBearing: 18,
    defaultPitch: 52,
    defaultZoom: 17.25,
    spatialAccuracy: "schematic-reference",
    verificationStatus: "draft",
    lastUpdated: "2026-09-03",
    floors: [floor],
    stores: buildStores(outletId, center, String(outlet.openingHours ?? "—")),
    pois: buildPois(center),
    environment: buildEnvironment(center),
    source: buildSource(outletId),
  };
}

const mapCache = new Map<PremiumOutletMapId, PremiumOutletMap>();

function isPremiumOutletMapCandidateId(outletId: string): outletId is PremiumOutletMapId {
  return premiumOutletMapIds.includes(outletId as PremiumOutletMapId);
}

function isFiniteCoordinate(coordinate: Coordinate): boolean {
  return Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1])
    && coordinate[0] >= -180 && coordinate[0] <= 180
    && coordinate[1] >= -90 && coordinate[1] <= 90;
}

function hasClosedPolygon(polygon: Polygon | undefined): boolean {
  const ring = polygon?.[0];
  if (!ring || ring.length < 4) return false;
  const first = ring[0];
  const last = ring[ring.length - 1];
  return Boolean(first && last && first[0] === last[0] && first[1] === last[1] && ring.every(isFiniteCoordinate));
}

export function getPremiumOutletMapCandidate(outletId: string): PremiumOutletMap | undefined {
  if (!isPremiumOutletMapCandidateId(outletId)) return undefined;
  const cached = mapCache.get(outletId);
  if (cached) return cached;
  const generated = buildMap(outletId);
  mapCache.set(outletId, generated);
  return generated;
}

export function isPremiumOutletMapReleaseReady(map: PremiumOutletMap): boolean {
  if (map.verificationStatus !== "verified") return false;
  if (map.spatialAccuracy === "schematic-reference") return false;
  if (!map.source.commercialReuseAllowed) return false;
  if (map.source.redistributionStatus === "reference-only") return false;
  if (map.source.dataLicense === "proprietary-reference-only") return false;
  if (map.source.dataLicense === "ODbL-1.0" && !map.source.attribution?.includes("OpenStreetMap")) return false;
  if (map.floors.length === 0 || map.stores.length === 0) return false;
  for (const store of map.stores) {
    if (!isFiniteCoordinate(store.center)) return false;
    if (store.geometryKind === "area" && !hasClosedPolygon(store.polygon)) return false;
    if (store.geometryKind === "point" && store.polygon) return false;
  }
  return true;
}

export function hasPremiumOutletMap(outletId: string): outletId is PremiumOutletMapId {
  const map = getPremiumOutletMapCandidate(outletId);
  return Boolean(map && isPremiumOutletMapReleaseReady(map));
}

export function getPremiumOutletMap(outletId: string): PremiumOutletMap | undefined {
  const map = getPremiumOutletMapCandidate(outletId);
  return map && isPremiumOutletMapReleaseReady(map) ? map : undefined;
}

export function getAllPremiumOutletMapCandidates(): PremiumOutletMap[] {
  return premiumOutletMapIds.map(outletId => getPremiumOutletMapCandidate(outletId) as PremiumOutletMap);
}

export function getAllPremiumOutletMaps(): PremiumOutletMap[] {
  return getAllPremiumOutletMapCandidates().filter(isPremiumOutletMapReleaseReady);
}
