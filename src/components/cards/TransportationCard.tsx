import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import {
  getTransportationDisplayFallbacks,
  getTransportationOptionDisplayModel,
  getTransportationCompactSummaryLabel,
  type TransportationV2Option,
} from "../../services/transportationV2Service";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { motion } from "../../theme/motion";
import { useTranslation } from "../../hooks/useTranslation";

export type TransportationCardProps = {
  title: string;
  summaryItems: TransportationV2Option[];
  notAvailableText: string;
  buttonText: string;
  onPressGuide: () => void;
};

function getSummaryTitle(
  originGroup: TransportationV2Option["originGroup"],
  t: (key: string) => string,
) {
  if (originGroup === "airport") return t("transportation.v2.airportFrom");
  if (originGroup === "city") return t("transportation.v2.cityFrom");
  return t("transportation.v2.shuttle");
}

function getIcon(originGroup: TransportationV2Option["originGroup"]) {
  if (originGroup === "airport") return "✈️";
  if (originGroup === "shuttle") return "🚌";
  return "🧭";
}

export function TransportationCard({
  title,
  summaryItems,
  notAvailableText,
  buttonText,
  onPressGuide,
}: TransportationCardProps) {
  const { t, language } = useTranslation();
  const fallbacks = getTransportationDisplayFallbacks(language);

  return (
    <Card>
      <SectionTitle title={title} />
      <Text style={styles.subtitle}>
        {t("transportation.v2.detailSubtitle")}
      </Text>

      {summaryItems.length > 0 ? (
        summaryItems.slice(0, 2).map((rawItem) => {
          const item = getTransportationOptionDisplayModel(rawItem, language);
          const meta = getTransportationCompactSummaryLabel(item, language);
          return meta ? (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.icon}>{getIcon(item.originGroup)}</Text>
              <View style={styles.summaryText}>
                <Text style={styles.title}>
                  {getSummaryTitle(item.originGroup, t)}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {meta}
                </Text>
              </View>
            </View>
          ) : null;
        })
      ) : (
        <Text style={styles.emptyText}>
          {fallbacks.details || notAvailableText}
        </Text>
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
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  icon: { width: 36, fontSize: 22, marginRight: spacing.sm },
  summaryText: { flex: 1, minWidth: 0 },
  title: {
    color: colors.textPrimary,
    fontWeight: typography.weightBlack,
    fontSize: typography.bodyLarge,
  },
  meta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 20,
    fontWeight: typography.weightBold,
  },
  emptyText: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: colors.surface,
    fontWeight: typography.weightBlack,
    fontSize: typography.body,
  },
});
