import { StyleSheet, Text } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import { useTranslation } from "../../hooks/useTranslation";
import { TaxFreeRule } from "../../constants/taxFreeRules";
import { OutletTaxFreeDisplayStatus, getMinimumPurchaseTextKey, hasDisplayValue } from "../../utils/taxFreeDisplay";
type TaxFreeCardProps = { title: string; taxFreeStatus: OutletTaxFreeDisplayStatus; rule?: TaxFreeRule; officeInfo?: string };
export function TaxFreeCard({ title, taxFreeStatus, rule, officeInfo }: TaxFreeCardProps) { const { t } = useTranslation(); return <Card><SectionTitle title={title} /><Text style={styles.text}>{t(`taxFree.${taxFreeStatus}`)}</Text>{taxFreeStatus === "country_scheme_available" ? <Text style={styles.text}>{t("taxFree.retailerConfirmation")}</Text> : null}{taxFreeStatus === "not_available" ? <Text style={styles.text}>{t("taxFree.notAvailableExplanation")}</Text> : null}{taxFreeStatus === "not_verified" ? <Text style={styles.text}>{t("taxFree.notVerifiedExplanation")}</Text> : null}{rule ? <><Text style={styles.text}>{t("taxCalc.vatRate")}: {rule.vatRate}%</Text>{rule.minimumPurchaseStatus === "verified_amount" ? <Text style={styles.text}>{t("taxCalc.minimumSpend")}: {rule.minimumPurchaseAmount} {rule.currency} ({t(getMinimumPurchaseTextKey(rule))})</Text> : <Text style={styles.text}>{t(getMinimumPurchaseTextKey(rule))}</Text>}<Text style={styles.text}>{t("taxCalc.finalDisclaimer")}</Text></> : null}{hasDisplayValue(officeInfo) && taxFreeStatus === "outlet_verified" ? <Text style={styles.text}>{officeInfo}</Text> : null}</Card>; }
const styles = StyleSheet.create({ text: { fontSize: 15, color: "#666666", lineHeight: 22, marginBottom: 6 } });
