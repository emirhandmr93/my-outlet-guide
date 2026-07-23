import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CountrySelector } from "../components/CountrySelector";
import { CurrencySelector } from "../components/CurrencySelector";
import { countries } from "../constants/countries";
import { currencies } from "../constants/currencies";
import { getTaxFreeRule } from "../constants/taxFreeRules";
import { useSavings } from "../contexts/SavingsContext";
import {
  convertCurrency,
  CurrencyCode,
  formatCurrency,
} from "../services/exchangeRateService";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../utils/localization";
import { getMinimumPurchaseComparisonSymbol, getMinimumPurchaseTextKey, normalizeTaxFreeCountryStatus } from "../utils/taxFreeDisplay";
import {
  calculateTaxFreeEstimate,
  isBelowMinimumPurchase,
  parsePurchaseAmount,
} from "../services/taxFreeCalculatorService";
import { useTranslation } from "../hooks/useTranslation";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

export function TaxFreeCalculatorScreen() {
  const [amount, setAmount] = useState("");
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();

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
  const countryTaxFreeStatus = normalizeTaxFreeCountryStatus(selectedCountry.taxFreeStatus);
  const parsedAmount = parsePurchaseAmount(amount);
  const hasAmount = typeof parsedAmount === "number";
  const isInvalidAmount =
    hasAmount && (!Number.isFinite(parsedAmount) || parsedAmount <= 0);
  const estimate =
    rule && hasAmount && !isInvalidAmount
      ? calculateTaxFreeEstimate(parsedAmount, rule)
      : undefined;

  const displayCurrency = rule?.currency ?? selectedCountry.currency;
  const selectedCountryDisplayName = getLocalizedCountryName(selectedCountry, language);
  const selectedCurrencyDisplayName = getLocalizedCurrencyName(selectedCurrencyInfo, language);
  const isCurrencyMismatch =
    !!rule && selectedCountry.currency !== rule.currency;
  const isBelowMinimum =
    !!rule && !!estimate && isBelowMinimumPurchase(estimate.grossAmount, rule);
  const shouldShowConvertedResults =
    !!rule && selectedCurrency !== rule.currency && !!estimate && !isBelowMinimum;
  const [convertedRefund, setConvertedRefund] = useState<number | null>(null);
  const [convertedCostAfterRefund, setConvertedCostAfterRefund] = useState<number | null>(null);
  const [conversionUnavailable, setConversionUnavailable] = useState(false);

  useEffect(() => {
    let active = true;

    if (!rule || !estimate || !shouldShowConvertedResults) {
      setConvertedRefund(null);
      setConvertedCostAfterRefund(null);
      setConversionUnavailable(false);
      return;
    }

    Promise.all([
      convertCurrency(
        estimate.estimatedTaxFreeRefund,
        rule.currency,
        selectedCurrency,
      ),
      convertCurrency(
        estimate.estimatedCostAfterRefund,
        rule.currency,
        selectedCurrency,
      ),
    ])
      .then(([refundResult, costResult]) => {
        if (active) {
          setConvertedRefund(refundResult.convertedAmount);
          setConvertedCostAfterRefund(costResult.convertedAmount);
          setConversionUnavailable(false);
        }
      })
      .catch(() => {
        if (active) {
          setConvertedRefund(null);
          setConvertedCostAfterRefund(null);
          setConversionUnavailable(true);
        }
      });

    return () => {
      active = false;
    };
  }, [
    estimate?.estimatedCostAfterRefund,
    estimate?.estimatedTaxFreeRefund,
    rule,
    selectedCurrency,
    shouldShowConvertedResults,
  ]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("taxCalc.heroLabel")}</Text>
        <Text style={styles.pageTitle}>{t("taxCalc.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("taxCalc.subtitle")}</Text>
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
                  {selectedCountryDisplayName}
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
                  {selectedCurrencyDisplayName}
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
          {t("taxCalc.productPrice")} (
          {displayCurrency})
        </Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor="#8A8A8A"
          value={amount}
          onChangeText={setAmount}
        />

        {!rule && (
          <View style={styles.warningBox}><Text style={styles.warningText}>{t(countryTaxFreeStatus === "not_available" ? "taxFree.notAvailableExplanation" : "taxFree.notVerifiedExplanation")}</Text></View>
        )}

        {isCurrencyMismatch && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              {t("taxCalc.currencyMismatch")}
            </Text>
          </View>
        )}

        {isInvalidAmount && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{t("taxCalc.invalidAmount")}</Text>
          </View>
        )}

        {isBelowMinimum && typeof rule?.minimumPurchaseAmount === "number" && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              {t("taxCalc.belowMinimum")}{" "}
              {formatCurrency(
                rule.minimumPurchaseAmount,
                rule.currency,
                language,
              )} ({t(getMinimumPurchaseTextKey(rule))}).
            </Text>
          </View>
        )}

        {rule && estimate && !isBelowMinimum && (
          <>
            <View style={styles.resultGrid}>
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>
                  {t("taxFree.maximumVatBeforeFees")}
                </Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(
                    estimate.estimatedTaxFreeRefund,
                    rule.currency,
                    language,
                  )}
                </Text>
              </View>

              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>
                  {t("taxCalc.estimatedCostAfterRefund")}
                </Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(
                    estimate.estimatedCostAfterRefund,
                    rule.currency,
                    language,
                  )}
                </Text>
              </View>
            </View>

            {shouldShowConvertedResults && (
              <View style={styles.convertedBox}>
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>
                    {t("taxCalc.convertedRefund")}
                  </Text>
                  <Text style={styles.resultValue}>
                    {convertedRefund === null
                      ? conversionUnavailable
                        ? t("currency.unavailableShort")
                        : "—"
                      : formatCurrency(convertedRefund, selectedCurrency, language)}
                  </Text>
                </View>

                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>
                    {t("taxCalc.convertedCostAfterRefund")}
                  </Text>
                  <Text style={styles.resultValue}>
                    {convertedCostAfterRefund === null
                      ? conversionUnavailable
                        ? t("currency.unavailableShort")
                        : "—"
                      : formatCurrency(
                          convertedCostAfterRefund,
                          selectedCurrency,
                          language,
                        )}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.highlightBox}>
              <Text style={styles.highlightLabel}>
                {t("taxCalc.actualRefundMayVary")}
              </Text>
              <Text style={styles.highlightValue}>
                {t("taxCalc.notGuaranteedRefund")}
              </Text>
            </View>
          </>
        )}

        {rule && (
          <View style={styles.metaBox}>
            <Text style={styles.metaTitle}>{t("taxCalc.sourceTitle")}</Text>
            <Text style={styles.metaText}>{rule.schemeSource.name} • {rule.schemeSource.checkedDate}</Text>
            <Text style={styles.metaText}>{t("taxCalc.vatRate")}: {rule.vatRate}% • {rule.vatRateSource.name} • {rule.vatRateSource.checkedDate}</Text>
            {rule.minimumPurchaseStatus === "verified_amount" && typeof rule.minimumPurchaseAmount === "number" && rule.minimumPurchaseSource ? (
              <Text style={styles.metaText}>{t("taxCalc.minimumSpend")}: {getMinimumPurchaseComparisonSymbol(rule)} {formatCurrency(rule.minimumPurchaseAmount, rule.currency, language)} ({t(getMinimumPurchaseTextKey(rule))}) • {rule.minimumPurchaseSource.name} • {rule.minimumPurchaseSource.checkedDate}</Text>
            ) : <Text style={styles.metaText}>{t(getMinimumPurchaseTextKey(rule))}</Text>}
            <Text style={styles.metaText}>{t("taxCalc.standardVatBasis")}</Text>
            <Text style={styles.metaNote}>{t("taxCalc.finalDisclaimer")}</Text>
          </View>
        )}
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
  convertedBox: {
    marginTop: 16,
    gap: 12,
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
