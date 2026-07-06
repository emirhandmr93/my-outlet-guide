import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { motion } from "../../theme/motion";
import { useTranslation } from "../../hooks/useTranslation";

export type MapsCardProps = {
  title: string;
  googleText: string;
  appleText: string;
  yandexText: string;
  onPressGoogle: () => void;
  onPressApple: () => void;
  onPressYandex: () => void;
};

export function MapsCard({
  title,
  googleText,
  appleText,
  yandexText,
  onPressGoogle,
  onPressApple,
  onPressYandex,
}: MapsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <SectionTitle title={title} />

      <Text style={styles.description}>{t("sharedCards.maps.description")}</Text>

      <View style={styles.buttonStack}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={motion.pressOpacity}
          onPress={onPressGoogle}
        >
          <Text style={styles.primaryIcon}>🗺️</Text>
          <View style={styles.buttonTextWrap}>
            <Text style={styles.primaryButtonText}>{googleText}</Text>
            <Text style={styles.primaryButtonSubtext}>{t("sharedCards.maps.recommendedRoute")}</Text>
          </View>
          <Text style={styles.primaryArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={motion.pressOpacity}
            onPress={onPressApple}
          >
            <Text style={styles.secondaryIcon}></Text>
            <Text style={styles.secondaryButtonText}>{appleText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={motion.pressOpacity}
            onPress={onPressYandex}
          >
            <Text style={styles.secondaryIcon}>📍</Text>
            <Text style={styles.secondaryButtonText}>{yandexText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    marginBottom: spacing.lg,
  },

  buttonStack: {
    gap: spacing.sm,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },

  primaryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  buttonTextWrap: {
    flex: 1,
  },

  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
  },

  primaryButtonSubtext: {
    color: "#D8DEE9",
    fontSize: typography.small,
    fontWeight: typography.weightBold,
    marginTop: spacing.xs,
  },

  primaryArrow: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: typography.weightBlack,
  },

  secondaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  secondaryIcon: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },

  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },
});
