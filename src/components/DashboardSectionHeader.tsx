import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type DashboardSectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function DashboardSectionHeader({ title, subtitle }: DashboardSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  title: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    lineHeight: typography.lineH3,
    fontWeight: typography.weightBlack,
    letterSpacing: -0.2,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
    lineHeight: typography.lineBody,
  },
});
