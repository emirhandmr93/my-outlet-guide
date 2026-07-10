import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

export function FlightDealsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { isLoggedIn } = useUser();
  const { trips } = useTrips();
  const insets = useSafeAreaInsets();
  const flightRows = trips.flatMap((trip) => [
    trip.flightDetails?.outbound?.departureDate ? { trip, leg: trip.flightDetails.outbound, label: t("flightAlerts.outboundFlight"), type: "outboundFlight" } : null,
    trip.flightDetails?.return?.departureDate ? { trip, leg: trip.flightDetails.return, label: t("flightAlerts.returnFlight"), type: "returnFlight" } : null,
  ].filter(Boolean));

  if (!isLoggedIn) {
    return <View style={styles.centerState}>
      <Text style={styles.title}>{t("flightAlerts.title")}</Text>
      <Text style={styles.subtitle}>{t("flightAlerts.guestState")}</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Login", { authMessage: t("flightAlerts.guestState") })}><Text style={styles.primaryButtonText}>{t("profile.signIn")}</Text></TouchableOpacity>
    </View>;
  }

  return <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
    <View style={styles.heroCard}><Text style={styles.kicker}>{t("flightAlerts.flightInfo")}</Text><Text style={styles.title}>{t("flightAlerts.title")}</Text><Text style={styles.subtitle}>{t("flightAlerts.subtitle")}</Text></View>
    {flightRows.length > 0 ? flightRows.map((row: any) => {
      const reminder = row.trip.reminderPlan.find((item: any) => item.type === row.type);
      const route = [row.leg.departureAirport, row.leg.arrivalAirport].filter(Boolean).join(" → ");
      const flightName = [row.leg.airline, row.leg.flightNumber].filter(Boolean).join(" ");
      return <TouchableOpacity key={`${row.trip.id}-${row.type}`} style={styles.card} activeOpacity={0.86} onPress={() => navigation.navigate("TripDetail", { tripId: row.trip.id })}>
        <Text style={styles.detailLabel}>{row.trip.tripName} · {row.label}</Text>
        {flightName ? <Text style={styles.detailValue}>{flightName}</Text> : null}
        {route ? <Text style={styles.detailValue}>{route}</Text> : null}
        <Text style={styles.detailValue}>{[row.leg.departureDate, row.leg.departureTime].filter(Boolean).join(" · ")}</Text>
        {reminder ? <Text style={styles.reminderMeta}>{t("flightAlerts.reminderReady")}</Text> : null}
      </TouchableOpacity>;
    }) : <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{t("flightAlerts.emptyState")}</Text></View>}
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20 }, centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F7F8FA" }, heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 }, kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36, textAlign: "center" }, subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: "center" }, card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 }, detailLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginBottom: 6 }, detailValue: { color: "#0B1F3A", fontSize: 16, fontWeight: "800", lineHeight: 23 }, reminderMeta: { color: "#666666", fontSize: 12, fontWeight: "800", marginTop: 8 }, emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 24, alignItems: "center" }, emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900" }, primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17, minWidth: 180, marginTop: 16 }, primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" } });
