import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";

export function FavoritesScreen() {
const { favoriteIds, toggleFavorite } = useFavorites();

const favoriteOutlets = outlets.filter((outlet) =>
favoriteIds.includes(outlet.id)
);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Favorites</Text>
<Text style={styles.pageSubtitle}>Your saved outlet destinations.</Text>

{favoriteOutlets.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>No Favorite Outlets Yet</Text>
<Text style={styles.emptyText}>
Explore outlets and save your favorites to stay updated.
</Text>
</View>
) : (
favoriteOutlets.map((outlet) => (
<View key={outlet.id} style={styles.card}>
<Text style={styles.cardLabel}>Favorite Outlet</Text>
<Text style={styles.cardTitle}>{outlet.name}</Text>
<Text style={styles.cardText}>
{outlet.city}, {outlet.country} • {outlet.stores}
</Text>

<TouchableOpacity
style={styles.removeButton}
onPress={() => toggleFavorite(outlet.id)}
>
<Text style={styles.removeButtonText}>Remove from Favorites</Text>
</TouchableOpacity>
</View>
))
)}
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
cardText: { fontSize: 14, color: "#666666", lineHeight: 20 },
removeButton: {
marginTop: 14,
backgroundColor: "#0B1F3A",
padding: 12,
borderRadius: 14,
},
removeButtonText: {
color: "#FFFFFF",
textAlign: "center",
fontWeight: "800",
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
emptyText: { fontSize: 14, color: "#666666", lineHeight: 20 },
});