import { ScrollView, StyleSheet, Text, View } from "react-native";

export function FavoritesScreen() {
return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Favorites</Text>
<Text style={styles.pageSubtitle}>Updates from your favorite outlets.</Text>

<View style={styles.card}>
<Text style={styles.cardLabel}>New Promotion</Text>
<Text style={styles.cardTitle}>La Vallée Village</Text>
<Text style={styles.cardText}>Luxury Weekend starts soon.</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardLabel}>Event During Your Trip</Text>
<Text style={styles.cardTitle}>Serravalle</Text>
<Text style={styles.cardText}>New store opening during your Milan trip.</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardLabel}>No Active Updates</Text>
<Text style={styles.cardTitle}>Bicester Village</Text>
<Text style={styles.cardText}>You will be notified about major promotions.</Text>
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
cardLabel: { fontSize: 13, color: "#C9A227", fontWeight: "700", marginBottom: 8 },
cardTitle: { fontSize: 20, fontWeight: "800", color: "#0B1F3A", marginBottom: 6 },
cardText: { fontSize: 14, color: "#666666", lineHeight: 20 },
});