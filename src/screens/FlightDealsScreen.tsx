import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { heroAssets } from "../media/heroAssets";
import {
  FlightDealAirportRegion,
  supportedFlightDealAirports,
  SupportedFlightDealAirport,
} from "../constants/flightDealAirports";
import { useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../utils/locationDisplay";
import {
  deleteFlightDealAlert,
  FLIGHT_DEAL_THRESHOLDS,
  FlightDealAlertPreference,
  FlightDealThreshold,
  listFlightDealAlerts,
  saveFlightDealAlert,
} from "../services/flightDealAlertService";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

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
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const { isLoggedIn, currentUser } = useUser();
  const { trips } = useTrips();
  const insets = useSafeAreaInsets();
  const [selectedOrigin, setSelectedOrigin] =
    useState<SupportedFlightDealAirport | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<SupportedFlightDealAirport | null>(null);
  const [selectedThresholds, setSelectedThresholds] = useState<
    FlightDealThreshold[]
  >([15]);
  const [active, setActive] = useState(true);
  const [savedAlerts, setSavedAlerts] = useState<FlightDealAlertPreference[]>(
    [],
  );
  const [saving, setSaving] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [filterText, setFilterText] = useState("");
  const [selectorFilter, setSelectorFilter] =
    useState<FlightDealSelectorFilter>("popular");

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

  useEffect(() => {
    if (!currentUser?.userId) {
      setSavedAlerts([]);
      return;
    }
    listFlightDealAlerts(currentUser.userId)
      .then(setSavedAlerts)
      .catch(() => setSavedAlerts([]));
  }, [currentUser?.userId]);

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

  async function refreshAlerts(userId: string) {
    setSavedAlerts(await listFlightDealAlerts(userId));
  }

  async function handleSaveAlert() {
    if (!currentUser?.userId) {
      navigation.navigate("Login", {
        authMessage: t("flightDeals.signInPrompt"),
      });
      return;
    }
    if (!selectedOrigin) {
      Alert.alert(t("flightDeals.selectOriginRequired"));
      return;
    }
    if (!selectedDestination) {
      Alert.alert(t("flightDeals.selectDestinationRequired"));
      return;
    }
    if (selectedThresholds.length === 0) {
      Alert.alert(t("flightDeals.thresholdRequired"));
      return;
    }

    const alertId =
      `${selectedOrigin.airportCode}_${selectedDestination.airportCode}`
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "");
    const payload = {
      alertId,
      originLabel: `${selectedOrigin.cityName} (${selectedOrigin.airportCode})`,
      originAirportCode: selectedOrigin.airportCode,
      originAirportName: selectedOrigin.airportName,
      originCityName: selectedOrigin.cityName,
      originCountryCode: selectedOrigin.countryCode,
      originCountryName: selectedOrigin.countryName,
      destinationType: "airport" as const,
      destinationKey: selectedDestination.airportCode,
      destinationAirportCode: selectedDestination.airportCode,
      destinationAirportName: selectedDestination.airportName,
      destinationCityName: selectedDestination.cityName,
      destinationCountryCode: selectedDestination.countryCode,
      destinationCountryName: selectedDestination.countryName,
      destinationLabel: `${selectedDestination.cityName} (${selectedDestination.airportCode})`,
      selectedThresholds,
      active,
    };

    setSaving(true);
    try {
      await saveFlightDealAlert(currentUser.userId, payload);
      await refreshAlerts(currentUser.userId);
      Alert.alert(t("flightDeals.saved"));
    } catch (error) {
      if (__DEV__) {
        const safeError = error as { code?: string; message?: string };
        console.warn("Flight deal alert save failed", {
          code: safeError?.code,
          message: safeError?.message,
          hasUserId: Boolean(currentUser.userId),
          alertId,
          originAirportCode: payload.originAirportCode,
          destinationAirportCode: payload.destinationAirportCode,
          selectedThresholds: payload.selectedThresholds,
          payloadKeys: Object.keys(payload),
        });
      }
      Alert.alert(t("flightDeals.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAlert(alertId: string) {
    if (!currentUser?.userId) return;
    await deleteFlightDealAlert(currentUser.userId, alertId);
    setSavedAlerts((current) =>
      current.filter((alert) => alert.alertId !== alertId),
    );
  }

  const localizedOriginLabel = (item: SupportedFlightDealAirport) =>
    `${formatCityDisplayName(item.cityName, language)} (${item.airportCode})`;
  const localizedSavedOriginLabel = (item: {
    originCityName?: string;
    originAirportCode?: string;
    originLabel: string;
  }) =>
    item.originCityName && item.originAirportCode
      ? `${formatCityDisplayName(item.originCityName, language)} (${item.originAirportCode})`
      : item.originLabel;
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
  const localizedSavedDestinationLabel = (item: FlightDealAlertPreference) => {
    if (item.destinationAirportCode) {
      return `${formatCityDisplayName(item.destinationCityName, language)} (${item.destinationAirportCode})`;
    }
    const legacyCodes = item.destinationAirportCodes?.join(" / ");
    return legacyCodes
      ? `${formatCityDisplayName(item.destinationCityName, language)} (${legacyCodes})`
      : item.destinationLabel ||
          formatCityDisplayName(item.destinationCityName, language);
  };

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

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: getScreenTopInset(insets.top),
            paddingBottom: getFloatingTabClearance(insets.bottom),
          },
        ]}
        scrollIndicatorInsets={{
          bottom: getScrollIndicatorBottomInset(insets.bottom),
        }}
      >
        <LocalHeroImageCard imageSource={heroAssets.flightDeals} style={styles.heroCard} contentStyle={styles.heroInner}>
          <Text style={styles.title}>{t("flightDeals.title")}</Text>
          <Text style={styles.subtitle}>{t("flightDeals.subtitle")}</Text>
        </LocalHeroImageCard>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("flightDeals.saveAlert")}</Text>
          <Text style={styles.providerText}>
            {t("flightDeals.providerPending")}
          </Text>
          {!isLoggedIn ? (
            <Text style={styles.guestText}>
              {t("flightDeals.signInPrompt")}
            </Text>
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
          <Text style={styles.label}>{t("flightDeals.threshold")}</Text>
          <View style={styles.thresholdRow}>
            {FLIGHT_DEAL_THRESHOLDS.map((threshold) => (
              <TouchableOpacity
                key={threshold}
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
          <View style={styles.switchRow}>
            <Text style={styles.label}>
              {active
                ? t("flightDeals.alertActive")
                : t("flightDeals.alertInactive")}
            </Text>
            <Switch value={active} onValueChange={setActive} />
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveAlert}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {t("flightDeals.saveAlert")}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t("flightDeals.savedAlerts")}
          </Text>
          {savedAlerts.length > 0 ? (
            savedAlerts.map((alert) => (
              <View key={alert.alertId} style={styles.savedAlertRow}>
                <View style={styles.savedAlertText}>
                  <Text style={styles.detailValue}>
                    {localizedSavedOriginLabel(alert)} →{" "}
                    {localizedSavedDestinationLabel(alert)}
                  </Text>
                  <Text style={styles.reminderMeta}>
                    {alert.selectedThresholds
                      .map((threshold) =>
                        t(`flightDeals.threshold${threshold}`),
                      )
                      .join(", ")}{" "}
                    ·{" "}
                    {alert.active
                      ? t("flightDeals.alertActive")
                      : t("flightDeals.alertInactive")}
                  </Text>
                  <Text style={styles.pendingBadge}>
                    {t("flightDeals.providerPendingBadge")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteAlert(alert.alertId)}
                >
                  <Text style={styles.deleteText}>
                    {t("flightDeals.deleteAlert")}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {t("flightDeals.noDealsYet")}
              </Text>
              <Text style={styles.reminderMeta}>
                {t("flightDeals.noFakeDeals")}
              </Text>
            </View>
          )}
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
                    {[row.leg.departureDate, row.leg.departureTime]
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
                  style={styles.input}
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
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20 },
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
    marginRight: 8,
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
});
