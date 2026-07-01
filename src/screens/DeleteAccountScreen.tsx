import {
Alert,
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";

export function DeleteAccountScreen() {
return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Delete Account</Text>

<Text style={styles.pageSubtitle}>
Permanently delete your account and personal data.
</Text>

<View style={styles.card}>
<Text style={styles.cardTitle}>What will be deleted?</Text>
<Text style={styles.cardText}>• Your account</Text>
<Text style={styles.cardText}>• Favorites</Text>
<Text style={styles.cardText}>• Trips</Text>
<Text style={styles.cardText}>• Flight deal preferences</Text>
<Text style={styles.cardText}>• Notification settings</Text>
</View>

<View style={styles.card}>
<Text style={styles.cardTitle}>Reviews</Text>
<Text style={styles.cardText}>
Your published reviews and ratings will remain, but they will be shown as
“Anonymous Shopper”.
</Text>
</View>

<TouchableOpacity
style={styles.deleteButton}
onPress={() =>
Alert.alert(
"Delete Account",
"This action cannot be undone.",
[
{
text: "Cancel",
style: "cancel",
},
{
text: "Delete",
style: "destructive",
onPress: () => {
Alert.alert(
"Coming Soon",
"Account deletion logic will be connected next."
);
},
},
]
)
}
>
<Text style={styles.deleteButtonText}>
Delete My Account
</Text>
</TouchableOpacity>

</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F7F8FA" },
content: { padding: 20, paddingTop: 60, paddingBottom: 120 },

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
marginBottom: 8,
},

cardText: {
color: "#666666",
lineHeight: 22,
},

deleteButton: {
backgroundColor: "#D32F2F",
borderRadius: 16,
padding: 16,
marginTop: 12,
},

deleteButtonText: {
color: "#FFFFFF",
fontWeight: "800",
textAlign: "center",
},

});