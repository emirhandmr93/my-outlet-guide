import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { outlets } from "../constants/outlets";
import { flightDeals } from "../constants/flightDeals";
import { departureAirports, flightDealCities } from "../constants/flightDealCities";
import { useTranslation } from "../hooks/useTranslation";

const SKYSCANNER_URL = "https://www.skyscanner.com/";

type RouteParams = {
  FlightDealDetail: {
    dealId: string;
  };
};

export function FlightDealDetailScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RouteParams, "FlightDealDetail">>();

  const deal = flightDeals.find((item) => item.dealId === route.params?.dealId) || flightDeals[0];
  const departure = departureAirports.find((airport) => airport.airportId === deal.departureAirportId);
  const destination = flightDealCities.find((city) => city.cityId === deal.destinationCityId);

  const recommendedOutlet =
    outlets.find((outlet) => {
      if (deal.destinationCityId === "paris") return outlet.outletId === "la-vallee-village";
      if (deal.destinationCityId === "milan") return outlet.outletId === "serravalle-designer-outlet";
      if (deal.destinationCityId === "london") return outlet.outletId === "bicester-village";
      return false;
    }) || outlets[0];

  function openFlights() {
    Linking.openURL(SKYSCANNER_URL);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("flightDeals.detailKicker")}</Text>
        <Text style={styles.title}>
          {departure?.cityName || deal.departureAirportId} → {destination?.cityName || deal.destinationCityId}
        </Text>
        <Text style={styles.subtitle}>
          {deal.discountPercent}% {t("flightDeals.below90DayFare")}
        </Text>
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.cardKicker}>{t("flightDeals.currentFare")}</Text>
        <Text style={styles.price}>
          {deal.detectedPrice} {deal.currency}
        </Text>
        <Text style={styles.airline}>{deal.airline}</Text>
        <Text style={styles.updated}>{t("flightDeals.updated")} {deal.lastUpdatedMinutesAgo} {t("flightDeals.minAgo")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("flightDeals.whyMatters")}</Text>
        <View style={styles.factRow}>
          <Text style={styles.factLabel}>{t("flightDeals.route")}</Text>
          <Text style={styles.factValue}>
            {departure?.airportId?.toUpperCase?.() || deal.departureAirportId.toUpperCase()} → {destination?.cityName || deal.destinationCityId}
          </Text>
        </View>
        <View style={styles.factRow}>
          <Text style={styles.factLabel}>{t("flightDeals.discount")}</Text>
          <Text style={styles.factValue}>{deal.discountPercent}% {t("flightDeals.belowAverage")}</Text>
        </View>
        <View style={styles.factRow}>
          <Text style={styles.factLabel}>{t("flightDeals.averageBasis")}</Text>
          <Text style={styles.factValue}>{t("flightDeals.last90Days")}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("OutletDetail", { outletId: recommendedOutlet.outletId })}
      >
        <Text style={styles.sectionTitle}>{t("flightDeals.recommendedOutletNearby")}</Text>
        <Text style={styles.outletTitle}>{recommendedOutlet.name}</Text>
        <Text style={styles.outletText}>
          {t("flightDeals.pairRouteOutlet")}
        </Text>
        <Text style={styles.outletLink}>{t("flightDeals.viewOutlet")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} activeOpacity={0.86} onPress={openFlights}>
        <Text style={styles.buttonText}>{t("flightDeals.checkFlightsArrow")}</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        {t("flightDeals.priceNotice")}
      </Text>
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
  priceCard: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E0E5EC", marginBottom: 14 },
  cardKicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 8 },
  price: { color: "#0B1F3A", fontSize: 34, fontWeight: "900", letterSpacing: -0.8 },
  airline: { color: "#687386", fontSize: 15, fontWeight: "800", marginTop: 8 },
  updated: { color: "#8B94A3", fontSize: 12, fontWeight: "700", marginTop: 7 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#E0E5EC" },
  sectionTitle: { fontSize: 19, fontWeight: "900", color: "#0B1F3A", marginBottom: 12 },
  factRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 9 },
  factLabel: { color: "#687386", fontWeight: "800" },
  factValue: { color: "#0B1F3A", fontWeight: "900", flexShrink: 1, textAlign: "right" },
  outletTitle: { fontSize: 21, fontWeight: "900", color: "#0B1F3A", letterSpacing: -0.3 },
  outletText: { marginTop: 7, color: "#687386", fontSize: 15, lineHeight: 22, fontWeight: "600" },
  outletLink: { marginTop: 14, color: "#0B1F3A", fontWeight: "900" },
  button: { backgroundColor: "#0B1F3A", borderRadius: 20, padding: 17, marginTop: 4 },
  buttonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  note: { marginTop: 16, color: "#687386", lineHeight: 21, fontWeight: "600" },
});
