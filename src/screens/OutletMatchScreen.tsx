import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { type NavigationProp, type RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { brands } from "../constants/brands";
import { outlets } from "../constants/outlets";
import { isWebSeoPublicOutlet } from "../constants/webSeo";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import type { RootStackParamList } from "../navigation/types";
import {
  getOutletMatches,
  parseOutletMatchSelection,
  serializeOutletMatchSelection,
  type OutletMatchResult,
} from "../services/outletMatch";
import type { UserCoordinates } from "../services/nearbyOutlets";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { formatOutletLocationSubtitle } from "../utils/locationDisplay";
import { trackProductEvent } from "../utils/productAnalytics";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

const activeBrands = brands.filter((brand) => brand.brandStatus === "active")
  .sort((left, right) => left.brandName.localeCompare(right.brandName));
const brandById = new Map(activeBrands.map((brand) => [brand.brandId, brand]));
const webPublicOutletIds = new Set(outlets.filter(isWebSeoPublicOutlet).map((outlet) => outlet.outletId));

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

function includesSearch(brand: (typeof activeBrands)[number], query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return [brand.brandName, brand.brandId, ...(brand.aliases ?? [])]
    .some((value) => value.toLocaleLowerCase().includes(normalized));
}

export function OutletMatchScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "OutletMatch">>();
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const { favoriteBrandIds, favoritesLoading } = useFavorites();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 1024;
  const initial = useMemo(() => parseOutletMatchSelection(route.params.selection), [route.params.selection]);
  const initialized = useRef(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(initial.brandIds);
  const [compareOutletIds, setCompareOutletIds] = useState<string[]>(initial.outletIds);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (initialized.current || favoritesLoading) return;
    initialized.current = true;
    if (!initial.brandIds.length && favoriteBrandIds.length) setSelectedBrandIds(favoriteBrandIds.slice(0, 8));
  }, [favoriteBrandIds, favoritesLoading, initial.brandIds.length]);

  const matches = useMemo(() => getOutletMatches(selectedBrandIds, userLocation)
    .filter((outlet) => Platform.OS !== "web" || webPublicOutletIds.has(outlet.outletId)), [selectedBrandIds, userLocation]);
  const visibleBrands = useMemo(() => activeBrands.filter((brand) => includesSearch(brand, search)).slice(0, 24), [search]);
  const compared = compareOutletIds.map((outletId) => matches.find((match) => match.outletId === outletId))
    .filter((outlet): outlet is OutletMatchResult => Boolean(outlet));

  useEffect(() => {
    const visibleIds = new Set(matches.map((match) => match.outletId));
    setCompareOutletIds((current) => current.filter((outletId) => visibleIds.has(outletId)).slice(0, 3));
  }, [matches]);

  function toggleBrand(brandId: string) {
    setSelectedBrandIds((current) => {
      if (current.includes(brandId)) return current.filter((id) => id !== brandId);
      if (current.length >= 8) {
        Alert.alert(t("outletMatch.limitTitle"), t("outletMatch.brandLimitBody"));
        return current;
      }
      trackProductEvent("outlet_match_brand_add", { brand_id: brandId });
      return [...current, brandId];
    });
  }

  function toggleCompare(outletId: string) {
    setCompareOutletIds((current) => {
      if (current.includes(outletId)) return current.filter((id) => id !== outletId);
      if (current.length >= 3) {
        Alert.alert(t("outletMatch.limitTitle"), t("outletMatch.compareLimitBody"));
        return current;
      }
      return [...current, outletId];
    });
  }

  async function useLocation() {
    if (locating) return;
    setLocating(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== "granted") permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(t("outletMatch.locationDeniedTitle"), t("outletMatch.locationDeniedBody"));
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      trackProductEvent("outlet_match_location_rank", {});
    } catch {
      Alert.alert(t("outletMatch.locationErrorTitle"), t("outletMatch.locationErrorBody"));
    } finally {
      setLocating(false);
    }
  }

  async function shareResult() {
    if (!selectedBrandIds.length) return;
    const sharedOutlets = compareOutletIds.length ? compareOutletIds : matches.slice(0, 3).map((outlet) => outlet.outletId);
    const selection = serializeOutletMatchSelection(selectedBrandIds, sharedOutlets);
    const url = `https://myoutletguide.com/${language}/outlet-match/${encodeURIComponent(selection)}`;
    const brandNames = selectedBrandIds.map((brandId) => brandById.get(brandId)?.brandName).filter(Boolean).join(", ");
    const outletNames = sharedOutlets.map((outletId) => matches.find((outlet) => outlet.outletId === outletId)?.name).filter(Boolean).join(", ");
    await Share.share({
      title: t("outletMatch.shareTitle"),
      message: `${t("outletMatch.shareTitle")}\n${brandNames}\n${outletNames}\n${url}`,
      url,
    });
    trackProductEvent("outlet_match_share", { brand_count: selectedBrandIds.length, outlet_count: sharedOutlets.length });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, desktop && styles.desktop, {
        paddingTop: desktop ? spacing.xxl : getScreenTopInset(insets.top),
        paddingBottom: desktop ? spacing.xxl : getFloatingTabClearance(insets.bottom),
      }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.hero}>
        <MaterialCommunityIcons name="vector-combine" size={34} color={colors.gold} />
        <Text style={[styles.kicker, isNativeRTL && styles.rtl]}>{t("outletMatch.kicker")}</Text>
        <Text accessibilityRole="header" style={[styles.title, isNativeRTL && styles.rtl]}>{t("outletMatch.title")}</Text>
        <Text style={[styles.subtitle, isNativeRTL && styles.rtl]}>{t("outletMatch.subtitle")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle, isNativeRTL && styles.rtl]}>{t("outletMatch.chooseBrands")}</Text>
        <Text style={[styles.body, isNativeRTL && styles.rtl]}>{t("outletMatch.chooseBrandsBody")}</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("outletMatch.searchPlaceholder")}
          placeholderTextColor={colors.textMuted}
          style={[styles.search, isNativeRTL && styles.rtl]}
        />
        {selectedBrandIds.length ? (
          <View style={styles.chips}>
            {selectedBrandIds.map((brandId) => (
              <TouchableOpacity key={brandId} style={styles.selectedChip} onPress={() => toggleBrand(brandId)}>
                <Text style={styles.selectedChipText}>{brandById.get(brandId)?.brandName ?? brandId} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        <View style={styles.brandGrid}>
          {visibleBrands.map((brand) => {
            const selected = selectedBrandIds.includes(brand.brandId);
            return (
              <TouchableOpacity key={brand.brandId} style={[styles.brandOption, selected && styles.brandOptionSelected]} onPress={() => toggleBrand(brand.brandId)}>
                <Text style={[styles.brandOptionText, selected && styles.brandOptionTextSelected]}>{brand.brandName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => void useLocation()} disabled={locating}>
          <MaterialCommunityIcons name="crosshairs-gps" size={18} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>{t(locating ? "outletMatch.locating" : userLocation ? "outletMatch.locationActive" : "outletMatch.useLocation")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shareButton, !selectedBrandIds.length && styles.disabled]} disabled={!selectedBrandIds.length} onPress={() => void shareResult()}>
          <MaterialCommunityIcons name="share-variant-outline" size={18} color={colors.primary} />
          <Text style={styles.shareButtonText}>{t("outletMatch.share")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsHeader}>
        <View>
          <Text style={[styles.sectionTitle, isNativeRTL && styles.rtl]}>{t("outletMatch.resultsTitle")}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtl]}>{selectedBrandIds.length
            ? interpolate(t("outletMatch.resultCount"), { count: matches.length })
            : t("outletMatch.selectPrompt")}</Text>
        </View>
      </View>

      {matches.slice(0, 20).map((outlet, index) => {
        const selectedForCompare = compareOutletIds.includes(outlet.outletId);
        return (
          <View key={outlet.outletId} style={[styles.resultCard, index === 0 && styles.bestResult]}>
            <View style={styles.resultTopRow}>
              <View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View>
              <View style={styles.resultCopy}>
                <Text style={[styles.outletName, isNativeRTL && styles.rtl]}>{outlet.name}</Text>
                <Text style={[styles.location, isNativeRTL && styles.rtl]}>{formatOutletLocationSubtitle(outlet.cityId, outlet.countryId, language)}</Text>
              </View>
              <View style={styles.score}><Text style={styles.scoreText}>{outlet.coveragePercent}%</Text></View>
            </View>
            <Text style={[styles.matchSummary, isNativeRTL && styles.rtl]}>{interpolate(t("outletMatch.matchSummary"), {
              matched: outlet.matchedBrandIds.length,
              total: selectedBrandIds.length,
            })}</Text>
            <View style={styles.chips}>
              {outlet.matchedBrandIds.map((brandId) => <View key={brandId} style={styles.matchChip}><Text style={styles.matchChipText}>✓ {brandById.get(brandId)?.brandName ?? brandId}</Text></View>)}
            </View>
            {outlet.distanceKm !== undefined ? <Text style={styles.distance}>{interpolate(t("outletMatch.distance"), { distance: outlet.distanceKm.toFixed(1) })}</Text> : null}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate("OutletDetail", { outletId: outlet.outletId })}>
                <Text style={styles.cardActionText}>{t("outletMatch.viewOutlet")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cardAction, selectedForCompare && styles.cardActionSelected]} onPress={() => toggleCompare(outlet.outletId)}>
                <Text style={[styles.cardActionText, selectedForCompare && styles.cardActionTextSelected]}>{t(selectedForCompare ? "outletMatch.removeCompare" : "outletMatch.addCompare")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate("TravelBasket", { outletId: outlet.outletId, source: "outlet_match" })}>
                <Text style={styles.cardActionText}>{t("outletMatch.planTrip")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {compared.length ? (
        <View style={styles.compareCard}>
          <Text style={[styles.sectionTitle, isNativeRTL && styles.rtl]}>{t("outletMatch.compareTitle")}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtl]}>{t("outletMatch.compareBody")}</Text>
          <View style={styles.compareNames}>
            <View style={styles.compareBrand} />
            {compared.map((outlet) => <Text key={outlet.outletId} numberOfLines={2} style={styles.compareName}>{outlet.name}</Text>)}
          </View>
          {selectedBrandIds.map((brandId) => (
            <View key={brandId} style={styles.compareRow}>
              <Text numberOfLines={1} style={styles.compareBrand}>{brandById.get(brandId)?.brandName ?? brandId}</Text>
              {compared.map((outlet) => (
                <View key={outlet.outletId} style={[styles.compareValue, outlet.matchedBrandIds.includes(brandId) && styles.compareValueMatched]}>
                  <Text style={[styles.compareValueText, outlet.matchedBrandIds.includes(brandId) && styles.compareValueTextMatched]}>{outlet.matchedBrandIds.includes(brandId) ? "✓" : "—"}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, paddingHorizontal: spacing.xl },
  desktop: { alignSelf: "center", maxWidth: 1040, paddingHorizontal: 24, width: "100%" },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xxl, padding: spacing.xl },
  kicker: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1, marginTop: spacing.md, textTransform: "uppercase" },
  title: { color: colors.textInverse, fontSize: 30, fontWeight: "900", lineHeight: 36, marginTop: spacing.sm },
  subtitle: { color: "rgba(255,255,255,.82)", fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xxl, borderWidth: 1, padding: spacing.xl },
  sectionTitle: { color: colors.textPrimary, fontSize: 21, fontWeight: "900" },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: spacing.xs },
  search: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, color: colors.textPrimary, fontSize: 15, marginTop: spacing.lg, minHeight: 48, paddingHorizontal: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.md },
  selectedChip: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  selectedChipText: { color: colors.textInverse, fontSize: 12, fontWeight: "800" },
  brandGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.md },
  brandOption: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  brandOptionSelected: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  brandOptionText: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" },
  brandOptionTextSelected: { color: colors.primary, fontWeight: "900" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  secondaryButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 48, paddingHorizontal: 16 },
  secondaryButtonText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  shareButton: { alignItems: "center", backgroundColor: colors.gold, borderRadius: radius.pill, flexDirection: "row", gap: 7, minHeight: 48, paddingHorizontal: 18 },
  shareButtonText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  disabled: { opacity: 0.45 },
  resultsHeader: { marginTop: spacing.sm },
  resultCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xxl, borderWidth: 1, padding: spacing.lg },
  bestResult: { borderColor: colors.gold, borderWidth: 2 },
  resultTopRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  rank: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  rankText: { color: colors.textInverse, fontWeight: "900" },
  resultCopy: { flex: 1 },
  outletName: { color: colors.textPrimary, fontSize: 18, fontWeight: "900" },
  location: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  score: { backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  scoreText: { color: colors.goldDark, fontSize: 14, fontWeight: "900" },
  matchSummary: { color: colors.textSecondary, fontSize: 13, fontWeight: "800", marginTop: spacing.md },
  matchChip: { backgroundColor: colors.successSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  matchChipText: { color: colors.success, fontSize: 11, fontWeight: "800" },
  distance: { color: colors.goldDark, fontSize: 12, fontWeight: "800", marginTop: spacing.md },
  cardActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.lg },
  cardAction: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  cardActionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  cardActionText: { color: colors.primary, fontSize: 12, fontWeight: "900" },
  cardActionTextSelected: { color: colors.textInverse },
  compareCard: { backgroundColor: colors.primary, borderRadius: radius.xxl, padding: spacing.xl },
  compareRow: { alignItems: "center", borderBottomColor: "rgba(255,255,255,.12)", borderBottomWidth: 1, flexDirection: "row", gap: 8, minHeight: 46 },
  compareBrand: { color: colors.textInverse, flex: 1.5, fontSize: 12, fontWeight: "800" },
  compareValue: { alignItems: "center", backgroundColor: "rgba(255,255,255,.08)", borderRadius: 12, flex: 1, justifyContent: "center", minHeight: 32 },
  compareValueMatched: { backgroundColor: colors.gold },
  compareValueText: { color: "rgba(255,255,255,.65)", fontWeight: "900" },
  compareValueTextMatched: { color: colors.primary },
  compareNames: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: spacing.md },
  compareName: { color: colors.gold, flex: 1, fontSize: 10, fontWeight: "800", textAlign: "center" },
  rtl: { textAlign: "right" },
});
