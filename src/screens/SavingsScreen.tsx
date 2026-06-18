import { ScrollView, StyleSheet, Text, View } from "react-native";

export function SavingsScreen() {
return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Savings</Text>
<Text style={styles.pageSubtitle}>Save more. Shop smarter.</Text>

<View style={styles.card}>
<Text style={styles.cardIcon}>💱</Text>
<Text style={styles.cardTitle}>Smart Shopping Calculator</Text>
<Text style={styles.cardText}>Calculate the real cost after Tax Free.</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardIcon}>🏷️</Text>
<Text style={styles.cardTitle}>Price Advantage Calculator</Text>
<Text style={styles.cardText}>Compare European and local prices.</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardIcon}>🧮</Text>
<Text style={styles.cardTitle}>Tax Free Calculator</Text>
<Text style={styles.cardText}>Estimate your Tax Free refund.</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardIcon}>📚</Text>
<Text style={styles.cardTitle}>Tax Free Guide</Text>
<Text style={styles.cardText}>Country-by-country Tax Free rules.</Text>
</View>
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F7F8FA" },
content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
pageTitle: { fontSize: 28, fontWeight: "800", color: "#0B1F3A" },
pageSubtitle: { fontSize: 15, color: "#C9A227", marginTop: 6, marginBottom: 22 },
card: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 18,
marginBottom: 14,
borderWidth: 1,
borderColor: "#E5E7EB",
},
cardIcon: { fontSize: 26, marginBottom: 10 },
cardTitle: { fontSize: 19, fontWeight: "800", color: "#0B1F3A", marginBottom: 6 },
cardText: { fontSize: 14, color: "#666666", lineHeight: 20 },
});