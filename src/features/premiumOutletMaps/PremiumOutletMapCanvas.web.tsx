import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TranslationLanguage } from "../../translations/locale";
import { poiLabels } from "./copy";
import { campaignForStore } from "./search";
import type {
  Coordinate,
  MapDetailMode,
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

function normalizedStorePosition(map: PremiumOutletMap, store: PremiumMapStore) {
  const [centerLongitude, centerLatitude] = map.center;
  const [longitude, latitude] = store.center;
  const latitudeRadians = centerLatitude * Math.PI / 180;
  const eastMeters = (longitude - centerLongitude) * 111_320 * Math.max(0.2, Math.cos(latitudeRadians));
  const northMeters = (latitude - centerLatitude) * 110_540;
  const left = Math.max(3, Math.min(91, 50 + (eastMeters / 460) * 100));
  const top = Math.max(4, Math.min(88, 50 - (northMeters / 470) * 100));
  return { left: `${left}%`, top: `${top}%` } as const;
}

export function PremiumOutletMapCanvas({
  map,
  floorId,
  language,
  detailMode,
  campaigns,
  selectedStoreId,
  onSelectStore,
}: Props) {
  const stores = useMemo(
    () => map.stores.filter(store => store.floorId === floorId),
    [floorId, map.stores],
  );
  const visible = detailMode === "premium"
    ? stores.slice(0, 90)
    : stores.filter((store, index) =>
        index % 4 === 0 || store.id === selectedStoreId || Boolean(campaignForStore(store, campaigns)),
      ).slice(0, 48);

  return (
    <View style={styles.canvas} accessibilityLabel={`${map.outletName} 3D Outlet Map web preview`}>
      <View pointerEvents="none" style={styles.roadHorizontal} />
      <View pointerEvents="none" style={styles.roadVertical} />
      <View pointerEvents="none" style={styles.walkwayHorizontal} />
      <View pointerEvents="none" style={styles.walkwayVertical} />

      {visible.map(store => {
        const campaign = campaignForStore(store, campaigns);
        return (
          <Pressable
            key={store.id}
            onPress={() => onSelectStore(store)}
            style={[
              styles.store,
              normalizedStorePosition(map, store),
              campaign && styles.campaign,
              store.id === selectedStoreId && styles.selected,
            ]}
          >
            <Text numberOfLines={2} style={styles.storeText}>{store.brandName}</Text>
          </Pressable>
        );
      })}

      <View style={styles.poiRow}>
        {map.pois.slice(0, 8).map(poi => (
          <Text key={poi.id} style={styles.poi}>{poiLabels[poi.kind][language]}</Text>
        ))}
      </View>
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
  roadHorizontal: {
    position: "absolute",
    left: "2%",
    right: "2%",
    top: "78%",
    height: 18,
    borderRadius: 9,
    backgroundColor: "#CCD3DA",
  },
  roadVertical: {
    position: "absolute",
    top: "8%",
    bottom: "12%",
    left: "8%",
    width: 16,
    borderRadius: 8,
    backgroundColor: "#CCD3DA",
  },
  walkwayHorizontal: {
    position: "absolute",
    left: "10%",
    right: "7%",
    top: "48%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDE3E8",
  },
  walkwayVertical: {
    position: "absolute",
    top: "8%",
    bottom: "18%",
    left: "49%",
    width: 8,
    borderRadius: 4,
    backgroundColor: "#DDE3E8",
  },
  store: {
    position: "absolute",
    width: 82,
    minHeight: 42,
    marginLeft: -41,
    marginTop: -21,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#AAB2BC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  campaign: {
    backgroundColor: "#FFF0A4",
    borderColor: "#C9A31B",
  },
  selected: {
    backgroundColor: "#F6C945",
    borderColor: "#0B1F3A",
    borderWidth: 2,
    zIndex: 5,
  },
  storeText: {
    color: "#0B1F3A",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  poiRow: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    zIndex: 10,
  },
  poi: {
    color: "#FFFFFF",
    backgroundColor: "#0B1F3A",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    fontSize: 8,
    overflow: "hidden",
  },
});
