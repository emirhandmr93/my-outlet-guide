import { StyleSheet, Text } from "react-native";

import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { getMaximumRefundRate, getTaxFreePolicySummaryKey, TaxFreeRule } from "../../constants/taxFreeRules";
import { useTranslation } from "../../hooks/useTranslation";
import { formatCurrency } from "../../services/exchangeRateService";
import {
  getMinimumPurchaseComparisonSymbol,
  getMinimumPurchaseTextKey,
  hasDisplayValue,
  OutletTaxFreeDisplayStatus,
} from "../../utils/taxFreeDisplay";

type TaxFreeCardProps = {
  title: string;
  taxFreeStatus: OutletTaxFreeDisplayStatus;
  rule?: TaxFreeRule;
  officeInfo?: string;
};

export function TaxFreeCard({
  title,
  taxFreeStatus,
  rule,
  officeInfo,
}: TaxFreeCardProps) {
  const { t, language } = useTranslation();
  const policySummaryKey = rule ? getTaxFreePolicySummaryKey(rule) : undefined;
  const shouldShowOfficeInfo =
    hasDisplayValue(officeInfo) &&
    (language !== "tr" || (officeInfo?.length ?? 0) <= 90);

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
        policySummaryKey === "taxCalc.futureRegimeNoEstimate" ? (
          <Text style={styles.text}>{t("taxCalc.futureRegimeNoEstimate")}</Text>
        ) : (
          <>
            <Text style={styles.text}>
              {rule.refundPolicy.mode === "provider_dependent_upper_bound"
                ? t(policySummaryKey!).replace("%{rate}", `${getMaximumRefundRate(rule).toFixed(1)}%`)
                : t(policySummaryKey!)}
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

      {shouldShowOfficeInfo && taxFreeStatus === "outlet_verified" && policySummaryKey !== "taxCalc.futureRegimeNoEstimate" ? (
        <Text style={styles.text}>{officeInfo}</Text>
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
});
