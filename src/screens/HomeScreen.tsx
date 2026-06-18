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
import { useFavorites } from "../contexts/FavoritesContext";
import { outlets } from "../constants/outlets";

export function HomeScreen() {
const navigation = useNavigation<any>();
const { trips } = useTrips();
const { favoriteIds } = useFavorites();

const latestTrip = trips[0];
const favoriteOutlets = outlets.filter((outlet) =>
favoriteIds.includes(outlet.id)
);
const firstFavorite = favoriteOutlets[0];

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<View style={styles.header}>
<View>
<Text style={styles.appName}>My Outlet Guide</Text>
<Text style={styles.tagline}>Shop Smarter. Travel Better.</Text>
</View>
<Text style={styles.icon}>🔔</Text>
</View>

<TextInput
style={styles.searchInput}
placeholder="Search cities, outlets, brands..."
placeholderTextColor="#8A8A8A"
/>

<View style={styles.card}>
<Text style={styles.cardLabel}>Featured Deal</Text>
<Text style={styles.cardTitle}>La Vallée Village Summer Sale</Text>
<Text style={styles.cardText}>
Discover premium outlet deals near Paris.
</Text>
</View>

<TouchableOpacity
style={styles.card}
onPress={() => navigation.navigate("MyTrips")}
activeOpacity={0.85}
>
<Text style={styles.cardLabel}>My Shopping Trip</Text>
<Text style={styles.cardTitle}>
{latestTrip ? latestTrip.tripName : "No Trip Yet"}
</Text>
<Text style={styles.cardText}>
{latestTrip
? `${latestTrip.city} • ${latestTrip.startDate} - ${latestTrip.endDate}`
: "Create your first shopping trip to track deals and Tax Free reminders."}
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.card}
onPress={() => navigation.navigate("Favorites")}
activeOpacity={0.85}
>
<Text style={styles.cardLabel}>Favorite Updates</Text>
<Text style={styles.cardTitle}>
{favoriteIds.length > 0
? `${favoriteIds.length} Favorite Outlet${favoriteIds.length > 1 ? "s" : ""}`
: "No Favorites Yet"}
</Text>
<Text style={styles.cardText}>
{firstFavorite
? `${firstFavorite.name} is saved. Major promotion alerts will appear here.`
: "Save outlets to get major promotion updates."}
</Text>
</TouchableOpacity>

<Text style={styles.sectionTitle}>Popular Cities</Text>

<View style={styles.row}>
<View style={styles.smallCard}>
<Text style={styles.smallCardTitle}>Paris</Text>
<Text style={styles.smallCardText}>France</Text>
</View>

<View style={styles.smallCard}>
<Text style={styles.smallCardTitle}>Milan</Text>
<Text style={styles.smallCardText}>Italy</Text>
</View>
</View>

<Text style={styles.sectionTitle}>Recommended Outlets</Text>

<TouchableOpacity
style={styles.card}
onPress={() =>
navigation.navigate("OutletDetail", {
outletId: "la-vallee-village",
})
}
activeOpacity={0.85}
>
<Text style={styles.cardLabel}>Near Paris</Text>
<Text style={styles.cardTitle}>La Vallée Village</Text>
<Text style={styles.cardText}>
Luxury outlet shopping destination close to Disneyland Paris.
</Text>
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
paddingTop: 80,
paddingBottom: 120,
},
header: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
marginBottom: 24,
},
appName: {
fontSize: 28,
fontWeight: "800",
color: "#0B1F3A",
},
tagline: {
fontSize: 14,
color: "#C9A227",
marginTop: 4,
},
icon: {
fontSize: 26,
},
searchInput: {
backgroundColor: "#FFFFFF",
borderRadius: 16,
paddingHorizontal: 16,
paddingVertical: 14,
fontSize: 16,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 20,
},
card: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 18,
marginBottom: 16,
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
color: "#0B1F3A",
fontWeight: "800",
marginBottom: 6,
},
cardText: {
fontSize: 14,
color: "#666666",
lineHeight: 20,
},
sectionTitle: {
fontSize: 18,
color: "#0B1F3A",
fontWeight: "800",
marginBottom: 12,
marginTop: 6,
},
row: {
flexDirection: "row",
gap: 12,
marginBottom: 18,
},
smallCard: {
flex: 1,
backgroundColor: "#FFFFFF",
borderRadius: 18,
padding: 16,
borderWidth: 1,
borderColor: "#E5E7EB",
},
smallCardTitle: {
fontSize: 18,
fontWeight: "800",
color: "#0B1F3A",
},
smallCardText: {
fontSize: 13,
color: "#666666",
marginTop: 4,
},
});