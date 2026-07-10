import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useTranslation } from "../../hooks/useTranslation";

export type ReviewStatsCardProps = {
  summaryText: string;
  transportationTitle: string;
  transportationValue: string;
  brandsTitle: string;
  brandsValue: string;
  restaurantsTitle: string;
  restaurantsValue: string;
  servicesTitle: string;
  servicesValue: string;
};

export function ReviewStatsCard({
  summaryText,
  transportationTitle,
  transportationValue,
  brandsTitle,
  brandsValue,
  restaurantsTitle,
  restaurantsValue,
  servicesTitle,
  servicesValue,
}: ReviewStatsCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>{t("sharedCards.reviews.overallRating")}</Text>
        <Text style={styles.summaryText}>{summaryText}</Text>
      </View>

      <View style={styles.grid}>
        <StatBox title={transportationTitle} value={transportationValue} />
        <StatBox title={brandsTitle} value={brandsValue} />
        <StatBox title={restaurantsTitle} value={restaurantsValue} />
        <StatBox title={servicesTitle} value={servicesValue} />
      </View>
    </View>
  );
}

type StatBoxProps = {
  title: string;
  value: string;
};

function StatBox({ title, value }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.statValue}>⭐ {value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  summaryBox: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  summaryLabel: {
    color: colors.gold,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },

  summaryText: {
    color: colors.textInverse,
    fontSize: typography.h2,
    fontWeight: typography.weightBlack,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  statBox: {
    width: "48%",
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statTitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: typography.weightExtraBold,
  },

  statValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    marginTop: spacing.xs,
  },
});
