import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

export function PremiumOutletMapCanvas({ map, floorId, language, detailMode, campaigns, selectedStoreId, onSelectStore }: Props) {
  const stores = useMemo(() => map.stores.filter(store => store.floorId === floorId), [floorId, map.stores]);
  const visible = detailMode === "premium" ? stores.slice(0, 60) : stores.filter((store, index) => index % 4 === 0 || store.id === selectedStoreId || campaignForStore(store, campaigns)).slice(0, 42);
  return (
    <View style={styles.canvas} accessibilityLabel={`${map.outletName} 3D Outlet Map`}>
      <View style={styles.grid}>
        {visible.map(store => {
          const campaign = campaignForStore(store, campaigns);
          return (
            <Pressable key={store.id} onPress={() => onSelectStore(store)} style={[styles.store, campaign && styles.campaign, store.id === selectedStoreId && styles.selected]}>
              <Text numberOfLines={2} style={styles.storeText}>{store.brandName}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.poiRow}>
        {map.pois.slice(0, 8).map(poi => <Text key={poi.id} style={styles.poi}>{poiLabels[poi.kind][language]}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: "#EEF1F4", padding: 12, overflow: "hidden" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6, transform: [{ perspective: 700 }, { rotateX: "12deg" }] },
  store: { width: "15.5%", minWidth: 76, minHeight: 42, padding: 5, borderRadius: 5, borderWidth: 1, borderColor: "#AAB2BC", backgroundColor: "#FFFFFF", justifyContent: "center" },
  campaign: { backgroundColor: "#FFF0A4", borderColor: "#C9A31B" },
  selected: { backgroundColor: "#F6C945", borderColor: "#0B1F3A", borderWidth: 2 },
  storeText: { color: "#0B1F3A", fontSize: 9, lineHeight: 11, fontWeight: "800", textAlign: "center" },
  poiRow: { position: "absolute", left: 10, right: 10, bottom: 8, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  poi: { color: "#FFFFFF", backgroundColor: "#0B1F3A", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, fontSize: 8, overflow: "hidden" },
});
