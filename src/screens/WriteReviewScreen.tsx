import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export function WriteReviewScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.icon}>✍️</Text>
        <Text style={styles.title}>{t("writeReview.unavailableTitle")}</Text>
        <Text style={styles.text}>{t("writeReview.unavailableText")}</Text>

        <TouchableOpacity style={styles.button} activeOpacity={0.86} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>
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
    paddingTop: 72,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "900",
  },
});
