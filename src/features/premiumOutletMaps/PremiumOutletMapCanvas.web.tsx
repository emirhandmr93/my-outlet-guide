import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TranslationLanguage } from "../../translations/locale";
import { poiLabels } from "./copy";
import { campaignForStore } from "./search";
import type {
  Coordinate,
  MapDetailMode,
  Polygon,
  PremiumMapCampaign,
  PremiumMapStore,
  PremiumOutletMap,
} from "./types";

type Props = {
  map: PremiumOutletMap;
  floorId: string;
  language: TranslationLanguage;
  detailMode: MapDetailMode;
  campaigns: PremiumMapCampaign[];
  selectedStoreId?: string;
  focusCoordinate?: Coordinate;
  focusSequence: number;
  bearing: number;
  onSelectStore: (store: PremiumMapStore) => void;
};

type PlanPoint = { x: number; y: number };
type LocalPoint = { east: number; north: number };
type PolygonLayout = {
  left: string;
  top: string;
  width: string;
  height: string;
  clipPath: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  area: number;
};

type Projection = {
  point: (coordinate: Coordinate) => PlanPoint;
};

const GRID_POSITIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

function coordinateToMeters(origin: Coordinate, coordinate: Coordinate): LocalPoint {
  const latitudeRadians = origin[1] * Math.PI / 180;
  return {
    east: (coordinate[0] - origin[0]) * 111_320 * Math.max(0.2, Math.cos(latitudeRadians)),
    north: (coordinate[1] - origin[1]) * 110_540,
  };
}

function rotatePoint(point: LocalPoint, bearing: number): LocalPoint {
  const radians = -bearing * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return {
    east: point.east * cosine - point.north * sine,
    north: point.east * sine + point.north * cosine,
  };
}

function floorMapCoordinates(map: PremiumOutletMap, floorId: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  const pushPolygon = (polygon: Polygon | undefined) => polygon?.forEach(ring => ring.forEach(point => coordinates.push(point)));
  pushPolygon(map.environment.siteBoundary);
  map.environment.landscapeAreas.forEach(pushPolygon);
  map.environment.roads.forEach(line => line.forEach(point => coordinates.push(point)));
  map.environment.walkways.forEach(line => line.forEach(point => coordinates.push(point)));
  map.environment.trees.forEach(point => coordinates.push(point));
  map.stores.filter(store => store.floorId === floorId).forEach(store => {
    pushPolygon(store.polygon);
    coordinates.push(store.center);
  });
  map.pois.filter(poi => poi.floorId === floorId).forEach(poi => coordinates.push(poi.coordinate));
  if (!coordinates.length) coordinates.push(map.center);
  return coordinates;
}

function createProjection(
  map: PremiumOutletMap,
  floorId: string,
  bearing: number,
  focusCoordinate?: Coordinate,
): Projection {
  const localPoints = floorMapCoordinates(map, floorId).map(coordinate => rotatePoint(coordinateToMeters(map.center, coordinate), bearing));
  let minEast = Math.min(...localPoints.map(point => point.east));
  let maxEast = Math.max(...localPoints.map(point => point.east));
  let minNorth = Math.min(...localPoints.map(point => point.north));
  let maxNorth = Math.max(...localPoints.map(point => point.north));

  if (!Number.isFinite(minEast) || maxEast - minEast < 20) {
    minEast = -220;
    maxEast = 220;
  }
  if (!Number.isFinite(minNorth) || maxNorth - minNorth < 20) {
    minNorth = -220;
    maxNorth = 220;
  }

  const fullWidth = maxEast - minEast;
  const fullHeight = maxNorth - minNorth;
  const horizontalPadding = Math.max(12, fullWidth * 0.045);
  const verticalPadding = Math.max(12, fullHeight * 0.05);
  minEast -= horizontalPadding;
  maxEast += horizontalPadding;
  minNorth -= verticalPadding;
  maxNorth += verticalPadding;

  if (focusCoordinate) {
    const focus = rotatePoint(coordinateToMeters(map.center, focusCoordinate), bearing);
    const focusWidth = Math.max(62, (maxEast - minEast) * 0.38);
    const focusHeight = Math.max(62, (maxNorth - minNorth) * 0.38);
    minEast = focus.east - focusWidth / 2;
    maxEast = focus.east + focusWidth / 2;
    minNorth = focus.north - focusHeight / 2;
    maxNorth = focus.north + focusHeight / 2;
  }

  const width = Math.max(1, maxEast - minEast);
  const height = Math.max(1, maxNorth - minNorth);
  return {
    point(coordinate: Coordinate) {
      const local = rotatePoint(coordinateToMeters(map.center, coordinate), bearing);
      return {
        x: 3 + ((local.east - minEast) / width) * 94,
        y: 4 + ((maxNorth - local.north) / height) * 90,
      };
    },
  };
}

