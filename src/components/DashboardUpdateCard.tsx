import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type DashboardUpdateCardProps = {
  label: string;
  title: string;
  description: string;
  actionText: string;
  badge?: string;
  metadata?: Record<string, string>;
  onPress: () => void;
};

const dealLabels: Record<string, string> = {
  good: "Good Deal",
  great: "Great Deal",
  amazing: "Amazing Deal",
};

export function DashboardUpdateCard({
  label,
  title,
  description,
  actionText,
  badge,
  metadata,
  onPress,
}: DashboardUpdateCardProps) {
  const dealLevel = metadata?.dealLevel
    ? dealLabels[metadata.dealLevel] || metadata.dealLevel
    : undefined;
  const route = metadata?.route;
  const price = metadata?.price;
  const updated = metadata?.updated;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{badge || label}</Text>
        {dealLevel ? <Text style={styles.dealBadge}>{dealLevel}</Text> : null}
      </View>

      <Text style={styles.title}>{title}</Text>

      {route || price ? (
        <View style={styles.dataBox}>
          {route ? <Text style={styles.route}>{route}</Text> : null}
          {price ? <Text style={styles.price}>{price}</Text> : null}
        </View>
      ) : (
        <Text style={styles.description}>{description}</Text>
      )}

      {route || price ? (
        <Text style={styles.description}>{updated ? `Updated ${updated}` : description}</Text>
      ) : null}

      <View style={styles.actionRow}>
        <Text style={styles.action}>{actionText}</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.hero,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  label: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  dealBadge: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    overflow: "hidden",
  },

  title: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    lineHeight: typography.lineH2,
    fontWeight: typography.weightBlack,
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },

  dataBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  route: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    marginBottom: spacing.xs,
  },

  price: {
    color: colors.gold,
    fontSize: typography.h2,
    lineHeight: typography.lineH2,
    fontWeight: typography.weightBlack,
  },

  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    marginBottom: spacing.md,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  action: {
    color: colors.primary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
  },

  arrow: {
    color: colors.primary,
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
  },
});
