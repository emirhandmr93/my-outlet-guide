import { StyleSheet, Text, View } from "react-native";

import type { NearbyOutlet, UserCoordinates } from "../services/nearbyOutlets";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";

type Props = {
  userLocation: UserCoordinates;
  outlets: readonly NearbyOutlet[];
  fallbackText: string;
  onSelect: (outlet: NearbyOutlet) => void;
};

export function NearbyOutletsMap({ fallbackText }: Props) {
  return (
    <View style={styles.fallback} accessibilityRole="text">
      <Text style={styles.fallbackText}>{fallbackText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    padding: spacing.lg,
  },
  fallbackText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