function polygonLayout(polygon: Polygon, projection: Projection): PolygonLayout | undefined {
  const ring = polygon[0] ?? [];
  const points = ring.map(projection.point);
  if (points.length < 4) return undefined;
  const minX = Math.min(...points.map(point => point.x));
  const maxX = Math.max(...points.map(point => point.x));
  const minY = Math.min(...points.map(point => point.y));
  const maxY = Math.max(...points.map(point => point.y));
  const width = Math.max(0.18, maxX - minX);
  const height = Math.max(0.18, maxY - minY);
  const clipPath = `polygon(${points.map(point => `${((point.x - minX) / width) * 100}% ${((point.y - minY) / height) * 100}%`).join(", ")})`;
  return {
    left: `${minX}%`,
    top: `${minY}%`,
    width: `${width}%`,
    height: `${height}%`,
    clipPath,
    minX,
    maxX,
    minY,
    maxY,
    area: width * height,
  };
}

function lineSegments(lines: Coordinate[][], projection: Projection) {
  return lines.flatMap((line, lineIndex) => line.slice(1).map((coordinate, pointIndex) => {
    const start = projection.point(line[pointIndex]);
    const end = projection.point(coordinate);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    return {
      key: `${lineIndex}:${pointIndex}`,
      style: {
        left: `${(start.x + end.x) / 2 - length / 2}%`,
        top: `${(start.y + end.y) / 2}%`,
        width: `${length}%`,
        transform: [{ rotateZ: `${angle}deg` }],
      },
    };
  }));
}

function projectedCenterStyle(coordinate: Coordinate, projection: Projection) {
  const point = projection.point(coordinate);
  return { left: `${point.x}%`, top: `${point.y}%` } as const;
}

function visibleStoreLabelIds(
  stores: PremiumMapStore[],
  projection: Projection,
  campaigns: PremiumMapCampaign[],
  selectedStoreId: string | undefined,
  detailMode: MapDetailMode,
): Set<string> {
  const occupied = new Set<string>();
  const visible = new Set<string>();
  const candidates = stores.map(store => {
    const center = projection.point(store.center);
    const layout = store.polygon ? polygonLayout(store.polygon, projection) : undefined;
    const campaign = campaignForStore(store, campaigns);
    const important = store.id === selectedStoreId || Boolean(campaign);
    const score = important ? 10_000 : (layout?.area ?? 0.28);
    return { store, center, area: layout?.area ?? 0.28, important, score };
  }).sort((a, b) => b.score - a.score);

  const maxLabels = detailMode === "premium" ? 36 : 18;
  for (const candidate of candidates) {
    if (!candidate.important && candidate.area < (detailMode === "premium" ? 0.34 : 0.62)) continue;
    const cellX = Math.floor(candidate.center.x / 7.5);
    const cellY = Math.floor(candidate.center.y / 5.5);
    const cell = `${cellX}:${cellY}`;
    if (!candidate.important && occupied.has(cell)) continue;
    visible.add(candidate.store.id);
    occupied.add(cell);
    if (visible.size >= maxLabels && !candidate.important) break;
  }
  return visible;
}

