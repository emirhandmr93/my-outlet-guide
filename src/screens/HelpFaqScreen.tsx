import { ScrollView, StyleSheet, Text, View } from "react-native";

export function HelpFaqScreen() {
return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.content}
>
<Text style={styles.pageTitle}>Help & FAQ</Text>

<Text style={styles.pageSubtitle}>
Frequently asked questions.
</Text>

<View style={styles.card}>
<Text style={styles.question}>
How do Flight Deal notifications work?
</Text>

<Text style={styles.answer}>
Flight Deal alerts are based on the average fare over the last 90 days.
You can choose to receive notifications when fares are significantly
below the average.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.question}>
How does Tax Free information work?
</Text>

<Text style={styles.answer}>
Tax Free information is provided as a guide and may vary depending on
country regulations and purchase conditions.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.question}>
What is included in Offline Packs?
</Text>

<Text style={styles.answer}>
Offline Packs may include outlet information, transportation guides,
tax free tools, brand lists, shopping notes and travel checklists.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.question}>
Can I edit my review?
</Text>

<Text style={styles.answer}>
Yes. You can update your review and rating after submitting it.
Previous comments may be shown for transparency.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.question}>
Do I need an account?
</Text>

<Text style={styles.answer}>
No. Most information can be viewed without an account. An account is
only required for features such as favorites, trips, reviews and
personalized notifications.
</Text>
</View>

<View style={styles.card}>
<Text style={styles.question}>
How do I delete my account?
</Text>

<Text style={styles.answer}>
You can request account deletion from the Profile section.
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

question: {
fontSize: 18,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 8,
},

answer: {
color: "#666666",
lineHeight: 22,
},
});