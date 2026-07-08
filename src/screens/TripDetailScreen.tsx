import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { getTripStatusLabel } from "../utils/getTripStatusLabel";

type RouteParams = {
  TripDetail: {
    tripId: string;
  };
};

export function TripDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "TripDetail">>();
  const navigation = useNavigation<any>();
  const { trips } = useTrips();
  const { t } = useTranslation();

  const trip = trips.find((item) => item.id === route.params?.tripId || item.tripId === route.params?.tripId);

  if (!trip) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyTitle}>{t("tripDetail.notFound")}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>{t("tripDetail.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("tripDetail.heroKicker")}</Text>
        <Text style={styles.title}>{trip.tripName}</Text>
        <Text style={styles.subtitle}>{trip.outletName}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{getTripStatusLabel(trip.status, t)}</Text>
          <Text style={styles.summaryLabel}>{t("tripDetail.statusSummary")}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{trip.visitDate || "—"}</Text>
          <Text style={styles.summaryLabel}>{t("createTrip.visitDate")}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("tripDetail.destination")}</Text>
        <Text style={styles.detailLabel}>{t("tripDetail.outlet")}</Text>
        <Text style={styles.detailValue}>{trip.outletName}</Text>
        <Text style={styles.detailLabel}>{t("trips.city")}</Text>
        <Text style={styles.detailValue}>{trip.city || t("tripDetail.notProvided")}</Text>
        <Text style={styles.detailLabel}>{t("trips.country")}</Text>
        <Text style={styles.detailValue}>{trip.country || t("tripDetail.notProvided")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("createTrip.notes")}</Text>
        <Text style={styles.detailValue}>{trip.notes || t("tripDetail.notProvided")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F7F8FA" },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryBox: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  summaryValue: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  summaryLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 },
  detailLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 10, marginBottom: 4, textTransform: "uppercase" },
  detailValue: { color: "#0B1F3A", fontSize: 16, fontWeight: "800", lineHeight: 23 },
  emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 },
  primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17, minWidth: 180 },
  primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
