import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { deals } from "../constants/deals";
import { events } from "../constants/events";
import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTranslation } from "../hooks/useTranslation";

export function FavoritesScreen() {
const { favoriteIds, toggleFavorite } = useFavorites();
const { t } = useTranslation();

const favoriteOutlets = outlets.filter((outlet) =>
favoriteIds.includes(outlet.outletId)
);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>{t("favorites.title")}</Text>
<Text style={styles.pageSubtitle}>{t("favorites.subtitle")}</Text>

{favoriteOutlets.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>{t("favorites.emptyTitle")}</Text>

<Text style={styles.emptyText}>
{t("favorites.emptyText")}
</Text>
</View>
) : (
favoriteOutlets.map((outlet) => {
const outletDeals = deals.filter(
(deal) => deal.outletId === outlet.outletId
);

const outletEvents = events.filter(
(event) => event.outletId === outlet.outletId
);

return (
<View key={outlet.outletId} style={styles.card}>
<Text style={styles.cardLabel}>{t("favorites.cardLabel")}</Text>

<Text style={styles.cardTitle}>{outlet.name}</Text>

<Text style={styles.cardText}>
{outlet.cityId}, {outlet.countryId}
</Text>

<View style={styles.summaryRow}>
<View style={styles.summaryBox}>
<Text style={styles.summaryNumber}>{outletDeals.length}</Text>
<Text style={styles.summaryLabel}>{t("favorites.deals")}</Text>
</View>

<View style={styles.summaryBox}>
<Text style={styles.summaryNumber}>{outletEvents.length}</Text>
<Text style={styles.summaryLabel}>{t("favorites.events")}</Text>
</View>
</View>

<TouchableOpacity
style={styles.removeButton}
onPress={() => toggleFavorite(outlet.outletId)}
>
<Text style={styles.removeButtonText}>
{t("favorites.remove")}
</Text>
</TouchableOpacity>
</View>
);
})
)}
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
},

summaryRow: {
flexDirection: "row",
gap: 10,
marginTop: 14,
},

summaryBox: {
flex: 1,
backgroundColor: "#F7F8FA",
borderRadius: 14,
padding: 12,
borderWidth: 1,
borderColor: "#E5E7EB",
},

summaryNumber: {
fontSize: 22,
fontWeight: "800",
color: "#0B1F3A",
},

summaryLabel: {
marginTop: 2,
color: "#C9A227",
fontWeight: "800",
},

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

emptyText: {
fontSize: 14,
color: "#666666",
lineHeight: 20,
},
});