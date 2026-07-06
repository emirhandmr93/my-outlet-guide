import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { departureAirports, flightDealCities } from "../constants/flightDealCities";
import { useFlightDealPreferences } from "../contexts/FlightDealPreferencesContext";
import { useTranslation } from "../hooks/useTranslation";

const alertThresholds = [
  {
    id: "good",
    titleKey: "flightDeals.threshold.good",
    descriptionKey: "flightDeals.threshold.goodDesc",
    percent: "15%",
  },
  {
    id: "great",
    titleKey: "flightDeals.threshold.great",
    descriptionKey: "flightDeals.threshold.greatDesc",
    percent: "30%",
  },
  {
    id: "exceptional",
    titleKey: "flightDeals.threshold.exceptional",
    descriptionKey: "flightDeals.threshold.exceptionalDesc",
    percent: "45%",
  },
];

export function FlightDealSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const {
    departureAirportId,
    setDepartureAirportId,
    selectedCityIds,
    addCity,
    removeCity,
    selectedThresholds,
    toggleThreshold,
  } = useFlightDealPreferences();

  const selectedAirport = departureAirports.find(
    (airport) => airport.airportId === departureAirportId
  );

  function handleThresholdPress(thresholdId: string) {
    if (selectedThresholds.includes(thresholdId) && selectedThresholds.length === 1) {
      return;
    }

    toggleThreshold(thresholdId);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("flightDeals.settingsKicker")}</Text>
        <Text style={styles.title}>{t("flightDeals.settingsHeroTitle")}</Text>
        <Text style={styles.subtitle}>
          {t("flightDeals.settingsHeroSubtitle")}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t("flightDeals.howItWorks")}</Text>
        <Text style={styles.infoText}>
          {t("flightDeals.howItWorksText")}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{t("flightDeals.currentSetup")}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t("flightDeals.departure")}</Text>
          <Text style={styles.summaryValue}>{selectedAirport?.cityName || t("flightDeals.notSelected")}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t("flightDeals.cities")}</Text>
          <Text style={styles.summaryValue}>{selectedCityIds.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t("flightDeals.alertLevels")}</Text>
          <Text style={styles.summaryValue}>{selectedThresholds.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("flightDeals.departureAirport")}</Text>
      {departureAirports.map((airport) => {
        const selected = departureAirportId === airport.airportId;

        return (
          <TouchableOpacity
            key={airport.airportId}
            style={[styles.optionCard, selected && styles.selectedCard]}
            activeOpacity={0.86}
            onPress={() => setDepartureAirportId(airport.airportId)}
          >
            <View style={styles.optionTopRow}>
              <Text style={styles.optionTitle}>{airport.cityName}</Text>
              <Text style={[styles.statusPill, selected && styles.statusPillActive]}>
                {selected ? t("common.selected") : airport.airportId.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.optionText}>{airport.airportName}</Text>
            <Text style={styles.optionMeta}>{airport.countryName}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>{t("flightDeals.shoppingCities")}</Text>
      {flightDealCities.map((city) => {
        const selected = selectedCityIds.includes(city.cityId);

        return (
          <TouchableOpacity
            key={city.cityId}
            style={[styles.optionCard, selected && styles.selectedCard]}
            activeOpacity={0.86}
            onPress={() => (selected ? removeCity(city.cityId) : addCity(city.cityId))}
          >
            <View style={styles.optionTopRow}>
              <Text style={styles.optionTitle}>{city.cityName}</Text>
              <Text style={[styles.statusPill, selected && styles.statusPillActive]}>
                {selected ? t("common.selected") : t("common.add")}
              </Text>
            </View>
            <Text style={styles.optionText}>{city.countryName}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>{t("flightDeals.alertLevels")}</Text>
      {alertThresholds.map((threshold) => {
        const selected = selectedThresholds.includes(threshold.id);

        return (
          <TouchableOpacity
            key={threshold.id}
            style={[styles.optionCard, selected && styles.selectedCard]}
            activeOpacity={0.86}
            onPress={() => handleThresholdPress(threshold.id)}
          >
            <View style={styles.optionTopRow}>
              <Text style={styles.optionTitle}>{t(threshold.titleKey)}</Text>
              <Text style={[styles.statusPill, selected && styles.statusPillActive]}>
                {threshold.percent}
              </Text>
            </View>
            <Text style={styles.optionText}>{t(threshold.descriptionKey)}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.86}
        onPress={() => navigation.navigate("FlightDeals")}
      >
        <Text style={styles.primaryButtonText}>{t("flightDeals.saveAlertViewDeals")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 130 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 26, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.3, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -0.6 },
  subtitle: { color: "#E7EDF5", fontSize: 15, lineHeight: 22, fontWeight: "600", marginTop: 10 },
  infoCard: { backgroundColor: "#FFF7E0", borderRadius: 22, padding: 17, borderWidth: 1, borderColor: "#F0D88A", marginBottom: 14 },
  infoTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900", marginBottom: 7 },
  infoText: { color: "#5F5A45", fontSize: 14, lineHeight: 21, fontWeight: "700" },
  summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#E0E5EC", marginBottom: 18 },
  summaryTitle: { color: "#0B1F3A", fontSize: 19, fontWeight: "900", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  summaryLabel: { color: "#687386", fontWeight: "800" },
  summaryValue: { color: "#0B1F3A", fontWeight: "900" },
  sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginTop: 14, marginBottom: 12 },
  optionCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 17, borderWidth: 1, borderColor: "#E0E5EC", marginBottom: 12 },
  selectedCard: { borderColor: "#C9A227", backgroundColor: "#FFFDF5" },
  optionTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  optionTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900", flex: 1 },
  optionText: { color: "#687386", lineHeight: 21, marginTop: 7, fontWeight: "600" },
  optionMeta: { color: "#C9A227", fontWeight: "900", marginTop: 6 },
  statusPill: { color: "#0B1F3A", fontWeight: "900", fontSize: 12, backgroundColor: "#F2F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: "hidden" },
  statusPillActive: { backgroundColor: "#0B1F3A", color: "#FFFFFF" },
  primaryButton: { backgroundColor: "#0B1F3A", borderRadius: 20, padding: 17, marginTop: 10 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
});
