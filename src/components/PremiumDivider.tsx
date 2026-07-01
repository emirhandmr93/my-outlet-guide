import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type PremiumDividerProps = {
  size?: "sm" | "md" | "lg";
};

export function PremiumDivider({ size = "md" }: PremiumDividerProps) {
  return <View style={[styles.divider, styles[size]]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: "100%",
  },
  sm: {
    marginVertical: spacing.sm,
  },
  md: {
    marginVertical: spacing.md,
  },
  lg: {
    marginVertical: spacing.lg,
  },
});
