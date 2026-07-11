import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  supportedFlightDealAirports,
  SupportedFlightDealAirport,
} from "../constants/flightDealAirports";
import { useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  deleteFlightDealAlert,
  FLIGHT_DEAL_THRESHOLDS,
  FlightDealAlertPreference,
  FlightDealThreshold,
  listFlightDealAlerts,
  saveFlightDealAlert,
} from "../services/flightDealAlertService";
import {
  FlightDealDestinationOption,
  getFlightDealDestinationOptions,
} from "../services/flightDealDestinationOptions";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

type PickerMode = "origin" | "destination" | null;

export function FlightDealsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { isLoggedIn, currentUser } = useUser();
  const { trips } = useTrips();
  const insets = useSafeAreaInsets();
  const [selectedOrigin, setSelectedOrigin] =
    useState<SupportedFlightDealAirport | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<FlightDealDestinationOption | null>(null);
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
  const destinationOptions = useMemo(
    () => getFlightDealDestinationOptions(),
    [],
  );

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
      `${selectedOrigin.airportCode}_${selectedDestination.destinationCityKey}`
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
      destinationCityKey: selectedDestination.destinationCityKey,
      destinationCityName: selectedDestination.destinationCityName,
      destinationCountryCode: selectedDestination.destinationCountryCode,
      destinationCountryName: selectedDestination.destinationCountryName,
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
          destinationCityKey: payload.destinationCityKey,
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

  const normalizedFilter = filterText.trim().toLowerCase();
  const originOptions = supportedFlightDealAirports.filter(
    (item) =>
      !normalizedFilter ||
      `${item.cityName} ${item.airportName} ${item.airportCode}`
        .toLowerCase()
        .includes(normalizedFilter),
  );
  const filteredDestinationOptions = destinationOptions.filter(
    (item) =>
      !normalizedFilter ||
      `${item.destinationCityName} ${item.destinationCountryName}`
        .toLowerCase()
        .includes(normalizedFilter),
  );

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
        <View style={styles.heroCard}>
          <Text style={styles.title}>{t("flightDeals.title")}</Text>
          <Text style={styles.subtitle}>{t("flightDeals.subtitle")}</Text>
        </View>
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
                ? `${selectedOrigin.cityName} (${selectedOrigin.airportCode})`
                : t("flightDeals.selectAirport")}
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
                ? selectedDestination.destinationCityName
                : t("flightDeals.selectDestination")}
            </Text>
            {selectedDestination ? (
              <Text style={styles.selectorMeta}>
                {selectedDestination.destinationCountryName}
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
                    {alert.originLabel} → {alert.destinationCityName}
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
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>
              {pickerMode === "origin"
                ? t("flightDeals.selectAirport")
                : t("flightDeals.selectDestination")}
            </Text>
            <TextInput
              value={filterText}
              onChangeText={setFilterText}
              placeholder={t("flightDeals.filterOptions")}
              style={styles.input}
            />{" "}
            <ScrollView>
              {pickerMode === "origin"
                ? originOptions.map((item) => (
                    <TouchableOpacity
                      key={item.airportCode}
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
                        {item.cityName} · {item.airportCode}
                      </Text>
                      <Text style={styles.selectorMeta}>
                        {item.airportName}
                      </Text>
                    </TouchableOpacity>
                  ))
                : filteredDestinationOptions.map((item) => (
                    <TouchableOpacity
                      key={item.destinationCityKey}
                      style={[
                        styles.optionRow,
                        selectedDestination?.destinationCityKey ===
                          item.destinationCityKey && styles.optionSelected,
                      ]}
                      onPress={() => {
                        setSelectedDestination(item);
                        setPickerMode(null);
                      }}
                    >
                      <Text style={styles.selectorTitle}>
                        {item.destinationCityName}
                      </Text>
                      <Text style={styles.selectorMeta}>
                        {item.destinationCountryName}
                      </Text>
                    </TouchableOpacity>
                  ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setPickerMode(null)}>
                <Text style={styles.deleteText}>{t("flightDeals.cancel")}</Text>
              </TouchableOpacity>
              <Text style={styles.selectorMeta}>{t("flightDeals.select")}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20 },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
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
  modalCard: {
    maxHeight: "82%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
  },
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
