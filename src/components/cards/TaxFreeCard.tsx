import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { TaxFreeRule } from "../../constants/taxFreeRules";
import { useTranslation } from "../../hooks/useTranslation";
import { formatCurrency } from "../../services/exchangeRateService";
import {
  getMinimumPurchaseComparisonSymbol,
  getMinimumPurchaseTextKey,
  getTaxFreePolicyDisplayModel,
  hasDisplayValue,
  OutletTaxFreeDisplayStatus,
} from "../../utils/taxFreeDisplay";

type TaxFreeCardProps = {
  title: string;
  taxFreeStatus: OutletTaxFreeDisplayStatus;
  rule?: TaxFreeRule;
  officeInfo?: string;
  guideButtonText?: string;
  onPressGuide?: () => void;
};

export function TaxFreeCard({
  title,
  taxFreeStatus,
  rule,
  officeInfo,
  guideButtonText,
  onPressGuide,
}: TaxFreeCardProps) {
  const { t, language } = useTranslation();
  const policyDisplay = rule ? getTaxFreePolicyDisplayModel(rule, language, t) : undefined;
  const shouldShowOfficeInfo =
    hasDisplayValue(officeInfo) &&
    (language !== "tr" || (officeInfo?.length ?? 0) <= 90);
  const shouldShowGuideButton = hasDisplayValue(guideButtonText) && Boolean(onPressGuide);

  return (
    <Card>
      <SectionTitle title={title} />
      <Text style={styles.text}>{t(`taxFree.${taxFreeStatus}`)}</Text>

      {taxFreeStatus === "country_scheme_available" ? (
        <Text style={styles.text}>{t("taxFree.retailerConfirmation")}</Text>
      ) : null}
      {taxFreeStatus === "not_available" ? (
        <Text style={styles.text}>{t("taxFree.notAvailableExplanation")}</Text>
      ) : null}
      {taxFreeStatus === "not_verified" ? (
        <Text style={styles.text}>{t("taxFree.notVerifiedExplanation")}</Text>
      ) : null}

      {rule && (taxFreeStatus === "outlet_verified" || taxFreeStatus === "country_scheme_available") ? (
        policyDisplay?.kind === "future_regime" ? (
          <Text style={styles.text}>{policyDisplay.summary}</Text>
        ) : (
          <>
            <Text style={styles.text}>
              {policyDisplay?.summary}
            </Text>
            {rule.minimumPurchaseStatus === "verified_amount" && typeof rule.minimumPurchaseAmount === "number" ? (
              <Text style={styles.text}>
                {t("taxCalc.minimumSpend")}: {getMinimumPurchaseComparisonSymbol(rule)} {formatCurrency(rule.minimumPurchaseAmount, rule.currency, language)} ({t(getMinimumPurchaseTextKey(rule))})
              </Text>
            ) : <Text style={styles.text}>{t(getMinimumPurchaseTextKey(rule))}</Text>}
            <Text style={styles.text}>{t(rule.refundPolicy.mode === "point_of_sale_exemption" ? "taxCalc.pointOfSaleDisclaimer" : "taxCalc.finalDisclaimer")}</Text>
          </>
        )
      ) : null}

      {shouldShowOfficeInfo && taxFreeStatus === "outlet_verified" && policyDisplay?.kind !== "future_regime" ? (
        <Text style={styles.text}>{officeInfo}</Text>
      ) : null}

      {shouldShowGuideButton ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={guideButtonText}
          activeOpacity={0.86}
          onPress={onPressGuide}
          style={styles.guideButton}
        >
          <Text style={styles.guideButtonText}>{guideButtonText}</Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
    marginBottom: 6,
  },
  guideButton: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#0B1F3A",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  guideButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
