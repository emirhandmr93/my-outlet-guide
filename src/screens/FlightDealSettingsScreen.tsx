import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "../hooks/useTranslation";

export function FlightDealSettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("flightDeals.unavailableKicker")}</Text>
        <Text style={styles.title}>{t("flightDeals.unavailableTitle")}</Text>
        <Text style={styles.subtitle}>{t("flightDeals.unavailableBody")}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{t("flightDeals.unavailableStatusTitle")}</Text>
        <Text style={styles.infoText}>{t("flightDeals.unavailableStatusBody")}</Text>
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
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
  },
  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
  },
  subtitle: {
    color: "#D8DEE9",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#C9A227",
  },
  infoTitle: {
    color: "#0B1F3A",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8,
  },
  infoText: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21,
  },
});
