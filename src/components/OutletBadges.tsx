import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type OutletBadgesProps = {
  taxFreeText: string;
  status: string;
  rating: number;
};

export function OutletBadges({ taxFreeText, status, rating }: OutletBadgesProps) {
  return (
    <View style={styles.badgeRow}>
      <View style={styles.badgePrimary}>
        <Text style={styles.badgePrimaryText}>{taxFreeText}</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>⭐ {rating}</Text>
      </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badgePrimary: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gold,
  },

  badgeText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: "800",
    textTransform: "capitalize",
  },

  badgePrimaryText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "900",
  },
});
