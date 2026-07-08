import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type PremiumIconButtonVariant = "primary" | "secondary" | "gold" | "ghost";

type PremiumIconButtonProps = {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: PremiumIconButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PremiumIconButton({
  label,
  icon,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: PremiumIconButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled, style]}
      activeOpacity={0.84}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.label, styles[`${variant}Text`], disabled && styles.disabledText]}>
        {label}
      </Text>
      {icon ? <Text style={[styles.icon, styles[`${variant}Text`]]}>{icon}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.soft,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gold: {
    backgroundColor: colors.gold,
  },
  ghost: {
    backgroundColor: colors.surfaceSoft,
  },
  disabled: {
    opacity: 0.48,
  },
  label: {
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    fontWeight: typography.weightBlack,
    textAlign: "center",
    flexShrink: 1,
  },
  icon: {
    fontSize: typography.bodyLarge,
    lineHeight: typography.lineBody,
    fontWeight: typography.weightBlack,
  },
  primaryText: {
    color: colors.textInverse,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  goldText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.textPrimary,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
