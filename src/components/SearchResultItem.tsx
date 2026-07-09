import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { SearchResult } from "../services/searchTypes";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type SearchResultItemProps = {
  item: SearchResult;
  onPress: () => void;
};

const icons: Record<SearchResult["type"], string> = {
  outlet: "📍",
  brand: "🏷️",
  city: "🏙️",
  country: "🌍",
  category: "✨",
  feature: "⚙️",
};

export function SearchResultItem({ item, onPress }: SearchResultItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.subtitle}`}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icons[item.type]}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 76,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 2,
  },

  icon: {
    fontSize: 20,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  type: {
    color: colors.gold,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    lineHeight: typography.lineCaption,
    flexShrink: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },

  title: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    lineHeight: typography.lineBody,
    flexShrink: 1,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
    fontWeight: typography.weightBold,
    lineHeight: typography.lineCaption,
    flexShrink: 1,
  },

  arrow: {
    color: colors.gold,
    fontSize: typography.h2,
    fontWeight: typography.weightBold,
    marginLeft: spacing.sm,
    marginTop: 10,
  },
});
