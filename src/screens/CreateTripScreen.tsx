import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
ScrollView,
StyleSheet,
Text,
TextInput,
TouchableOpacity,
View,
} from "react-native";

import { useTrips } from "../contexts/TripsContext";

export function CreateTripScreen() {
const navigation = useNavigation<any>();
const { addTrip } = useTrips();

const [tripName, setTripName] = useState("");
const [city, setCity] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

function handleSaveTrip() {
if (!city.trim() || !startDate.trim() || !endDate.trim()) {
return;
}

addTrip({
tripName: tripName.trim() || `${city.trim()} Trip`,
city: city.trim(),
startDate: startDate.trim(),
endDate: endDate.trim(),
});

navigation.navigate("MyTrips");
}

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Create Shopping Trip</Text>
<Text style={styles.pageSubtitle}>Add cities and travel dates.</Text>

<View style={styles.card}>
<Text style={styles.label}>Trip Name</Text>
<TextInput
style={styles.input}
placeholder="Paris & Milan Trip"
placeholderTextColor="#8A8A8A"
value={tripName}
onChangeText={setTripName}
/>

<Text style={styles.label}>City</Text>
<TextInput
style={styles.input}
placeholder="Paris"
placeholderTextColor="#8A8A8A"
value={city}
onChangeText={setCity}
/>

<Text style={styles.label}>Start Date</Text>
<TextInput
style={styles.input}
placeholder="15 Aug 2026"
placeholderTextColor="#8A8A8A"
value={startDate}
onChangeText={setStartDate}
/>

<Text style={styles.label}>End Date</Text>
<TextInput
style={styles.input}
placeholder="22 Aug 2026"
placeholderTextColor="#8A8A8A"
value={endDate}
onChangeText={setEndDate}
/>

<TouchableOpacity style={styles.saveButton} onPress={handleSaveTrip}>
<Text style={styles.saveButtonText}>Save Trip</Text>
</TouchableOpacity>
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
borderRadius: 20,
padding: 18,
borderWidth: 1,
borderColor: "#E5E7EB",
},
label: {
fontSize: 14,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 8,
marginTop: 12,
},
input: {
backgroundColor: "#F7F8FA",
borderRadius: 14,
paddingHorizontal: 14,
paddingVertical: 12,
borderWidth: 1,
borderColor: "#E5E7EB",
fontSize: 15,
},
saveButton: {
marginTop: 22,
backgroundColor: "#0B1F3A",
borderRadius: 16,
padding: 15,
},
saveButtonText: {
color: "#FFFFFF",
textAlign: "center",
fontWeight: "800",
fontSize: 16,
},
});