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

type Projection = {
  point: (coordinate: Coordinate) => PlanPoint;
};

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

function allMapCoordinates(map: PremiumOutletMap): Coordinate[] {
  const coordinates: Coordinate[] = [map.center];
  const pushPolygon = (polygon: Polygon | undefined) => polygon?.forEach(ring => ring.forEach(point => coordinates.push(point)));
  pushPolygon(map.environment.siteBoundary);
  map.environment.landscapeAreas.forEach(pushPolygon);
  map.environment.roads.forEach(line => line.forEach(point => coordinates.push(point)));
  map.environment.walkways.forEach(line => line.forEach(point => coordinates.push(point)));
  map.environment.trees.forEach(point => coordinates.push(point));
  map.stores.forEach(store => {
    pushPolygon(store.polygon);
    coordinates.push(store.center);
  });
  map.pois.forEach(poi => coordinates.push(poi.coordinate));
  return coordinates;
}

function createProjection(
  map: PremiumOutletMap,
  bearing: number,
  focusCoordinate?: Coordinate,
): Projection {
  const localPoints = allMapCoordinates(map).map(coordinate => rotatePoint(coordinateToMeters(map.center, coordinate), bearing));
  let minEast = Math.min(...localPoints.map(point => point.east));
  let maxEast = Math.max(...localPoints.map(point => point.east));
  let minNorth = Math.min(...localPoints.map(point => point.north));
  let maxNorth = Math.max(...localPoints.map(point => point.north));

  if (!Number.isFinite(minEast) || maxEast - minEast < 20) {
    minEast = -240;
    maxEast = 240;
  }
  if (!Number.isFinite(minNorth) || maxNorth - minNorth < 20) {
    minNorth = -240;
    maxNorth = 240;
  }

  const fullWidth = maxEast - minEast;
  const fullHeight = maxNorth - minNorth;
  const horizontalPadding = Math.max(18, fullWidth * 0.08);
  const verticalPadding = Math.max(18, fullHeight * 0.08);
  minEast -= horizontalPadding;
  maxEast += horizontalPadding;
  minNorth -= verticalPadding;
  maxNorth += verticalPadding;

  if (focusCoordinate) {
    const focus = rotatePoint(coordinateToMeters(map.center, focusCoordinate), bearing);
    const focusWidth = Math.max(70, (maxEast - minEast) * 0.46);
    const focusHeight = Math.max(70, (maxNorth - minNorth) * 0.46);
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
        x: ((local.east - minEast) / width) * 100,
        y: ((maxNorth - local.north) / height) * 100,
      };
    },
  };
}

function polygonLayout(polygon: Polygon, projection: Projection) {
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
  } as const;
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
    () => createProjection(map, bearing, focusCoordinate),
    [bearing, focusCoordinate?.[0], focusCoordinate?.[1], focusSequence, map],
  );
  const roadSegments = useMemo(() => lineSegments(map.environment.roads, projection), [map.environment.roads, projection]);
  const walkwaySegments = useMemo(() => lineSegments(map.environment.walkways, projection), [map.environment.walkways, projection]);
  const labelStride = detailMode === "premium" ? 1 : Math.max(1, Math.ceil(stores.length / 36));

  return (
    <View style={styles.canvas} accessibilityLabel={`${map.outletName} exact premium outlet map`}>
      {map.environment.landscapeAreas.map((polygon, index) => {
        const layout = polygonLayout(polygon, projection);
        return layout ? <View key={`landscape-${index}`} pointerEvents="none" style={[styles.landscape, layout as never]} /> : null;
      })}

      {roadSegments.map(segment => <View key={`road-${segment.key}`} pointerEvents="none" style={[styles.road, segment.style as never]} />)}
      {walkwaySegments.map(segment => <View key={`walkway-${segment.key}`} pointerEvents="none" style={[styles.walkway, segment.style as never]} />)}

      {map.environment.trees.map((coordinate, index) => (
        <View key={`tree-${index}`} pointerEvents="none" style={[styles.tree, projectedCenterStyle(coordinate, projection)]} />
      ))}

      {stores.map((store, index) => {
        const campaign = campaignForStore(store, campaigns);
        const selected = store.id === selectedStoreId;
        const showLabel = selected || Boolean(campaign) || index % labelStride === 0;

        if (store.geometryKind === "point") {
          return (
            <View key={store.id} style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
                  <Text numberOfLines={2} style={styles.storeText}>{store.brandName}</Text>
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
              <View pointerEvents="none" style={[styles.storeDepth, layout as never, { transform: [{ translateY: selected ? 8 : 5 }] }]} />
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
            />
            {showLabel ? (
              <View pointerEvents="none" style={[styles.storeLabel, projectedCenterStyle(store.center, projection), selected && styles.selectedLabel]}>
                <Text numberOfLines={2} style={styles.storeText}>{store.brandName}</Text>
              </View>
            ) : null}
          </View>
        );
      })}

      {map.pois.filter(poi => poi.floorId === floorId).map(poi => (
        <View key={poi.id} pointerEvents="none" style={[styles.poiMarker, projectedCenterStyle(poi.coordinate, projection)]}>
          <Text numberOfLines={1} style={styles.poiText}>{poiLabels[poi.kind][language]}</Text>
        </View>
      ))}

      {focusCoordinate ? (
        <View pointerEvents="none" style={styles.focusHint}>
          <Text style={styles.focusHintText}>◎</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: "100%",
    minHeight: 420,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#E9EEF2",
  },
  landscape: {
    position: "absolute",
    backgroundColor: "#BDD8B8",
    opacity: 0.8,
  },
  road: {
    position: "absolute",
    height: 9,
    marginTop: -4.5,
    borderRadius: 5,
    backgroundColor: "#A9B2BC",
  },
  walkway: {
    position: "absolute",
    height: 4,
    marginTop: -2,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  tree: {
    position: "absolute",
    width: 8,
    height: 8,
    marginLeft: -4,
    marginTop: -4,
    borderRadius: 4,
    backgroundColor: "#578858",
  },
  storeDepth: {
    position: "absolute",
    backgroundColor: "#7C8794",
    opacity: 0.54,
  },
  storeFootprint: {
    position: "absolute",
    minWidth: 3,
    minHeight: 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#929DAA",
  },
  storePoint: {
    position: "absolute",
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#526170",
    zIndex: 6,
  },
  campaign: {
    backgroundColor: "#FFF0A4",
    borderColor: "#C9A31B",
  },
  campaignPoint: {
    backgroundColor: "#D4AF25",
    borderColor: "#8A6800",
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
    maxWidth: 104,
    marginLeft: -52,
    marginTop: -11,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.92)",
    zIndex: 8,
  },
  pointStoreLabel: {
    marginTop: 7,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#7B8794",
  },
  selectedLabel: {
    backgroundColor: "#F6C945",
  },
  storeText: {
    color: "#0B1F3A",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  poiMarker: {
    position: "absolute",
    minWidth: 12,
    minHeight: 12,
    marginLeft: -6,
    marginTop: -6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 7,
    backgroundColor: "#0B1F3A",
    borderWidth: 1,
    borderColor: "#F6C945",
    zIndex: 9,
  },
  poiText: {
    color: "#FFFFFF",
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "800",
  },
  focusHint: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 26,
    height: 26,
    marginLeft: -13,
    marginTop: -13,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "rgba(11,31,58,0.25)",
  },
  focusHintText: {
    color: "rgba(11,31,58,0.45)",
    fontSize: 14,
  },
});
