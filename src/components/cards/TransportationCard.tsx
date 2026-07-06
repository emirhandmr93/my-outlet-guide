import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import type { TransportationItem } from "../../services/transportationService";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { motion } from "../../theme/motion";
import { useTranslation } from "../../hooks/useTranslation";
import { formatTransportationTypeLabel } from "../../utils/transportationLabelFormatter";

export type TransportationCardProps = {
  title: string;
  transportationItems: TransportationItem[];
  notAvailableText: string;
  buttonText: string;
  onPressGuide: () => void;
};

function getTransportIcon(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("train") || normalizedType.includes("metro")) {
    return "🚆";
  }

  if (normalizedType.includes("bus") || normalizedType.includes("shuttle")) {
    return "🚌";
  }

  if (normalizedType.includes("taxi") || normalizedType.includes("car")) {
    return "🚕";
  }

  return "🧭";
}

export function TransportationCard({
  title,
  transportationItems,
  notAvailableText,
  buttonText,
  onPressGuide,
}: TransportationCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <SectionTitle title={title} />

      {transportationItems.length > 0 ? (
        transportationItems.map((item) => (
          <View key={item.transportationId} style={styles.itemCard}>
            <View style={styles.topRow}>
              <View style={styles.iconBubble}>
                <Text style={styles.icon}>{getTransportIcon(item.transportType)}</Text>
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.type}>{formatTransportationTypeLabel(item.transportType, t)}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>{t("transportation.duration")}</Text>
                <Text style={styles.metaValue}>{item.duration}</Text>
              </View>

              <View style={styles.metaDivider} />

              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>{t("transportation.cost")}</Text>
                <Text style={styles.metaValueGold}>{item.cost}</Text>
              </View>
            </View>

            {!!item.tip && <Text style={styles.tip}>{item.tip}</Text>}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>{notAvailableText}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={onPressGuide}
        activeOpacity={motion.pressOpacity}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.goldSurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  icon: {
    fontSize: 22,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: colors.textPrimary,
    fontWeight: typography.weightBlack,
    fontSize: typography.bodyLarge,
  },

  type: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: typography.weightExtraBold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  metaRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    paddingVertical: spacing.md,
  },

  metaBox: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  metaDivider: {
    width: 1,
    backgroundColor: colors.border,
  },

  metaLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    marginTop: spacing.xs,
  },

  metaValueGold: {
    color: colors.gold,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    marginTop: spacing.xs,
  },

  tip: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.body,
    fontStyle: "italic",
    lineHeight: typography.lineBody,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },

  buttonText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },

  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: typography.lineBody,
    marginBottom: spacing.sm,
  },
});
