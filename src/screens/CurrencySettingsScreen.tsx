import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { currencies } from "../constants/currencies";
import { useSavings } from "../contexts/SavingsContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  convertCurrency,
  CurrencyCode,
  formatCurrency,
  formatRate,
  isSupportedCurrency,
  type ConversionResult,
} from "../services/exchangeRateService";

export function CurrencySettingsScreen() {
  const { selectedCurrency, setSelectedCurrency } = useSavings();
  const { t, language } = useTranslation();
  const [amount, setAmount] = useState("");
  const [sourceCurrency, setSourceCurrency] = useState<CurrencyCode>("EUR");
  const [targetCurrency, setTargetCurrency] = useState<CurrencyCode>(selectedCurrency);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    const numericAmount = Number(amount.replace(",", "."));

    if (!amount.trim()) {
      setError(t("currency.validation.amountRequired"));
      setResult(null);
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t("currency.validation.positiveAmount"));
      setResult(null);
      return;
    }

    if (!isSupportedCurrency(sourceCurrency) || !isSupportedCurrency(targetCurrency)) {
      setError(t("currency.unsupported"));
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const conversion = await convertCurrency(numericAmount, sourceCurrency, targetCurrency);
      setResult(conversion);
    } catch {
      setResult(null);
      setError(t("currency.liveUnavailable"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("currency.kicker")}</Text>
        <Text style={styles.pageTitle}>{t("currency.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("currency.subtitle")}</Text>
      </View>

      <View style={styles.converterCard}>
        <Text style={styles.sectionTitle}>{t("currency.converterTitle")}</Text>
        <Text style={styles.converterCopy}>{t("currency.converterCopy")}</Text>

        <Text style={styles.inputLabel}>{t("currency.amount")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="100"
          placeholderTextColor="#8A8A8A"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.inputLabel}>{t("currency.from")}</Text>
        <View style={styles.currencyGrid}>
          {currencies.map((item) => (
            <TouchableOpacity
              key={`from-${item.currencyCode}`}
              style={[styles.currencyPill, sourceCurrency === item.currencyCode && styles.currencyPillActive]}
              onPress={() => setSourceCurrency(item.currencyCode as CurrencyCode)}
            >
              <Text style={styles.currencyPillText}>{item.currencyCode}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>{t("currency.to")}</Text>
        <View style={styles.currencyGrid}>
          {currencies.map((item) => (
            <TouchableOpacity
              key={`to-${item.currencyCode}`}
              style={[styles.currencyPill, targetCurrency === item.currencyCode && styles.currencyPillActive]}
              onPress={() => setTargetCurrency(item.currencyCode as CurrencyCode)}
            >
              <Text style={styles.currencyPillText}>{item.currencyCode}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.convertButton} onPress={handleConvert} activeOpacity={0.86}>
          <Text style={styles.convertButtonText}>{loading ? t("currency.loading") : t("currency.convert")}</Text>
        </TouchableOpacity>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultValue}>{formatCurrency(result.convertedAmount, result.targetCurrency, language)}</Text>
            <Text style={styles.resultMeta}>
              1 {result.sourceCurrency} ≈ {formatRate(result.rate, language)} {result.targetCurrency}
            </Text>
            <Text style={styles.resultMeta}>{result.rates.status === "stale_cache" ? t("currency.staleRate") : t("currency.liveRate")}</Text>
            <Text style={styles.resultMeta}>{t("currency.providerFrankfurter")}</Text>
            <Text style={styles.resultMeta}>{t("currency.updatedAt")}: {result.rates.updatedAt}</Text>
            <Text style={styles.disclaimer}>{t("currency.disclaimer")}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>{t("currency.preferredTitle")}</Text>
      {currencies.map((item) => {
        const selected = selectedCurrency === item.currencyCode;

        return (
          <TouchableOpacity
            key={item.currencyCode}
            style={[styles.card, selected && styles.selectedCard]}
            activeOpacity={0.86}
            onPress={() => setSelectedCurrency(item.currencyCode as CurrencyCode)}
          >
            <View style={styles.symbolBox}>
              <Text style={styles.symbol}>{item.symbol}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.currencyName}>{item.currencyName}</Text>
              <Text style={styles.currencyCode}>{item.currencyCode}</Text>
            </View>

            <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
              <Text style={styles.checkmark}>{selected ? "✓" : ""}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  pageTitle: { fontSize: 26, fontWeight: "900", color: "#FFFFFF" },
  pageSubtitle: { fontSize: 14, color: "#D8DEE9", marginTop: 8, lineHeight: 20 },
  converterCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 16 },
  sectionTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900", marginBottom: 10 },
  converterCopy: { color: "#667085", lineHeight: 20, marginBottom: 12 },
  inputLabel: { color: "#0B1F3A", fontWeight: "900", marginTop: 10, marginBottom: 8 },
  input: { backgroundColor: "#F7F8FA", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 14, color: "#0B1F3A", fontWeight: "800" },
  currencyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  currencyPill: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: "#F7F8FA", borderWidth: 1, borderColor: "#E5E7EB" },
  currencyPillActive: { backgroundColor: "#FFF8E1", borderColor: "#C9A227" },
  currencyPillText: { color: "#0B1F3A", fontWeight: "900" },
  convertButton: { backgroundColor: "#0B1F3A", borderRadius: 18, padding: 15, alignItems: "center", marginTop: 16 },
  convertButtonText: { color: "#FFFFFF", fontWeight: "900" },
  errorText: { color: "#B42318", fontWeight: "800", marginTop: 12 },
  resultCard: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 14, marginTop: 14 },
  resultValue: { color: "#0B1F3A", fontSize: 24, fontWeight: "900" },
  resultMeta: { color: "#475467", fontWeight: "700", marginTop: 6 },
  disclaimer: { color: "#667085", marginTop: 10, lineHeight: 19 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12, flexDirection: "row", alignItems: "center" },
  selectedCard: { borderColor: "#C9A227", backgroundColor: "#FFF8E1" },
  symbolBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F7F8FA", alignItems: "center", justifyContent: "center", marginRight: 14 },
  symbol: { color: "#0B1F3A", fontSize: 20, fontWeight: "900" },
  cardContent: { flex: 1 },
  currencyName: { fontSize: 17, fontWeight: "900", color: "#0B1F3A" },
  currencyCode: { marginTop: 4, color: "#666666", fontWeight: "800" },
  checkCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  checkCircleActive: { backgroundColor: "#C9A227", borderColor: "#C9A227" },
  checkmark: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
});
