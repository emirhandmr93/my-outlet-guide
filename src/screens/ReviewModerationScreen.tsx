import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { outlets } from "../constants/outlets";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../hooks/useTranslation";
import { addModerationNote, dismissReport, fetchGroupedModerationReports, hideReviewForModeration, markReportReviewing, restoreReviewForModeration, type ModerationReportGroup } from "../services/moderationService";
import type { RootReviewReport, ReviewReportModerationStatus } from "../services/reviewReportService";
import type { OutletReview } from "../types/review";
import { canUseModeration, getAdminAccess } from "../utils/adminAccess";

const FILTERS: ReviewReportModerationStatus[] = ["open", "reviewing", "action_taken", "dismissed"];

type ReportCard = ModerationReportGroup;

export function ReviewModerationScreen() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [filter, setFilter] = useState<ReviewReportModerationStatus>("open");
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [note, setNote] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const moderatorUserId = currentUser?.uid || "";

  async function load() {
    const access = await getAdminAccess(moderatorUserId);
    if (!canUseModeration(access)) {
      setAllowed(false);
      return;
    }
    setAllowed(true);
    setCards(await fetchGroupedModerationReports(filter));
  }

  useEffect(() => { load().catch(() => setAllowed(false)); }, [filter, moderatorUserId]);

  const title = useMemo(() => t("moderation.inboxTitle"), [t]);

  async function run(actionName: string, group: ModerationReportGroup, action: () => Promise<void>, successKey: string, requireNote = false) {
    if (requireNote && !note.trim()) {
      Alert.alert(t("moderation.noteRequired"));
      return;
    }
    try {
      setBusyAction(`${group.groupKey}:${actionName}`);
      await action();
      Alert.alert(t(successKey));
      setNote("");
      await load();
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "unknown";
      const safeMessage = error instanceof Error ? error.message.slice(0, 120) : "unknown";
      const hasAdminAccess = allowed && Boolean(moderatorUserId);
      const payloadKeys = actionName === "restore_review"
        ? ["status", "updatedAt", "moderatedBy", "moderatedAt", "moderationNote"]
        : ["status", "updatedAt", "moderationNote", "moderatedBy", "moderatedAt"];
      console.warn("reviewModerationActionFailed", { code, safeMessage, action: actionName, groupKey: group.groupKey, reportIdsCount: group.reports.length, outletId: group.outletId, reviewId: group.reviewId, hasAdminAccess, payloadKeys });
      Alert.alert(code === "permission-denied" ? t("moderation.permissionDenied") : t("moderation.actionFailed"));
    } finally {
      setBusyAction(null);
    }
  }

  function reasonSummary(group: ModerationReportGroup) {
    if (group.reasons.length > 1) return t("moderation.multipleReasons");
    return t(`moderation.reason.${group.reasons[0]}`);
  }

  if (!allowed) {
    return <View style={styles.center}><Text style={styles.denied}>{t("moderation.permissionDenied")}</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}><Text style={styles.kicker}>{t("moderation.title")}</Text><Text style={styles.title}>{title}</Text></View>
      <View style={styles.tabs}>{FILTERS.map((item) => <TouchableOpacity key={item} style={[styles.tab, filter === item && styles.tabActive]} onPress={() => setFilter(item)}><Text style={[styles.tabText, filter === item && styles.tabTextActive]}>{t(`moderation.filter.${item}`)}</Text></TouchableOpacity>)}</View>
      <TextInput style={styles.noteInput} value={note} onChangeText={setNote} placeholder={t("moderation.note")} />
      {cards.map((group) => {
        const { primaryReport: report, review, reportCount } = group;
        const outlet = outlets.find((item) => item.outletId === group.outletId);
        const reviewStatus = review?.status || "published";
        const isBusy = busyAction?.startsWith(`${group.groupKey}:`);
        return <View key={group.groupKey} style={styles.card}>
          <Text style={styles.outlet}>{outlet?.name || group.outletId}</Text>
          <Text style={styles.meta}>{review?.userDisplayName || t("reviews.anonymousAccount")} • ⭐ {review?.rating ?? "—"}</Text>
          <Text style={styles.preview}>{review?.title ? `${review.title} — ` : ""}{review?.comment || ""}</Text>
          <Text style={styles.meta}>{t("moderation.reasonLabel")}: {reasonSummary(group)}</Text>
          <Text style={styles.meta}>{t("moderation.reportingUsers")}: {reportCount} • {new Date(group.latestUpdatedAt).toLocaleDateString()}</Text>
          <Text style={styles.meta}>{t("moderation.reportStatus")}: {t(`moderation.reportStatus.${report.status}`)} • {t("moderation.reviewStatus")}: {t(`moderation.reviewStatus.${reviewStatus}`)}</Text>
          <View style={styles.actions}>
            {report.status === "open" ? <TouchableOpacity disabled={isBusy} style={styles.button} onPress={() => run("mark_reviewing", group, () => markReportReviewing(group, moderatorUserId), "moderation.markedReviewing")}><Text style={styles.buttonText}>{t("moderation.markReviewing")}</Text></TouchableOpacity> : null}
            {report.status !== "dismissed" ? <TouchableOpacity disabled={isBusy} style={styles.button} onPress={() => run("dismiss_report", group, () => dismissReport(group, moderatorUserId, note), "moderation.reportDismissed")}><Text style={styles.buttonText}>{t("moderation.dismissReport")}</Text></TouchableOpacity> : null}
            {reviewStatus === "hidden" ? <TouchableOpacity disabled={isBusy} style={styles.button} onPress={() => run("restore_review", group, () => restoreReviewForModeration(group, moderatorUserId, note), "moderation.reviewRestored")}><Text style={styles.buttonText}>{t("moderation.restoreReview")}</Text></TouchableOpacity> : <TouchableOpacity disabled={isBusy} style={styles.dangerButton} onPress={() => run("hide_review", group, () => hideReviewForModeration(group, moderatorUserId, note), "moderation.reviewHidden")}><Text style={styles.dangerText}>{t("moderation.hideReview")}</Text></TouchableOpacity>}
            <TouchableOpacity disabled={isBusy} style={styles.button} onPress={() => run("add_note", group, () => addModerationNote(group, moderatorUserId, note), "moderation.noteSaved", true)}><Text style={styles.buttonText}>{t("moderation.addNote")}</Text></TouchableOpacity>
          </View>
        </View>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20, paddingTop: 60 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }, denied: { color: "#0B1F3A", fontWeight: "900" }, hero: { backgroundColor: "#0B1F3A", borderRadius: 24, padding: 20, marginBottom: 14 }, kicker: { color: "#C9A227", fontWeight: "900" }, title: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", marginTop: 6 }, tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }, tab: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" }, tabActive: { backgroundColor: "#0B1F3A" }, tabText: { color: "#0B1F3A", fontWeight: "900" }, tabTextActive: { color: "#FFFFFF" }, noteInput: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, padding: 12, marginBottom: 12 }, card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 }, outlet: { color: "#0B1F3A", fontSize: 17, fontWeight: "900" }, meta: { color: "#666666", fontWeight: "700", marginTop: 6 }, preview: { color: "#0B1F3A", marginTop: 8, lineHeight: 20 }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, button: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#F7F8FA" }, buttonText: { color: "#0B1F3A", fontWeight: "900" }, dangerButton: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#FEE2E2" }, dangerText: { color: "#991B1B", fontWeight: "900" },
});
