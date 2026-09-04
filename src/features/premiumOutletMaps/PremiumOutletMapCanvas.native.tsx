import { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  ViewAnnotation,
  type CameraRef,
  type PressEventWithFeatures,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";

import type { TranslationLanguage } from "../../translations/locale";
import { poiLabels } from "./copy";
import { campaignForStore } from "./search";
import type { Coordinate, MapDetailMode, PremiumMapCampaign, PremiumMapStore, PremiumOutletMap } from "./types";

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

const localStyle: StyleSpecification = {
  version: 8,
  name: "My Outlet Guide premium offline canvas",
  sources: {},
  light: { anchor: "viewport", color: "#FFF3CC", intensity: 0.72, position: [1.35, 210, 38] },
  layers: [{ id: "background", type: "background", paint: { "background-color": "#E6E9E8" } }],
};

function featureCollection(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features };
}

export function PremiumOutletMapCanvas({
  map, floorId, language, detailMode, campaigns, selectedStoreId, focusCoordinate,
  focusSequence, bearing, onSelectStore,
}: Props) {
  const camera = useRef<CameraRef>(null);
  const [zoomLevel, setZoomLevel] = useState(map.defaultZoom);
  const floorStores = useMemo(() => map.stores.filter(store => store.floorId === floorId), [floorId, map.stores]);
  const areaStores = useMemo(() => floorStores.filter(store => store.geometryKind === "area" && Boolean(store.polygon)), [floorStores]);
  const pointStores = useMemo(() => floorStores.filter(store => store.geometryKind === "point"), [floorStores]);
  const floorPois = useMemo(() => map.pois.filter(poi => poi.floorId === floorId), [floorId, map.pois]);
  const premiumPitch = Math.min(58, Math.max(50, map.defaultPitch));

  const storeData = useMemo(() => featureCollection(areaStores.map(store => {
    const campaign = campaignForStore(store, campaigns);
    const selected = store.id === selectedStoreId;
    return {
      type: "Feature",
      id: store.id,
      geometry: { type: "Polygon", coordinates: store.polygon as GeoJSON.Position[][] },
      properties: {
        storeId: store.id,
        color: selected ? "#F6C945" : campaign ? "#F5E39A" : "#FAF8F1",
        height: detailMode === "premium" ? (selected ? 22 : campaign ? 17 : 12) : 1,
        outline: selected ? "#0B1F3A" : campaign ? "#A67D0A" : "#717D87",
      },
    } as GeoJSON.Feature;
  })), [areaStores, campaigns, detailMode, selectedStoreId]);

  const pointStoreData = useMemo(() => featureCollection(pointStores.map(store => {
    const campaign = campaignForStore(store, campaigns);
    const selected = store.id === selectedStoreId;
    return {
      type: "Feature",
      id: store.id,
      geometry: { type: "Point", coordinates: store.center },
      properties: {
        storeId: store.id,
        color: selected ? "#F6C945" : campaign ? "#D4AF25" : "#FAF8F1",
        halo: selected ? "#F7D76A" : campaign ? "#E4CB69" : "#AEB8C1",
        radius: selected ? 9 : campaign ? 8 : detailMode === "premium" ? 6 : 5,
        stroke: selected ? "#0B1F3A" : campaign ? "#765800" : "#526170",
        strokeWidth: selected ? 3 : 2,
      },
    } as GeoJSON.Feature;
  })), [campaigns, detailMode, pointStores, selectedStoreId]);

  const selectedData = useMemo(() => featureCollection(
    areaStores.filter(store => store.id === selectedStoreId && store.polygon).map(store => ({
      type: "Feature", geometry: { type: "Polygon", coordinates: store.polygon as GeoJSON.Position[][] }, properties: {},
    } as GeoJSON.Feature)),
  ), [areaStores, selectedStoreId]);

  const environment = map.environment;
  const siteData = useMemo(() => featureCollection(
    environment.siteBoundary
      ? [{
          type: "Feature",
          geometry: { type: "Polygon", coordinates: environment.siteBoundary },
          properties: {},
        } as GeoJSON.Feature]
      : [],
  ), [environment.siteBoundary]);
  const roadData = useMemo(() => featureCollection(environment.roads.map(coordinates => ({ type: "Feature", geometry: { type: "LineString", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.roads]);
  const walkwayData = useMemo(() => featureCollection(environment.walkways.map(coordinates => ({ type: "Feature", geometry: { type: "LineString", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.walkways]);
  const landscapeData = useMemo(() => featureCollection(environment.landscapeAreas.map(coordinates => ({ type: "Feature", geometry: { type: "Polygon", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.landscapeAreas]);
  const treeData = useMemo(() => featureCollection(environment.trees.map(coordinates => ({ type: "Feature", geometry: { type: "Point", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.trees]);
  const poiData = useMemo(() => featureCollection(floorPois.map(poi => ({ type: "Feature", geometry: { type: "Point", coordinates: poi.coordinate }, properties: { kind: poi.kind } } as GeoJSON.Feature))), [floorPois]);

  const labelStores = useMemo(() => {
    const stride = zoomLevel >= 19.4 ? 1 : zoomLevel >= 18.8 ? 2 : zoomLevel >= 18.1 ? 4 : 8;
    return floorStores.filter((store, index) => {
      const important = store.id === selectedStoreId || Boolean(campaignForStore(store, campaigns));
      return important || (detailMode === "premium" && index % stride === 0);
    });
  }, [campaigns, detailMode, floorStores, selectedStoreId, zoomLevel]);

  const handleStorePress = (event: { nativeEvent: PressEventWithFeatures }) => {
    const storeId = event.nativeEvent.features?.[0]?.properties?.storeId;
    const store = floorStores.find(candidate => candidate.id === storeId);
    if (store) onSelectStore(store);
  };

  return (
    <Map
      mapStyle={localStyle}
      style={styles.map}
      attribution={false}
      logo={false}
      compass
      scaleBar={false}
      onRegionDidChange={event => setZoomLevel(event.nativeEvent.zoom)}
    >
      <Camera
        ref={camera}
        initialViewState={{ center: map.center, zoom: map.defaultZoom, pitch: detailMode === "premium" ? premiumPitch : 0, bearing: map.defaultBearing }}
        center={focusCoordinate ?? map.center}
        zoom={focusCoordinate ? 19.45 : map.defaultZoom}
        pitch={detailMode === "premium" ? premiumPitch : 0}
        bearing={bearing}
        duration={focusSequence > 0 ? 720 : 0}
        easing="fly"
      />
      <GeoJSONSource id="premium-site" data={siteData}>
        <Layer id="premium-site-shadow" type="fill" source="premium-site" paint={{ "fill-color": "#5E6870", "fill-opacity": 0.16, "fill-translate": [3, 5] }} />
        <Layer id="premium-site-fill" type="fill" source="premium-site" paint={{ "fill-color": "#EDE8DB", "fill-opacity": 0.96 }} />
        <Layer id="premium-site-outline" type="line" source="premium-site" paint={{ "line-color": "#BFB7A6", "line-width": 1.5, "line-opacity": 0.9 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-landscape" data={landscapeData}>
        <Layer id="premium-landscape-fill" type="fill" source="premium-landscape" paint={{ "fill-color": "#BFD2B6", "fill-opacity": 0.9 }} />
        <Layer id="premium-landscape-outline" type="line" source="premium-landscape" paint={{ "line-color": "#8FA787", "line-width": 1.2, "line-opacity": 0.8 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-roads" data={roadData}>
        <Layer id="premium-roads-casing" type="line" source="premium-roads" paint={{ "line-color": "#707980", "line-width": 13, "line-opacity": 0.95 }} />
        <Layer id="premium-roads-line" type="line" source="premium-roads" paint={{ "line-color": "#B6BDC2", "line-width": 9, "line-opacity": 1 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-walkways" data={walkwayData}>
        <Layer id="premium-walkways-casing" type="line" source="premium-walkways" paint={{ "line-color": "#C8C0B4", "line-width": 7, "line-opacity": 0.9 }} />
        <Layer id="premium-walkways-line" type="line" source="premium-walkways" paint={{ "line-color": "#FFFDF8", "line-width": 4.5, "line-opacity": 0.98 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-trees" data={treeData}>
        <Layer id="premium-trees-shadow" type="circle" source="premium-trees" paint={{ "circle-color": "#2D4831", "circle-radius": detailMode === "premium" ? 7 : 4, "circle-opacity": 0.18, "circle-translate": [2, 3] }} />
        <Layer id="premium-trees-circle" type="circle" source="premium-trees" paint={{ "circle-color": "#4F7C50", "circle-radius": detailMode === "premium" ? 5 : 3, "circle-stroke-color": "#E6EFE1", "circle-stroke-width": 1.2 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-stores" data={storeData} onPress={handleStorePress} hitbox={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Layer id="premium-store-ground-shadow" type="fill" source="premium-stores" paint={{ "fill-color": "#42505B", "fill-opacity": detailMode === "premium" ? 0.22 : 0.08, "fill-translate": [4, 6] }} />
        {detailMode === "premium" ? (
          <Layer id="premium-store-buildings" type="fill-extrusion" source="premium-stores" paint={{ "fill-extrusion-color": ["get", "color"], "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.98, "fill-extrusion-vertical-gradient": true }} />
        ) : (
          <Layer id="premium-store-shapes" type="fill" source="premium-stores" paint={{ "fill-color": ["get", "color"], "fill-outline-color": "#7C8791" }} />
        )}
        <Layer id="premium-store-outline" type="line" source="premium-stores" paint={{ "line-color": ["get", "outline"], "line-width": 1.35, "line-opacity": 0.9 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-store-points" data={pointStoreData} onPress={handleStorePress} hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}>
        <Layer id="premium-store-point-halo" type="circle" source="premium-store-points" paint={{ "circle-color": ["get", "halo"], "circle-radius": ["+", ["get", "radius"], 5], "circle-opacity": 0.23 }} />
        <Layer
          id="premium-store-point-markers"
          type="circle"
          source="premium-store-points"
          paint={{
            "circle-color": ["get", "color"],
            "circle-radius": ["get", "radius"],
            "circle-stroke-color": ["get", "stroke"],
            "circle-stroke-width": ["get", "strokeWidth"],
          }}
        />
      </GeoJSONSource>
      <GeoJSONSource id="premium-selected" data={selectedData}>
        <Layer id="premium-selected-glow" type="line" source="premium-selected" paint={{ "line-color": "#F7CF4D", "line-width": 7, "line-blur": 3, "line-opacity": 0.88 }} />
        <Layer id="premium-selected-outline" type="line" source="premium-selected" paint={{ "line-color": "#0B1F3A", "line-width": 2.5, "line-opacity": 0.95 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-pois" data={poiData}>
        <Layer id="premium-poi-halo" type="circle" source="premium-pois" paint={{ "circle-color": "#F0C84B", "circle-radius": 9, "circle-opacity": 0.18 }} />
        <Layer id="premium-poi-points" type="circle" source="premium-pois" paint={{ "circle-color": "#102B45", "circle-radius": 6, "circle-stroke-color": "#E1BD3D", "circle-stroke-width": 2 }} />
      </GeoJSONSource>
      {labelStores.map(store => {
        const campaign = campaignForStore(store, campaigns);
        const selected = store.id === selectedStoreId;
        return (
          <ViewAnnotation key={store.id} id={`label-${store.id}`} lngLat={store.center} anchor="bottom" onPress={() => onSelectStore(store)}>
            <View collapsable={false} style={[styles.storeLabel, store.geometryKind === "point" && styles.pointStoreLabel, campaign && styles.campaignLabel, selected && styles.selectedLabel]}>
              <Text numberOfLines={1} style={[styles.storeLabelText, selected && styles.selectedLabelText]}>{store.brandName}</Text>
            </View>
          </ViewAnnotation>
        );
      })}
      {zoomLevel >= 18.3 ? floorPois.map(poi => (
        <ViewAnnotation key={poi.id} id={`poi-${map.outletId}-${poi.id}`} lngLat={poi.coordinate} anchor="top">
          <View collapsable={false} style={styles.poiLabel}>
            <View style={styles.poiLabelDot} />
            <Text numberOfLines={1} style={styles.poiLabelText}>{poiLabels[poi.kind][language]}</Text>
          </View>
        </ViewAnnotation>
      )) : null}
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  storeLabel: { maxWidth: 138, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.96)", borderWidth: 1, borderColor: "#BBC3CB" },
  pointStoreLabel: { borderStyle: "dashed" },
  campaignLabel: { backgroundColor: "#FFF1B2", borderColor: "#C9A11B" },
  selectedLabel: { backgroundColor: "#F6C945", borderColor: "#0B1F3A", borderWidth: 2 },
  storeLabelText: { color: "#13283F", fontSize: 10, lineHeight: 12, fontWeight: "800" },
  selectedLabelText: { color: "#071629", fontWeight: "900" },
  poiLabel: { marginTop: 8, maxWidth: 126, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(16,43,69,0.94)", borderWidth: 1, borderColor: "#D6B83D", flexDirection: "row", alignItems: "center", gap: 4 },
  poiLabelDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F2C94C" },
  poiLabelText: { color: "#FFFFFF", fontSize: 9, lineHeight: 11, fontWeight: "800" },
});
