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

import { poiLabels } from "./copy";
import { campaignForStore } from "./search";
import type { Coordinate, MapDetailMode, PremiumMapCampaign, PremiumMapStore, PremiumOutletMap } from "./types";
import type { TranslationLanguage } from "../../translations/locale";

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
  name: "My Outlet Guide offline canvas",
  sources: {},
  light: { anchor: "viewport", color: "#FFF7DA", intensity: 0.58, position: [1.15, 210, 36] },
  layers: [{ id: "background", type: "background", paint: { "background-color": "#F4F6F8" } }],
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

  const storeData = useMemo(() => featureCollection(areaStores.map(store => {
    const campaign = campaignForStore(store, campaigns);
    return {
      type: "Feature",
      id: store.id,
      geometry: { type: "Polygon", coordinates: store.polygon as GeoJSON.Position[][] },
      properties: {
        storeId: store.id,
        color: store.id === selectedStoreId ? "#F6C945" : campaign ? "#D4AF25" : "#FBFCFD",
        height: detailMode === "premium" ? (store.id === selectedStoreId ? 18 : campaign ? 14 : 10) : 1,
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
        color: selected ? "#F6C945" : campaign ? "#D4AF25" : "#FFFFFF",
        radius: selected ? 9 : campaign ? 8 : detailMode === "premium" ? 6 : 5,
        stroke: selected ? "#0B1F3A" : campaign ? "#8A6800" : "#526170",
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
  const siteData = useMemo(() => featureCollection([{
    type: "Feature", geometry: { type: "Polygon", coordinates: environment.siteBoundary }, properties: {},
  } as GeoJSON.Feature]), [environment.siteBoundary]);
  const roadData = useMemo(() => featureCollection(environment.roads.map(coordinates => ({ type: "Feature", geometry: { type: "LineString", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.roads]);
  const walkwayData = useMemo(() => featureCollection(environment.walkways.map(coordinates => ({ type: "Feature", geometry: { type: "LineString", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.walkways]);
  const landscapeData = useMemo(() => featureCollection(environment.landscapeAreas.map(coordinates => ({ type: "Feature", geometry: { type: "Polygon", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.landscapeAreas]);
  const treeData = useMemo(() => featureCollection(environment.trees.map(coordinates => ({ type: "Feature", geometry: { type: "Point", coordinates }, properties: {} } as GeoJSON.Feature))), [environment.trees]);
  const poiData = useMemo(() => featureCollection(floorPois.map(poi => ({ type: "Feature", geometry: { type: "Point", coordinates: poi.coordinate }, properties: { kind: poi.kind } } as GeoJSON.Feature))), [floorPois]);

  const labelStores = useMemo(() => {
    const stride = zoomLevel >= 19 ? 1 : zoomLevel >= 18 ? 2 : 5;
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
        initialViewState={{ center: map.center, zoom: map.defaultZoom, pitch: detailMode === "premium" ? map.defaultPitch : 0, bearing: map.defaultBearing }}
        center={focusCoordinate ?? map.center}
        zoom={focusCoordinate ? 19.2 : map.defaultZoom}
        pitch={detailMode === "premium" ? map.defaultPitch : 0}
        bearing={bearing}
        duration={focusSequence > 0 ? 760 : 0}
        easing="fly"
      />
      <GeoJSONSource id="premium-site" data={siteData}>
        <Layer id="premium-site-fill" type="fill" source="premium-site" paint={{ "fill-color": "#E7EBF0", "fill-outline-color": "#CBD2DA" }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-landscape" data={landscapeData}>
        <Layer id="premium-landscape-fill" type="fill" source="premium-landscape" paint={{ "fill-color": "#BFD8B7", "fill-opacity": 0.84 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-roads" data={roadData}>
        <Layer id="premium-roads-line" type="line" source="premium-roads" paint={{ "line-color": "#89939E", "line-width": 8 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-walkways" data={walkwayData}>
        <Layer id="premium-walkways-line" type="line" source="premium-walkways" paint={{ "line-color": "#FFFFFF", "line-width": 5, "line-opacity": 0.92 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-trees" data={treeData}>
        <Layer id="premium-trees-circle" type="circle" source="premium-trees" paint={{ "circle-color": "#4F8450", "circle-radius": detailMode === "premium" ? 5 : 3, "circle-stroke-color": "#E7F2E3", "circle-stroke-width": 1 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-stores" data={storeData} onPress={handleStorePress} hitbox={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        {detailMode === "premium" ? (
          <Layer id="premium-store-buildings" type="fill-extrusion" source="premium-stores" paint={{ "fill-extrusion-color": ["get", "color"], "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.96, "fill-extrusion-vertical-gradient": true }} />
        ) : (
          <Layer id="premium-store-shapes" type="fill" source="premium-stores" paint={{ "fill-color": ["get", "color"], "fill-outline-color": "#8C96A3" }} />
        )}
      </GeoJSONSource>
      <GeoJSONSource id="premium-store-points" data={pointStoreData} onPress={handleStorePress} hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}>
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
        <Layer id="premium-selected-glow" type="line" source="premium-selected" paint={{ "line-color": "#FFCC22", "line-width": 8, "line-blur": 4, "line-opacity": 0.92 }} />
      </GeoJSONSource>
      <GeoJSONSource id="premium-pois" data={poiData}>
        <Layer id="premium-poi-points" type="circle" source="premium-pois" paint={{ "circle-color": "#0B1F3A", "circle-radius": 6, "circle-stroke-color": "#F6C945", "circle-stroke-width": 2 }} />
      </GeoJSONSource>
      {labelStores.map(store => {
        const campaign = campaignForStore(store, campaigns);
        const selected = store.id === selectedStoreId;
        return (
          <ViewAnnotation key={store.id} id={`label-${store.id}`} lngLat={store.center} anchor="bottom" onPress={() => onSelectStore(store)}>
            <View collapsable={false} style={[styles.storeLabel, store.geometryKind === "point" && styles.pointStoreLabel, campaign && styles.campaignLabel, selected && styles.selectedLabel]}>
              <Text numberOfLines={1} style={styles.storeLabelText}>{store.brandName}</Text>
            </View>
          </ViewAnnotation>
        );
      })}
      {zoomLevel >= 18 ? floorPois.map(poi => (
        <ViewAnnotation key={poi.id} id={`poi-${map.outletId}-${poi.id}`} lngLat={poi.coordinate} anchor="top">
          <View collapsable={false} style={styles.poiLabel}>
            <Text numberOfLines={1} style={styles.poiLabelText}>{poiLabels[poi.kind][language]}</Text>
          </View>
        </ViewAnnotation>
      )) : null}
    </Map>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  storeLabel: { maxWidth: 128, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "#C8CED6" },
  pointStoreLabel: { borderStyle: "dashed" },
  campaignLabel: { backgroundColor: "#FFF3B5", borderColor: "#D4AF25" },
  selectedLabel: { backgroundColor: "#F6C945", borderColor: "#0B1F3A", borderWidth: 2 },
  storeLabelText: { color: "#0B1F3A", fontSize: 10, lineHeight: 12, fontWeight: "800" },
  poiLabel: { marginTop: 7, maxWidth: 118, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, backgroundColor: "rgba(11,31,58,0.92)" },
  poiLabelText: { color: "#FFFFFF", fontSize: 9, lineHeight: 11, fontWeight: "700" },
});
