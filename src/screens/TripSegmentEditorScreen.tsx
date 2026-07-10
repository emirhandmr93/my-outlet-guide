import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cities } from "../constants/cities";
import { TripSegment, useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import type { RootStackParamList } from "../navigation/types";
import { searchOutlets } from "../services/searchService";
import { hasSegmentDateOverlap, sortTripSegments } from "../services/tripReminderPlan";
import { expandSearchValues, normalizeSearchText } from "../services/searchAliases";
import { formatCityDisplayName, formatCountryDisplayName, formatOutletLocationSubtitle } from "../utils/locationDisplay";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

function formatDate(date: Date) { return date.toISOString().slice(0, 10); }
function parseDate(value: string) { return value ? new Date(`${value}T00:00:00.000Z`) : new Date(); }

type RouteSearchResult =
  | { type: "city"; key: string; cityId: string; countryId: string; title: string; subtitle: string }
  | { type: "outlet"; key: string; outlet: any; title: string; subtitle: string };

function hasSelectedRoute(segment: TripSegment) {
  return Boolean(segment.cityId || segment.outletId || segment.cityName || segment.outletName);
}

export function TripSegmentEditorScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "TripSegmentEditor">>();
  const navigation = useNavigation<any>();
  const { trips, updateTrip } = useTrips();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const trip = trips.find((item) => item.id === route.params.tripId || item.tripId === route.params.tripId);
  const existing = trip?.segments.find((item) => item.id === route.params.segmentId);
  const [title] = useState(existing?.title || "");
  const [routeQuery, setRouteQuery] = useState("");
  const [isEditingRoute, setIsEditingRoute] = useState(!existing);
  const [segment, setSegment] = useState<TripSegment>(existing || { id: `segment-${Date.now()}`, startDate: trip?.startDate || "", endDate: trip?.endDate || "" });
  const [notes, setNotes] = useState(existing?.notes || "");
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);
  const [saving, setSaving] = useState(false);

  const routeResults = useMemo<RouteSearchResult[]>(() => {
    const query = normalizeSearchText(routeQuery);
    if (query.length < 2) return [];

    const cityResults: RouteSearchResult[] = cities
      .filter((city) => {
        const hay = [city.cityName, city.cityId, city.countryId, formatCityDisplayName(city.cityId, language), formatCountryDisplayName(city.countryId, language), ...expandSearchValues(city.cityName)].join(" ");
        return normalizeSearchText(hay).includes(query);
      })
      .slice(0, 6)
      .map((city) => ({
        type: "city",
        key: `city-${city.cityId}`,
        cityId: city.cityId,
        countryId: city.countryId,
        title: formatCityDisplayName(city.cityId, language),
        subtitle: formatCountryDisplayName(city.countryId, language),
      }));

    const outletResults: RouteSearchResult[] = searchOutlets(routeQuery)
      .slice(0, 6)
      .map((outlet: any) => ({
        type: "outlet",
        key: `outlet-${outlet.outletId}`,
        outlet,
        title: outlet.name || outlet.outletName,
        subtitle: formatOutletLocationSubtitle(outlet.cityId, outlet.countryId, language),
      }));

    return [...outletResults, ...cityResults].slice(0, 10);
  }, [routeQuery, language]);

  if (!trip) return <View style={styles.centerState}><Text style={styles.emptyTitle}>{t("tripDetail.notFound")}</Text></View>;

  function selectCity(city: { cityId: string; countryId: string }) {
    setSegment((value) => ({ ...value, cityId: city.cityId, cityName: formatCityDisplayName(city.cityId, language), countryCode: city.countryId, countryName: formatCountryDisplayName(city.countryId, language), outletId: undefined, outletName: undefined }));
    setRouteQuery("");
    setIsEditingRoute(false);
  }

  function selectOutlet(outlet: any) {
    setSegment((value) => ({ ...value, outletId: outlet.outletId, outletName: outlet.name || outlet.outletName, cityId: outlet.cityId, cityName: formatCityDisplayName(outlet.cityId, language), countryCode: outlet.countryId, countryName: formatCountryDisplayName(outlet.countryId, language) }));
    setRouteQuery("");
    setIsEditingRoute(false);
  }

  function selectResult(result: RouteSearchResult) {
    if (result.type === "city") selectCity(result);
    else selectOutlet(result.outlet);
  }

  function editRouteSelection() {
    setRouteQuery("");
    setIsEditingRoute(true);
  }

  async function save() {
    if (!trip) return;
    const next = { ...segment, title: title.trim() || undefined, notes: notes.trim() || undefined };
    if (!next.cityId && !next.outletId && !next.cityName && !next.outletName) return Alert.alert(t("createTrip.validationTitle"), t("tripSegment.cityOrOutletRequired"));
    if (next.startDate < trip.startDate || next.endDate > trip.endDate) return Alert.alert(t("createTrip.validationTitle"), t("tripSegment.datesOutsideTrip"));
    if (next.endDate < next.startDate) return Alert.alert(t("createTrip.validationTitle"), t("tripSegment.endBeforeStart"));
    const others = trip.segments.filter((item) => item.id !== next.id);
    if (hasSegmentDateOverlap(next, others)) return Alert.alert(t("createTrip.validationTitle"), t("tripSegment.overlap"));
    setSaving(true);
    try {
      await updateTrip(trip.id, { segments: sortTripSegments([...others, next]) });
      navigation.goBack();
    } finally { setSaving(false); }
  }

  const routeSelected = hasSelectedRoute(segment);
  const selectedTitle = segment.outletName || segment.cityName || (segment.cityId ? formatCityDisplayName(segment.cityId, language) : "");
  const selectedSubtitle = segment.cityId && segment.countryCode ? formatOutletLocationSubtitle(segment.cityId, segment.countryCode, language) : segment.countryName;

  return <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{existing ? t("tripDetail.editRouteCta") : t("tripDetail.addRouteCta")}</Text>
      {(!routeSelected || isEditingRoute) && <>
        <TextInput style={styles.input} placeholder={t("tripSegment.unifiedSearchPlaceholder")} value={routeQuery} onChangeText={setRouteQuery} placeholderTextColor="#8A8A8A" />
        {routeResults.map((result) => <TouchableOpacity key={result.key} style={styles.resultRow} onPress={() => selectResult(result)}>
          <View style={styles.resultHeader}><Text style={styles.typePill}>{t(result.type === "city" ? "tripSegment.cityType" : "tripSegment.outletType")}</Text></View>
          <Text style={styles.resultTitle}>{result.title}</Text><Text style={styles.resultSubtitle}>{result.subtitle}</Text>
        </TouchableOpacity>)}
      </>}
      {routeSelected && !isEditingRoute && <View style={styles.summaryCard}>
        <View style={styles.summaryCopy}>
          <Text style={styles.typePill}>{t(segment.outletId ? "tripSegment.outletType" : "tripSegment.cityType")}</Text>
          <Text style={styles.summaryTitle}>{selectedTitle}</Text>
          {!!selectedSubtitle && <Text style={styles.resultSubtitle}>{selectedSubtitle}</Text>}
        </View>
        <TouchableOpacity style={styles.changeButton} onPress={editRouteSelection}><Text style={styles.changeButtonText}>{t("tripSegment.changeRoute")}</Text></TouchableOpacity>
      </View>}
      {routeSelected && !isEditingRoute && <>
        <View style={styles.dateRow}><TouchableOpacity style={styles.dateBox} onPress={() => setPickerTarget("start")}><Text style={styles.label}>{t("tripSegment.startDate")}</Text><Text style={styles.inputText}>{segment.startDate}</Text></TouchableOpacity><TouchableOpacity style={styles.dateBox} onPress={() => setPickerTarget("end")}><Text style={styles.label}>{t("tripSegment.endDate")}</Text><Text style={styles.inputText}>{segment.endDate}</Text></TouchableOpacity></View>
        <TextInput style={[styles.input, styles.notesInput]} placeholder={t("tripSegment.notes")} value={notes} onChangeText={setNotes} multiline placeholderTextColor="#8A8A8A" />
        {pickerTarget && <View style={styles.pickerCard}><DateTimePicker value={parseDate(pickerTarget === "start" ? segment.startDate : segment.endDate)} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(_, date) => { if (date) setSegment((value) => ({ ...value, [pickerTarget === "start" ? "startDate" : "endDate"]: formatDate(date) })); if (Platform.OS !== "ios") setPickerTarget(null); }} />{Platform.OS === "ios" && <TouchableOpacity style={styles.doneButton} onPress={() => setPickerTarget(null)}><Text style={styles.doneButtonText}>{t("createTrip.done")}</Text></TouchableOpacity>}</View>}
        <TouchableOpacity style={[styles.primaryButton, saving && styles.disabledButton]} onPress={save} disabled={saving}><Text style={styles.primaryButtonText}>{t("tripSegment.saveRoute")}</Text></TouchableOpacity>
      </>}
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20 }, centerState: { flex: 1, alignItems: "center", justifyContent: "center" }, card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB" }, sectionTitle: { color: "#0B1F3A", fontSize: 22, fontWeight: "900", marginBottom: 12 }, label: { color: "#0B1F3A", fontWeight: "900", marginBottom: 8 }, input: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", color: "#0B1F3A", fontWeight: "700", marginBottom: 12 }, resultRow: { backgroundColor: "#F7F8FA", borderRadius: 14, padding: 12, marginBottom: 8 }, resultHeader: { flexDirection: "row", marginBottom: 6 }, typePill: { alignSelf: "flex-start", backgroundColor: "#F2E8BF", borderRadius: 999, color: "#7A5D00", fontSize: 11, fontWeight: "900", letterSpacing: 0.5, paddingHorizontal: 9, paddingVertical: 4, textTransform: "uppercase" }, resultTitle: { color: "#0B1F3A", fontWeight: "900" }, resultSubtitle: { color: "#666", marginTop: 4 }, summaryCard: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", gap: 12, alignItems: "center" }, summaryCopy: { flex: 1 }, summaryTitle: { color: "#0B1F3A", fontSize: 17, fontWeight: "900", marginTop: 8 }, changeButton: { backgroundColor: "#0B1F3A", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }, changeButtonText: { color: "#FFFFFF", fontWeight: "900" }, dateRow: { flexDirection: "row", gap: 10 }, dateBox: { flex: 1, backgroundColor: "#F7F8FA", borderRadius: 16, padding: 14, marginBottom: 12 }, inputText: { color: "#0B1F3A", fontWeight: "900" }, notesInput: { minHeight: 96, textAlignVertical: "top" }, pickerCard: { marginBottom: 12 }, doneButton: { backgroundColor: "#0B1F3A", borderRadius: 16, padding: 14 }, doneButtonText: { color: "#fff", fontWeight: "900", textAlign: "center" }, primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17 }, primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, disabledButton: { opacity: 0.65 }, emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900" } });
