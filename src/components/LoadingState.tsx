import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type LoadingStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({ title = "Loading", message }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.gold} size="small" />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    marginTop: spacing.md,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    lineHeight: typography.lineCaption,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
