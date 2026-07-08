import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CountrySelector } from "../components/CountrySelector";
import { CurrencySelector } from "../components/CurrencySelector";
import { countries } from "../constants/countries";
import { currencies } from "../constants/currencies";
import { useSavings } from "../contexts/SavingsContext";
import { useTranslation } from "../hooks/useTranslation";

type SavingsTool = {
  id: string;
  icon: string;
  title: string;
  description: string;
  routeName: string;
  badge: string;
  highlight?: string;
};

export function SavingsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    selectedCountryId,
    selectedCurrency,
    setSelectedCountryId,
    setSelectedCurrency,
  } = useSavings();

  const tools: SavingsTool[] = [
    {
      id: "smart-shopping",
      icon: "🛍️",
      title: t("savings.smartTitle"),
      description: t("savings.smartDescription"),
      routeName: "SmartShoppingCalculator",
      badge: t("savings.smartBadge"),
      highlight: t("savings.smartHighlight"),
    },
    {
      id: "price-advantage",
      icon: "↘️",
      title: t("savings.priceTitleShort"),
      description: t("savings.priceDescription"),
      routeName: "PriceAdvantageCalculator",
      badge: t("savings.priceBadge"),
      highlight: t("savings.priceHighlight"),
    },
    {
      id: "tax-free-calculator",
      icon: "🧾",
      title: t("savings.taxCalcTitle"),
      description: t("savings.taxCalcDescription"),
      routeName: "TaxFreeCalculator",
      badge: t("savings.taxCalcBadge"),
      highlight: t("savings.taxCalcHighlight"),
    },
  ];

  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) || countries[0];

  const selectedCurrencyInfo =
    currencies.find((currency) => currency.currencyCode === selectedCurrency) || currencies[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("savings.heroLabel")}</Text>
        <Text style={styles.pageTitle}>{t("savings.heroTitle")}</Text>
        <Text style={styles.pageSubtitle}>
          {t("savings.heroSubtitle")}
        </Text>
      </View>


      <View style={styles.settingsCard}>
        <View style={styles.settingsHeaderRow}>
          <View>
            <Text style={styles.settingsKicker}>{t("savings.settingsKicker")}</Text>
            <Text style={styles.settingsTitle}>{t("savings.settingsTitle")}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.changeButton}
            onPress={() => setSettingsOpen((current) => !current)}
          >
            <Text style={styles.changeButtonText}>{settingsOpen ? t("common.done") : t("common.change")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSummaryRow}>
          <View style={styles.settingsSummaryItem}>
            <Text style={styles.settingsFlag}>{selectedCountry.countryFlag}</Text>
            <View>
              <Text style={styles.settingsLabel}>{t("common.country")}</Text>
              <Text style={styles.settingsValue}>{selectedCountry.countryName}</Text>
            </View>
          </View>

          <View style={styles.settingsSummaryDivider} />

          <View style={styles.settingsSummaryItem}>
            <Text style={styles.settingsFlag}>{selectedCurrencyInfo.currencyFlag}</Text>
            <View>
              <Text style={styles.settingsLabel}>{t("common.currency")}</Text>
              <Text style={styles.settingsValue}>{selectedCurrency}</Text>
                <Text style={styles.settingsSubvalue}>{selectedCurrencyInfo.currencyName}</Text>
            </View>
          </View>
        </View>

        {settingsOpen ? (
          <View style={styles.settingsSelectors}>
            <Text style={styles.settingsSelectorTitle}>{t("common.country")}</Text>
            <CountrySelector
              selectedCountryId={selectedCountryId}
              onSelectCountry={setSelectedCountryId}
            />

            <Text style={styles.settingsSelectorTitle}>{t("common.currency")}</Text>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelectCurrency={setSelectedCurrency}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.snapshotCard}>
        <View style={styles.snapshotItem}>
          <Text style={styles.snapshotValue}>{t("savings.snapshotRefund")}</Text>
          <Text style={styles.snapshotLabel}>{t("savings.snapshotRefundLabel")}</Text>
        </View>
        <View style={styles.snapshotDivider} />
        <View style={styles.snapshotItem}>
          <Text style={styles.snapshotValue}>{t("savings.snapshotCompare")}</Text>
          <Text style={styles.snapshotLabel}>{t("savings.snapshotCompareLabel")}</Text>
        </View>
        <View style={styles.snapshotDivider} />
        <View style={styles.snapshotItem}>
          <Text style={styles.snapshotValue}>{t("savings.snapshotAlerts")}</Text>
          <Text style={styles.snapshotLabel}>{t("savings.snapshotAlertsLabel")}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("savings.toolsTitle")}</Text>
        <Text style={styles.sectionSubtitle}>{t("savings.toolsSubtitle")}</Text>
      </View>

      {tools.map((tool, index) => (
        <TouchableOpacity
          key={tool.id}
          style={[styles.toolCard, index === 0 && styles.primaryToolCard]}
          activeOpacity={0.88}
          onPress={() => navigation.navigate(tool.routeName)}
        >
          <View style={styles.toolTopRow}>
            <View style={[styles.iconBox, index === 0 && styles.primaryIconBox]}>
              <Text style={styles.cardIcon}>{tool.icon}</Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tool.badge}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{tool.title}</Text>
          <Text style={styles.cardText}>{tool.description}</Text>

          {tool.highlight ? (
            <View style={styles.highlightPill}>
              <Text style={styles.highlightText}>{tool.highlight}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Text style={styles.cardAction}>{t("savings.openTool")}</Text>
            <Text style={styles.arrow}>→</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.tipsCard}>
        <Text style={styles.tipsKicker}>{t("savings.tipsKicker")}</Text>
        <Text style={styles.tipsTitle}>{t("savings.tipsTitle")}</Text>
        <Text style={styles.tipsText}>
          {t("savings.tipsText")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  content: {
    padding: 20,
    paddingTop: 58,
    paddingBottom: 130,
  },

  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 26,
    marginBottom: 16,
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  heroLabel: {
    color: "#C9A227",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  pageTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 10,
  },

  pageSubtitle: {
    color: "#E7EDF5",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },


  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.38)",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  settingsHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
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
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    maxWidth: 225,
  },

  changeButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  changeButtonText: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
  },

  settingsSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },

  settingsSummaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  settingsSummaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E0E5EC",
    marginHorizontal: 12,
  },

  settingsFlag: {
    fontSize: 27,
    marginRight: 10,
  },

  settingsLabel: {
    color: "#687386",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 3,
  },

  settingsValue: {
    color: "#0B1F3A",
    fontSize: 15,
    fontWeight: "900",
  },

  settingsSubvalue: {
    color: "#687386",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  settingsSelectors: {
    marginTop: 16,
  },

  settingsSelectorTitle: {
    color: "#0B1F3A",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 8,
  },

  snapshotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  snapshotItem: {
    flex: 1,
  },

  snapshotDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#E0E5EC",
    marginHorizontal: 10,
  },

  snapshotValue: {
    color: "#0B1F3A",
    fontSize: 16,
    fontWeight: "900",
  },

  snapshotLabel: {
    color: "#687386",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    marginTop: 4,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#0B1F3A",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    color: "#687386",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 4,
  },

  toolCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  primaryToolCard: {
    borderColor: "rgba(201,162,39,0.45)",
  },

  toolTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "#F2F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },

  primaryIconBox: {
    backgroundColor: "#FFF7E0",
    borderColor: "rgba(201,162,39,0.45)",
  },

  cardIcon: {
    fontSize: 25,
  },

  badge: {
    backgroundColor: "#FFF7E0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.55)",
  },

  badgeText: {
    color: "#0B1F3A",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  cardTitle: {
    color: "#0B1F3A",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 8,
  },

  cardText: {
    color: "#687386",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  highlightPill: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F5F9",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 14,
  },

  highlightText: {
    color: "#0B1F3A",
    fontSize: 12,
    fontWeight: "900",
  },

  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardAction: {
    color: "#0B1F3A",
    fontSize: 15,
    fontWeight: "900",
  },

  arrow: {
    color: "#C9A227",
    fontSize: 22,
    fontWeight: "900",
  },

  tipsCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 26,
    padding: 22,
    marginTop: 4,
  },

  tipsKicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  tipsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    marginBottom: 8,
  },

  tipsText: {
    color: "#E7EDF5",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
});
