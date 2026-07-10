import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TripReminderPlanItem, useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { getTripStatusLabel } from "../utils/getTripStatusLabel";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

type RouteParams = { TripDetail: { tripId: string } };

function applyParams(template: string, params?: Record<string, string>) {
  return Object.entries(params || {}).reduce((text, [key, value]) => text.replace(`{{${key}}}`, value), template);
}

function ReminderRow({ item, t }: { item: TripReminderPlanItem; t: (key: string) => string }) {
  return <View style={styles.reminderRow}><Text style={styles.detailLabel}>{item.date} · {t(item.titleKey)}</Text><Text style={styles.detailValue}>{applyParams(t(item.messageKey), item.messageParams)}</Text></View>;
}

export function TripDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "TripDetail">>();
  const navigation = useNavigation<any>();
  const { trips } = useTrips();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const trip = trips.find((item) => item.id === route.params?.tripId || item.tripId === route.params?.tripId);

  if (!trip) {
    return <View style={styles.centerState}><Text style={styles.emptyTitle}>{t("tripDetail.notFound")}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}><Text style={styles.primaryButtonText}>{t("tripDetail.goBack")}</Text></TouchableOpacity></View>;
  }

  const hasFlightSummary = Boolean(trip.flightDetails && Object.values(trip.flightDetails).some(Boolean));

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
      <View style={styles.heroCard}><Text style={styles.kicker}>{t("tripDetail.heroKicker")}</Text><Text style={styles.title}>{trip.tripName}</Text><Text style={styles.subtitle}>{trip.startDate} – {trip.endDate}</Text></View>
      <View style={styles.summaryRow}><View style={styles.summaryBox}><Text style={styles.summaryValue}>{getTripStatusLabel(trip.status, t)}</Text><Text style={styles.summaryLabel}>{t("tripDetail.statusSummary")}</Text></View><View style={styles.summaryBox}><Text style={styles.summaryValue}>{trip.startDate} – {trip.endDate}</Text><Text style={styles.summaryLabel}>{t("createTrip.visitDates")}</Text></View></View>

      {hasFlightSummary && <View style={styles.card}><Text style={styles.sectionTitle}>{t("tripDetail.flightInfo")}</Text>{Object.entries(trip.flightDetails || {}).filter(([, value]) => Boolean(value)).map(([key, value]) => <Text key={key} style={styles.detailValue}>{value}</Text>)}</View>}

      <View style={styles.card}><Text style={styles.sectionTitle}>{t("tripDetail.destinationSegments")}</Text>{trip.segments.length > 0 ? trip.segments.map((segment) => <View key={segment.id} style={styles.segmentCard}><Text style={styles.detailValue}>{segment.outletName || segment.cityName || segment.countryName}</Text><Text style={styles.detailLabel}>{segment.startDate} – {segment.endDate}</Text>{segment.notes ? <Text style={styles.detailValue}>{segment.notes}</Text> : null}</View>) : <View style={styles.emptySegment}><Text style={styles.emptyTitle}>{t("tripDetail.emptyRouteTitle")}</Text><Text style={styles.emptyText}>{t("tripDetail.emptyRouteText")}</Text><TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Explore", { initialTab: "outlet", tripPrompt: true })}><Text style={styles.secondaryButtonText}>{t("tripDetail.addRouteCta")}</Text></TouchableOpacity></View>}</View>

      <View style={styles.card}><Text style={styles.sectionTitle}>{t("tripDetail.reminderPlan")}</Text>{trip.reminderPlan.map((item) => <ReminderRow key={item.id} item={item} t={t} />)}</View>
      {trip.notes ? <View style={styles.card}><Text style={styles.sectionTitle}>{t("createTrip.notes")}</Text><Text style={styles.detailValue}>{trip.notes}</Text></View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20 }, centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F7F8FA" }, heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 }, kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 }, subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 }, summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 }, summaryBox: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" }, summaryValue: { color: "#0B1F3A", fontSize: 16, fontWeight: "900" }, summaryLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 4 }, card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 }, sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 }, detailLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 8, marginBottom: 4 }, detailValue: { color: "#0B1F3A", fontSize: 16, fontWeight: "800", lineHeight: 23 }, emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 8 }, emptyText: { color: "#666666", textAlign: "center", lineHeight: 21, marginBottom: 14 }, primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17, minWidth: 180 }, primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, secondaryButton: { backgroundColor: "#F8F1D8", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#E7D79A" }, secondaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, segmentCard: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 14, marginBottom: 10 }, emptySegment: { alignItems: "center", backgroundColor: "#F7F8FA", borderRadius: 18, padding: 16 }, reminderRow: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 14, marginBottom: 10 },
});
