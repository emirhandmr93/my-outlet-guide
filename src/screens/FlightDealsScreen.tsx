import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
  Pressable,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { heroAssets } from "../media/heroAssets";
import type { FlightDealAirportRegion, SupportedFlightDealAirport } from "../constants/flightDealAirports";
import { useFlightAirportData } from "../hooks/useDetailData";
import { useTrips } from "../contexts/TripsContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { NativeDirectionRoot, useLayoutDirection } from "../hooks/useLayoutDirection";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../utils/locationDisplay";
import {
  deleteFlightDealAlert,
  FLIGHT_DEAL_THRESHOLDS,
  FlightDealThreshold,
  FlightDealTripClass,
  FlightDealTripType,
  listAllFlightDealAlerts,
  RollingRouteFlightDealAlertPreference,
  saveRollingRouteFlightDealAlert,
  setFlightDealAlertActive,
  StoredFlightDealAlertPreference,
} from "../services/flightDealAlertService";
import { FLIGHT_PRICE_MONITORING_PUBLICLY_VERIFIED } from "../constants/flightDealsAvailability";
import { submitRollingRouteFlightDealAlert } from "../services/flightDealAlertSubmission";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";
import { formatIsoDateOnly } from "../utils/dateOnly";
import { trackProductEvent } from "../utils/productAnalytics";

type PickerMode = "origin" | "destination" | null;
type FlightDealSelectorFilter = "popular" | FlightDealAirportRegion;
const MAX_SELECTOR_RESULTS = 50;
const SELECTOR_FILTERS: FlightDealSelectorFilter[] = [
  "popular",
  "TR",
  "EUROPE",
  "MIDDLE_EAST",
  "ASIA",
  "AMERICAS",
];

