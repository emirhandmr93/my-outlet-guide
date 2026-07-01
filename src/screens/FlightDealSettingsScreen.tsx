import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { departureAirports, flightDealCities } from "../constants/flightDealCities";
import { useFlightDealPreferences } from "../contexts/FlightDealPreferencesContext";

const alertThresholds = [
  {
    id: "good",
    title: "Good Deal",
    percent: "15%",
    description: "Useful fare drops below the usual route average.",
  },
  {
    id: "great",
    title: "Great Deal",
    percent: "30%",
    description: "Strong savings worth checking quickly.",
  },
  {
    id: "exceptional",
    title: "Exceptional Deal",
    percent: "45%",
    description: "Rare fares that may disappear fast.",
  },
];

export function FlightDealSettingsScreen() {
  const navigation = useNavigation<any>();
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
        <Text style={styles.kicker}>FLIGHT ALERTS</Text>
        <Text style={styles.title}>Create fare drop alerts</Text>
        <Text style={styles.subtitle}>
          Select departure, shopping destinations and the discount levels you want to follow.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          We compare fares with the last 90-day route average. You choose 15%, 30% or 45% drops — no unrealistic budget limits.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Current setup</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Departure</Text>
          <Text style={styles.summaryValue}>{selectedAirport?.cityName || "Not selected"}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cities</Text>
          <Text style={styles.summaryValue}>{selectedCityIds.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Alert levels</Text>
          <Text style={styles.summaryValue}>{selectedThresholds.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Departure airport</Text>
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
                {selected ? "Selected" : airport.airportId.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.optionText}>{airport.airportName}</Text>
            <Text style={styles.optionMeta}>{airport.countryName}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>Shopping cities</Text>
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
                {selected ? "Selected" : "Add"}
              </Text>
            </View>
            <Text style={styles.optionText}>{city.countryName}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.sectionTitle}>Alert levels</Text>
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
              <Text style={styles.optionTitle}>{threshold.title}</Text>
              <Text style={[styles.statusPill, selected && styles.statusPillActive]}>
                {threshold.percent}
              </Text>
            </View>
            <Text style={styles.optionText}>{threshold.description}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.86}
        onPress={() => navigation.navigate("FlightDeals")}
      >
        <Text style={styles.primaryButtonText}>Save alert and view deals →</Text>
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
