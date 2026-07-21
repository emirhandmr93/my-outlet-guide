import { StyleSheet, Text } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { useTranslation } from "../../hooks/useTranslation";
import { getTaxFreeStatusKey, hasDisplayValue, hasVerifiedMinimumSpend, hasVerifiedVatRate } from "../../utils/taxFreeDisplay";

type TaxFreeCardProps = {
  title: string;
  taxFreeAvailable: boolean;
  vatRate?: number;
  minimumSpend?: string;
  officeInfo?: string;
};

export function TaxFreeCard({
  title,
  taxFreeAvailable,
  vatRate,
  minimumSpend,
  officeInfo,
}: TaxFreeCardProps) {
  const { t, language } = useTranslation();
  const hasOfficeInfo = hasDisplayValue(officeInfo);
  const shouldShowOfficeInfo = hasOfficeInfo && (language !== "tr" || (officeInfo?.length ?? 0) <= 90);

  return (
    <Card>
      <SectionTitle title={title} />

      <Text style={styles.text}>{t(getTaxFreeStatusKey(taxFreeAvailable))}</Text>

      {!taxFreeAvailable ? (
        <Text style={styles.text}>{t("taxFree.notVerifiedExplanation")}</Text>
      ) : null}

      {hasVerifiedVatRate(vatRate) ? (
        <Text style={styles.text}>
          {t("taxCalc.vatRate")}: {vatRate}%
        </Text>
      ) : null}

      <Text style={styles.text}>{t("taxCalc.finalDisclaimer")}</Text>

      {hasVerifiedMinimumSpend(minimumSpend) ? (
        <Text style={styles.text}>
          {t("taxCalc.minimumSpend")}: {minimumSpend}
        </Text>
      ) : null}

      {shouldShowOfficeInfo ? <Text style={styles.text}>{officeInfo ?? ""}</Text> : null}
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