export function FlightDealsScreen() {
  const airportData = useFlightAirportData();
  const supportedFlightDealAirports = airportData.data ?? [];
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const { trips } = useTrips();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const [selectedOrigin, setSelectedOrigin] =
    useState<SupportedFlightDealAirport | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<SupportedFlightDealAirport | null>(null);
  const [selectedThresholds, setSelectedThresholds] = useState<
    FlightDealThreshold[]
  >([15]);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [filterText, setFilterText] = useState("");
  const [selectorFilter, setSelectorFilter] =
    useState<FlightDealSelectorFilter>("popular");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSavingAlert, setIsSavingAlert] = useState(false);
  const [tripType, setTripType] = useState<FlightDealTripType>("round_trip");
  const [tripClass, setTripClass] = useState<FlightDealTripClass>("economy");
  const [directOnly, setDirectOnly] = useState(false);
  const [savedAlerts, setSavedAlerts] = useState<StoredFlightDealAlertPreference[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsLoadFailed, setAlertsLoadFailed] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string>();
  const [busyAlertId, setBusyAlertId] = useState<string>();
  const scrollRef = useRef<ScrollView>(null);

  const loadAlerts = useCallback(async () => {
    if (!currentUser?.uid) { setSavedAlerts([]); return; }
    setAlertsLoading(true); setAlertsLoadFailed(false);
    try { setSavedAlerts(await listAllFlightDealAlerts(currentUser.uid)); }
    catch { setAlertsLoadFailed(true); }
    finally { setAlertsLoading(false); }
  }, [currentUser?.uid]);
  useEffect(() => { void loadAlerts(); }, [loadAlerts]);

  function resetForm() { setSelectedOrigin(null); setSelectedDestination(null); setTripType("round_trip"); setTripClass("economy"); setDirectOnly(false); setSelectedThresholds([15]); setEditingAlertId(undefined); }
  function editAlert(alert: RollingRouteFlightDealAlertPreference) { setSelectedOrigin(supportedFlightDealAirports.find(item => item.airportCode === alert.originAirportCode) ?? null); setSelectedDestination(supportedFlightDealAirports.find(item => item.airportCode === alert.destinationAirportCode) ?? null); setTripType(alert.tripType); setTripClass(alert.tripClass); setDirectOnly(alert.directOnly); setSelectedThresholds(alert.selectedThresholds); setEditingAlertId(alert.alertId); setSaveFeedback(null); scrollRef.current?.scrollTo({ y: 190, animated: true }); }
  async function toggleAlert(alert: StoredFlightDealAlertPreference) { if (!currentUser || busyAlertId) return; setBusyAlertId(alert.alertId); try { await setFlightDealAlertActive(currentUser.uid, alert.alertId, !alert.active); await loadAlerts(); } catch { Alert.alert(t("flightDeals.toggleFailedTitle"), t("flightDeals.toggleFailedBody")); } finally { setBusyAlertId(undefined); } }
  function confirmDelete(alert: StoredFlightDealAlertPreference) { Alert.alert(t("flightDeals.deleteConfirmTitle"), t("flightDeals.deleteConfirmBody"), [{ text: t("flightDeals.cancel"), style: "cancel" }, { text: t("flightDeals.deleteAlert"), style: "destructive", onPress: async () => { if (!currentUser || busyAlertId) return; setBusyAlertId(alert.alertId); try { await deleteFlightDealAlert(currentUser.uid, alert.alertId); if (editingAlertId === alert.alertId) resetForm(); await loadAlerts(); } catch { Alert.alert(t("flightDeals.deleteFailedTitle"), t("flightDeals.deleteFailedBody")); } finally { setBusyAlertId(undefined); } } }]); }

  const flightRows = trips.flatMap((trip) =>
    [
      trip.flightDetails?.return?.departureDate &&
      trip.flightDetails?.return?.departureTime
        ? {
            trip,
            leg: trip.flightDetails.return,
            label: t("flightAlerts.returnFlight"),
            type: "returnFlight",
          }
        : null,
    ].filter(Boolean),
  );

  function toggleThreshold(threshold: FlightDealThreshold) {
    setSelectedThresholds((current) =>
      current.includes(threshold)
        ? current.filter((item) => item !== threshold)
        : [...current, threshold],
    );
  }

  function openPicker(mode: Exclude<PickerMode, null>) {
    setPickerMode(mode);
    setFilterText("");
    setSelectorFilter("popular");
  }

  async function handleSaveAlert() {
    if (isSavingAlert) return;
    const isCreatingAlert = !editingAlertId;
    setIsSavingAlert(true); setSaveFeedback(null);
    const result = await submitRollingRouteFlightDealAlert({ monitoringPubliclyVerified: FLIGHT_PRICE_MONITORING_PUBLICLY_VERIFIED, userId: currentUser?.uid, origin: selectedOrigin, destination: selectedDestination, thresholds: selectedThresholds, tripType, tripClass, directOnly, previousAlertId: editingAlertId, active: editingAlertId ? savedAlerts.find(item => item.schemaVersion === 3 && item.alertId === editingAlertId)?.active : true, save: saveRollingRouteFlightDealAlert });
    setIsSavingAlert(false);
    if (result.status === "saved" || result.status === "saved_pending_provider") { const pending = result.status === "saved_pending_provider"; const title = editingAlertId ? t("flightDeals.updatedTitle") : pending ? t("flightDeals.savedPendingTitle") : t("flightDeals.saveSuccessTitle"); const message = editingAlertId ? t("flightDeals.updatedBody") : pending ? t("flightDeals.savedPendingBody") : t("flightDeals.saveSuccess"); if (isCreatingAlert && selectedOrigin && selectedDestination) trackProductEvent("flight_alert_create", { origin_airport: selectedOrigin.airportCode, destination_airport: selectedDestination.airportCode, trip_type: tripType, cabin: tripClass, discount_threshold: selectedThresholds.join(","), direct_only: directOnly }); setSaveFeedback(message); Alert.alert(title, message); resetForm(); await loadAlerts(); return; }
    if (result.status === "sign_in_required") { setSaveFeedback(t("flightDeals.signInRequired")); navigation.navigate("Login"); return; }
    const key: Record<string, string> = { origin_required: "originRequired", destination_required: "destinationRequired", same_airport_error: "sameAirportError", trip_type_error: "tripTypeError", trip_class_error: "tripClassError", direct_only_error: "directOnlyError", threshold_required: "thresholdRequired", save_failed: "saveFailed" };
    const message = t(`flightDeals.${key[result.status] ?? result.status}`); setSaveFeedback(message); Alert.alert(t("flightDeals.saveErrorTitle"), message);
  }

  const localizedOriginLabel = (item: SupportedFlightDealAirport) =>
    `${formatCityDisplayName(item.cityName, language)} (${item.airportCode})`;
  const localizedDestinationCity = (item: {
    destinationCityName?: string;
    cityName?: string;
  }) =>
    formatCityDisplayName(
      item.destinationCityName || item.cityName || "",
      language,
    );
  const localizedDestinationCountry = (item: {
    destinationCountryName?: string;
    destinationCountryCode?: string;
    countryName?: string;
    countryCode?: string;
  }) =>
    formatCountryDisplayName(
      item.destinationCountryName ||
        item.countryName ||
        item.destinationCountryCode ||
        item.countryCode ||
        "",
      language,
    );

  const localizedAirportLabel = (item: SupportedFlightDealAirport) =>
    `${formatCityDisplayName(item.cityName, language)} (${item.airportCode})`;

  const normalizedFilter = filterText.trim().toLowerCase();
  const getFilterLabel = (filter: FlightDealSelectorFilter) =>
    filter === "popular"
      ? t("flightDeals.filterPopular")
      : filter === "TR"
        ? t("flightDeals.filterTurkey")
        : filter === "EUROPE"
          ? t("flightDeals.filterEurope")
          : filter === "MIDDLE_EAST"
            ? t("flightDeals.filterMiddleEast")
            : filter === "ASIA"
              ? t("flightDeals.filterAsia")
              : t("flightDeals.filterAmericas");
  const sortPopularFirst = <T extends { popular?: boolean }>(items: T[]) =>
    [...items].sort(
      (a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)),
    );
  const originOptions = sortPopularFirst(
    supportedFlightDealAirports.filter((item) => {
      const matchesFilter =
        selectorFilter === "popular"
          ? item.popular
          : item.region === selectorFilter;
      const matchesSearch =
        !normalizedFilter ||
        `${item.cityName} ${formatCityDisplayName(item.cityName, language)} ${item.countryName} ${item.airportName} ${item.airportCode} ${(item.searchAliases || []).join(" ")}`
          .toLowerCase()
          .includes(normalizedFilter);
      return matchesFilter && matchesSearch;
    }),
  ).slice(0, MAX_SELECTOR_RESULTS);
  const filteredDestinationOptions = sortPopularFirst(
    supportedFlightDealAirports.filter((item) => {
      const matchesFilter =
        selectorFilter === "popular"
          ? item.popular
          : item.region === selectorFilter;
      const matchesSearch =
        !normalizedFilter ||
        `${item.cityName} ${formatCityDisplayName(item.cityName, language)} ${item.countryName} ${formatCountryDisplayName(item.countryName, language)} ${item.airportName} ${item.airportCode} ${(item.searchAliases || []).join(" ")}`
          .toLowerCase()
          .includes(normalizedFilter);
      return matchesFilter && matchesSearch;
    }),
  ).slice(0, MAX_SELECTOR_RESULTS);

  if (airportData.loading) return <View style={styles.container}><Text>{t("common.loading")}</Text></View>;
  if (airportData.error) return <View style={styles.container}><Text>{t("trips.loadFailedTitle")}</Text><TouchableOpacity onPress={airportData.retry}><Text>{t("flightDealDetail.retry")}</Text></TouchableOpacity></View>;
  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isDesktopWeb && styles.desktopContent,
          {
            paddingTop: isDesktopWeb ? 32 : getScreenTopInset(insets.top),
            paddingBottom: isDesktopWeb ? 32 : getFloatingTabClearance(insets.bottom),
          },
        ]}
        scrollIndicatorInsets={{
          bottom: getScrollIndicatorBottomInset(insets.bottom),
        }}
      >
        <LocalHeroImageCard imageSource={heroAssets.flightDeals} responsiveWeb style={styles.heroCard} contentStyle={styles.heroInner}>
          <Text style={styles.title}>{t("flightDeals.title")}</Text>
          <Text style={styles.subtitle}>{t("flightDeals.subtitle")}</Text>
        </LocalHeroImageCard>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("flightDeals.saveAlert")}</Text>
          <Text style={styles.rollingExplanation}>{t("flightDeals.rollingExplanation")}</Text>
          {!FLIGHT_PRICE_MONITORING_PUBLICLY_VERIFIED ? (
            <Text style={styles.providerText}>{t("flightDeals.providerPending")}</Text>
          ) : null}
          <Text style={styles.label}>{t("flightDeals.origin")}</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => openPicker("origin")}
          >
            <Text style={styles.selectorTitle}>
              {selectedOrigin
                ? localizedOriginLabel(selectedOrigin)
                : t("flightDeals.selectOriginAirport")}
            </Text>
            {selectedOrigin ? (
              <Text style={styles.selectorMeta}>
                {selectedOrigin.airportName}
              </Text>
            ) : null}
          </TouchableOpacity>
          <Text style={styles.label}>{t("flightDeals.destination")}</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => openPicker("destination")}
          >
            <Text style={styles.selectorTitle}>
              {selectedDestination
                ? localizedAirportLabel(selectedDestination)
                : t("flightDeals.selectDestinationAirport")}
            </Text>
            {selectedDestination ? (
              <Text style={styles.selectorMeta}>
                {selectedDestination.airportName} ·{" "}
                {localizedDestinationCountry(selectedDestination)}
              </Text>
            ) : null}
          </TouchableOpacity>
          <Text style={styles.label}>{t("flightSearch.tripType")}</Text>
          <View style={[styles.segment, isNativeRTL && styles.rowReverse]}>{(["round_trip", "one_way"] as FlightDealTripType[]).map(value => <Segment key={value} selected={tripType === value} label={t(`flightSearch.${value === "round_trip" ? "roundTrip" : "oneWay"}`)} onPress={() => setTripType(value)} />)}</View>
          <Text style={styles.label}>{t("flightSearch.cabinClass")}</Text><View style={[styles.segment, isNativeRTL && styles.rowReverse]}>{(["economy", "business"] as FlightDealTripClass[]).map(value => <Segment key={value} selected={tripClass === value} label={t(`flightSearch.${value}`)} onPress={() => setTripClass(value)} />)}</View>
          <View style={[styles.switchRow, isNativeRTL && styles.rowReverse]}><View style={styles.switchCopy}><Text style={styles.label}>{t("flightDeals.directOnly")}</Text><Text style={styles.selectorMeta}>{t("flightDeals.directOnlyHint")}</Text></View><Switch accessibilityLabel={t("flightDeals.directOnly")} value={directOnly} onValueChange={setDirectOnly} /></View>
          <Text style={styles.label}>{t("flightDeals.threshold")}</Text>
          <View style={styles.thresholdRow}>
            {FLIGHT_DEAL_THRESHOLDS.map((threshold) => (
              <TouchableOpacity
                key={threshold}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedThresholds.includes(threshold) }}
                style={[
                  styles.thresholdButton,
                  selectedThresholds.includes(threshold) &&
                    styles.thresholdButtonActive,
                ]}
                onPress={() => toggleThreshold(threshold)}
              >
                <Text
                  style={[
                    styles.thresholdText,
                    selectedThresholds.includes(threshold) &&
                      styles.thresholdTextActive,
                  ]}
                >
                  {t(`flightDeals.threshold${threshold}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: isSavingAlert }}
            style={[styles.primaryButton, isSavingAlert && styles.disabledButton]}
            disabled={isSavingAlert}
            onPress={handleSaveAlert}
          >
            <Text style={styles.primaryButtonText}>
              {isSavingAlert ? t("flightDeals.saving") : editingAlertId ? t("flightDeals.updateAlert") : t("flightDeals.saveAlert")}
            </Text>
          </TouchableOpacity>
          {editingAlertId ? <TouchableOpacity accessibilityRole="button" onPress={resetForm}><Text style={styles.cancelEditing}>{t("flightDeals.cancelEditing")}</Text></TouchableOpacity> : null}
          {saveFeedback ? <Text style={styles.providerText}>{saveFeedback}</Text> : null}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t("flightDeals.savedAlerts")}
          </Text>
          {alertsLoading ? <Text style={styles.providerText}>{t("flightDeals.savedAlertsLoading")}</Text> : alertsLoadFailed ? <Text style={styles.errorText}>{t("flightDeals.savedAlertsLoadFailed")}</Text> : savedAlerts.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{t("flightDeals.savedAlertsEmptyRolling")}</Text></View> : savedAlerts.map(alert => (
            <View key={alert.alertId} style={styles.savedCard}>
              <Text style={styles.savedRoute}>{alert.originAirportCode} → {alert.destinationAirportCode}</Text>
              {alert.schemaVersion === 3 ? (
                <>
                  <Text style={styles.savedMeta}>{t(`flightSearch.${alert.tripType === "round_trip" ? "roundTrip" : "oneWay"}`)} · {t(`flightSearch.${alert.tripClass}`)}</Text>
                  <Text style={styles.savedMeta}>{t(alert.directOnly ? "flightDeals.directFlights" : "flightDeals.anyFlights")} · {alert.selectedThresholds.map(value => `${value}%`).join(" · ")}</Text>
                  <Text style={styles.pendingBadge}>{t(alert.active ? "flightDeals.activeStatus" : "flightDeals.pausedStatus")} · {t("flightDeals.rollingMonitoringStatus")}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.legacyBadge}>{t("flightDeals.legacyDatedAlert")}</Text>
                  <Text style={styles.savedMeta}>{t(`flightSearch.${alert.tripType === "round_trip" ? "roundTrip" : "oneWay"}`)} · {formatIsoDateOnly(alert.departDate)}{alert.returnDate ? ` → ${formatIsoDateOnly(alert.returnDate)}` : ""}</Text>
                  <Text style={styles.savedMeta}>{t("flightDeals.passengerSummary")}: {alert.adults} {t("flightSearch.adults")}, {alert.children} {t("flightSearch.children")}, {alert.infants} {t("flightSearch.infants")}</Text>
                  <Text style={styles.savedMeta}>{t(`flightSearch.${alert.tripClass}`)} · {t(alert.directOnly ? "flightDeals.directFlights" : "flightDeals.anyFlights")} · {alert.selectedThresholds.map(value => `${value}%`).join(" · ")}</Text>
                  <Text style={styles.legacyExplanation}>{t("flightDeals.legacyAlertExplanation")}</Text>
                  <Text style={styles.pendingBadge}>{t(alert.active ? "flightDeals.activeStatus" : "flightDeals.pausedStatus")}</Text>
                </>
              )}
              <View style={[styles.actionRow, isNativeRTL && styles.rowReverse]}>
                {alert.schemaVersion === 3 ? <ActionButton label={t("flightDeals.editAlert")} disabled={Boolean(busyAlertId)} onPress={() => editAlert(alert)} /> : null}
                <ActionButton label={t(alert.active ? "flightDeals.pauseAlert" : "flightDeals.activateAlert")} disabled={Boolean(busyAlertId)} onPress={() => void toggleAlert(alert)} />
                <ActionButton label={t("flightDeals.deleteAlert")} destructive disabled={Boolean(busyAlertId)} onPress={() => confirmDelete(alert)} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t("flightDeals.tripReminders")}
          </Text>
          {flightRows.length > 0 ? (
            flightRows.map((row: any) => {
              const reminder = row.trip.reminderPlan.find(
                (item: any) => item.type === row.type,
              );
              const route = [row.leg.departureAirport, row.leg.arrivalAirport]
                .filter(Boolean)
                .join(" → ");
              const flightName = [row.leg.airline, row.leg.flightNumber]
                .filter(Boolean)
                .join(" ");
              return (
                <TouchableOpacity
                  key={`${row.trip.id}-${row.type}`}
                  style={styles.reminderCard}
                  activeOpacity={0.86}
                  onPress={() =>
                    navigation.navigate("TripDetail", { tripId: row.trip.id })
                  }
                >
                  <Text style={styles.detailLabel}>
                    {row.trip.tripName} · {row.label}
                  </Text>
                  {flightName ? (
                    <Text style={styles.detailValue}>{flightName}</Text>
                  ) : null}
                  {route ? (
                    <Text style={styles.detailValue}>{route}</Text>
                  ) : null}
                  <Text style={styles.detailValue}>
                    {[formatIsoDateOnly(row.leg.departureDate), row.leg.departureTime]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                  {reminder ? (
                    <Text style={styles.reminderMeta}>
                      {t("flightAlerts.reminderReady")}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {t("flightAlerts.emptyState")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal visible={pickerMode !== null} animationType="slide" transparent>
        <NativeDirectionRoot>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <View
              style={[styles.modalCard, { paddingBottom: insets.bottom + 12 }]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.sectionTitle}>
                  {pickerMode === "origin"
                    ? t("flightDeals.selectOriginAirport")
                    : t("flightDeals.selectDestinationAirport")}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.filterRow}
                >
                  {SELECTOR_FILTERS.map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterChip,
                        selectorFilter === filter && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectorFilter(filter)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectorFilter === filter &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {getFilterLabel(filter)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  value={filterText}
                  onChangeText={setFilterText}
                  placeholder={
                    pickerMode === "origin"
                      ? t("flightDeals.airportSearchPlaceholder")
                      : t("flightDeals.destinationSearchPlaceholder")
                  }
                  placeholderTextColor="#94A3B8"
                  style={[styles.input, Platform.OS === "web" && styles.inputWeb, isNativeRTL && styles.proseInputRTL]}
                />
              </View>
              {pickerMode === "origin" ? (
                <FlatList
                  data={originOptions}
                  keyExtractor={(item) => item.airportCode}
                  keyboardShouldPersistTaps="handled"
                  style={styles.optionList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        selectedOrigin?.airportCode === item.airportCode &&
                          styles.optionSelected,
                      ]}
                      onPress={() => {
                        setSelectedOrigin(item);
                        setPickerMode(null);
                      }}
                    >
                      <Text style={styles.selectorTitle}>
                        {formatCityDisplayName(item.cityName, language)} ·{" "}
                        {item.airportCode}
                      </Text>
                      <Text style={styles.selectorMeta}>
                        {item.airportName} ·{" "}
                        {formatCountryDisplayName(item.countryName, language)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <FlatList
                  data={filteredDestinationOptions}
                  keyExtractor={(item) => item.airportCode}
                  keyboardShouldPersistTaps="handled"
                  style={styles.optionList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionRow,
                        selectedDestination?.airportCode === item.airportCode &&
                          styles.optionSelected,
                      ]}
                      onPress={() => {
                        setSelectedDestination(item);
                        setPickerMode(null);
                      }}
                    >
                      <Text style={styles.selectorTitle}>
                        {localizedAirportLabel(item)}
                      </Text>
                      <Text style={styles.selectorMeta}>
                        {item.airportName} · {localizedDestinationCountry(item)}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setPickerMode(null)}>
                  <Text style={styles.deleteText}>
                    {t("flightDeals.cancel")}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.selectorMeta}>
                  {t("flightDeals.select")}
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
              </NativeDirectionRoot>
      </Modal>
    </>
  );
}

function Segment({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} style={[styles.segmentButton, selected && styles.segmentActive]}><Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{label}</Text></Pressable>; }
function ActionButton({ label, onPress, disabled, destructive = false }: { label: string; onPress: () => void; disabled: boolean; destructive?: boolean }) { return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.actionButton, disabled && styles.disabledButton]}><Text style={destructive ? styles.deleteText : styles.actionText}>{label}</Text></TouchableOpacity>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20 },
  desktopContent: { width: "100%", maxWidth: 1180, alignSelf: "center", paddingHorizontal: 34 },
  heroCard: { marginBottom: 16 },
  heroInner: { padding: 24 },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
    textAlign: "center",
  },
  subtitle: {
    color: "#D8DEE9",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#0B1F3A",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },
  providerText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 12,
  },
  rollingExplanation: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  guestText: {
    color: "#8A6B10",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
  label: { color: "#0B1F3A", fontSize: 13, fontWeight: "900", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    color: "#0B1F3A",
    fontWeight: "700",
  },
  inputWeb: { fontSize: 16 },
  selectorButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#F8FAFC",
  },
  selectorTitle: { color: "#0B1F3A", fontSize: 16, fontWeight: "900" },
  selectorMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  thresholdRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  thresholdButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  thresholdButtonActive: { backgroundColor: "#0B1F3A", borderColor: "#0B1F3A" },
  thresholdText: { color: "#0B1F3A", fontWeight: "900" },
  thresholdTextActive: { color: "#FFFFFF" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#C9A227",
    borderRadius: 20,
    padding: 17,
    marginTop: 4,
  },
  disabledButton: { opacity: 0.55 },
  primaryButtonText: {
    color: "#0B1F3A",
    fontWeight: "900",
    textAlign: "center",
  },
  savedAlertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
    paddingVertical: 12,
    gap: 12,
  },
  savedAlertText: { flex: 1 },
  deleteText: { color: "#B91C1C", fontWeight: "900" },
  pendingBadge: {
    alignSelf: "flex-start",
    color: "#0B1F3A",
    backgroundColor: "#E0F2FE",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },
  reminderCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  detailLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
  },
  detailValue: {
    color: "#0B1F3A",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
  },
  reminderMeta: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11,31,58,0.45)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    height: "82%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
  },
  modalHeader: {
    backgroundColor: "#FFFFFF",
  },
  filterRow: { gap: 8, paddingBottom: 12 },
  filterChip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginEnd: 8,
  },
  filterChipActive: { backgroundColor: "#0B1F3A", borderColor: "#0B1F3A" },
  filterChipText: { color: "#0B1F3A", fontWeight: "900", fontSize: 12 },
  filterChipTextActive: { color: "#FFFFFF" },
  optionList: { flex: 1 },
  optionRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  optionSelected: { backgroundColor: "#FEF3C7" },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  proseInputRTL: { textAlign: "right", writingDirection: "rtl" },
  segment: { flexDirection: "row", padding: 4, borderRadius: 14, backgroundColor: "#F1F5F9", gap: 4, marginBottom: 14, width: "100%" }, rowReverse: { flexDirection: "row-reverse" }, segmentButton: { flex: 1, minWidth: 0, paddingVertical: 11, paddingHorizontal: 4, alignItems: "center", borderRadius: 11 }, segmentActive: { backgroundColor: "#0B1F3A" }, segmentText: { color: "#475569", fontWeight: "800", textAlign: "center" }, segmentTextActive: { color: "#FFFFFF" }, switchCopy: { flex: 1, paddingEnd: 12 }, cancelEditing: { color: "#0B1F3A", textAlign: "center", fontWeight: "900", padding: 12 }, savedCard: { backgroundColor: "#F8FAFC", borderRadius: 18, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10 }, savedRoute: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" }, savedMeta: { color: "#475569", fontSize: 13, fontWeight: "700", marginTop: 5, lineHeight: 19 }, legacyBadge: { alignSelf: "flex-start", color: "#7C2D12", backgroundColor: "#FFEDD5", borderRadius: 999, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: "900", marginTop: 8 }, legacyExplanation: { color: "#64748B", fontSize: 12, lineHeight: 18, marginTop: 8 }, actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, actionButton: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, minHeight: 42, justifyContent: "center" }, actionText: { color: "#0B1F3A", fontWeight: "900" }, errorText: { color: "#B91C1C", fontWeight: "800" },
});
