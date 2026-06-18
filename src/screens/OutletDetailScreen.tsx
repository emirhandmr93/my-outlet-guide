import { RouteProp, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";

type RouteParams = {
OutletDetail: {
outletId: string;
};
};

export function OutletDetailScreen() {
const route = useRoute<RouteProp<RouteParams, "OutletDetail">>();

const outlet =
outlets.find((item) => item.id === route.params?.outletId) || outlets[0];

const { toggleFavorite, isFavorite } = useFavorites();

const favorite = isFavorite(outlet.id);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<View style={styles.hero}>
<Text style={styles.heroEmoji}>🛍️</Text>
</View>

<Text style={styles.title}>{outlet.name}</Text>

<Text style={styles.location}>
{outlet.city}, {outlet.country}
</Text>

<TouchableOpacity
style={styles.favoriteButton}
onPress={() => toggleFavorite(outlet.id)}
>
<Text style={styles.favoriteButtonText}>
{favorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
</Text>
</TouchableOpacity>

<View style={styles.badgeRow}>
<Text style={styles.badge}>{outlet.stores}</Text>
<Text style={styles.badge}>{outlet.taxFree}</Text>
<Text style={styles.badge}>{outlet.distance}</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Quick Facts</Text>
<Text style={styles.text}>Opening Hours: {outlet.hours}</Text>
<Text style={styles.text}>
Airport Distance: {outlet.airportDistance}
</Text>
<Text style={styles.text}>Best For: {outlet.bestFor}</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Popular Brands</Text>
<Text style={styles.text}>{outlet.brands.join(", ")}</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Restaurants & Cafes</Text>
<Text style={styles.text}>{outlet.restaurants.join(", ")}</Text>
</View>

<View style={styles.card}>
<Text style={styles.sectionTitle}>Why Visit?</Text>
<Text style={styles.text}>{outlet.description}</Text>
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
paddingTop: 70,
paddingBottom: 120,
},

hero: {
height: 180,
borderRadius: 28,
backgroundColor: "#0B1F3A",
alignItems: "center",
justifyContent: "center",
marginBottom: 22,
},

heroEmoji: {
fontSize: 64,
},

title: {
fontSize: 32,
fontWeight: "800",
color: "#0B1F3A",
},

location: {
fontSize: 16,
color: "#C9A227",
marginTop: 6,
marginBottom: 16,
},

favoriteButton: {
backgroundColor: "#FFFFFF",
borderRadius: 16,
padding: 14,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 18,
},

favoriteButtonText: {
textAlign: "center",
fontWeight: "700",
color: "#0B1F3A",
},

badgeRow: {
flexDirection: "row",
gap: 10,
marginBottom: 20,
flexWrap: "wrap",
},

badge: {
backgroundColor: "#FFFFFF",
color: "#0B1F3A",
paddingHorizontal: 12,
paddingVertical: 8,
borderRadius: 999,
borderWidth: 1,
borderColor: "#E5E7EB",
fontWeight: "700",
},

card: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 18,
marginBottom: 14,
borderWidth: 1,
borderColor: "#E5E7EB",
},

sectionTitle: {
fontSize: 20,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 10,
},

text: {
fontSize: 15,
color: "#666666",
lineHeight: 22,
marginBottom: 6,
},
});