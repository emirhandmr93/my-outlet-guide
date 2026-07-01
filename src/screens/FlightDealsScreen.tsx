import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { flightDeals } from "../constants/flightDeals";
import { departureAirports, flightDealCities } from "../constants/flightDealCities";
import { useFlightDealPreferences } from "../contexts/FlightDealPreferencesContext";
import { getBestFlightDealAlertLevel } from "../utils/flightDealEngine";

function getThresholdText(selectedThresholds: string[]) {
  const labels: Record<string, string> = {
    good: "15%",
    great: "30%",
    exceptional: "45%",
  };

  return selectedThresholds.map((item) => labels[item] || item).join(" • ");
}

export function FlightDealsScreen() {
  const navigation = useNavigation<any>();
  const { departureAirportId, selectedCityIds, selectedThresholds } = useFlightDealPreferences();

  const selectedAirport = departureAirports.find(
    (airport) => airport.airportId === departureAirportId
  );

  const selectedCities = flightDealCities.filter((city) => selectedCityIds.includes(city.cityId));

  const filteredDeals = flightDeals.filter((deal) => {
    const alertLevel = getBestFlightDealAlertLevel({
      discountPercent: deal.discountPercent,
      selectedThresholds,
    });

    return (
      deal.departureAirportId === departureAirportId &&
      selectedCityIds.includes(deal.destinationCityId) &&
      Boolean(alertLevel)
    );
  });

  const hasActiveAlert = Boolean(departureAirportId) && selectedCityIds.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>FLIGHT DEALS</Text>
        <Text style={styles.title}>Track fares for outlet trips</Text>
        <Text style={styles.subtitle}>
          Get notified when flights drop 15%, 30% or 45% below the 90-day route average.
        </Text>
      </View>

      <View style={styles.setupCard}>
        <View style={styles.setupHeader}>
          <View>
            <Text style={styles.setupKicker}>Current alert</Text>
            <Text style={styles.setupTitle}>
              {selectedAirport?.cityName || "Choose departure"}
              {selectedCities.length > 0 ? ` → ${selectedCities.map((city) => city.cityName).join(", ")}` : ""}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.setupButton}
            onPress={() => navigation.navigate("FlightDealSettings")}
          >
            <Text style={styles.setupButtonText}>{hasActiveAlert ? "Manage" : "Create"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.setupText}>
          {hasActiveAlert
            ? `Monitoring ${getThresholdText(selectedThresholds)} fare drops based on the last 90-day average fare.`
            : "Create a route alert and choose which discount levels you want to follow."}
        </Text>
      </View>

      {filteredDeals.length > 0 ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deals found</Text>
            <Text style={styles.sectionSubtitle}>Current fares below your selected alert levels.</Text>
          </View>

          {filteredDeals.map((deal) => {
            const airport = departureAirports.find(
              (item) => item.airportId === deal.departureAirportId
            );
            const city = flightDealCities.find((item) => item.cityId === deal.destinationCityId);
            const alertLevel = getBestFlightDealAlertLevel({
              discountPercent: deal.discountPercent,
              selectedThresholds,
            });

            const icon =
              alertLevel?.id === "exceptional" ? "🔥" : alertLevel?.id === "great" ? "🟠" : "🟡";

            return (
              <TouchableOpacity
                key={deal.dealId}
                style={styles.dealCard}
                activeOpacity={0.86}
                onPress={() => navigation.navigate("FlightDealDetail", { dealId: deal.dealId })}
              >
                <Text style={styles.badge}>
                  {icon} {alertLevel?.title || "Deal Found"}
                </Text>

                <Text style={styles.route}>
                  {airport?.cityName} → {city?.cityName}
                </Text>

                <Text style={styles.airline}>{deal.airline}</Text>

                <View style={styles.dealFooter}>
                  <View>
                    <Text style={styles.discount}>{deal.discountPercent}% below average</Text>
                    <Text style={styles.updated}>Updated {deal.lastUpdatedMinutesAgo} min ago</Text>
                  </View>

                  <Text style={styles.price}>
                    {deal.detectedPrice} {deal.currency}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyKicker}>{hasActiveAlert ? "ALERT ACTIVE" : "NO ALERT YET"}</Text>
          <Text style={styles.emptyTitle}>
            {hasActiveAlert ? "We are monitoring your route" : "Create your first flight alert"}
          </Text>
          <Text style={styles.emptyText}>
            {hasActiveAlert
              ? "No matching fare drop has been found yet. Your selected route and discount levels stay active."
              : "Choose your departure city, shopping destination and discount levels to start tracking fares."}
          </Text>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.primaryButton}
            onPress={() => navigation.navigate("FlightDealSettings")}
          >
            <Text style={styles.primaryButtonText}>{hasActiveAlert ? "Manage Alert" : "Create Alert"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 130 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 26, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.4, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 31, lineHeight: 36, fontWeight: "900", letterSpacing: -0.6 },
  subtitle: { color: "#E7EDF5", fontSize: 15, lineHeight: 22, fontWeight: "600", marginTop: 10 },
  setupCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#E0E5EC", marginBottom: 16 },
  setupHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  setupKicker: { color: "#C9A227", fontSize: 11, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 5 },
  setupTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900", flexShrink: 1 },
  setupText: { color: "#687386", fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 12 },
  setupButton: { backgroundColor: "#0B1F3A", borderRadius: 999, paddingHorizontal: 15, paddingVertical: 9 },
  setupButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  sectionHeader: { marginTop: 4, marginBottom: 12 },
  sectionTitle: { color: "#0B1F3A", fontSize: 24, fontWeight: "900", letterSpacing: -0.4 },
  sectionSubtitle: { color: "#687386", fontSize: 15, lineHeight: 21, fontWeight: "600", marginTop: 4 },
  dealCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#E0E5EC", marginBottom: 14 },
  badge: { alignSelf: "flex-start", color: "#0B1F3A", fontSize: 12, fontWeight: "900", backgroundColor: "#FFF7E0", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, overflow: "hidden", marginBottom: 12 },
  route: { color: "#0B1F3A", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  airline: { color: "#687386", fontSize: 14, fontWeight: "700", marginTop: 6 },
  dealFooter: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 16 },
  discount: { color: "#C9A227", fontSize: 15, fontWeight: "900" },
  updated: { color: "#8B94A3", fontSize: 12, fontWeight: "700", marginTop: 5 },
  price: { color: "#0B1F3A", fontSize: 22, fontWeight: "900" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#E0E5EC" },
  emptyKicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 8 },
  emptyTitle: { color: "#0B1F3A", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  emptyText: { color: "#687386", fontSize: 15, lineHeight: 22, fontWeight: "600", marginTop: 8 },
  primaryButton: { backgroundColor: "#0B1F3A", borderRadius: 18, padding: 16, marginTop: 18 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
});
