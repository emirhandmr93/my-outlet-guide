import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { CountrySelector } from "../components/CountrySelector";
import { formatCurrency } from "../services/exchangeRateService";
import { getTaxFreeGuideDisplayModel } from "../services/taxFreeGuideService";
import { getMinimumPurchaseComparisonSymbol, getMinimumPurchaseTextKey } from "../utils/taxFreeDisplay";
import { useSavings } from "../contexts/SavingsContext";
import { useTranslation } from "../hooks/useTranslation";
import { formatCountryDisplayName } from "../utils/locationDisplay";

const processOrder = ["before_shopping", "in_store", "before_departure", "customs_validation", "receive_refund"] as const;

export function TaxFreeGuideScreen() {
  const navigation = useNavigation<any>();
  const { selectedCountryId, setSelectedCountryId } = useSavings();
  const { t, language } = useTranslation();
  const { country, guide, rule, policyDisplay, countryStatus, isGuideAvailable } = getTaxFreeGuideDisplayModel(selectedCountryId, language, t);
  const taxFreeSummary = policyDisplay?.summary;
  const selectedCountryIdSafe = country?.countryId ?? selectedCountryId;

  const openSource = (url: string) => { if (/^https:\/\//.test(url)) Linking.openURL(url); };
  const minimumText = rule?.minimumPurchaseStatus === "verified_amount" && typeof rule.minimumPurchaseAmount === "number"
    ? `${getMinimumPurchaseComparisonSymbol(rule)} ${formatCurrency(rule.minimumPurchaseAmount, rule.currency, language)}`
    : rule ? t(getMinimumPurchaseTextKey(rule)) : "—";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("taxGuide.heroLabel")}</Text>
        <Text style={styles.pageTitle}>{t("taxGuide.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("taxGuide.subtitle")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("taxGuide.country")}</Text>
        <CountrySelector selectedCountryId={selectedCountryIdSafe} onSelectCountry={setSelectedCountryId} />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>{t("taxGuide.countryStatus")}</Text>
        <Text style={styles.statusValue}>{t(`taxGuide.status.${isGuideAvailable ? guide!.status : countryStatus}`)}</Text>
        {!rule ? ( /* t("taxGuide.taxFreeProcess") */
          <Text style={styles.note}>{t("taxGuide.notYetAvailable") /* notAvailableExplanation */}</Text>
        ) : !isGuideAvailable ? (
          <Text style={styles.note}>{t("taxGuide.notYetAvailable")}</Text>
        ) : null}
      </View>

      {isGuideAvailable && guide && rule && policyDisplay ? (
        <>
          <View style={styles.quickFactsGrid}>
            <Fact label={t("taxGuide.quickFact.estimatedRefund")} value={policyDisplay.rateText ?? taxFreeSummary ?? policyDisplay.summary} detail={t(guide.estimatedRefundExplanationKey)} />
            <Fact label={t("taxGuide.quickFact.minimumPurchase")} value={minimumText} detail={t(guide.minimumPurchaseExplanationKey)} />
          </View>

          <Section title={t("taxGuide.eligibility")} items={[guide.travellerEligibilitySummaryKey, ...guide.goodsUseExportConditionKeys].map(t)} />
          <Section title={t("taxGuide.requiredDocuments")} items={guide.requiredDocumentKeys.map(t)} />

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("taxGuide.numberedProcess")}</Text>
            {processOrder.map((section, index) => (
              <View key={section} style={styles.processBlock}>
                <View style={styles.stepNumberBox}><Text style={styles.stepNumber}>{index + 1}</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{t(`taxGuide.process.${section}`)}</Text>
                  {guide.processSections[section].map((key) => <Text key={key} style={styles.bullet}>• {t(key)}</Text>)}
                </View>
              </View>
            ))}
          </View>

          <Section title={t("taxGuide.refundMethods")} items={[...guide.supportedRefundMethodKeys.map(t), t(guide.operatorFeeExplanationKey)]} />
          <Section title={t("taxGuide.deadlinesWarnings")} items={[t(guide.deadlineInformationKey), ...guide.warningKeys.map(t)]} warning />

          <View style={styles.noteCard}><Text style={styles.noteTitle}>{t("taxGuide.estimateDisclaimerTitle")}</Text><Text style={styles.note}>{t("taxGuide.estimateDisclaimer")}</Text></View>

          <TouchableOpacity style={styles.calculatorButton} activeOpacity={0.88} onPress={() => navigation.navigate("TaxFreeCalculator")}>
            <Text style={styles.calculatorButtonText}>{t("taxGuide.openCalculator")}</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("taxGuide.officialSources")}</Text>
            {guide.sources.map((source) => (
              <TouchableOpacity key={`${source.topic}-${source.url}`} style={styles.sourceRow} onPress={() => openSource(source.url)} activeOpacity={0.86}>
                <View style={styles.stepBody}>
                  <Text style={styles.sourceAuthority}>{source.authority}</Text>
                  <Text style={styles.sourceText}>{t(`taxGuide.sourceTopic.${source.topic}`)} · {t(source.verifiesKey)}</Text>
                  <Text style={styles.sourceDate}>{t("taxGuide.verifiedAt")}: {source.verifiedAt}</Text>
                </View>
                <Text style={styles.sourceAction}>{t("taxGuide.openSource")}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.lastVerified}>{t("taxGuide.lastVerified")}: {guide.lastVerifiedAt}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function Fact({ label, value, detail }: { label: string; value: string; detail: string }) { return <View style={styles.factCard}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text><Text style={styles.factDetail}>{detail}</Text></View>; }
function Section({ title, items, warning }: { title: string; items: string[]; warning?: boolean }) { return <View style={warning ? styles.noteCard : styles.card}><Text style={styles.sectionTitle}>{title}</Text>{items.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}</View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  heroLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.4, marginBottom: 12 },
  pageTitle: { fontSize: 30, fontWeight: "900", color: "#FFFFFF", marginBottom: 8 },
  pageSubtitle: { fontSize: 15, color: "#D8DEE9", lineHeight: 22 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: "#0B1F3A", marginBottom: 14 },
  statusCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  statusLabel: { color: "#666666", fontSize: 12, fontWeight: "800", marginBottom: 6 },
  statusValue: { color: "#0B1F3A", fontSize: 22, fontWeight: "900" },
  quickFactsGrid: { gap: 12, marginBottom: 14 },
  factCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  factLabel: { color: "#666666", fontSize: 12, fontWeight: "800", marginBottom: 6 },
  factValue: { color: "#0B1F3A", fontSize: 24, fontWeight: "900", marginBottom: 6 },
  factDetail: { color: "#666666", lineHeight: 20, fontWeight: "700" },
  processBlock: { flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "flex-start" },
  stepNumberBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#0B1F3A", alignItems: "center", justifyContent: "center" },
  stepNumber: { color: "#FFFFFF", fontWeight: "900" },
  stepBody: { flex: 1 },
  stepTitle: { color: "#0B1F3A", fontWeight: "900", marginBottom: 6 },
  bullet: { color: "#666666", lineHeight: 21, fontWeight: "700", marginBottom: 7 },
  noteCard: { backgroundColor: "#FFF8E1", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#F0D98A", marginBottom: 14 },
  noteTitle: { color: "#0B1F3A", fontWeight: "900", marginBottom: 6 },
  note: { color: "#666666", lineHeight: 21, fontWeight: "700", marginTop: 8 },
  calculatorButton: { backgroundColor: "#0B1F3A", borderRadius: 22, padding: 16, alignItems: "center", marginBottom: 14 },
  calculatorButtonText: { color: "#C9A227", fontWeight: "900", fontSize: 15 },
  sourceRow: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  sourceAuthority: { color: "#0B1F3A", fontWeight: "900", marginBottom: 4 },
  sourceText: { color: "#666666", fontWeight: "700", lineHeight: 20 },
  sourceDate: { color: "#888888", fontWeight: "700", marginTop: 4 },
  sourceAction: { color: "#0B1F3A", fontWeight: "900" },
  lastVerified: { color: "#666666", fontWeight: "800", marginTop: 14 },
});
