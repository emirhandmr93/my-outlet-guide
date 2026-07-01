import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  rightText?: string;
  style?: StyleProp<TextStyle>;
};

export function SectionTitle({
  title,
  subtitle,
  eyebrow,
  rightText,
  style,
}: SectionTitleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.textBlock}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={[styles.title, style]}>{title}</Text>
        </View>

        {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: typography.micro,
    fontWeight: typography.weightBlack,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    lineHeight: typography.lineH3,
    fontWeight: typography.weightBlack,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    lineHeight: typography.lineBody,
    marginTop: spacing.xs,
  },
  rightText: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    marginTop: spacing.xs,
  },
});
