import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { languages } from "../constants/languages";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export function LanguageSettingsScreen() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.kicker}>{t("languageSettings.kicker")}</Text>
        <Text style={styles.pageTitle}>{t("languageSettings.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("languageSettings.subtitle")}</Text>
      </View>

      <View style={styles.sectionCard}>
        {languages.map((item) => {
          const selected = language === item.languageCode;

          return (
            <TouchableOpacity
              key={item.languageCode}
              style={[styles.languageRow, selected && styles.selectedRow]}
              activeOpacity={0.86}
              onPress={() => setLanguage(item.languageCode)}
            >
              <View style={styles.languageLeft}>
                <Text style={styles.flag}>{item.flag}</Text>

                <View>
                  <Text style={styles.languageName}>{item.languageName}</Text>
                  <Text style={styles.languageCode}>{item.languageCode.toUpperCase()}</Text>
                </View>
              </View>

              <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
                <Text style={[styles.checkmark, selected && styles.checkmarkActive]}>
                  {selected ? "✓" : ""}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.xl,
    paddingTop: 70,
    paddingBottom: 120,
  },

  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },

  pageTitle: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },

  pageSubtitle: {
    color: "#D8DEE9",
    fontSize: typography.body,
    lineHeight: 22,
  },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },

  languageRow: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectedRow: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.gold,
  },

  languageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },

  flag: {
    fontSize: 24,
  },

  languageName: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: "900",
  },

  languageCode: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: "800",
    marginTop: 3,
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircleActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },

  checkmark: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "900",
  },

  checkmarkActive: {
    color: colors.primary,
  },
});
