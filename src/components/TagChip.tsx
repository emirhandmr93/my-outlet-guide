import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type TagChipProps = {
  label: string;
  icon?: string;
  active?: boolean;
  muted?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TagChip({ label, icon, active = false, muted = false, onPress, style }: TagChipProps) {
  const content = (
    <>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.text, active && styles.textActive, muted && styles.textMuted]}>
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.chip, active && styles.chipActive, muted && styles.chipMuted, style]}
        activeOpacity={0.84}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.chip, active && styles.chipActive, muted && styles.chipMuted, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.pill,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold,
  },
  chipMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    fontSize: typography.caption,
    marginRight: spacing.xs,
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    lineHeight: typography.lineCaption,
    flexShrink: 1,
  },
  textActive: {
    color: colors.primary,
    fontWeight: typography.weightBlack,
  },
  textMuted: {
    color: colors.textSecondary,
  },
});
