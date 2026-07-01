import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { motion } from "../../theme/motion";

export type WebsiteCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
};

export function WebsiteCard({
  title,
  description,
  buttonText,
  onPress,
}: WebsiteCardProps) {
  return (
    <Card>
      <View style={styles.iconBubble}>
        <Text style={styles.icon}>🌐</Text>
      </View>

      <SectionTitle title={title} />
      <Text style={styles.text}>{description}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={motion.pressOpacity}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.goldSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },

  icon: {
    fontSize: 24,
  },

  text: {
    fontSize: typography.bodyLarge,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  buttonText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },
});
