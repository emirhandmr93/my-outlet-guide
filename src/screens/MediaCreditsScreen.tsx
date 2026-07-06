import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getProductionMediaCredits } from "../media/outletMedia";
import { useTranslation } from "../hooks/useTranslation";

function CreditField({
  label,
  value,
  url,
}: {
  label: string;
  value?: string;
  url?: string;
}) {
  const { t } = useTranslation();
  const displayValue = value || t("mediaCredits.notProvided");

  if (url) {
    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Text style={styles.linkValue}>{displayValue}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{displayValue}</Text>
    </View>
  );
}

export function MediaCreditsScreen() {
  const { t } = useTranslation();
  const credits = getProductionMediaCredits();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("mediaCredits.kicker")}</Text>
        <Text style={styles.title}>{t("mediaCredits.title")}</Text>
        <Text style={styles.subtitle}>{t("mediaCredits.subtitle")}</Text>
      </View>

      {credits.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("mediaCredits.emptyTitle")}</Text>
          <Text style={styles.emptyText}>{t("mediaCredits.emptyText")}</Text>
        </View>
      ) : (
        credits.map((credit) => (
          <View key={`${credit.outletId}:${credit.assetPath}`} style={styles.creditCard}>
            <Text style={styles.outletName}>{credit.displayName}</Text>
            <CreditField label={t("mediaCredits.role")} value={credit.role} />
            <CreditField label={t("mediaCredits.alt")} value={credit.alt} />
            <CreditField label={t("mediaCredits.credit")} value={credit.credit} />
            <CreditField label={t("mediaCredits.license")} value={credit.license} />
            <CreditField
              label={t("mediaCredits.sourceUrl")}
              value={credit.sourceUrl}
              url={credit.sourceUrl}
            />
            <CreditField
              label={t("mediaCredits.licenseUrl")}
              value={credit.licenseUrl}
              url={credit.licenseUrl}
            />
            <CreditField label={t("mediaCredits.notes")} value={credit.notes} />
          </View>
        ))
      )}
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
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: "#D8DEE9",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  emptyTitle: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  emptyText: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 21,
  },
  creditCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },
  outletName: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  fieldRow: {
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  fieldValue: {
    color: "#0B1F3A",
    fontSize: 14,
    lineHeight: 20,
  },
  linkValue: {
    color: "#2563EB",
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: "underline",
  },
});
