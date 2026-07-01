import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { PremiumIconButton } from "./PremiumIconButton";

type EmptyStateProps = {
  icon?: string;
  title: string;
  message?: string;
  actionText?: string;
  onPressAction?: () => void;
};

export function EmptyState({ icon = "✨", title, message, actionText, onPressAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {actionText && onPressAction ? (
        <PremiumIconButton label={actionText} icon="→" onPress={onPressAction} variant="primary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    lineHeight: typography.lineH3,
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
