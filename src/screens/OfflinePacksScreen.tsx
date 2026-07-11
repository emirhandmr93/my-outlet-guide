import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "../hooks/useTranslation";
import { getOfflineAvailabilitySummary } from "../services/offlinePackEngine";

const availableOfflineKeys = ["guide", "records", "media", "taxFree"] as const;
const requiresInternetKeys = ["reviews", "favoritesTrips", "notifications", "currency"] as const;

export function OfflinePacksScreen() {
  const { t } = useTranslation();
  const summary = getOfflineAvailabilitySummary();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("offline.kicker")}</Text>
        <Text style={styles.pageTitle}>{t("offline.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("offline.subtitle")}</Text>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>{t("offline.alreadyAvailable")}</Text>
        <Text style={styles.noticeText}>{t("offline.alreadyAvailableText")}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={`${summary.outletCount}`} label={t("offline.stat.outlets")} />
        <StatCard value={`${summary.countryCount}`} label={t("offline.stat.countries")} />
      </View>
      <View style={styles.statsRow}>
        <StatCard value={`${summary.brandCount}`} label={t("offline.stat.brands")} />
        <StatCard value={`${summary.localMediaAssetCount}`} label={t("offline.stat.media")} />
      </View>

      <Text style={styles.sectionTitle}>{t("offline.availableSection")}</Text>
      {summary.availableOffline.map((item, index) => (
        <StatusCard key={availableOfflineKeys[index] ?? item.title} icon="✅" title={t(`offline.available.${availableOfflineKeys[index]}.title`)} text={t(`offline.available.${availableOfflineKeys[index]}.text`)} />
      ))}

      <Text style={styles.sectionTitle}>{t("offline.requiresInternetSection")}</Text>
      {summary.requiresInternet.map((item, index) => (
        <StatusCard key={requiresInternetKeys[index] ?? item.title} icon="🌐" title={t(`offline.requires.${requiresInternetKeys[index]}.title`)} text={t(`offline.requires.${requiresInternetKeys[index]}.text`)} />
      ))}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>{t("offline.noPacksTitle")}</Text>
        <Text style={styles.noticeText}>{t("offline.noPacksText")}</Text>
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
