import { ScrollView, StyleSheet, Text, View } from "react-native";

const items = [
"Language",
"Currency",
"Notifications",
"Offline Packs",
"My Trips",
"My Reviews",
"Help & FAQ",
"Contact Us",
"Privacy Policy",
"Terms & Conditions",
"Delete Account",
"About My Outlet Guide",
];

export function ProfileScreen() {
return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Profile</Text>
<Text style={styles.pageSubtitle}>Manage your app preferences.</Text>

{items.map((item) => (
<View key={item} style={styles.row}>
<Text style={styles.rowText}>{item}</Text>
<Text style={styles.arrow}>›</Text>
</View>
))}
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F7F8FA" },
content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
pageTitle: { fontSize: 28, fontWeight: "800", color: "#0B1F3A" },
pageSubtitle: { fontSize: 15, color: "#C9A227", marginTop: 6, marginBottom: 22 },
row: {
backgroundColor: "#FFFFFF",
borderRadius: 16,
padding: 18,
marginBottom: 10,
borderWidth: 1,
borderColor: "#E5E7EB",
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
},
rowText: { fontSize: 16, fontWeight: "700", color: "#0B1F3A" },
arrow: { fontSize: 26, color: "#C9A227" },
});