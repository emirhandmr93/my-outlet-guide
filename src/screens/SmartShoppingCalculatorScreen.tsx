import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CountrySelector } from "../components/CountrySelector";
import { CurrencySelector } from "../components/CurrencySelector";
import { countries } from "../constants/countries";
import { currencies } from "../constants/currencies";
import { getTaxFreeRule } from "../constants/taxFreeRules";
import { useSavings } from "../contexts/SavingsContext";
import {
  convertFromEur,
  CurrencyCode,
  formatCurrency,
} from "../services/exchangeRateService";
import { calculateTaxFreeEstimate } from "../services/taxFreeCalculatorService";
import { useTranslation } from "../hooks/useTranslation";

export function SmartShoppingCalculatorScreen() {
  const [price, setPrice] = useState("");
  const { t } = useTranslation();

  const {
    selectedCountryId,
    selectedCurrency,
    setSelectedCountryId,
    setSelectedCurrency,
  } = useSavings();

  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) ||
    countries[0];

  const selectedCurrencyInfo =
    currencies.find((currency) => currency.currencyCode === selectedCurrency) ||
    currencies[0];

  const rule = getTaxFreeRule(selectedCountryId);

  const numericPrice = Number(price) || 0;
  const estimate =
    rule && numericPrice > 0
      ? calculateTaxFreeEstimate(numericPrice, rule)
      : undefined;
  const refund = estimate?.vatPortion ?? 0;
  const netCost = numericPrice - refund;
  const convertedNetCost = convertFromEur(netCost, selectedCurrency);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("smartCalc.heroLabel")}</Text>
        <Text style={styles.pageTitle}>{t("smartCalc.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("smartCalc.subtitle")}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsKicker}>
            {t("savings.settingsKicker")}
          </Text>
          <Text style={styles.settingsTitle}>
            {t("savings.settingsSharedTitle")}
          </Text>

          <View style={styles.settingsSummaryRow}>
            <View style={styles.settingsSummaryItem}>
              <Text style={styles.settingsFlag}>
                {selectedCountry.countryFlag}
              </Text>
              <View>
                <Text style={styles.settingsLabel}>{t("common.country")}</Text>
                <Text style={styles.settingsValue}>
                  {selectedCountry.countryName}
                </Text>
              </View>
            </View>

            <View style={styles.settingsSummaryDivider} />

            <View style={styles.settingsSummaryItem}>
              <Text style={styles.settingsFlag}>
                {selectedCurrencyInfo.currencyFlag}
              </Text>
              <View>
                <Text style={styles.settingsLabel}>{t("common.currency")}</Text>
                <Text style={styles.settingsValue}>{selectedCurrency}</Text>
                <Text style={styles.settingsSubvalue}>
                  {selectedCurrencyInfo.currencyName}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t("common.country")}</Text>
          <CountrySelector
            selectedCountryId={selectedCountryId}
            onSelectCountry={setSelectedCountryId}
          />

          <Text style={styles.sectionTitle}>{t("common.currency")}</Text>
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onSelectCurrency={setSelectedCurrency}
          />
        </View>

        <Text style={styles.label}>
          {t("smartCalc.productPrice")} ({selectedCountry.currency})
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor="#8A8A8A"
          value={price}
          onChangeText={setPrice}
        />

        <View style={styles.resultGrid}>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              {t("taxCalc.estimatedVatPortion")}
            </Text>
            <Text style={styles.resultValue}>
              {rule
                ? formatCurrency(refund, rule.currency as CurrencyCode)
                : "—"}
            </Text>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              {t("smartCalc.estimatedNetCost")}
            </Text>
            <Text style={styles.resultValue}>
              {rule
                ? formatCurrency(netCost, rule.currency as CurrencyCode)
                : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightLabel}>
            {t("smartCalc.yourCurrency")}
          </Text>
          <Text style={styles.highlightValue}>
            {formatCurrency(convertedNetCost, selectedCurrency)}
          </Text>
        </View>

        <Text style={styles.note}>
          {rule
            ? `${t("taxCalc.vatRate")}: ${rule.vatRate}% • ${t("taxCalc.providerFeesUnknown")}`
            : t("taxCalc.unsupportedCountry")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 10,
    marginTop: 8,
  },

  settingsPanel: {
    backgroundColor: "#F7F8FA",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
    marginBottom: 14,
  },
  settingsKicker: {
    color: "#C9A227",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  settingsTitle: {
    color: "#0B1F3A",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
    marginBottom: 12,
  },
  settingsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  settingsSummaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  settingsSummaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
  settingsFlag: {
    fontSize: 25,
    marginRight: 9,
  },
  settingsLabel: {
    color: "#687386",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  settingsValue: {
    color: "#0B1F3A",
    fontSize: 14,
    fontWeight: "900",
  },

  settingsSubvalue: {
    color: "#687386",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#0B1F3A",
    fontWeight: "700",
  },
  resultGrid: {
    marginTop: 18,
    gap: 12,
  },
  resultBox: {
    backgroundColor: "#F7F8FA",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultLabel: {
    color: "#666666",
    fontWeight: "700",
  },
  resultValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: "#0B1F3A",
  },
  highlightBox: {
    marginTop: 16,
    backgroundColor: "#0B1F3A",
    borderRadius: 22,
    padding: 18,
  },
  highlightLabel: {
    color: "#C9A227",
    fontWeight: "900",
    marginBottom: 8,
  },
  highlightValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  note: {
    marginTop: 16,
    color: "#666666",
    lineHeight: 21,
    fontWeight: "700",
  },
});
