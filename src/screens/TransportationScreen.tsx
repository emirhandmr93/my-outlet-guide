import { RouteProp, useRoute } from "@react-navigation/native";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";
import { useTranslation } from "../hooks/useTranslation";
import {
  getNearbyAirportDisplay,
  getOutletMapLinks,
  getRecommendedTransportationV2Option,
  getRouteDetailWarning,
  getTransportationOptionDisplayModel,
  getTransportationRouteDetailRows,
  getTransportationV2Options,
  type NearbyAirportDisplay,
  type TransportationV2Option,
} from "../services/transportationV2Service";
import { colors } from "../theme/colors";

type RouteParams = { Transportation: { outletId: string } };

function Metadata({ item }: { item: TransportationV2Option }) {
  const chips = [
    item.modeLabel,
    item.estimatedDurationLabel,
    item.estimatedFareLabel,
  ].filter(Boolean) as string[];
  return (
    <View style={styles.chipRow}>
      {chips.map((chip) => (
        <Text key={chip} style={styles.metaChip}>
          {chip}
        </Text>
      ))}
    </View>
  );
}

function OptionRow({
  item,
  compact = false,
}: {
  item: TransportationV2Option;
  compact?: boolean;
}) {
  const { language } = useTranslation();
  const detailRows = getTransportationRouteDetailRows(item, language);
  const showWarning =
    !item.routeDetails.hasSourceBackedRouteDetail &&
    !["taxi", "uber"].includes(item.mode);
  return (
    <View style={[styles.optionRow, compact && styles.optionRowCompact]}>
      {!compact ? <Text style={styles.optionTitle}>{item.title}</Text> : null}
      <Metadata item={item} />
      {detailRows.length ? (
        <View style={styles.detailList}>
          {detailRows.map((row) => (
            <Text key={`${item.id}-${row.label}`} style={styles.detailText}>
              <Text style={styles.detailLabel}>{row.label}: </Text>
              {row.value}
            </Text>
          ))}
        </View>
      ) : null}
      {showWarning ? (
        <Text style={styles.routeWarning}>
          {getRouteDetailWarning(language)}
        </Text>
      ) : null}
    </View>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: TransportationV2Option[];
}) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <OptionRow key={item.id} item={item} />
      ))}
    </View>
  );
}

