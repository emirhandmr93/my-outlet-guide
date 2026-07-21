import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
import { calculateTaxFreeEstimate } from "../services/taxFreeCalculatorService";
import { useTranslation } from "../hooks/useTranslation";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../utils/localization";
import { formatPriceAdvantage } from "../utils/priceAdvantage";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

export function PriceAdvantageCalculatorScreen() {
  const [europePrice, setEuropePrice] = useState("");
  const [localPrice, setLocalPrice] = useState("");
  const [includeTaxFree, setIncludeTaxFree] = useState(true);
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

  const numericEuropePrice = Number(europePrice) || 0;
  const numericLocalPrice = Number(localPrice) || 0;
  const estimate =
    rule && numericEuropePrice > 0
      ? calculateTaxFreeEstimate(numericEuropePrice, rule)
      : undefined;
  const refund = includeTaxFree ? (estimate?.vatPortion ?? 0) : 0;
  const netEuropeCost = numericEuropePrice - refund;
  const [convertedEuropeCost, setConvertedEuropeCost] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    if (!rule || netEuropeCost <= 0) {
      setConvertedEuropeCost(null);
      return;
    }

    convertCurrency(netEuropeCost, rule.currency as CurrencyCode, selectedCurrency)
      .then((result) => {
        if (active) {
          setConvertedEuropeCost(result.convertedAmount);
        }
      })
      .catch(() => {
        if (active) {
          setConvertedEuropeCost(null);
        }
      });

    return () => {
      active = false;
    };
  }, [netEuropeCost, rule, selectedCurrency]);

  const savings = convertedEuropeCost === null ? 0 : numericLocalPrice - convertedEuropeCost;
  const hasSavings = savings > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("priceCalc.heroLabel")}</Text>
        <Text style={styles.pageTitle}>{t("priceCalc.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("priceCalc.subtitle")}</Text>
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
                  {getLocalizedCountryName(selectedCountry, language)}
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
          {t("priceCalc.countryPrice").replace("{country}", getLocalizedCountryName(selectedCountry, language))} ({selectedCountry.currency})
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="2500"
          placeholderTextColor="#8A8A8A"
          value={europePrice}
          onChangeText={setEuropePrice}
        />

        <Text style={styles.label}>
          {t("priceCalc.localPrice")} ({selectedCurrency})
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="120000"
          placeholderTextColor="#8A8A8A"
          value={localPrice}
          onChangeText={setLocalPrice}
        />

        <TouchableOpacity
          style={[
            styles.toggleButton,
            includeTaxFree && styles.toggleButtonActive,
          ]}
          onPress={() => setIncludeTaxFree((current) => !current)}
          activeOpacity={0.85}
        >
          <Text style={styles.toggleButtonText}>
            {includeTaxFree ? "✓" : "+"} {t("priceCalc.includeTaxFree")}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>{t("priceCalc.countryNetCost").replace("{country}", getLocalizedCountryName(selectedCountry, language))}</Text>
          <Text style={styles.resultValue}>
            {convertedEuropeCost === null
            ? t("currency.unavailableShort")
            : formatCurrency(convertedEuropeCost, selectedCurrency, language)}
          </Text>
        </View>

        <View
          style={[styles.highlightBox, !hasSavings && styles.highlightBoxMuted]}
        >
          <Text style={styles.highlightLabel}>
            {hasSavings ? t("priceCalc.youSave") : t("priceCalc.noSavings")}
          </Text>
          <Text style={styles.highlightValue}>
            {formatPriceAdvantage(savings, selectedCurrency, language)}
          </Text>
        </View>

        <Text style={styles.note}>
          {includeTaxFree && rule
            ? `${t("taxCalc.estimatedTaxFreeRefund")}: ${formatCurrency(refund, rule.currency as CurrencyCode)}. ${t("taxCalc.providerFeesUnknown")}`
            : includeTaxFree
              ? t("taxCalc.unsupportedCountry")
              : t("priceCalc.taxFreeNotIncluded")}
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
  toggleButton: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#C9A227",
  },
  toggleButtonActive: {
    backgroundColor: "#FFF8E1",
  },
  toggleButtonText: {
    color: "#0B1F3A",
    fontWeight: "900",
    textAlign: "center",
  },
  resultBox: {
    marginTop: 18,
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
  highlightBoxMuted: {
    backgroundColor: "#666666",
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
