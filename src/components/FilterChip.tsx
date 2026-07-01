import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type FilterChipProps = {
  label: string;
  icon?: string;
  onRemove?: () => void;
  onPress?: () => void;
};

export function FilterChip({ label, icon, onRemove, onPress }: FilterChipProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.chip}
        activeOpacity={onPress ? 0.84 : 1}
        onPress={onPress}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>

      {onRemove ? (
        <TouchableOpacity style={styles.removeButton} activeOpacity={0.78} onPress={onRemove}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.goldSoft,
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  icon: {
    fontSize: typography.caption,
    marginRight: spacing.xs,
  },
  label: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -spacing.md,
  },
  removeText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    lineHeight: 18,
  },
});
