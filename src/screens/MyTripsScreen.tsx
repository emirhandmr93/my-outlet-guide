import { useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Trip, useTrips } from "../contexts/TripsContext";

function formatCities(trip: Trip) {
  if (trip.tripCities.length === 0) {
    return "No cities added yet";
  }

  return trip.tripCities.map((city) => city.cityName).join(" • ");
}

function TripCard({ trip, onPress, onDelete }: { trip: Trip; onPress: () => void; onDelete: () => void }) {
  return (
    <TouchableOpacity style={styles.tripCard} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <Text style={styles.statusPill}>{trip.status}</Text>
        <Text style={styles.dateText}>{trip.startDate} → {trip.endDate}</Text>
      </View>

      <Text style={styles.tripTitle}>{trip.tripName || "Shopping Trip"}</Text>
      <Text style={styles.tripCities}>{formatCities(trip)}</Text>

      <View style={styles.tripMetaRow}>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{trip.tripCities.length}</Text>
          <Text style={styles.metaLabel}>Cities</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>{trip.flightNumber ? "Added" : "—"}</Text>
          <Text style={styles.metaLabel}>Flight</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaValue}>Ready</Text>
          <Text style={styles.metaLabel}>Tax Free</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(event) => {
          event.stopPropagation();
          Alert.alert("Delete trip", "Remove this shopping trip?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: onDelete },
          ]);
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function MyTripsScreen() {
  const navigation = useNavigation<any>();
  const { trips, deleteTrip } = useTrips();

  const activeCount = trips.filter((trip) => trip.status === "Active").length;
  const upcomingCount = trips.filter((trip) => trip.status === "Upcoming").length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>SHOPPING TRIPS</Text>
        <Text style={styles.title}>Plan smarter outlet days.</Text>
        <Text style={styles.subtitle}>
          Save your cities, travel dates, flight details and Tax Free reminders in one place.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{trips.length}</Text>
          <Text style={styles.summaryLabel}>Trips</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{upcomingCount}</Text>
          <Text style={styles.summaryLabel}>Upcoming</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.86}
        onPress={() => navigation.navigate("CreateTrip")}
      >
        <Text style={styles.primaryButtonText}>Create shopping trip →</Text>
      </TouchableOpacity>

      {trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🧳</Text>
          <Text style={styles.emptyTitle}>No trip planned yet</Text>
          <Text style={styles.emptyText}>
            Create your first trip to unlock travel reminders, offline packs and Tax Free alerts.
          </Text>
        </View>
      ) : (
        trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onDelete={() => deleteTrip(trip.id)}
            onPress={() => navigation.navigate("TripDetail", { tripId: trip.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
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
