import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { formatRating } from "../services/reviewsRatingsService";

type OutletBadgesProps = {
  taxFreeText: string;
  status: string;
  rating?: number | null;
};

export function OutletBadges({ taxFreeText, status, rating }: OutletBadgesProps) {
  const displayRating = formatRating(rating);

  return (
    <View style={styles.badgeRow}>
      <View style={styles.badgePrimary}>
        <Text style={styles.badgePrimaryText}>{taxFreeText}</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>

      {displayRating ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⭐ {displayRating}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },

  badgePrimary: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gold,
    justifyContent: "center",
  },

  badgeText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: typography.weightExtraBold,
    lineHeight: typography.lineCaption,
    flexShrink: 1,
    textTransform: "capitalize",
  },

  badgePrimaryText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    lineHeight: typography.lineCaption,
    flexShrink: 1,
  },
});
