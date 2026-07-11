import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { outlets } from "../constants/outlets";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { addModerationNote, dismissReport, fetchModerationReports, fetchModerationReview, hideReviewForModeration, markReportReviewing, restoreReviewForModeration } from "../services/moderationService";
import type { RootReviewReport, ReviewReportModerationStatus } from "../services/reviewReportService";
import type { OutletReview } from "../types/review";
import { canUseModeration, getAdminAccess } from "../utils/adminAccess";

const FILTERS: ReviewReportModerationStatus[] = ["open", "reviewing", "action_taken", "dismissed"];

type ReportCard = { report: RootReviewReport; review: OutletReview | null; reportCount: number };

export function ReviewModerationScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [filter, setFilter] = useState<ReviewReportModerationStatus>("open");
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [note, setNote] = useState("");

  const moderatorUserId = currentUser?.uid || "";

  async function load() {
    const access = await getAdminAccess(moderatorUserId);
    if (!canUseModeration(access)) {
      setAllowed(false);
      return;
    }
    setAllowed(true);
    const reports = await fetchModerationReports(filter);
    const allForCounts = await Promise.all(reports.map((report) => fetchModerationReview(report.outletId, report.reviewId)));
    const groupedCounts = reports.reduce<Record<string, number>>((acc, report) => {
      acc[`${report.outletId}:${report.reviewId}`] = (acc[`${report.outletId}:${report.reviewId}`] || 0) + 1;
      return acc;
    }, {});
    setCards(reports.map((report, index) => ({ report, review: allForCounts[index], reportCount: groupedCounts[`${report.outletId}:${report.reviewId}`] || 1 })));
  }

  useEffect(() => { load().catch(() => setAllowed(false)); }, [filter, moderatorUserId]);

  const title = useMemo(() => t("moderation.inboxTitle"), [t]);

  async function run(action: () => Promise<void>, successKey: string) {
    try {
      await action();
      Alert.alert(t(successKey));
      setNote("");
      await load();
    } catch {
      Alert.alert(t("moderation.actionFailed"));
    }
  }

  if (!allowed) {
    return <View style={styles.center}><Text style={styles.denied}>{t("moderation.permissionDenied")}</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}><Text style={styles.kicker}>{t("moderation.title")}</Text><Text style={styles.title}>{title}</Text></View>
      <View style={styles.tabs}>{FILTERS.map((item) => <TouchableOpacity key={item} style={[styles.tab, filter === item && styles.tabActive]} onPress={() => setFilter(item)}><Text style={[styles.tabText, filter === item && styles.tabTextActive]}>{t(`moderation.filter.${item}`)}</Text></TouchableOpacity>)}</View>
      <TextInput style={styles.noteInput} value={note} onChangeText={setNote} placeholder={t("moderation.note")} />
      {cards.map(({ report, review, reportCount }) => {
        const outlet = outlets.find((item) => item.outletId === report.outletId);
        return <View key={report.reportId} style={styles.card}>
          <Text style={styles.outlet}>{outlet?.name || report.outletId}</Text>
          <Text style={styles.meta}>{review?.userDisplayName || report.reviewAuthorUserId || "—"} • ⭐ {review?.rating ?? "—"}</Text>
          <Text style={styles.preview}>{review?.title ? `${review.title} — ` : ""}{review?.comment || ""}</Text>
          <Text style={styles.meta}>{t("moderation.reason")}: {report.reason}</Text>
          <Text style={styles.meta}>{t("moderation.reportingUsers")}: {reportCount} • {new Date(report.updatedAt).toLocaleDateString()}</Text>
          <Text style={styles.meta}>status: {review?.status || "—"}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => run(() => markReportReviewing(report, moderatorUserId), "moderation.reportClosed")}><Text style={styles.buttonText}>{t("moderation.markReviewing")}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => run(() => dismissReport(report, moderatorUserId, note), "moderation.reportClosed")}><Text style={styles.buttonText}>{t("moderation.dismissReport")}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={() => run(() => hideReviewForModeration(report, moderatorUserId, note), "moderation.reviewHidden")}><Text style={styles.dangerText}>{t("moderation.hideReview")}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => run(() => restoreReviewForModeration(report, moderatorUserId, note), "moderation.reviewRestored")}><Text style={styles.buttonText}>{t("moderation.restoreReview")}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => run(() => addModerationNote(report, moderatorUserId, note), "moderation.reportClosed")}><Text style={styles.buttonText}>{t("moderation.addNote")}</Text></TouchableOpacity>
          </View>
        </View>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20, paddingTop: 60 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }, denied: { color: "#0B1F3A", fontWeight: "900" }, hero: { backgroundColor: "#0B1F3A", borderRadius: 24, padding: 20, marginBottom: 14 }, kicker: { color: "#C9A227", fontWeight: "900" }, title: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", marginTop: 6 }, tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }, tab: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" }, tabActive: { backgroundColor: "#0B1F3A" }, tabText: { color: "#0B1F3A", fontWeight: "900" }, tabTextActive: { color: "#FFFFFF" }, noteInput: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 12, marginBottom: 12 }, card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 }, outlet: { color: "#0B1F3A", fontSize: 17, fontWeight: "900" }, meta: { color: "#666666", fontWeight: "700", marginTop: 6 }, preview: { color: "#0B1F3A", marginTop: 8, lineHeight: 20 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, button: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#F7F8FA" }, buttonText: { color: "#0B1F3A", fontWeight: "900" }, dangerButton: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#FEE2E2" }, dangerText: { color: "#991B1B", fontWeight: "900" },
});
