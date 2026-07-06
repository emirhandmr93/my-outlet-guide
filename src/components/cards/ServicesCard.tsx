import { StyleSheet, Text, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useTranslation } from "../../hooks/useTranslation";
import { formatServiceLabel } from "../../utils/serviceLabelFormatter";

export type ServicesCardProps = {
  title: string;
  services: string[];
  notAvailableText: string;
};

export function ServicesCard({
  title,
  services,
  notAvailableText,
}: ServicesCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <SectionTitle title={title} />

      {services.length > 0 ? (
        <View style={styles.grid}>
          {services.map((service) => (
            <View key={service} style={styles.pill}>
              <Text style={styles.icon}>✓</Text>
              <Text style={styles.text}>{formatServiceLabel(service, t)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>{notAvailableText}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  pill: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    color: colors.gold,
    fontSize: typography.body,
    fontWeight: typography.weightBlack,
    marginRight: spacing.xs,
  },

  text: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: typography.weightExtraBold,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: typography.lineBody,
  },
});
