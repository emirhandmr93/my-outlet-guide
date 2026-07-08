import { StyleSheet, Text } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { useTranslation } from "../../hooks/useTranslation";

type TaxFreeCardProps = {
  title: string;
  vatRate: number;
  minimumSpend: string;
  officeInfo: string;
};

export function TaxFreeCard({
  title,
  vatRate,
  minimumSpend,
  officeInfo,
}: TaxFreeCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <SectionTitle title={title} />

      <Text style={styles.text}>
        {t("taxCalc.vatRate")}: {vatRate}%
      </Text>

      <Text style={styles.text}>{t("taxCalc.finalDisclaimer")}</Text>

      <Text style={styles.text}>
        {t("taxCalc.minimumSpend")}: {minimumSpend}
      </Text>

      <Text style={styles.text}>{officeInfo}</Text>
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
