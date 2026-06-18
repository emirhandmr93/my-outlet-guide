import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { outlets } from "../constants/outlets";

export function ExploreScreen() {
const navigation = useNavigation<any>();

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>Explore</Text>

<TextInput
style={styles.searchInput}
placeholder="Search cities, outlets, brands..."
placeholderTextColor="#8A8A8A"
/>

<Text style={styles.sectionTitle}>Trending Outlets</Text>

{outlets.map((outlet) => (
<TouchableOpacity
key={outlet.id}
activeOpacity={0.85}
style={styles.outletCard}
onPress={() =>
navigation.navigate("OutletDetail", {
outletId: outlet.id,
})
}
>
<Text style={styles.outletTitle}>{outlet.name}</Text>

<Text style={styles.outletLocation}>
{outlet.city}, {outlet.country}
</Text>

<Text style={styles.outletStores}>{outlet.stores}</Text>

<Text style={styles.tapText}>View details →</Text>
</TouchableOpacity>
))}
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
marginBottom: 20,
},

searchInput: {
backgroundColor: "#FFFFFF",
borderRadius: 16,
paddingHorizontal: 16,
paddingVertical: 14,
fontSize: 16,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 24,
},

sectionTitle: {
fontSize: 20,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 12,
},

outletCard: {
backgroundColor: "#FFFFFF",
borderRadius: 18,
padding: 18,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 12,
},

outletTitle: {
fontSize: 18,
fontWeight: "700",
color: "#0B1F3A",
},

outletLocation: {
marginTop: 4,
color: "#666666",
},

outletStores: {
marginTop: 8,
color: "#C9A227",
fontWeight: "700",
},

tapText: {
marginTop: 10,
color: "#0B1F3A",
fontWeight: "800",
},
});