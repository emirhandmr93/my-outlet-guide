import { StyleSheet, Text } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";

type TaxFreeCardProps = {
title: string;
vatRate: number;
refundRate?: string;
minimumSpend: string;
officeInfo: string;
};

export function TaxFreeCard({
title,
vatRate,
refundRate,
minimumSpend,
officeInfo,
}: TaxFreeCardProps) {
return (
<Card>
<SectionTitle title={title} />

<Text style={styles.text}>VAT Rate: {vatRate}%</Text>

<Text style={styles.text}>
Estimated Refund: {refundRate ?? `≈${Math.round(vatRate * 0.6)}%`}
</Text>

<Text style={styles.text}>Minimum Spend: {minimumSpend}</Text>

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
