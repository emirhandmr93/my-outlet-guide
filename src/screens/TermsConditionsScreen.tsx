import { ScrollView, StyleSheet, Text, View } from "react-native";

export function TermsConditionsScreen() {
return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Terms & Conditions</Text>
<Text style={styles.pageSubtitle}>Rules for using My Outlet Guide.</Text>

<View style={styles.card}>
<Text style={styles.cardTitle}>Use of the App</Text>
<Text style={styles.cardText}>
My Outlet Guide provides outlet shopping, travel, tax free and flight deal information for planning purposes.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Information Accuracy</Text>
<Text style={styles.cardText}>
Outlet details, prices, promotions, transport information and flight deal data may change. Always confirm final details with official providers.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>User Reviews</Text>
<Text style={styles.cardText}>
Users are responsible for the reviews and comments they submit. We may remove inappropriate or misleading content.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Third-Party Services</Text>
<Text style={styles.cardText}>
The app may link to maps, airline, travel or outlet websites. We are not responsible for third-party services.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Account</Text>
<Text style={styles.cardText}>
You are responsible for keeping your account secure and for activity under your account.
</Text>
</View>
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F7F8FA" },
content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
pageTitle: { fontSize: 28, fontWeight: "800", color: "#0B1F3A" },
pageSubtitle: {
fontSize: 15,
color: "#C9A227",
marginTop: 6,
marginBottom: 22,
},
card: {
backgroundColor: "#FFFFFF",
borderRadius: 18,
padding: 18,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 12,
},
cardTitle: {
fontSize: 18,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 6,
},
cardText: {
color: "#666666",
lineHeight: 20,
},
});