export function PremiumOutletMapCanvas({
  map,
  floorId,
  language,
  detailMode,
  campaigns,
  selectedStoreId,
  focusCoordinate,
  focusSequence,
  bearing,
  onSelectStore,
}: Props) {
  const stores = useMemo(
    () => map.stores.filter(store => store.floorId === floorId),
    [floorId, map.stores],
  );
  const projection = useMemo(
    () => createProjection(map, floorId, bearing, focusCoordinate),
    [bearing, floorId, focusCoordinate?.[0], focusCoordinate?.[1], focusSequence, map],
  );
  const roadSegments = useMemo(() => lineSegments(map.environment.roads, projection), [map.environment.roads, projection]);
  const walkwaySegments = useMemo(() => lineSegments(map.environment.walkways, projection), [map.environment.walkways, projection]);
  const siteBoundaryLayout = useMemo(
    () => map.environment.siteBoundary ? polygonLayout(map.environment.siteBoundary, projection) : undefined,
    [map.environment.siteBoundary, projection],
  );
  const visibleLabels = useMemo(
    () => visibleStoreLabelIds(stores, projection, campaigns, selectedStoreId, detailMode),
    [campaigns, detailMode, projection, selectedStoreId, stores],
  );

  return (
    <View style={styles.canvas} accessibilityLabel={`${map.outletName} exact premium outlet map`}>
      <View pointerEvents="none" style={styles.campusPlate} />
      <View pointerEvents="none" style={styles.groundHalo} />
      {GRID_POSITIONS.map(position => (
        <View key={`grid-v-${position}`} pointerEvents="none" style={[styles.gridLineVertical, { left: `${position}%` }]} />
      ))}
      {GRID_POSITIONS.map(position => (
        <View key={`grid-h-${position}`} pointerEvents="none" style={[styles.gridLineHorizontal, { top: `${position}%` }]} />
      ))}

      {siteBoundaryLayout ? (
        <>
          <View pointerEvents="none" style={[styles.siteBoundaryShadow, siteBoundaryLayout as never]} />
          <View pointerEvents="none" style={[styles.siteBoundaryFill, siteBoundaryLayout as never]} />
        </>
      ) : null}

      {map.environment.landscapeAreas.map((polygon, index) => {
        const layout = polygonLayout(polygon, projection);
        return layout ? (
          <View key={`landscape-${index}`} pointerEvents="none" style={[styles.landscape, layout as never]}>
            <View style={styles.landscapeInset} />
          </View>
        ) : null;
      })}

      {roadSegments.map(segment => <View key={`road-casing-${segment.key}`} pointerEvents="none" style={[styles.roadCasing, segment.style as never]} />)}
      {roadSegments.map(segment => <View key={`road-${segment.key}`} pointerEvents="none" style={[styles.road, segment.style as never]} />)}
      {walkwaySegments.map(segment => <View key={`walkway-casing-${segment.key}`} pointerEvents="none" style={[styles.walkwayCasing, segment.style as never]} />)}
      {walkwaySegments.map(segment => <View key={`walkway-${segment.key}`} pointerEvents="none" style={[styles.walkway, segment.style as never]} />)}

      {map.environment.trees.map((coordinate, index) => (
        <View key={`tree-${index}`} pointerEvents="none" style={[styles.treeShadow, projectedCenterStyle(coordinate, projection)]}>
          <View style={styles.tree} />
        </View>
      ))}

      {stores.map(store => {
        const campaign = campaignForStore(store, campaigns);
        const selected = store.id === selectedStoreId;
        const showLabel = visibleLabels.has(store.id);

        if (store.geometryKind === "point") {
          return (
            <View key={store.id} style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <View pointerEvents="none" style={[styles.pointHalo, projectedCenterStyle(store.center, projection), campaign && styles.campaignPointHalo, selected && styles.selectedPointHalo]} />
              <Pressable
                onPress={() => onSelectStore(store)}
                accessibilityRole="button"
                accessibilityLabel={store.brandName}
                style={[
                  styles.storePoint,
                  projectedCenterStyle(store.center, projection),
                  campaign && styles.campaignPoint,
                  selected && styles.selectedPoint,
                ]}
              />
              {showLabel ? (
                <View pointerEvents="none" style={[styles.storeLabel, styles.pointStoreLabel, projectedCenterStyle(store.center, projection), selected && styles.selectedLabel]}>
                  <Text numberOfLines={2} style={[styles.storeText, selected && styles.selectedStoreText]}>{store.brandName}</Text>
                </View>
              ) : null}
            </View>
          );
        }

        const layout = store.polygon ? polygonLayout(store.polygon, projection) : undefined;
        if (!layout) return null;
        return (
          <View key={store.id} style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {detailMode === "premium" ? (
              <>
                <View pointerEvents="none" style={[styles.storeShadow, layout as never, { transform: [{ translateX: selected ? 7 : 5 }, { translateY: selected ? 11 : 8 }] }, selected && styles.selectedShadow]} />
                <View pointerEvents="none" style={[styles.storeFacade, layout as never, { transform: [{ translateY: selected ? 6 : 4 }] }, campaign && styles.campaignFacade, selected && styles.selectedFacade]} />
              </>
            ) : null}
            <Pressable
              onPress={() => onSelectStore(store)}
              accessibilityRole="button"
              accessibilityLabel={store.brandName}
              style={[
                styles.storeFootprint,
                layout as never,
                campaign && styles.campaign,
                selected && styles.selected,
              ]}
            >
              {detailMode === "premium" ? <View pointerEvents="none" style={styles.roofSheen} /> : null}
            </Pressable>
            {showLabel ? (
              <View pointerEvents="none" style={[styles.storeLabel, projectedCenterStyle(store.center, projection), selected && styles.selectedLabel]}>
                <Text numberOfLines={2} style={[styles.storeText, selected && styles.selectedStoreText]}>{store.brandName}</Text>
              </View>
            ) : null}
          </View>
        );
      })}

      {map.pois.filter(poi => poi.floorId === floorId).map(poi => (
        <View key={poi.id} pointerEvents="none" style={[styles.poiMarker, projectedCenterStyle(poi.coordinate, projection)]}>
          <View style={styles.poiDot} />
          <Text numberOfLines={1} style={styles.poiText}>{poiLabels[poi.kind][language]}</Text>
        </View>
      ))}

      {focusCoordinate ? (
        <View pointerEvents="none" style={styles.focusHint}>
          <View style={styles.focusHintInner} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: "100%",
    minHeight: 460,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#DDE3E6",
  },
  campusPlate: {
    position: "absolute",
    left: "1.5%",
    right: "1.5%",
    top: "2%",
    bottom: "2%",
    borderRadius: 30,
    backgroundColor: "#F4F1E9",
    borderWidth: 1,
    borderColor: "#D7D0C2",
  },
  groundHalo: {
    position: "absolute",
    left: "4%",
    right: "4%",
    top: "6%",
    bottom: "5%",
    borderRadius: 34,
    borderWidth: 12,
    borderColor: "rgba(34,49,61,0.035)",
  },
  gridLineVertical: {
    position: "absolute",
    top: "4%",
    bottom: "4%",
    width: 1,
    backgroundColor: "rgba(89,99,105,0.045)",
  },
  gridLineHorizontal: {
    position: "absolute",
    left: "3%",
    right: "3%",
    height: 1,
    backgroundColor: "rgba(89,99,105,0.045)",
  },
  siteBoundaryShadow: {
    position: "absolute",
    backgroundColor: "rgba(38,49,57,0.18)",
    transform: [{ translateX: 5 }, { translateY: 8 }],
  },
  siteBoundaryFill: {
    position: "absolute",
    backgroundColor: "#EDE8DB",
    borderWidth: 1,
    borderColor: "#C9C1AF",
  },
  landscape: {
    position: "absolute",
    backgroundColor: "#BFD2B6",
    borderWidth: 1,
    borderColor: "#9DB995",
    overflow: "hidden",
  },
  landscapeInset: {
    flex: 1,
    margin: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  roadCasing: {
    position: "absolute",
    height: 13,
    marginTop: -6.5,
    borderRadius: 7,
    backgroundColor: "#767F86",
  },
  road: {
    position: "absolute",
    height: 9,
    marginTop: -4.5,
    borderRadius: 5,
    backgroundColor: "#B7BEC3",
  },
  walkwayCasing: {
    position: "absolute",
    height: 7,
    marginTop: -3.5,
    borderRadius: 4,
    backgroundColor: "#D2CABD",
  },
  walkway: {
    position: "absolute",
    height: 4,
    marginTop: -2,
    borderRadius: 2,
    backgroundColor: "#FFFDF8",
  },
  treeShadow: {
    position: "absolute",
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -4,
    borderRadius: 6,
    backgroundColor: "rgba(40,61,44,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  tree: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#4F7C50",
    borderWidth: 1,
    borderColor: "#DCE8D8",
  },
  storeShadow: {
    position: "absolute",
    backgroundColor: "rgba(45,55,64,0.3)",
  },
  selectedShadow: {
    backgroundColor: "rgba(107,82,0,0.36)",
  },
  storeFacade: {
    position: "absolute",
    backgroundColor: "#87919A",
    borderWidth: 1,
    borderColor: "#707A83",
  },
  campaignFacade: {
    backgroundColor: "#B38B18",
    borderColor: "#8C6910",
  },
  selectedFacade: {
    backgroundColor: "#B78909",
    borderColor: "#6F5605",
  },
  storeFootprint: {
    position: "absolute",
    minWidth: 3,
    minHeight: 3,
    overflow: "hidden",
    backgroundColor: "#FBFAF6",
    borderWidth: 1,
    borderColor: "#7D8892",
  },
  roofSheen: {
    position: "absolute",
    left: 1,
    right: 1,
    top: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  pointHalo: {
    position: "absolute",
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    borderRadius: 10,
    backgroundColor: "rgba(82,97,112,0.13)",
    zIndex: 5,
  },
  campaignPointHalo: {
    backgroundColor: "rgba(212,175,37,0.2)",
  },
  selectedPointHalo: {
    width: 26,
    height: 26,
    marginLeft: -13,
    marginTop: -13,
    borderRadius: 13,
    backgroundColor: "rgba(246,201,69,0.27)",
  },
  storePoint: {
    position: "absolute",
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    backgroundColor: "#FBFAF6",
    borderWidth: 2,
    borderColor: "#526170",
    zIndex: 6,
  },
  campaign: {
    backgroundColor: "#F8E8A3",
    borderColor: "#B78C11",
  },
  campaignPoint: {
    backgroundColor: "#D4AF25",
    borderColor: "#765800",
  },
  selected: {
    backgroundColor: "#F6C945",
    borderColor: "#0B1F3A",
    borderWidth: 2,
    zIndex: 5,
  },
  selectedPoint: {
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: 9,
    backgroundColor: "#F6C945",
    borderColor: "#0B1F3A",
    borderWidth: 3,
    zIndex: 7,
  },
  storeLabel: {
    position: "absolute",
    maxWidth: 126,
    marginLeft: -63,
    marginTop: -13,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(132,143,154,0.55)",
    zIndex: 8,
  },
  pointStoreLabel: {
    marginTop: 8,
    borderStyle: "dashed",
  },
  selectedLabel: {
    backgroundColor: "#F6C945",
    borderColor: "#0B1F3A",
    borderWidth: 2,
    zIndex: 12,
  },
  storeText: {
    color: "#13283F",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  selectedStoreText: {
    color: "#071629",
    fontWeight: "900",
  },
  poiMarker: {
    position: "absolute",
    minHeight: 20,
    marginLeft: -8,
    marginTop: -10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(15,34,54,0.94)",
    borderWidth: 1,
    borderColor: "#D5B53C",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  poiDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#F2C94C",
  },
  poiText: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "800",
  },
  focusHint: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "rgba(11,31,58,0.34)",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  focusHintInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(246,201,69,0.78)",
    borderWidth: 2,
    borderColor: "rgba(11,31,58,0.7)",
  },
});
