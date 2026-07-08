import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getOfflineAvailabilitySummary } from "../services/offlinePackEngine";

export function OfflinePacksScreen() {
  const summary = getOfflineAvailabilitySummary();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Offline mode</Text>
        <Text style={styles.pageTitle}>Offline availability</Text>
        <Text style={styles.pageSubtitle}>
          Core guide data is bundled with the app. There are no downloadable offline packs in this release.
        </Text>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Already available without internet</Text>
        <Text style={styles.noticeText}>
          You can browse bundled outlet details, brand lists, restaurants, transportation notes, local outlet photos, and supported Tax Free rules after the app is installed.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={`${summary.outletCount}`} label="Bundled outlets" />
        <StatCard value={`${summary.countryCount}`} label="Countries" />
      </View>
      <View style={styles.statsRow}>
        <StatCard value={`${summary.brandCount}`} label="Brand records" />
        <StatCard value={`${summary.localMediaAssetCount}`} label="Local media assets" />
      </View>

      <Text style={styles.sectionTitle}>Bundled offline scope</Text>
      {summary.availableOffline.map((item) => (
        <StatusCard key={item.title} icon="✅" title={item.title} text={item.description} />
      ))}

      <Text style={styles.sectionTitle}>Requires internet</Text>
      {summary.requiresInternet.map((item) => (
        <StatusCard key={item.title} icon="🌐" title={item.title} text={item.description} />
      ))}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Offline packs</Text>
        <Text style={styles.noticeText}>
          Download buttons are not shown because this version does not persist separate trip packs. Saved trips and favorites remain Firestore-backed and need network access to sync.
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatusCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardText}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8, textTransform: "uppercase" },
  pageTitle: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  pageSubtitle: { fontSize: 14, color: "#D8DEE9", marginTop: 8, lineHeight: 20 },
  noticeCard: { backgroundColor: "#FFF8E1", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#F1D27A", marginBottom: 16 },
  noticeTitle: { color: "#0B1F3A", fontSize: 16, fontWeight: "900", marginBottom: 6 },
  noticeText: { color: "#526070", fontSize: 14, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  statValue: { color: "#0B1F3A", fontSize: 20, fontWeight: "900" },
  statLabel: { color: "#C9A227", fontSize: 12, fontWeight: "800", marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#0B1F3A", marginTop: 12, marginBottom: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start" },
  iconBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center", marginRight: 12 },
  icon: { fontSize: 22 },
  cardHeaderContent: { flex: 1 },
  cardTitle: { color: "#0B1F3A", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  cardText: { color: "#6B7280", fontSize: 14, lineHeight: 20 },
});
