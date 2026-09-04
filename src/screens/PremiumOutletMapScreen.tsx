import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categories } from "../constants/categories";
import { PremiumOutletMapCanvas } from "../features/premiumOutletMaps/PremiumOutletMapCanvas";
import { getPremiumMapCopy, poiLabels } from "../features/premiumOutletMaps/copy";
import {
  getPremiumMapOffline,
  removePremiumMapOffline,
  savePremiumMapOffline,
} from "../features/premiumOutletMaps/offlinePackService";
import { loadPremiumOutletMap } from "../features/premiumOutletMaps/runtimeLoader";
import {
  campaignForStore,
  resolveCampaignBrandIdForOutlet,
  searchMapStores,
} from "../features/premiumOutletMaps/search";
import type {
  MapDetailMode,
  PremiumMapCampaign,
  PremiumMapStore,
  PremiumOutletMap,
} from "../features/premiumOutletMaps/types";
import { useTranslation } from "../hooks/useTranslation";
import type { RootStackParamList } from "../navigation/types";
import { formatCampaignDate, subscribeActiveOutletCampaignsForOutlet } from "../services/outletCampaignService";
import { colors } from "../theme/colors";
import { openExternalUrl } from "../utils/externalUrl";
import { formatBrandCategoryLabel } from "../utils/brandCategoryLabelFormatter";
import { trackProductEvent } from "../utils/productAnalytics";

const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

