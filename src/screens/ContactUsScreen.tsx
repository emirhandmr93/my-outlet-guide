import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function ContactUsScreen() {
return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.content}
>
<Text style={styles.pageTitle}>Contact Us</Text>

<Text style={styles.pageSubtitle}>
Need help or want to share feedback?
</Text>

<View style={styles.card}>
<Text style={styles.cardTitle}>Email Support</Text>

<Text style={styles.cardText}>
Contact our support team for questions, feedback or technical issues.
</Text>

<TouchableOpacity
style={styles.actionButton}
onPress={() =>
Linking.openURL("mailto:info@myoutletguide.com")
}
>
<Text style={styles.actionButtonText}>
info@myoutletguide.com
</Text>
</TouchableOpacity>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Instagram</Text>

<Text style={styles.cardText}>
Follow us for outlet news, shopping tips and updates.
</Text>

<TouchableOpacity
style={styles.actionButton}
onPress={() =>
Linking.openURL("https://instagram.com/outlet.guide")
}
>
<Text style={styles.actionButtonText}>
@outlet.guide
</Text>
</TouchableOpacity>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Website</Text>

<Text style={styles.cardText}>
Visit our official website.
</Text>

<TouchableOpacity
style={styles.actionButton}
onPress={() =>
Linking.openURL("https://www.myoutletguide.com")
}
>
<Text style={styles.actionButtonText}>
myoutletguide.com
</Text>
</TouchableOpacity>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Suggest a Feature</Text>

<Text style={styles.cardText}>
Have an idea that could improve My Outlet Guide?
We'd love to hear from you.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Report a Problem</Text>

<Text style={styles.cardText}>
Found incorrect information or a bug?
Please contact us and include as much detail as possible.
</Text>
</View>
</ScrollView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#F7F8FA",
},

content: {
padding: 20,
paddingTop: 60,
paddingBottom: 120,
},

pageTitle: {
fontSize: 28,
fontWeight: "800",
color: "#0B1F3A",
},

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
lineHeight: 22,
marginBottom: 10,
},

actionButton: {
backgroundColor: "#0B1F3A",
borderRadius: 14,
padding: 13,
},

actionButtonText: {
color: "#FFFFFF",
textAlign: "center",
fontWeight: "800",
},
});