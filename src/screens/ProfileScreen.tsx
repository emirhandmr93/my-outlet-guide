import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export function ProfileScreen() {
const navigation = useNavigation<any>();

return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.content}
>
<Text style={styles.pageTitle}>Profile</Text>
<Text style={styles.pageSubtitle}>
Manage your app preferences.
</Text>

<TouchableOpacity
style={styles.row}
onPress={() => navigation.navigate("MyTrips")}
>
<Text style={styles.rowText}>My Trips</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Language</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Currency</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Notifications</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Offline Packs</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>My Reviews</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Help & FAQ</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Contact Us</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Privacy Policy</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Terms & Conditions</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>Delete Account</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.row}>
<Text style={styles.rowText}>About My Outlet Guide</Text>
<Text style={styles.arrow}>›</Text>
</TouchableOpacity>
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

rowText: {
fontSize: 16,
fontWeight: "700",
color: "#0B1F3A",
},

arrow: {
fontSize: 26,
color: "#C9A227",
},
});