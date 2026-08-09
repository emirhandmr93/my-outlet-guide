import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { CountrySelector } from "../components/CountrySelector";
import { CurrencySelector } from "../components/CurrencySelector";
import { countries } from "../constants/countries";
import { currencies } from "../constants/currencies";
import { getTaxFreePolicySummaryKey, getTaxFreeRule } from "../constants/taxFreeRules";
import { useSavings } from "../contexts/SavingsContext";
import {
  convertCurrency,
  CurrencyCode,
  formatCurrency,
} from "../services/exchangeRateService";
import { getTaxFreeDisplayPlan, hasNumericTaxFreePlan } from "../services/taxFreeCalculatorService";
import { useTranslation } from "../hooks/useTranslation";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../utils/localization";
import { getMinimumPurchaseComparisonSymbol, getMinimumPurchaseTextKey } from "../utils/taxFreeDisplay";

export function SmartShoppingCalculatorScreen() {
  const [price, setPrice] = useState("");
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

  const numericPrice = Number(price) || 0;
  const displayPlan = rule && numericPrice > 0 ? getTaxFreeDisplayPlan(numericPrice, rule) : undefined;
  const numericPlan = hasNumericTaxFreePlan(displayPlan) ? displayPlan : undefined;
  const [convertedRefund, setConvertedRefund] = useState<number | null>(null);
  const [convertedNetCost, setConvertedNetCost] = useState<number | null>(null);
  const [conversionUnavailable, setConversionUnavailable] = useState(false);

  useEffect(() => {
    let active = true;

    if (!rule || !numericPlan || numericPrice <= 0 || selectedCurrency === rule.currency) {
      setConvertedRefund(null);
      setConvertedNetCost(null);
      setConversionUnavailable(false);
      return;
    }

    Promise.all([
      convertCurrency(numericPlan.benefitAmount, rule.currency as CurrencyCode, selectedCurrency),
      convertCurrency(numericPlan.costAmount, rule.currency as CurrencyCode, selectedCurrency),
    ])
      .then(([refundResult, costResult]) => {
        if (active) {
          setConvertedRefund(refundResult.convertedAmount);
          setConvertedNetCost(costResult.convertedAmount);
          setConversionUnavailable(false);
        }
      })
      .catch(() => {
        if (active) {
          setConvertedRefund(null);
          setConvertedNetCost(null);
          setConversionUnavailable(true);
        }
      });

    return () => {
      active = false;
    };
  }, [displayPlan?.kind, numericPlan?.costAmount, numericPlan?.benefitAmount, numericPrice, rule, selectedCurrency]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
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
              <View style={styles.settingsSummaryText}>
                <Text style={styles.settingsLabel}>{t("common.country")}</Text>
                <Text style={styles.settingsValue}>
                  {getLocalizedCountryName(selectedCountry, language)}
                </Text>
              </View>
            </View>

            <View style={styles.settingsSummaryDivider} />

            <View style={styles.settingsSummaryItem}>
              <Text style={styles.settingsFlag}>
                {selectedCurrencyInfo.currencyFlag}
              </Text>
              <View style={styles.settingsSummaryText}>
                <Text style={styles.settingsLabel}>{t("common.currency")}</Text>
                <Text style={styles.settingsValue}>{selectedCurrency}</Text>
                <Text style={styles.settingsSubvalue}>
                  {getLocalizedCurrencyName(selectedCurrencyInfo, language)}
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
          style={[styles.input, styles.technicalInputLTR]}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor="#8A8A8A"
          value={price}
          onChangeText={setPrice}
        />

        {displayPlan?.kind === "below_minimum" && rule && typeof rule.minimumPurchaseAmount === "number" ? (
          <View style={styles.warningBox}><Text style={styles.warningText}>{t("taxCalc.belowMinimum")} {getMinimumPurchaseComparisonSymbol(rule)} {formatCurrency(rule.minimumPurchaseAmount, rule.currency, language)} ({t(getMinimumPurchaseTextKey(rule))}).</Text></View>
        ) : null}

        {numericPlan || displayPlan?.kind === "below_minimum" ? (
          <View style={styles.resultGrid}>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>{t(numericPlan?.benefitLabelKey ?? "taxCalc.taxFreeResult")}</Text>
              <Text style={styles.resultValue}>{rule && numericPlan ? formatCurrency(numericPlan.benefitAmount, rule.currency as CurrencyCode, language) : "—"}</Text>
            </View>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>{t(numericPlan?.costLabelKey ?? "taxCalc.purchaseCost")}</Text>
              <Text style={styles.resultValue}>{rule && numericPlan ? formatCurrency(numericPlan.costAmount, rule.currency as CurrencyCode, language) : "—"}</Text>
            </View>
          </View>
        ) : null}

        {rule && numericPlan && selectedCurrency !== rule.currency && numericPrice > 0 && (
          <View style={styles.convertedBox}>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>
                {t(numericPlan?.convertedBenefitLabelKey ?? "taxCalc.convertedRefund")}
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
                {t(numericPlan?.convertedCostLabelKey ?? "taxCalc.convertedCostAfterRefund")}
              </Text>
              <Text style={styles.resultValue}>
                {convertedNetCost === null
                  ? conversionUnavailable
                    ? t("currency.unavailableShort")
                    : "—"
                  : formatCurrency(convertedNetCost, selectedCurrency, language)}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.note}>
          {rule
            ? displayPlan?.kind === "no_numeric_estimate" ? t(displayPlan.messageKey) : displayPlan?.kind === "below_minimum" ? t("taxCalc.belowMinimum") : numericPlan ? t(numericPlan.disclaimerKey) : rule.refundPolicy.mode === "point_of_sale_exemption" ? t(getTaxFreePolicySummaryKey(rule) === "taxCalc.futureRegimeNoEstimate" ? "taxCalc.futureRegimeNoEstimate" : "taxCalc.pointOfSaleDisclaimer") : t("taxCalc.finalDisclaimer")
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
  warningBox: { backgroundColor: "#FFF4E5", borderRadius: 14, padding: 12, marginBottom: 12 },
  warningText: { color: "#8A4B08", fontSize: 13, lineHeight: 19 },
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
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  settingsSummaryText: { flex: 1, minWidth: 0 },
  settingsSummaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
  settingsFlag: {
    fontSize: 25,
    marginEnd: 9,
    flexShrink: 0,
  },
  settingsLabel: {
    flexShrink: 1,
    color: "#687386",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  settingsValue: {
    flexShrink: 1,
    color: "#0B1F3A",
    fontSize: 14,
    fontWeight: "900",
  },

  settingsSubvalue: {
    flexShrink: 1,
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
  convertedBox: {
    marginTop: 16,
    gap: 12,
  },
  note: {
    marginTop: 16,
    color: "#666666",
    lineHeight: 21,
    fontWeight: "700",
  },
  technicalInputLTR: { direction: "ltr", writingDirection: "ltr", textAlign: "left" },
});
