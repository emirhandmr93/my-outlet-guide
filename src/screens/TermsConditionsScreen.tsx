import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "../hooks/useTranslation";

export function TermsConditionsScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("terms.title")}</Text>
      <Text style={styles.pageSubtitle}>{t("terms.subtitle")}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("terms.useTitle")}</Text>
        <Text style={styles.cardText}>{t("terms.useText")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("terms.accuracyTitle")}</Text>
        <Text style={styles.cardText}>{t("terms.accuracyText")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("terms.reviewsTitle")}</Text>
        <Text style={styles.cardText}>{t("terms.reviewsText")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("terms.thirdPartyTitle")}</Text>
        <Text style={styles.cardText}>{t("terms.thirdPartyText")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("terms.accountTitle")}</Text>
        <Text style={styles.cardText}>{t("terms.accountText")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  pageTitle: { fontSize: 28, fontWeight: "800", color: "#0B1F3A" },
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 6,
  },
  cardText: {
    color: "#666666",
    lineHeight: 20,
  },
});
