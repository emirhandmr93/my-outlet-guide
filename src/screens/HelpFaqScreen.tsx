import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "../hooks/useTranslation";

export function HelpFaqScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("help.title")}</Text>

      <Text style={styles.pageSubtitle}>{t("help.subtitle")}</Text>

      <View style={styles.card}>
        <Text style={styles.question}>{t("help.flightQuestion")}</Text>

        <Text style={styles.answer}>{t("help.flightAnswer")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{t("help.taxQuestion")}</Text>

        <Text style={styles.answer}>{t("help.taxAnswer")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{t("help.offlineQuestion")}</Text>

        <Text style={styles.answer}>{t("help.offlineAnswer")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{t("help.reviewQuestion")}</Text>

        <Text style={styles.answer}>{t("help.reviewAnswer")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{t("help.accountQuestion")}</Text>

        <Text style={styles.answer}>{t("help.accountAnswer")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.question}>{t("help.deleteQuestion")}</Text>

        <Text style={styles.answer}>{t("help.deleteAnswer")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1F3A",
  },

  pageSubtitle: {
    fontSize: 15,
    color: "#C9A227",
    marginTop: 6,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  question: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 8,
  },

  answer: {
    color: "#666666",
    lineHeight: 22,
  },
});