export function PremiumOutletMapScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "PremiumOutletMap">>();
  const { language, t } = useTranslation();
  const insets = useSafeAreaInsets();
  const copy = getPremiumMapCopy(language);
  const [map, setMap] = useState<PremiumOutletMap | undefined>();
  const [mapLoading, setMapLoading] = useState(true);
  const [floorId, setFloorId] = useState("ground");
  const [query, setQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<PremiumMapStore | undefined>();
  const [detailMode, setDetailMode] = useState<MapDetailMode>("premium");
  const [bearing, setBearing] = useState(18);
  const [focusSequence, setFocusSequence] = useState(0);
  const [campaigns, setCampaigns] = useState<PremiumMapCampaign[]>([]);
  const [offline, setOffline] = useState(false);
  const [offlineBusy, setOfflineBusy] = useState(false);
  const [offlineError, setOfflineError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMap(undefined);
    setMapLoading(true);
    setQuery("");
    setSelectedStore(undefined);
    setCampaigns([]);
    setOffline(false);
    setOfflineError(false);

    void loadPremiumOutletMap(route.params.outletId)
      .then(loadedMap => {
        if (cancelled) return;
        setMap(loadedMap);
        if (loadedMap) {
          setFloorId(loadedMap.floors[0]?.id ?? "ground");
          setBearing(loadedMap.defaultBearing);
        }
      })
      .catch(() => {
        if (!cancelled) setMap(undefined);
      })
      .finally(() => {
        if (!cancelled) setMapLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [route.params.outletId]);

  useEffect(() => {
    if (!map) return;
    trackProductEvent("premium_map_open", { outlet_id: map.outletId, map_accuracy: map.spatialAccuracy });
    void getPremiumMapOffline(map.outletId).then(cached => setOffline(Boolean(cached))).catch(() => setOffline(false));
    return subscribeActiveOutletCampaignsForOutlet(map.outletId, all => {
      setCampaigns(all.flatMap(campaign => {
        const brandId = resolveCampaignBrandIdForOutlet(map.outletId, campaign.brandName);
        if (!brandId) return [];
        return [{
          campaignId: campaign.campaignId,
          outletId: map.outletId,
          brandId,
          brandName: campaign.brandName,
          endsOn: campaign.endsOn,
          discountLabel: campaign.discountLabel,
        }];
      }));
    }, () => setCampaigns([]), language);
  }, [language, map?.outletId]);

  const searchResults = useMemo(() => map ? searchMapStores(map.stores, query) : [], [map, query]);
  const selectedCampaign = selectedStore ? campaignForStore(selectedStore, campaigns) : undefined;

  function selectStore(store: PremiumMapStore) {
    setSelectedStore(store);
    setFloorId(store.floorId);
    setFocusSequence(sequence => sequence + 1);
    setQuery(store.brandName);
    trackProductEvent("premium_map_brand_select", { outlet_id: map?.outletId, brand_id: store.brandId, floor_id: store.floorId });
  }

  async function toggleOffline() {
    if (!map || offlineBusy) return;
    setOfflineBusy(true);
    setOfflineError(false);
    try {
      if (offline) await removePremiumMapOffline(map.outletId);
      else await savePremiumMapOffline(map);
      setOffline(current => !current);
      trackProductEvent("premium_map_offline_toggle", { outlet_id: map.outletId, enabled: !offline });
    } catch {
      setOfflineError(true);
    } finally {
      setOfflineBusy(false);
    }
  }

  if (mapLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!map) {
    return <View style={styles.center}><Text style={styles.emptyText}>{copy.mapUnavailable}</Text></View>;
  }

  const categoryName = selectedStore
    ? categories.find(category => category.categoryId === selectedStore.categoryId)?.categoryName ?? selectedStore.categoryId.replace(/-/g, " ")
    : "";
  const usesOpenStreetMap = map.source.dataLicense === "ODbL-1.0";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: Math.max(30, insets.bottom + 18) }]} keyboardShouldPersistTaps="handled">
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{map.outletName} · {copy.subtitle}</Text>
        </View>
        <View style={styles.modeRow}>
          <Text style={styles.modeText}>{detailMode === "premium" ? copy.premium : copy.simple}</Text>
          <Switch
            accessibilityLabel={copy.premium}
            value={detailMode === "premium"}
            onValueChange={enabled => {
              const next = enabled ? "premium" : "simple";
              setDetailMode(next);
              trackProductEvent("premium_map_detail_toggle", { outlet_id: map.outletId, mode: next });
            }}
            trackColor={{ false: "#AEB5BF", true: "#C6A11A" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.searchArea}>
        <TextInput
          value={query}
          onChangeText={value => { setQuery(value); if (!value.trim()) setSelectedStore(undefined); }}
          placeholder={copy.searchPlaceholder}
          placeholderTextColor="#707987"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
          accessibilityLabel={copy.searchPlaceholder}
        />
        {query.trim() && searchResults.length > 0 && searchResults[0]?.brandName !== selectedStore?.brandName ? (
          <View style={styles.results}>
            {searchResults.map(store => (
              <Pressable key={store.id} onPress={() => selectStore(store)} style={styles.resultButton}>
                <Text style={styles.resultText}>{store.brandName}</Text>
                <Text style={styles.resultFloor}>{map.floors.find(floor => floor.id === store.floorId)?.label[language]}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {query.trim().length >= 2 && searchResults.length === 0 ? (
          <View style={styles.noResult}><Text style={styles.noResultTitle}>{copy.noResult}</Text><Text style={styles.noResultText}>{copy.noResultHint}</Text></View>
        ) : null}
      </View>

      <View style={styles.mapShell}>
        <PremiumOutletMapCanvas
          map={map}
          floorId={floorId}
          language={language}
          detailMode={detailMode}
          campaigns={campaigns}
          selectedStoreId={selectedStore?.id}
          focusCoordinate={selectedStore?.center}
          focusSequence={focusSequence}
          bearing={bearing}
          onSelectStore={selectStore}
        />
        {usesOpenStreetMap ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="OpenStreetMap copyright and ODbL licence"
            onPress={() => void openExternalUrl(OSM_COPYRIGHT_URL)}
            style={styles.osmAttribution}
          >
            <Text style={styles.osmAttributionText}>© OpenStreetMap contributors · ODbL 1.0</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => setBearing(current => (current + 45) % 360)} accessibilityRole="button">
          <Text style={styles.controlText}>↻ {copy.rotate}</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={() => { setSelectedStore(undefined); setQuery(""); setBearing(map.defaultBearing); setFocusSequence(sequence => sequence + 1); }} accessibilityRole="button">
          <Text style={styles.controlText}>⌂ {copy.reset}</Text>
        </Pressable>
        <Pressable style={[styles.controlButton, offline && styles.controlButtonActive]} onPress={() => void toggleOffline()} accessibilityRole="button" disabled={offlineBusy}>
          {offlineBusy ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.controlText}>{offline ? `✓ ${copy.removeOffline}` : `↓ ${copy.saveOffline}`}</Text>}
        </Pressable>
      </View>
      {offline ? <Text style={styles.offlineReady}>✓ {copy.offlineReady}</Text> : null}
      {offlineError ? <Text accessibilityRole="alert" style={styles.offlineError}>{copy.offlineError}</Text> : null}

      <View style={styles.floorRow}>
        <Text style={styles.sectionLabel}>{copy.floor}</Text>
        {map.floors.map(floor => (
          <Pressable key={floor.id} onPress={() => setFloorId(floor.id)} style={[styles.floorButton, floor.id === floorId && styles.floorButtonActive]}>
            <Text style={[styles.floorText, floor.id === floorId && styles.floorTextActive]}>{floor.label[language]}</Text>
          </Pressable>
        ))}
      </View>

      {selectedStore ? (
        <View style={[styles.card, selectedCampaign && styles.campaignCard]}>
          <Text style={styles.cardTitle}>{selectedStore.brandName}</Text>
          <Text style={styles.cardLine}>{copy.category}: {formatBrandCategoryLabel(categoryName, t)}</Text>
          <Text style={styles.cardLine}>{copy.openingHours}: {selectedStore.openingHours}</Text>
          {selectedCampaign ? (
            <View style={styles.campaignBlock}>
              <Text style={styles.campaignTitle}>✦ {copy.activeCampaign}: {selectedCampaign.discountLabel}</Text>
              <Text style={styles.cardLine}>{copy.ends}: {formatCampaignDate(selectedCampaign.endsOn, language)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{copy.points}</Text>
        <View style={styles.poiGrid}>
          {map.pois.map(poi => <Text key={poi.id} style={styles.poiChip}>{poiLabels[poi.kind][language]}</Text>)}
        </View>
      </View>

      <View style={styles.sourceCard}>
        <Text style={styles.sourceHeading}>{copy.source}</Text>
        <Text style={styles.sourceText}>{copy.sourceNote}</Text>
        {Platform.OS === "web" ? <Text style={styles.webNote}>{copy.webNote}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, gap: 14, width: "100%", maxWidth: 1120, alignSelf: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F3F4F6" },
  emptyText: { color: colors.primary, fontSize: 17, fontWeight: "700", textAlign: "center" },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  headingText: { flex: 1 },
  title: { color: colors.primary, fontSize: 28, lineHeight: 34, fontWeight: "900" },
  subtitle: { color: "#5B6573", marginTop: 3, fontSize: 14, lineHeight: 20 },
  modeRow: { alignItems: "center", gap: 3 },
  modeText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  searchArea: { zIndex: 5 },
  searchInput: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: "#CFD5DD", backgroundColor: "#FFFFFF", color: colors.primary, paddingHorizontal: 16, fontSize: 16, fontWeight: "600" },
  results: { marginTop: 6, borderRadius: 14, borderWidth: 1, borderColor: "#D3D8DF", backgroundColor: "#FFFFFF", overflow: "hidden" },
  resultButton: { minHeight: 52, paddingHorizontal: 15, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E5E9" },
  resultText: { flex: 1, color: colors.primary, fontSize: 15, fontWeight: "800" },
  resultFloor: { color: "#6C7480", fontSize: 12 },
  noResult: { marginTop: 6, borderRadius: 12, padding: 12, backgroundColor: "#FFF6D3", borderWidth: 1, borderColor: "#E2C85E" },
  noResultTitle: { color: colors.primary, fontWeight: "900" },
  noResultText: { color: "#5B6573", marginTop: 2, lineHeight: 18 },
  mapShell: { height: 590, minHeight: 460, overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: "#C9D0D8", backgroundColor: "#E8ECEF" },
  osmAttribution: { position: "absolute", right: 10, bottom: 10, zIndex: 20, maxWidth: "92%", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "#CBD2DA" },
  osmAttributionText: { color: "#344150", fontSize: 10, lineHeight: 12, fontWeight: "700", textDecorationLine: "underline" },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  controlButton: { minHeight: 46, flexGrow: 1, flexBasis: 180, alignItems: "center", justifyContent: "center", borderRadius: 13, paddingHorizontal: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CED4DC" },
  controlButtonActive: { backgroundColor: "#FFF0AA", borderColor: "#C7A51F" },
  controlText: { color: colors.primary, fontSize: 13, fontWeight: "900", textAlign: "center" },
  offlineReady: { color: "#2E6A3E", fontSize: 13, fontWeight: "800" },
  offlineError: { color: "#9C2F25", fontSize: 13, fontWeight: "800" },
  floorRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  sectionLabel: { color: colors.primary, fontSize: 14, fontWeight: "900", marginRight: 4 },
  floorButton: { minHeight: 42, justifyContent: "center", paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD1D9" },
  floorButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  floorText: { color: colors.primary, fontWeight: "800" },
  floorTextActive: { color: "#FFFFFF" },
  card: { borderRadius: 18, padding: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DEE2E7" },
  campaignCard: { borderColor: "#C9A31B", backgroundColor: "#FFFBEB" },
  cardTitle: { color: colors.primary, fontSize: 19, lineHeight: 24, fontWeight: "900" },
  cardLine: { color: "#4F5967", marginTop: 6, fontSize: 14, lineHeight: 20 },
  campaignBlock: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E2C85E" },
  campaignTitle: { color: "#8A6800", fontWeight: "900", lineHeight: 20 },
  poiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  poiChip: { color: colors.primary, backgroundColor: "#EEF1F5", paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999, fontSize: 12, overflow: "hidden" },
  sourceCard: { borderRadius: 16, padding: 14, backgroundColor: "#E9EDF2", borderWidth: 1, borderColor: "#D7DDE4" },
  sourceHeading: { color: colors.primary, fontSize: 13, lineHeight: 18, fontWeight: "900" },
  sourceText: { color: "#5F6875", fontSize: 12, lineHeight: 17, marginTop: 5 },
  webNote: { color: "#7B6110", fontSize: 12, lineHeight: 17, fontWeight: "800", marginTop: 7 },
});
