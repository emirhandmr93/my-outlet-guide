import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const componentStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxl,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  premiumCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.hero,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h2,
    lineHeight: typography.lineH2,
    fontWeight: typography.weightBlack,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.bodyLarge,
    lineHeight: typography.lineBody,
    fontWeight: typography.weightRegular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  body: {
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    color: colors.textSecondary,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
});

export default componentStyles;
