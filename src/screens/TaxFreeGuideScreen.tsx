import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect, useRef, useState } from "react";

import { CountrySelector } from "../components/CountrySelector";
import { formatCurrency } from "../services/exchangeRateService";
import { getTaxFreeGuideDisplayModel, isTaxFreeGuideAvailable } from "../services/taxFreeGuideService";
import { getMinimumPurchaseComparisonSymbol, getMinimumPurchaseTextKey } from "../utils/taxFreeDisplay";
import { useSavings } from "../contexts/SavingsContext";
import { useTranslation } from "../hooks/useTranslation";
import { formatCountryDisplayName } from "../utils/locationDisplay";
import { useTaxFreeGuideData } from "../hooks/useDetailData";

const processOrder = ["before_shopping", "in_store", "before_departure", "customs_validation", "receive_refund"] as const;

type TaxFreeGuideRouteParams = {
  TaxFreeGuide: { countryId?: string } | undefined;
};

export function TaxFreeGuideScreen() {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const guideData = useTaxFreeGuideData();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<TaxFreeGuideRouteParams, "TaxFreeGuide">>();
  const { selectedCountryId, setSelectedCountryId } = useSavings();
  const { t, language } = useTranslation();
  const normalizedRouteCountryId = typeof route.params?.countryId === "string"
    ? route.params.countryId.trim().toLowerCase()
    : undefined;
  const validRouteCountryId = normalizedRouteCountryId && guideData.data && isTaxFreeGuideAvailable(normalizedRouteCountryId, guideData.data)
    ? normalizedRouteCountryId
    : undefined;
  const lastAppliedRouteCountryIdRef = useRef<string | undefined>(undefined);
  const shouldApplyRouteCountry = Boolean(
    validRouteCountryId && validRouteCountryId !== lastAppliedRouteCountryIdRef.current,
  );
  const effectiveCountryId = shouldApplyRouteCountry ? validRouteCountryId! : selectedCountryId;

  useLayoutEffect(() => {
    if (!validRouteCountryId || validRouteCountryId === lastAppliedRouteCountryIdRef.current) return;

    lastAppliedRouteCountryIdRef.current = validRouteCountryId;
    if (selectedCountryId !== validRouteCountryId) setSelectedCountryId(validRouteCountryId);
  }, [selectedCountryId, setSelectedCountryId, validRouteCountryId]);

  if (guideData.loading) return <View style={styles.container}><Text style={styles.note}>{t("common.loading")}</Text></View>;
  if (guideData.error || !guideData.data) return <View style={styles.container}><Text style={styles.note}>{t("trips.loadFailedTitle")}</Text><TouchableOpacity onPress={guideData.retry}><Text>{t("flightDealDetail.retry")}</Text></TouchableOpacity></View>;
  const { country, guide, rule, policyDisplay, countryStatus, isGuideAvailable, concisePresentation } = getTaxFreeGuideDisplayModel(effectiveCountryId, language, t, guideData.data);
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
        {isGuideAvailable && guide && rule && policyDisplay ? (
          <View style={styles.quickFactsGrid}>
            <Fact label={t("taxGuide.quickFact.estimatedRefund")} value={policyDisplay.rateText ?? taxFreeSummary ?? policyDisplay.summary} />
            <Fact label={t("taxGuide.quickFact.minimumPurchase")} value={minimumText} />
          </View>
        ) : null}
        {!rule ? ( /* t("taxGuide.taxFreeProcess") */
          <Text style={styles.note}>{t("taxGuide.notYetAvailable") /* notAvailableExplanation */}</Text>
        ) : !isGuideAvailable ? (
          <Text style={styles.note}>{t("taxGuide.notYetAvailable")}</Text>
        ) : null}
      </View>

      {isGuideAvailable && guide && rule && policyDisplay ? (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("taxGuide.concise.title")}</Text>
            {concisePresentation!.stepKeys.map((key, index) => (
              <View key={key} style={styles.processBlock}>
                <View style={styles.stepNumberBox}><Text style={styles.stepNumber}>{index + 1}</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepText}>{t(key)}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.operatorCard}>
            <Text style={styles.sectionTitle}>{t("taxGuide.operator.title")}</Text>
            <Text style={styles.bodyText}>{t("taxGuide.operator.description")}</Text>
            <Text style={styles.bodyText}>{t("taxGuide.operator.action")}</Text>
          </View>

          <View style={styles.noteCard}><Text style={styles.noteTitle}>{t("taxGuide.concise.warningTitle")}</Text><Text style={styles.note}>{t(concisePresentation!.immediateWarningKey)}</Text></View>

          <TouchableOpacity style={styles.calculatorButton} activeOpacity={0.88} onPress={() => navigation.navigate("TaxFreeCalculator")}>
            <Text style={styles.calculatorButtonText}>{t("taxGuide.openCalculator")}</Text>
          </TouchableOpacity>

          <Accordion title={t("taxGuide.detailedRules")} expanded={detailsExpanded} onPress={() => setDetailsExpanded((value) => !value)}>
            <Section title={t("taxGuide.eligibility")} items={[t(guide.travellerEligibilitySummaryKey)]} embedded />
            <Section title={t("taxGuide.requiredDocuments")} items={guide.requiredDocumentKeys.map(t)} embedded />
            <Section title={t("taxGuide.goodsConditions")} items={guide.goodsUseExportConditionKeys.map(t)} embedded />
            <Section title={t("taxGuide.numberedProcess")} items={processOrder.flatMap((section) => guide.processSections[section].map(t))} embedded />
            <Section title={t("taxGuide.refundMethods")} items={[...guide.supportedRefundMethodKeys.map(t), t(guide.operatorFeeExplanationKey)]} embedded />
            <Section title={t("taxGuide.deadlinesWarnings")} items={[t(guide.deadlineInformationKey), ...guide.warningKeys.map(t)]} embedded />
            <Section title={t("taxGuide.feesAndEstimates")} items={[t(guide.vatRateExplanationKey), t(guide.estimatedRefundExplanationKey), t(guide.minimumPurchaseExplanationKey), t("taxGuide.estimateDisclaimer")]} embedded />
          </Accordion>

          <Accordion title={t("taxGuide.officialSources")} expanded={sourcesExpanded} onPress={() => setSourcesExpanded((value) => !value)}>
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
          </Accordion>
        </>
      ) : null}
    </ScrollView>
  );
}

