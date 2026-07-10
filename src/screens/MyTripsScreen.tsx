import { useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Trip, useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { getTripStatusLabel } from "../utils/getTripStatusLabel";
import { requireAuth } from "../utils/requireAuth";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

function TripCard({ trip, onPress, onDelete, t }: { trip: Trip; onPress: () => void; onDelete: () => void; t: (key: string) => string }) {
  return (
    <TouchableOpacity style={styles.tripCard} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <Text style={styles.statusPill}>{getTripStatusLabel(trip.status, t)}</Text>
        <Text style={styles.dateText}>{trip.visitDate || t("trips.dateNotSet")}</Text>
      </View>

      <Text style={styles.tripTitle}>{trip.tripName || t("trips.defaultTripName")}</Text>
      <Text style={styles.tripCities}>{trip.outletName}</Text>
      <Text style={styles.tripCities}>{trip.destination || t("trips.destinationNotSet")}</Text>

      <View style={styles.tripMetaRow}>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{trip.city || "—"}</Text>
          <Text style={styles.metaLabel}>{t("trips.city")}</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{trip.country || "—"}</Text>
          <Text style={styles.metaLabel}>{t("trips.country")}</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{trip.notes ? t("trips.added") : "—"}</Text>
          <Text style={styles.metaLabel}>{t("trips.notes")}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(event) => {
          event.stopPropagation();
          Alert.alert(t("trips.deleteConfirmTitle"), t("trips.deleteConfirmMessage"), [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("common.delete"), style: "destructive", onPress: onDelete },
          ]);
        }}
      >
        <Text style={styles.deleteButtonText}>{t("common.delete")}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function MyTripsScreen() {
  const navigation = useNavigation<any>();
  const { trips, deleteTrip, loading, tripsError } = useTrips();
  const { t } = useTranslation();
  const { isLoggedIn } = useUser();
  const insets = useSafeAreaInsets();

  const activeCount = trips.filter((trip) => trip.status === "active").length;
  const datedCount = trips.filter((trip) => Boolean(trip.visitDate)).length;

  async function handleDeleteTrip(tripId: string) {
    try {
      await deleteTrip(tripId);
    } catch (error) {
      console.log("Delete trip error", error);
      const isPermissionDenied = (error as { code?: unknown }).code === "permission-denied";
      Alert.alert(
        t("trips.deleteFailedTitle"),
        t(isPermissionDenied ? "trips.permissionDeniedMessage" : "trips.deleteFailedMessage"),
      );
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("trips.heroKicker")}</Text>
        <Text style={styles.title}>{t("trips.heroTitle")}</Text>
        <Text style={styles.subtitle}>
          {t("trips.heroSubtitle")}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{trips.length}</Text>
          <Text style={styles.summaryLabel}>{t("trips.summaryTrips")}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>{t("status.active")}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{datedCount}</Text>
          <Text style={styles.summaryLabel}>{t("trips.dated")}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.86}
        onPress={() => {
          if (requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") })) {
            navigation.navigate("CreateTrip");
          }
        }}
      >
        <Text style={styles.primaryButtonText}>{t("trips.createShoppingTripCta")}</Text>
      </TouchableOpacity>

      {!isLoggedIn ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyTitle}>{t("trips.signInTitle")}</Text>
          <Text style={styles.emptyText}>{t("trips.signInText")}</Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("trips.loading")}</Text>
        </View>
      ) : tripsError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("trips.loadFailedTitle")}</Text>
          <Text style={styles.emptyText}>
            {t(tripsError === "permission-denied" ? "trips.permissionDeniedMessage" : "trips.loadFailedMessage")}
          </Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🧳</Text>
          <Text style={styles.emptyTitle}>{t("trips.emptyTitle")}</Text>
          <Text style={styles.emptyText}>
            {t("trips.emptyText")}
          </Text>
        </View>
      ) : (
        trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onDelete={() => handleDeleteTrip(trip.id)}
            onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
            t={t}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryBox: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  summaryValue: { color: "#0B1F3A", fontSize: 20, fontWeight: "900" },
  summaryLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 4 },
  primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17, marginBottom: 16 },
  primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 24, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900" },
  emptyText: { color: "#666666", textAlign: "center", lineHeight: 21, marginTop: 8 },
  tripCard: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 },
  statusPill: { backgroundColor: "#0B1F3A", color: "#FFFFFF", fontSize: 12, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: "hidden" },
  dateText: { color: "#666666", fontSize: 12, fontWeight: "800", flex: 1, textAlign: "right" },
  tripTitle: { color: "#0B1F3A", fontSize: 22, fontWeight: "900" },
  tripCities: { color: "#666666", lineHeight: 21, marginTop: 7 },
  tripMetaRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  metaBox: { flex: 1, backgroundColor: "#F7F8FA", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  metaValue: { color: "#0B1F3A", fontWeight: "900" },
  metaLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 4 },
  deleteButton: { backgroundColor: "#FFF1F1", borderRadius: 16, padding: 13, marginTop: 14, borderWidth: 1, borderColor: "#FECACA" },
  deleteButtonText: { color: "#DC2626", fontWeight: "900", textAlign: "center" },
});
