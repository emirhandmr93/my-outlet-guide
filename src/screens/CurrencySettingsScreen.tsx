import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { currencies } from "../constants/currencies";
import { useSavings } from "../contexts/SavingsContext";
import type { CurrencyCode } from "../services/exchangeRateService";

export function CurrencySettingsScreen() {
  const { selectedCurrency, setSelectedCurrency } = useSavings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>CURRENCY</Text>
        <Text style={styles.pageTitle}>Preferred currency</Text>
        <Text style={styles.pageSubtitle}>
          Calculators and shopping tools will use this currency by default.
        </Text>
      </View>

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
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },

  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#D8DEE9",
    marginTop: 8,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedCard: {
    borderColor: "#C9A227",
    backgroundColor: "#FFF8E1",
  },

  symbolBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  symbol: {
    color: "#0B1F3A",
    fontSize: 20,
    fontWeight: "900",
  },

  cardContent: {
    flex: 1,
  },

  currencyName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0B1F3A",
  },

  currencyCode: {
    marginTop: 4,
    color: "#666666",
    fontWeight: "800",
  },

  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircleActive: {
    backgroundColor: "#C9A227",
    borderColor: "#C9A227",
  },

  checkmark: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
  },
});
