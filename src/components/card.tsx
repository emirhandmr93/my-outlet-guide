import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";

export type CardVariant = "default" | "soft" | "premium" | "dark" | "gold";

type CardProps = {
  children: ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, variant = "default", style }: CardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    ...shadows.soft,
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
  },
  premium: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    ...shadows.card,
  },
  dark: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryMuted,
    ...shadows.premium,
  },
  gold: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.borderGold,
  },
});
