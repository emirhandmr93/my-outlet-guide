import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CountrySelector } from "../components/CountrySelector";
import { CurrencySelector } from "../components/CurrencySelector";
import { countries } from "../constants/countries";
import { currencies } from "../constants/currencies";
import { taxFreeRules } from "../constants/taxFreeRules";
import { useSavings } from "../contexts/SavingsContext";
import { convertFromEur, formatCurrency } from "../services/exchangeRateService";
import { useTranslation } from "../hooks/useTranslation";

export function TaxFreeCalculatorScreen() {
  const [amount, setAmount] = useState("");
  const { t } = useTranslation();

  const {
    selectedCountryId,
    selectedCurrency,
    setSelectedCountryId,
    setSelectedCurrency,
  } = useSavings();

  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) || countries[0];

  const selectedCurrencyInfo =
    currencies.find((currency) => currency.currencyCode === selectedCurrency) || currencies[0];

  const rule =
    taxFreeRules.find((item) => item.countryId === selectedCountryId) || taxFreeRules[0];

  const numericAmount = Number(amount) || 0;
  const estimatedRefund = numericAmount * (rule.estimatedRefundRate / 100);
  const netCost = numericAmount - estimatedRefund;
  const convertedNetCost = convertFromEur(netCost, selectedCurrency);

  const isBelowMinimum =
    rule.minimumSpend > 0 && numericAmount > 0 && numericAmount < rule.minimumSpend;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>TAX FREE</Text>
        <Text style={styles.pageTitle}>{t("taxCalc.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("taxCalc.subtitle")}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsKicker}>SHOPPING SETTINGS</Text>
          <Text style={styles.settingsTitle}>Country and currency are shared across all Savings tools.</Text>

          <View style={styles.settingsSummaryRow}>
            <View style={styles.settingsSummaryItem}>
              <Text style={styles.settingsFlag}>{selectedCountry.countryFlag}</Text>
              <View>
                <Text style={styles.settingsLabel}>Country</Text>
                <Text style={styles.settingsValue}>{selectedCountry.countryName}</Text>
              </View>
            </View>

            <View style={styles.settingsSummaryDivider} />

            <View style={styles.settingsSummaryItem}>
              <Text style={styles.settingsFlag}>{selectedCurrencyInfo.currencyFlag}</Text>
              <View>
                <Text style={styles.settingsLabel}>Currency</Text>
                <Text style={styles.settingsValue}>{selectedCurrency}</Text>
                <Text style={styles.settingsSubvalue}>{selectedCurrencyInfo.currencyName}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Country</Text>
          <CountrySelector
            selectedCountryId={selectedCountryId}
            onSelectCountry={setSelectedCountryId}
          />

          <Text style={styles.sectionTitle}>Currency</Text>
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onSelectCurrency={setSelectedCurrency}
          />
        </View>

        <Text style={styles.label}>
          {t("taxCalc.shoppingAmount")} ({selectedCountry.currency})
        </Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor="#8A8A8A"
          value={amount}
          onChangeText={setAmount}
        />

        {isBelowMinimum && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              {t("taxCalc.belowMinimum")} {selectedCountry.countryName}.
            </Text>
          </View>
        )}

        <View style={styles.resultGrid}>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{t("taxCalc.estimatedRefund")}</Text>
            <Text style={styles.resultValue}>
              {selectedCountry.currency} {estimatedRefund.toFixed(2)}
            </Text>
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{t("taxCalc.estimatedNetCost")}</Text>
            <Text style={styles.resultValue}>
              {selectedCountry.currency} {netCost.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightLabel}>{t("taxCalc.netCostCurrency")}</Text>
          <Text style={styles.highlightValue}>
            {formatCurrency(convertedNetCost, selectedCurrency)}
          </Text>
        </View>

        <View style={styles.metaBox}>
          <Text style={styles.metaTitle}>Tax Free guide</Text>
          <Text style={styles.metaText}>
            Estimated refund: {rule.estimatedRefundRate}% of your eligible shopping amount.
          </Text>
          <Text style={styles.metaText}>
            Minimum spend: {selectedCountry.currency} {rule.minimumSpend} in {selectedCountry.countryName}.
          </Text>
          <Text style={styles.metaText}>
            Keep invoices, validate your form before leaving the country and collect your refund by card or cash where available.
          </Text>
          <Text style={styles.metaNote}>
            Actual refund can vary by operator fees, store policy and local rules.
          </Text>
        </View>
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
  warningBox: {
    marginTop: 14,
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C9A227",
  },
  warningText: {
    color: "#0B1F3A",
    fontWeight: "800",
    lineHeight: 20,
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
  metaBox: {
    marginTop: 16,
    backgroundColor: "#FFF8E1",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0D98A",
  },
  metaTitle: {
    color: "#0B1F3A",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8,
  },
  metaText: {
    color: "#0B1F3A",
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 20,
  },
  metaNote: {
    color: "#687386",
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 4,
  },
});