function NearbyAirportsSection({
  airports,
}: {
  airports: NearbyAirportDisplay[];
}) {
  const { t } = useTranslation();
  if (!airports.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t("transportation.v2.nearbyAirports")}
      </Text>
      {airports.map((airport) => (
        <View key={`${airport.code}-${airport.name}`} style={styles.airportRow}>
          <Text style={styles.airportName}>
            {airport.code} · {airport.name}
          </Text>
          {airport.distance ? (
            <Text style={styles.metaLine}>{airport.distance}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function dedupeShuttles(items: TransportationV2Option[]) {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = [
        item.fareLabel || "",
        item.durationLabel || "",
        item.noteLabel || "",
      ]
        .join("|")
        .toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 1);
}

export function TransportationScreen() {
  const route = useRoute<RouteProp<RouteParams, "Transportation">>();
  const outletId = route.params?.outletId;
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const options = getTransportationV2Options(outletId).map((option) =>
    getTransportationOptionDisplayModel(option, language),
  );
  const recommendedBase = getRecommendedTransportationV2Option(outletId);
  const recommended = recommendedBase
    ? getTransportationOptionDisplayModel(recommendedBase, language)
    : undefined;
  const maps = getOutletMapLinks(outletId);
  const airportOptions = options
    .filter(
      (item) =>
        item.originGroup === "airport" && item.isUsefulForPrimaryDisplay,
    )
    .slice(0, 3);
  const nearbyAirports = airportOptions.length
    ? []
    : getNearbyAirportDisplay(outletId);
  const cityOptions = options.filter(
    (item) =>
      item.originGroup === "city" &&
      item.estimatedDurationLabel &&
      item.estimatedFareLabel,
  );
  const shuttleOptions = dedupeShuttles(
    options.filter(
      (item) =>
        item.originGroup === "shuttle" &&
        item.estimatedDurationLabel &&
        item.estimatedFareLabel,
    ),
  );
  const showRecommended = Boolean(
    recommended?.estimatedDurationLabel && recommended?.estimatedFareLabel,
  );
  const steps = showRecommended ? (recommended?.steps.slice(0, 4) ?? []) : [];

  if (!recommended && !nearbyAirports.length)
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {t("transportation.notAvailable")}
        </Text>
      </View>
    );

  return (
    <View style={styles.screenRoot}>
      <View
        pointerEvents="none"
        style={[styles.topSafeScrim, { height: insets.top }]}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(getScreenTopInset(insets.top) - 6, 14),
            paddingBottom: getFloatingTabClearance(insets.bottom) + 16,
          },
        ]}
        scrollIndicatorInsets={{
          top: Math.max(getScreenTopInset(insets.top) - 6, 14),
          bottom: getScrollIndicatorBottomInset(insets.bottom),
        }}
      >
        <Text style={styles.pageTitle}>{t("transportation.title")}</Text>
        <Text style={styles.pageSubtitle}>
          {t("transportation.v2.subtitle")}
        </Text>
        <View style={styles.recommendedCard}>
          <Text style={styles.badge}>
            {t("transportation.recommendedRoute")}
          </Text>
          {showRecommended && recommended ? (
            <>
              <Text style={styles.recommendedTitle}>{recommended.title}</Text>
              <OptionRow item={recommended} compact />
              {recommended.noteLabel ? (
                <Text style={styles.notePlain}>{recommended.noteLabel}</Text>
              ) : null}
            </>
          ) : null}
        </View>
        {airportOptions.length ? (
          <Section
            title={t("transportation.v2.airportAccess")}
            items={airportOptions}
          />
        ) : (
          <NearbyAirportsSection airports={nearbyAirports} />
        )}
        <Section
          title={t("transportation.v2.cityAccess")}
          items={cityOptions}
        />
        <Section
          title={t("transportation.v2.shuttleSection")}
          items={shuttleOptions}
        />
        {steps.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("transportation.stepByStep")}
            </Text>
            {steps.map((step, index) => (
              <View key={`${recommended?.id}-${index}`} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {maps ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("transportation.v2.navigation")}
            </Text>
            <View style={styles.mapRow}>
              {[
                { label: t("outlet.googleMaps"), url: maps.googleMapsUrl },
                { label: t("outlet.appleMaps"), url: maps.appleMapsUrl },
                { label: t("outlet.yandexMaps"), url: maps.yandexMapsUrl },
              ].map((link) =>
                link.url ? (
                  <TouchableOpacity
                    key={link.label}
                    style={styles.mapButton}
                    onPress={() => Linking.openURL(link.url)}
                  >
                    <Text style={styles.mapButtonText}>{link.label}</Text>
                  </TouchableOpacity>
                ) : null,
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.surfaceSoft },
  topSafeScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceSoft,
    zIndex: 10,
  },
  container: { flex: 1 },
  content: { padding: 20 },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
  },
  pageTitle: { fontSize: 28, fontWeight: "900", color: colors.primary },
  pageSubtitle: {
    fontSize: 15,
    color: colors.gold,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 21,
  },
  recommendedCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.goldSurface,
    color: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontWeight: "900",
    marginBottom: 10,
  },
  recommendedTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 8,
  },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 8,
  },
  optionRow: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  optionRowCompact: { padding: 0, borderWidth: 0, marginBottom: 0 },
  optionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: 8,
  },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaChip: {
    color: colors.textPrimary,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
  },
  detailList: { marginTop: 10, gap: 4 },
  detailText: {
    color: colors.textSecondary,
    fontWeight: "700",
    lineHeight: 19,
  },
  detailLabel: { color: colors.primary, fontWeight: "900" },
  routeWarning: {
    marginTop: 8,
    color: colors.textSecondary,
    fontWeight: "800",
    lineHeight: 19,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    color: colors.surface,
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "900",
  },
  stepText: { flex: 1, color: colors.textSecondary, lineHeight: 20 },
  note: {
    color: colors.textSecondary,
    lineHeight: 21,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notePlain: { color: colors.textSecondary, lineHeight: 21, fontWeight: "700" },
  mapRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  mapButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  mapButtonText: { color: colors.surface, fontWeight: "900" },
  metaLine: { color: colors.textSecondary, fontWeight: "800", lineHeight: 20 },
  airportRow: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  airportName: { color: colors.primary, fontWeight: "900", marginBottom: 6 },
});
