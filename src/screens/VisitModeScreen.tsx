import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { outlets } from "../constants/outlets";
import { useTranslation } from "../hooks/useTranslation";
import { getBrandCategoryGroupsForOutlet } from "../services/brandService";
import {
  loadOutletVisitProgress,
  resetOutletVisitProgress,
  saveOutletVisitProgress,
} from "../services/visitModeService";
import {
  moveOutletVisitBrand,
  setOutletVisitNote,
  toggleOutletVisitBrand,
  toggleOutletVisitPriority,
  type OutletVisitProgress,
} from "../services/visitModeState";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { openExternalUrl } from "../utils/externalUrl";
import { formatOpeningHoursText } from "../utils/outletDisplayFormatters";
import { normalizeSearchText } from "../services/searchAliases";
import { formatBrandCategoryLabel } from "../utils/brandCategoryLabelFormatter";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

type VisitModeRoute = { VisitMode: { outletId: string } };

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function VisitModeScreen() {
  const route = useRoute<RouteProp<VisitModeRoute, "VisitMode">>();
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const outlet = outlets.find(
    (item) => item.outletId === route.params.outletId && item.status === "active",
  );
  const brandGroups = useMemo(
    () => outlet ? getBrandCategoryGroupsForOutlet(outlet.outletId) : [],
    [outlet?.outletId],
  );
  const visitBrands = useMemo(() => brandGroups.flatMap((group) =>
    group.brands.map((brand) => ({
      brandId: brand.brandId,
      brandName: brand.brandName,
      categoryName: formatBrandCategoryLabel(group.categoryName, t),
    })),
  ), [brandGroups, t, language]);
  const allowedBrandIds = useMemo(() => visitBrands.map((brand) => brand.brandId), [visitBrands]);
  const [progress, setProgress] = useState<OutletVisitProgress | null>(null);
  const [search, setSearch] = useState("");
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    if (!outlet) return;
    let active = true;
    setProgress(null);
    setStorageError(false);
    void loadOutletVisitProgress(outlet.outletId, allowedBrandIds)
      .then((loaded) => { if (active) setProgress(loaded); })
      .catch(() => { if (active) setStorageError(true); });
    return () => { active = false; };
  }, [outlet?.outletId, allowedBrandIds.join("|")]);

  const orderedVisitBrands = useMemo(() => {
    if (!progress) return visitBrands;
    const byId = new Map(visitBrands.map((brand) => [brand.brandId, brand]));
    return progress.orderedBrandIds.flatMap((brandId) => {
      const brand = byId.get(brandId);
      return brand ? [brand] : [];
    });
  }, [progress?.orderedBrandIds, visitBrands]);

  const visibleBrands = useMemo(() => {
    const query = normalizeSearchText(search);
    if (!query) return orderedVisitBrands;
    return orderedVisitBrands.filter((brand) => normalizeSearchText(
      `${brand.brandName} ${brand.categoryName}`,
    ).includes(query));
  }, [search, orderedVisitBrands]);

  if (!outlet) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>{t("visitMode.notFoundTitle")}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>{t("nav.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const outletId = outlet.outletId;

  async function persistTransition(next: OutletVisitProgress, previous: OutletVisitProgress) {
    setProgress(next);
    try {
      await saveOutletVisitProgress(next);
      setStorageError(false);
    } catch {
      setProgress(previous);
      setStorageError(true);
    }
  }

  async function toggleBrand(brandId: string) {
    if (!progress) return;
    const next = toggleOutletVisitBrand(progress, brandId, allowedBrandIds);
    await persistTransition(next, progress);
  }

  async function togglePriority(brandId: string) {
    if (!progress) return;
    await persistTransition(
      toggleOutletVisitPriority(progress, brandId, allowedBrandIds),
      progress,
    );
  }

  async function moveBrand(brandId: string, direction: -1 | 1) {
    if (!progress) return;
    await persistTransition(
      moveOutletVisitBrand(progress, brandId, direction, allowedBrandIds),
      progress,
    );
  }

  async function saveNote() {
    if (!progress) return;
    try {
      await saveOutletVisitProgress(progress);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function confirmReset() {
    Alert.alert(t("visitMode.resetTitle"), t("visitMode.resetBody"), [
      { text: t("visitMode.cancel"), style: "cancel" },
      {
        text: t("visitMode.resetConfirm"),
        style: "destructive",
        onPress: () => {
          void resetOutletVisitProgress(outletId)
            .then(() => loadOutletVisitProgress(outletId, allowedBrandIds))
            .then(setProgress)
            .catch(() => setStorageError(true));
        },
      },
    ]);
  }

  const checkedCount = progress?.checkedBrandIds.length ?? 0;
  const checkedIds = new Set(progress?.checkedBrandIds ?? []);
  const priorityIds = new Set(progress?.priorityBrandIds ?? []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktopWeb && styles.desktopContent,
        {
          paddingTop: isDesktopWeb ? spacing.xxl : getScreenTopInset(insets.top),
          paddingBottom: isDesktopWeb ? spacing.xxl : getFloatingTabClearance(insets.bottom),
        },
      ]}
      scrollIndicatorInsets={{
        top: getScreenTopInset(insets.top),
        bottom: getScrollIndicatorBottomInset(insets.bottom),
      }}
    >
      <View style={[styles.inner, isDesktopWeb && styles.desktopInner]}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>{t("visitMode.kicker")}</Text>
          <Text style={styles.title}>{outlet.name}</Text>
          <Text style={styles.subtitle}>{t("visitMode.subtitle")}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${visitBrands.length > 0 ? Math.round((checkedCount / visitBrands.length) * 100) : 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {interpolate(t("visitMode.progress"), { checked: checkedCount, total: visitBrands.length })}
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => void openExternalUrl(outlet.googleMapsUrl)}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>{t("visitMode.directions")}</Text>
          </TouchableOpacity>
          {outlet.centerMapUrl ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => void openExternalUrl(outlet.centerMapUrl)}>
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionText}>{t("visitMode.centerMap")}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.actionButton} onPress={() => void openExternalUrl(outlet.websiteUrl)}>
            <Text style={styles.actionIcon}>🌐</Text>
            <Text style={styles.actionText}>{t("visitMode.website")}</Text>
          </TouchableOpacity>
          {Platform.OS !== "web" ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("CreateTrip", { outletId })}>
              <Text style={styles.actionIcon}>🧳</Text>
              <Text style={styles.actionText}>{t("visitMode.addToTrip")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{t("visitMode.openingHours")}</Text>
          <Text style={styles.infoText}>{formatOpeningHoursText(outlet.openingHours, language)}</Text>
        </View>

        {progress ? (
          <View style={styles.noteCard}>
            <Text style={styles.sectionTitleSmall}>{t("visitMode.shoppingNote")}</Text>
            <Text style={styles.sectionText}>{t("visitMode.shoppingNoteText")}</Text>
            <TextInput
              accessibilityLabel={t("visitMode.shoppingNote")}
              style={styles.noteInput}
              value={progress.note}
              onChangeText={(note) => setProgress(setOutletVisitNote(progress, note, allowedBrandIds))}
              onBlur={() => void saveNote()}
              placeholder={t("visitMode.shoppingNotePlaceholder")}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
            <Text style={styles.savedText}>{t("visitMode.autoResume")}</Text>
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <View style={styles.listHeaderCopy}>
            <Text style={styles.sectionTitle}>{t("visitMode.brandChecklist")}</Text>
            <Text style={styles.sectionText}>{t("visitMode.brandChecklistText")}</Text>
          </View>
          <TouchableOpacity onPress={confirmReset}>
            <Text style={styles.resetText}>{t("visitMode.reset")}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t("visitMode.searchPlaceholder")}
          placeholderTextColor={colors.textMuted}
        />

        {storageError ? <Text style={styles.errorText}>{t("visitMode.storageError")}</Text> : null}
        {!progress ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : visibleBrands.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t("visitMode.noBrands")}</Text>
          </View>
        ) : visibleBrands.map((brand) => {
          const checked = checkedIds.has(brand.brandId);
          const priority = priorityIds.has(brand.brandId);
          const orderIndex = progress.orderedBrandIds.indexOf(brand.brandId);
          const showOrderControls = search.trim().length === 0;
          return (
            <View key={brand.brandId} style={[styles.brandRow, priority && styles.brandRowPriority, checked && styles.brandRowChecked]}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                activeOpacity={0.84}
                style={styles.brandCheckAction}
                onPress={() => void toggleBrand(brand.brandId)}
              >
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                  <Text style={styles.checkboxText}>{checked ? "✓" : ""}</Text>
                </View>
                <View style={styles.brandCopy}>
                  <Text style={[styles.brandName, checked && styles.brandNameChecked]}>{brand.brandName}</Text>
                  <Text style={styles.brandCategory}>{brand.categoryName}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.brandActions}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={priority ? t("visitMode.removePriority") : t("visitMode.markPriority")}
                  accessibilityState={{ selected: priority }}
                  style={[styles.miniButton, priority && styles.miniButtonPriority]}
                  onPress={() => void togglePriority(brand.brandId)}
                >
                  <Text style={styles.miniButtonText}>{priority ? "★" : "☆"}</Text>
                </TouchableOpacity>
                {showOrderControls ? (
                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t("visitMode.moveUp")}
                      disabled={orderIndex <= 0}
                      style={[styles.orderButton, orderIndex <= 0 && styles.orderButtonDisabled]}
                      onPress={() => void moveBrand(brand.brandId, -1)}
                    >
                      <Text style={styles.orderButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t("visitMode.moveDown")}
                      disabled={orderIndex < 0 || orderIndex >= progress.orderedBrandIds.length - 1}
                      style={[styles.orderButton, (orderIndex < 0 || orderIndex >= progress.orderedBrandIds.length - 1) && styles.orderButtonDisabled]}
                      onPress={() => void moveBrand(brand.brandId, 1)}
                    >
                      <Text style={styles.orderButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl },
  desktopContent: { paddingHorizontal: 34 },
  inner: { width: "100%" },
  desktopInner: { maxWidth: 980, alignSelf: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, backgroundColor: colors.background },
  heroCard: { backgroundColor: colors.primary, borderRadius: radius.xxl, padding: spacing.xl, marginBottom: spacing.lg },
  kicker: { color: colors.gold, fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.textInverse, fontSize: 28, fontWeight: "900", marginTop: spacing.sm },
  subtitle: { color: "rgba(255,255,255,0.78)", fontSize: 15, lineHeight: 21, marginTop: spacing.sm },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.16)", overflow: "hidden", marginTop: spacing.lg },
  progressFill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.gold },
  progressText: { color: colors.textInverse, fontSize: 13, fontWeight: "800", marginTop: spacing.sm },
  quickActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  actionButton: { flexGrow: 1, flexBasis: "30%", minWidth: 105, minHeight: 72, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md },
  actionIcon: { fontSize: 20, marginBottom: spacing.xs },
  actionText: { color: colors.textPrimary, fontSize: 12, fontWeight: "900", textAlign: "center" },
  infoCard: { backgroundColor: colors.goldSoft, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderGold },
  infoLabel: { color: colors.goldDark, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  infoText: { color: colors.textPrimary, fontSize: 14, lineHeight: 21, fontWeight: "700", marginTop: spacing.sm },
  noteCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  sectionTitleSmall: { color: colors.textPrimary, fontSize: 18, fontWeight: "900" },
  noteInput: { minHeight: 96, marginTop: spacing.md, backgroundColor: colors.background, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: spacing.md, fontSize: 15, lineHeight: 21, textAlignVertical: "top" },
  savedText: { color: colors.success, fontSize: 12, fontWeight: "800", marginTop: spacing.sm },
  listHeader: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, marginBottom: spacing.md },
  listHeaderCopy: { flex: 1 },
  sectionTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: "900" },
  sectionText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: spacing.xs },
  resetText: { color: colors.danger, fontSize: 13, fontWeight: "900", paddingVertical: spacing.xs },
  searchInput: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 15, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  loader: { marginVertical: spacing.xxl },
  brandRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  brandRowPriority: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
  brandRowChecked: { backgroundColor: colors.successSoft, borderColor: colors.success },
  brandCheckAction: { flex: 1, minHeight: 54, flexDirection: "row", alignItems: "center", padding: spacing.xs },
  checkbox: { width: 26, height: 26, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", marginEnd: spacing.md },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkboxText: { color: colors.textInverse, fontWeight: "900" },
  brandCopy: { flex: 1 },
  brandName: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  brandNameChecked: { textDecorationLine: "line-through", color: colors.textSecondary },
  brandCategory: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
  brandActions: { alignItems: "center", marginStart: spacing.sm, gap: spacing.xs },
  miniButton: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  miniButtonPriority: { backgroundColor: colors.gold, borderColor: colors.goldDark },
  miniButtonText: { color: colors.primary, fontSize: 20, fontWeight: "900" },
  orderActions: { flexDirection: "row", gap: 4 },
  orderButton: { width: 30, height: 30, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  orderButtonDisabled: { opacity: 0.3 },
  orderButtonText: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "900", textAlign: "center" },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.lg },
  primaryButtonText: { color: colors.textInverse, fontWeight: "900" },
});
