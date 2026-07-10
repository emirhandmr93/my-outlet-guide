import { RouteProp, useRoute } from "@react-navigation/native";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";
import { useTranslation } from "../hooks/useTranslation";
import { formatTransportationTypeLabel } from "../utils/transportationLabelFormatter";
import { getNearbyAirportDisplay, getOutletMapLinks, getRecommendedTransportationV2Option, getTransportationDisplayFallbacks, getTransportationOptionDisplayModel, getTransportationV2Options, type NearbyAirportDisplay, type TransportationV2Option } from "../services/transportationV2Service";
import { colors } from "../theme/colors";

type RouteParams = { Transportation: { outletId: string } };

function labelForOrigin(item: TransportationV2Option, t: (key: string) => string) {
  if (item.originGroup === "airport") return t("transportation.v2.airportFrom");
  if (item.originGroup === "city") return t("transportation.v2.cityFrom");
  return t("transportation.v2.shuttle");
}

function Value({ label, value }: { label: string; value: string }) {
  return <View style={styles.valueBox}><Text style={styles.valueLabel}>{label}</Text><Text style={styles.valueText}>{value}</Text></View>;
}

function OptionRow({ item }: { item: TransportationV2Option }) {
  const { t, language } = useTranslation();
  const fallbacks = getTransportationDisplayFallbacks(language);
  const duration = item.duration || fallbacks.time;
  const fare = item.fare || fallbacks.fare;
  return <View style={styles.optionRow}>
    <View style={styles.optionHeader}><Text style={styles.optionTitle}>{item.title || formatTransportationTypeLabel(item.mode, t)}</Text><Text style={styles.modeChip}>{labelForOrigin(item, t)}</Text></View>
    {item.hasOnlyFallbackMeta ? <View style={styles.metaList}><Text style={styles.metaLine}>{t("transportation.duration")}: {duration}</Text><Text style={styles.metaLine}>{t("transportation.cost")}: {fare}</Text></View> : <View style={styles.valueRow}><Value label={t("transportation.duration")} value={duration} /><Value label={t("transportation.cost")} value={fare} /></View>}
    {item.note ? <Text style={styles.compactNote}>{item.note}</Text> : null}
    {item.providerNote ? <Text style={styles.providerNote}>{item.providerNote}</Text> : null}
  </View>;
}

function Section({ title, items, empty }: { title: string; items: TransportationV2Option[]; empty?: string }) {
  if (!items.length && !empty) return null;
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{items.length ? items.map((item) => <OptionRow key={item.id} item={item} />) : <Text style={styles.note}>{empty}</Text>}</View>;
}


function NearbyAirportsSection({ airports }: { airports: NearbyAirportDisplay[] }) {
  const { t, language } = useTranslation();
  if (!airports.length) return null;
  return <View style={styles.section}><Text style={styles.sectionTitle}>{t("transportation.v2.nearbyAirports")}</Text>{airports.map((airport) => <View key={`${airport.code}-${airport.name}`} style={styles.airportRow}><Text style={styles.airportName}>{airport.code} · {airport.name}</Text>{airport.distance ? <Text style={styles.metaLine}>{t("transportation.v2.distance")}: {airport.distance}</Text> : null}<Text style={styles.metaLine}>{t("transportation.v2.publicTransport")}: {t("transportation.v2.checkProviderShort")}</Text><Text style={styles.metaLine}>{t("transportation.v2.taxiUber")}: {t("transportation.v2.checkProviderShort")}</Text></View>)}</View>;
}

