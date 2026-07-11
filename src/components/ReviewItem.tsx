import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { OutletReview } from "../types/review";

type ReviewItemProps = {
  review: OutletReview;
  currentUserId?: string;
  editedText: string;
  helpfulText: string;
  helpfulActiveText: string;
  helpfulOwnDisabledText: string;
  previousCommentLabel: string;
  previousTitleLabel: string;
  editText: string;
  deleteText: string;
  reportText: string;
  anonymousAccountText: string;
  onHelpful: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
};

export function ReviewItem({
  review,
  currentUserId,
  editedText,
  helpfulText,
  helpfulActiveText,
  helpfulOwnDisabledText,
  previousCommentLabel,
  previousTitleLabel,
  editText,
  deleteText,
  reportText,
  anonymousAccountText,
  onHelpful,
  onEdit,
  onDelete,
  onReport,
}: ReviewItemProps) {
  const userName = review.authorDeleted === true ? anonymousAccountText : review.userDisplayName || review.userName || "Anonymous Shopper";
  const initial = userName.trim().charAt(0).toUpperCase() || "U";
  const isAuthor = Boolean(currentUserId && review.userId === currentUserId);
  const isHelpful = Boolean(currentUserId && review.helpfulUserIds?.includes(currentUserId));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
        <View style={styles.headerTextWrap}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.ratingBadge}><Text style={styles.ratingText}>⭐ {review.rating}</Text></View>
      </View>

      {review.title ? <Text style={styles.title}>{review.title}</Text> : null}
      <Text style={styles.comment}>{review.comment}</Text>

      {review.editedAt || (review.updatedAt && review.updatedAt !== review.createdAt) ? (
        <View style={styles.editedBlock}>
          <Text style={styles.editedText}>{editedText} • {new Date(review.editedAt || review.updatedAt).toLocaleDateString()}</Text>
          {review.previousComment ? (
            <Text style={styles.previousText}>{previousCommentLabel}: {review.previousComment}</Text>
          ) : review.previousTitle ? (
            <Text style={styles.previousText}>{previousTitleLabel}: {review.previousTitle}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        {isAuthor ? (
          <View style={[styles.actionPill, styles.actionPillDisabled]}>
            <Text style={styles.actionTextDisabled}>{helpfulOwnDisabledText} ({review.helpfulCount || 0})</Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.actionPill, isHelpful && styles.actionPillActive]} onPress={onHelpful}>
            <Text style={[styles.actionText, isHelpful && styles.actionTextActive]}>
              {isHelpful ? helpfulActiveText : helpfulText} ({review.helpfulCount || 0})
            </Text>
          </TouchableOpacity>
        )}

        {isAuthor ? (
          <>
            <TouchableOpacity style={styles.actionPill} onPress={onEdit}><Text style={styles.actionText}>{editText}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionPill} onPress={onDelete}><Text style={styles.actionText}>{deleteText}</Text></TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.actionPill} onPress={onReport}><Text style={styles.actionText}>{reportText}</Text></TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#0B1F3A", alignItems: "center", justifyContent: "center", marginRight: 10 },
  avatarText: { color: "#C9A227", fontSize: 15, fontWeight: "900" },
  headerTextWrap: { flex: 1 },
  userName: { color: "#0B1F3A", fontSize: 15, fontWeight: "900" },
  date: { color: "#999999", fontSize: 12, fontWeight: "700", marginTop: 2 },
  ratingBadge: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#E5E7EB" },
  ratingText: { color: "#0B1F3A", fontSize: 12, fontWeight: "900" },
  title: { color: "#0B1F3A", fontSize: 15, fontWeight: "900", marginTop: 12 },
  comment: { color: "#666666", fontSize: 14, lineHeight: 21, marginTop: 8 },
  editedBlock: { marginTop: 8 },
  editedText: { color: "#C9A227", fontSize: 12, fontWeight: "800" },
  previousText: { color: "#666666", fontSize: 12, fontWeight: "700", lineHeight: 18, marginTop: 4 },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  actionPill: { backgroundColor: "#FFFFFF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  actionPillActive: { backgroundColor: "#0B1F3A", borderColor: "#0B1F3A" },
  actionPillDisabled: { backgroundColor: "#F1F5F9", borderColor: "#E5E7EB" },
  actionTextDisabled: { color: "#64748B", fontSize: 12, fontWeight: "900" },
  actionText: { color: "#0B1F3A", fontSize: 12, fontWeight: "900" },
  actionTextActive: { color: "#FFFFFF" },
});
