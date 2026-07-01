import { ScrollView, StyleSheet, Text, View } from "react-native";

export function PrivacyPolicyScreen() {
return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Privacy Policy</Text>
<Text style={styles.pageSubtitle}>How My Outlet Guide handles your data.</Text>

<View style={styles.card}>
<Text style={styles.cardTitle}>Information We Collect</Text>
<Text style={styles.cardText}>
We may collect account information, saved trips, favorites, notification preferences, flight deal preferences and reviews you submit.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>How We Use Information</Text>
<Text style={styles.cardText}>
We use your information to sync your account, show saved trips and favorites, personalize notifications and improve the app experience.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Reviews</Text>
<Text style={styles.cardText}>
Reviews you publish may be visible to other users together with your display name.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Data Security</Text>
<Text style={styles.cardText}>
We use Firebase services and security rules to help protect user data.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Contact</Text>
<Text style={styles.cardText}>
For privacy questions, contact: info@myoutletguide.com
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