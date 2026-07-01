import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";

export function OfflinePacksScreen() {
  const { trips } = useTrips();
  const { t } = useTranslation();
  const [downloadedTripIds, setDownloadedTripIds] = useState<string[]>([]);

  const downloadedCount = downloadedTripIds.length;
  const totalSize = downloadedCount * 42;

  function toggleDownload(tripId: string) {
    setDownloadedTripIds((current) =>
      current.includes(tripId) ? current.filter((id) => id !== tripId) : [...current, tripId]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>OFFLINE</Text>
        <Text style={styles.pageTitle}>{t("offline.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("offline.subtitle")}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{downloadedCount}</Text>
          <Text style={styles.statLabel}>Downloaded</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalSize} MB</Text>
          <Text style={styles.statLabel}>Storage</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("offline.tripPacks")}</Text>

      {trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🧳</Text>
          <Text style={styles.cardTitle}>{t("offline.noTrips")}</Text>
          <Text style={styles.cardText}>{t("offline.noTripsText")}</Text>
        </View>
      ) : (
        trips.map((trip) => {
          const downloaded = downloadedTripIds.includes(trip.id);

          return (
            <View key={trip.id} style={[styles.card, downloaded && styles.downloadedCard]}>
              <View style={styles.cardTopRow}>
                <View style={styles.tripIconBox}>
                  <Text style={styles.tripIcon}>📦</Text>
                </View>

                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>{trip.tripName}</Text>
                  <Text style={styles.cardText}>
                    {trip.startDate} - {trip.endDate}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardText}>
                {t("offline.cities")}: {" "}
                {trip.tripCities.length > 0
                  ? trip.tripCities.map((city) => city.cityName).join(", ")
                  : t("offline.addCitiesFirst")}
              </Text>

              <View style={styles.includesBox}>
                <Text style={styles.includesTitle}>{t("offline.packIncludes")}</Text>
                <Text style={styles.includesText}>• {t("offline.outletInfo")}</Text>
                <Text style={styles.includesText}>• {t("offline.transportationGuides")}</Text>
                <Text style={styles.includesText}>• {t("offline.taxFreeTools")}</Text>
                <Text style={styles.includesText}>• {t("offline.brandLists")}</Text>
                <Text style={styles.includesText}>• {t("offline.mapShortcuts")}</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, downloaded && styles.downloadedButton]}
                onPress={() => toggleDownload(trip.id)}
              >
                <Text style={styles.actionButtonText}>
                  {downloaded ? t("offline.downloaded") : t("offline.downloadPack")}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>{t("offline.travelTools")}</Text>

      <ToolCard icon="✅" title={t("offline.checklistTitle")} text={t("offline.checklistText")} />
      <ToolCard icon="📝" title={t("offline.notesTitle")} text={t("offline.notesText")} />
      <ToolCard icon="💱" title={t("offline.exchangeTitle")} text={t("offline.exchangeText")} />
    </ScrollView>
  );
}

function ToolCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.toolCard}>
      <View style={styles.toolIconBox}>
        <Text style={styles.toolIcon}>{icon}</Text>
      </View>
      <View style={styles.cardHeaderContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },

  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#D8DEE9",
    marginTop: 8,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statValue: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0B1F3A",
    marginTop: 10,
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  downloadedCard: {
    borderColor: "#C9A227",
    backgroundColor: "#FFF8E1",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  tripIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  tripIcon: {
    fontSize: 22,
  },

  cardHeaderContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 4,
  },

  cardText: {
    color: "#666666",
    lineHeight: 20,
    fontSize: 14,
  },

  includesBox: {
    marginTop: 12,
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  includesTitle: {
    color: "#0B1F3A",
    fontWeight: "900",
    marginBottom: 8,
  },

  includesText: {
    color: "#666666",
    lineHeight: 22,
  },

  actionButton: {
    marginTop: 14,
    backgroundColor: "#0B1F3A",
    borderRadius: 16,
    padding: 14,
  },

  downloadedButton: {
    backgroundColor: "#C9A227",
  },

  actionButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
  },

  toolCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  toolIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  toolIcon: {
    fontSize: 21,
  },
});
