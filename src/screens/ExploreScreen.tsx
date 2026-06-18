import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
ScrollView,
StyleSheet,
Text,
TextInput,
TouchableOpacity,
View,
} from "react-native";

import { outlets } from "../constants/outlets";

export function ExploreScreen() {
const navigation = useNavigation<any>();
const [search, setSearch] = useState("");

const filteredOutlets = useMemo(() => {
if (!search.trim()) return outlets;

return outlets.filter((outlet) => {
const value = search.toLowerCase();

return (
outlet.name.toLowerCase().includes(value) ||
outlet.city.toLowerCase().includes(value) ||
outlet.country.toLowerCase().includes(value)
);
});
}, [search]);

return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.content}
>
<Text style={styles.pageTitle}>Explore</Text>

<TextInput
style={styles.searchInput}
placeholder="Search cities, outlets, brands..."
placeholderTextColor="#8A8A8A"
value={search}
onChangeText={setSearch}
/>

{search.length > 0 && (
<Text style={styles.resultText}>
{filteredOutlets.length} result found
</Text>
)}

<Text style={styles.sectionTitle}>Trending Outlets</Text>

{filteredOutlets.map((outlet) => (
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

{filteredOutlets.length === 0 && (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>No Results Found</Text>
<Text style={styles.emptyText}>
Try searching for another outlet, city or country.
</Text>
</View>
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
marginBottom: 14,
},

resultText: {
color: "#666666",
marginBottom: 14,
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
color: "#666666",
lineHeight: 20,
},
});