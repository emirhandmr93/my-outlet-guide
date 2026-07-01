import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ReviewItemProps = {
  userName: string;
  rating: string;
  comment: string;
  createdAt: string;
  isEdited?: boolean;
  updatedAt?: string;
  previousComment?: string;
  editedText: string;
  previousCommentTitle: string;
  helpfulText: string;
  helpfulCount: number;
  isHelpfulByCurrentUser: boolean;
  canEdit: boolean;
  editText: string;
  onPressHelpful: () => void;
  onPressEdit: () => void;
};

export function ReviewItem({
  userName,
  rating,
  comment,
  createdAt,
  isEdited,
  updatedAt,
  previousComment,
  editedText,
  previousCommentTitle,
  helpfulText,
  helpfulCount,
  isHelpfulByCurrentUser,
  canEdit,
  editText,
  onPressHelpful,
  onPressEdit,
}: ReviewItemProps) {
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.date}>{createdAt}</Text>
        </View>

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {rating}</Text>
        </View>
      </View>

      <Text style={styles.comment}>{comment}</Text>

      {isEdited && (
        <Text style={styles.editedText}>
          {editedText} {updatedAt ? `• ${updatedAt}` : ""}
        </Text>
      )}

      {previousComment && (
        <View style={styles.previousCommentBox}>
          <Text style={styles.previousCommentTitle}>{previousCommentTitle}</Text>
          <Text style={styles.previousCommentText}>{previousComment}</Text>
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.helpfulButton, isHelpfulByCurrentUser && styles.helpfulButtonActive]}
          activeOpacity={0.86}
          onPress={onPressHelpful}
        >
          <Text
            style={[
              styles.helpfulTextStyle,
              isHelpfulByCurrentUser && styles.helpfulTextActive,
            ]}
          >
            {isHelpfulByCurrentUser ? "👍" : "👍🏻"} {helpfulText} ({helpfulCount})
          </Text>
        </TouchableOpacity>

        {canEdit && (
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.86}
            onPress={onPressEdit}
          >
            <Text style={styles.editButtonText}>{editText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F7F8FA",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0B1F3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#C9A227",
    fontSize: 15,
    fontWeight: "900",
  },

  headerTextWrap: {
    flex: 1,
  },

  userName: {
    color: "#0B1F3A",
    fontSize: 15,
    fontWeight: "900",
  },

  date: {
    color: "#999999",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  ratingBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  ratingText: {
    color: "#0B1F3A",
    fontSize: 12,
    fontWeight: "900",
  },

  comment: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  editedText: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },

  previousCommentBox: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  previousCommentTitle: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },

  previousCommentText: {
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },

  helpfulButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  helpfulButtonActive: {
    backgroundColor: "#0B1F3A",
    borderColor: "#0B1F3A",
  },

  helpfulTextStyle: {
    color: "#0B1F3A",
    fontSize: 13,
    fontWeight: "900",
  },

  helpfulTextActive: {
    color: "#FFFFFF",
  },

  editButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  editButtonText: {
    color: "#0B1F3A",
    fontSize: 13,
    fontWeight: "900",
  },
});
