import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useTranslation } from "../hooks/useTranslation";
import { PremiumIconButton } from "./PremiumIconButton";

type ErrorStateProps = {
  title?: string;
  message: string;
  actionText?: string;
  onPressAction?: () => void;
};

export function ErrorState({ title, message, actionText, onPressAction }: ErrorStateProps) {
  const { t } = useTranslation();
  const displayTitle = title ?? t("common.somethingWentWrong");

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>!</Text>
      </View>
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionText && onPressAction ? (
        <PremiumIconButton label={actionText} icon="↻" onPress={onPressAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  icon: {
    color: colors.textInverse,
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