function Fact({ label, value }: { label: string; value: string }) { return <View style={styles.factCard}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>; }
function Section({ title, items, embedded }: { title: string; items: string[]; embedded?: boolean }) { return <View style={embedded ? styles.embeddedSection : styles.card}><Text style={styles.sectionTitle}>{title}</Text>{items.map((item, index) => <Text key={`${index}-${item}`} style={styles.bullet}>• {item}</Text>)}</View>; }
function Accordion({ title, expanded, onPress, children }: { title: string; expanded: boolean; onPress: () => void; children: React.ReactNode }) { return <View style={styles.card}><TouchableOpacity style={styles.accordionHeader} onPress={onPress} accessibilityRole="button" accessibilityState={{ expanded }}><Text style={styles.accordionTitle}>{title}</Text><Text style={styles.accordionIcon}>{expanded ? "−" : "+"}</Text></TouchableOpacity>{expanded ? <View style={styles.accordionContent}>{children}</View> : null}</View>; }

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
  quickFactsGrid: { gap: 10, marginTop: 16 },
  factCard: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 14 },
  factLabel: { color: "#666666", fontSize: 12, fontWeight: "800", marginBottom: 6 },
  factValue: { color: "#0B1F3A", fontSize: 20, fontWeight: "900" },
  processBlock: { flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "flex-start" },
  stepNumberBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#0B1F3A", alignItems: "center", justifyContent: "center" },
  stepNumber: { color: "#FFFFFF", fontWeight: "900" },
  stepBody: { flex: 1 },
  stepTitle: { color: "#0B1F3A", fontWeight: "900", marginBottom: 6 },
  stepText: { color: "#26364D", lineHeight: 21, fontWeight: "700" },
  bullet: { color: "#666666", lineHeight: 21, fontWeight: "700", marginBottom: 7 },
  noteCard: { backgroundColor: "#FFF8E1", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#F0D98A", marginBottom: 14 },
  noteTitle: { color: "#0B1F3A", fontWeight: "900", marginBottom: 6 },
  note: { color: "#666666", lineHeight: 21, fontWeight: "700", marginTop: 8 },
  operatorCard: { backgroundColor: "#EEF4FA", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#CAD8E8", marginBottom: 14 },
  bodyText: { color: "#405066", lineHeight: 21, fontWeight: "700", marginBottom: 8 },
  accordionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  accordionTitle: { flex: 1, fontSize: 18, fontWeight: "900", color: "#0B1F3A" },
  accordionIcon: { color: "#0B1F3A", fontSize: 26, fontWeight: "700", marginStart: 12 },
  accordionContent: { marginTop: 18 },
  embeddedSection: { marginBottom: 18 },
  calculatorButton: { backgroundColor: "#0B1F3A", borderRadius: 22, padding: 16, alignItems: "center", marginBottom: 14 },
  calculatorButtonText: { color: "#C9A227", fontWeight: "900", fontSize: 15 },
  sourceRow: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEF1F5" },
  sourceAuthority: { color: "#0B1F3A", fontWeight: "900", marginBottom: 4 },
  sourceText: { color: "#666666", fontWeight: "700", lineHeight: 20 },
  sourceDate: { color: "#888888", fontWeight: "700", marginTop: 4 },
  sourceAction: { color: "#0B1F3A", fontWeight: "900" },
  lastVerified: { color: "#666666", fontWeight: "800", marginTop: 14 },
});
