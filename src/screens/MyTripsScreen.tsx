import { useNavigation } from "@react-navigation/native";
import {
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";

import { useTrips } from "../contexts/TripsContext";

export function MyTripsScreen() {
const navigation = useNavigation<any>();
const { trips, deleteTrip } = useTrips();

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>My Shopping Trips</Text>

<Text style={styles.pageSubtitle}>
Plan outlet shopping around your travel dates.
</Text>

<TouchableOpacity
style={styles.createButton}
onPress={() => navigation.navigate("CreateTrip")}
>
<Text style={styles.createButtonText}>+ Create Trip</Text>
</TouchableOpacity>

{trips.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>No Trips Yet</Text>

<Text style={styles.emptyText}>
Create your first shopping trip and start tracking deals,
events and Tax Free reminders.
</Text>
</View>
) : (
trips.map((trip) => (
<View key={trip.id} style={styles.card}>
<Text style={styles.cardLabel}>{trip.status}</Text>

<Text style={styles.cardTitle}>{trip.tripName}</Text>

<Text style={styles.cardText}>
{trip.city}
</Text>

<Text style={styles.cardText}>
{trip.startDate} - {trip.endDate}
</Text>

<TouchableOpacity
style={styles.deleteButton}
onPress={() => deleteTrip(trip.id)}
>
<Text style={styles.deleteButtonText}>
Delete Trip
</Text>
</TouchableOpacity>
</View>
))
)}
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

createButton: {
backgroundColor: "#0B1F3A",
borderRadius: 16,
padding: 15,
marginBottom: 18,
},

createButtonText: {
color: "#FFFFFF",
textAlign: "center",
fontWeight: "800",
fontSize: 16,
},

card: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 18,
marginBottom: 14,
borderWidth: 1,
borderColor: "#E5E7EB",
},

cardLabel: {
fontSize: 13,
color: "#C9A227",
fontWeight: "700",
marginBottom: 8,
},

cardTitle: {
fontSize: 20,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 6,
},

cardText: {
fontSize: 14,
color: "#666666",
lineHeight: 20,
marginBottom: 4,
},

deleteButton: {
marginTop: 14,
backgroundColor: "#EFEFEF",
borderRadius: 14,
padding: 12,
},

deleteButtonText: {
textAlign: "center",
fontWeight: "700",
color: "#0B1F3A",
},

emptyCard: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 22,
borderWidth: 1,
borderColor: "#E5E7EB",
},

emptyTitle: {
fontSize: 20,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 8,
},

emptyText: {
fontSize: 14,
color: "#666666",
lineHeight: 20,
},
});
