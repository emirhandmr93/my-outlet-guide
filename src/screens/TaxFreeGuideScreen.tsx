import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CountrySelector } from "../components/CountrySelector";
import { countries } from "../constants/countries";
import { getTaxFreeRule, taxFreeRules } from "../constants/taxFreeRules";
import { useSavings } from "../contexts/SavingsContext";
import { useTranslation } from "../hooks/useTranslation";

export function TaxFreeGuideScreen() {
  const { selectedCountryId, setSelectedCountryId } = useSavings();
  const { t } = useTranslation();

  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) ||
    countries[0];

  const rule = getTaxFreeRule(selectedCountry.countryId) || taxFreeRules[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("taxGuide.heroLabel")}</Text>
        <Text style={styles.pageTitle}>{t("taxGuide.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("taxGuide.subtitle")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("taxGuide.country")}</Text>
        <CountrySelector
          selectedCountryId={selectedCountryId}
          onSelectCountry={setSelectedCountryId}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t("taxGuide.vatRate")}</Text>
          <Text style={styles.statValue}>{rule.vatRate}%</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>
            {t("taxGuide.refundRate")}
          </Text>
          <Text style={styles.statValue}>{rule.vatRate}%</Text>
        </View>
      </View>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>{t("taxGuide.minimumSpend")}</Text>
        <Text style={styles.highlightValue}>
          {rule.currency} {rule.minimumPurchaseAmount ?? 0}
        </Text>
        <Text style={styles.highlightText}>{selectedCountry.countryName}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("taxGuide.refundProcess")}</Text>

        {[t("taxCalc.standardVatBasis"), t("taxCalc.finalDisclaimer")].map((step, index) => (
          <View key={`${step}-${index}`} style={styles.stepRow}>
            <View style={styles.stepNumberBox}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>{t("common.important")}</Text>
        <Text style={styles.note}>{t("taxGuide.note")}</Text>
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
    paddingTop: 64,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#D8DEE9",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statLabel: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  statValue: {
    color: "#0B1F3A",
    fontSize: 24,
    fontWeight: "900",
  },
  highlightCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 26,
    padding: 20,
    marginBottom: 14,
  },
  highlightLabel: {
    color: "#C9A227",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  highlightValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  highlightText: {
    color: "#D8DEE9",
    marginTop: 6,
    fontWeight: "700",
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  stepNumberBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0B1F3A",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  stepText: {
    flex: 1,
    color: "#666666",
    lineHeight: 21,
    fontWeight: "700",
  },
  noteCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F0D98A",
  },
  noteTitle: {
    color: "#0B1F3A",
    fontWeight: "900",
    marginBottom: 6,
  },
  note: {
    color: "#666666",
    lineHeight: 21,
    fontWeight: "700",
  },
});