export function TransportationScreen() {
  const route = useRoute<RouteProp<RouteParams, "Transportation">>();
  const outletId = route.params?.outletId;
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const options = getTransportationV2Options(outletId).map((option) => getTransportationOptionDisplayModel(option, language));
  const recommendedBase = getRecommendedTransportationV2Option(outletId);
  const recommended = recommendedBase ? getTransportationOptionDisplayModel(recommendedBase, language) : undefined;
  const maps = getOutletMapLinks(outletId);
  const airportOptions = options.filter((item) => item.originGroup === "airport").slice(0, 3);
  const nearbyAirports = airportOptions.length ? [] : getNearbyAirportDisplay(outletId);
  const cityOptions = options.filter((item) => item.originGroup === "city");
  const shuttleOptions = options.filter((item) => item.originGroup === "shuttle" && (item.duration || item.fare));
  const steps = recommended?.steps.slice(0, 4) ?? [];

  if (!recommended) return <View style={styles.emptyContainer}><Text style={styles.emptyTitle}>{t("transportation.notAvailable")}</Text></View>;

  return <View style={styles.screenRoot}><View pointerEvents="none" style={[styles.topSafeScrim, { height: insets.top }]} />
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 8, 18), paddingBottom: getFloatingTabClearance(insets.bottom) + 12 }]} scrollIndicatorInsets={{ top: Math.max(insets.top + 8, 18), bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
      <Text style={styles.pageTitle}>{t("transportation.title")}</Text>
      <Text style={styles.pageSubtitle}>{t("transportation.v2.subtitle")}</Text>
      <View style={styles.recommendedCard}><Text style={styles.badge}>{t("transportation.recommendedRoute")}</Text><Text style={styles.recommendedTitle}>{recommended.title}</Text><OptionRow item={recommended} /></View>
      {airportOptions.length ? <Section title={t("transportation.v2.airportAccess")} items={airportOptions} /> : <NearbyAirportsSection airports={nearbyAirports} />}
      <Section title={t("transportation.v2.cityAccess")} items={cityOptions} empty={t("transportation.v2.noCityData")} />
      <Section title={t("transportation.v2.shuttleSection")} items={shuttleOptions} />
      <View style={styles.section}><Text style={styles.sectionTitle}>{t("transportation.stepByStep")}</Text>{steps.length ? steps.map((step, index) => <View key={`${recommended.id}-${index}`} style={styles.stepRow}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{step}</Text></View>) : <Text style={styles.note}>{t("transportation.v2.noReliableSteps")}</Text>}</View>
      {maps ? <View style={styles.section}><Text style={styles.sectionTitle}>{t("transportation.v2.navigation")}</Text><View style={styles.mapRow}>{[{label:t("outlet.googleMaps"),url:maps.googleMapsUrl},{label:t("outlet.appleMaps"),url:maps.appleMapsUrl},{label:t("outlet.yandexMaps"),url:maps.yandexMapsUrl}].map((link) => link.url ? <TouchableOpacity key={link.label} style={styles.mapButton} onPress={() => Linking.openURL(link.url)}><Text style={styles.mapButtonText}>{link.label}</Text></TouchableOpacity> : null)}</View></View> : null}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.surfaceSoft }, topSafeScrim: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.surfaceSoft, zIndex: 10 }, container: { flex: 1 }, content: { padding: 20 }, emptyContainer: { flex: 1, backgroundColor: colors.surfaceSoft, alignItems: "center", justifyContent: "center", padding: 20 }, emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.primary, textAlign: "center" }, pageTitle: { fontSize: 30, fontWeight: "900", color: colors.primary }, pageSubtitle: { fontSize: 15, color: colors.gold, marginTop: 6, marginBottom: 18, lineHeight: 21 }, recommendedCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }, badge: { alignSelf: "flex-start", backgroundColor: colors.goldSurface, color: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, fontWeight: "900", marginBottom: 10 }, recommendedTitle: { fontSize: 19, fontWeight: "900", color: colors.primary, marginBottom: 8 }, section: { marginTop: 16 }, sectionTitle: { fontSize: 20, fontWeight: "900", color: colors.primary, marginBottom: 10 }, optionRow: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }, optionHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }, optionTitle: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: "900", color: colors.primary }, modeChip: { color: colors.gold, backgroundColor: colors.goldSurface, borderRadius: 999, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "900" }, valueRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" }, valueBox: { flexGrow: 1, flexBasis: "100%", minWidth: 0, backgroundColor: colors.surfaceSoft, borderRadius: 14, padding: 10 }, valueLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", marginBottom: 4 }, valueText: { color: colors.textPrimary, fontWeight: "800", lineHeight: 19 }, stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }, stepNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, color: colors.surface, textAlign: "center", lineHeight: 26, fontWeight: "900" }, stepText: { flex: 1, color: colors.textSecondary, lineHeight: 20 }, note: { color: colors.textSecondary, lineHeight: 21, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border }, mapRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, mapButton: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 11 }, mapButtonText: { color: colors.surface, fontWeight: "900" }, metaList: { backgroundColor: colors.surfaceSoft, borderRadius: 14, padding: 10, gap: 4 }, metaLine: { color: colors.textSecondary, fontWeight: "800", lineHeight: 20 }, compactNote: { marginTop: 8, color: colors.textSecondary, lineHeight: 20 }, providerNote: { marginTop: 8, color: colors.gold, fontWeight: "800", lineHeight: 19 }, airportRow: { backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }, airportName: { color: colors.primary, fontWeight: "900", marginBottom: 6 },
});
