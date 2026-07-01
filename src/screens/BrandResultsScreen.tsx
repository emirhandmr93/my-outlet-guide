import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { brands } from "../constants/brands/index";
import { outletBrands } from "../constants/outletBrands/index";
import { outlets } from "../constants/outlets";
import { countries } from "../constants/countries";
import { getCityName, getCountryName } from "../services/locationService";

type RouteParams = {
BrandResults: {
brandId: string;
mode?: "chooseCountry";
};
};

type OutletItem = (typeof outlets)[number];

function OutletCard({
outlet,
onPress,
}: {
outlet: OutletItem;
onPress: () => void;
}) {
return (
<TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
<View style={styles.outletContent}>
<Text style={styles.outletName}>{outlet.name}</Text>
<Text style={styles.outletLocation}>
{getCityName(outlet.cityId)}, {getCountryName(outlet.countryId)}
</Text>
<Text style={styles.tapText}>View outlet →</Text>
</View>
</TouchableOpacity>
);
}

function EmptyCard({ title, text }: { title: string; text: string }) {
return (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>{title}</Text>
<Text style={styles.emptyText}>{text}</Text>
</View>
);
}

export function BrandResultsScreen() {
const navigation = useNavigation<any>();
const route = useRoute<RouteProp<RouteParams, "BrandResults">>();

const brand = brands.find((item) => item.brandId === route.params?.brandId) || brands[0];

const matchingOutletIds = outletBrands
.filter((item) => item.brandId === brand.brandId && item.relationStatus === "active")
.map((item) => item.outletId);

const matchingOutlets = outlets.filter((outlet) =>
matchingOutletIds.includes(outlet.outletId)
);

const countryIds = Array.from(new Set(matchingOutlets.map((outlet) => outlet.countryId)));

const matchingCountries = countries.filter((country) =>
countryIds.includes(country.countryId)
);

function openCountryResults(countryId: string) {
navigation.navigate("BrandResults", {
brandId: brand.brandId,
mode: "chooseCountry",
selectedCountryId: countryId,
});
}

const selectedCountryId = (route.params as any)?.selectedCountryId;

const visibleOutlets = selectedCountryId
? matchingOutlets.filter((outlet) => outlet.countryId === selectedCountryId)
: [];

const selectedCountry = countries.find((country) => country.countryId === selectedCountryId);

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<View style={styles.heroCard}>
<Text style={styles.heroLabel}>BRAND GUIDE</Text>
<Text style={styles.heroTitle}>{brand.brandName}</Text>
<Text style={styles.heroText}>
Choose a country to see which outlet destinations carry this brand.
</Text>
</View>

{!selectedCountryId ? (
<View style={styles.sectionBlock}>
<Text style={styles.sectionTitle}>Choose country</Text>

{matchingCountries.map((country) => (
<TouchableOpacity
key={country.countryId}
activeOpacity={0.88}
style={styles.countryRow}
onPress={() => openCountryResults(country.countryId)}
>
<Text style={styles.countryFlag}>{country.countryFlag}</Text>

<View style={styles.countryContent}>
<Text style={styles.countryName}>{country.countryName}</Text>
<Text style={styles.countryMeta}>
{
matchingOutlets.filter(
(outlet) => outlet.countryId === country.countryId
).length
}{" "}
outlets
</Text>
</View>

<Text style={styles.arrow}>→</Text>
</TouchableOpacity>
))}

{matchingCountries.length === 0 ? (
<EmptyCard
title="No outlet location found"
text="This brand is not linked to an active outlet yet."
/>
) : null}
</View>
) : (
<View style={styles.sectionBlock}>
<Text style={styles.sectionTitle}>
{brand.brandName} in {selectedCountry?.countryName}
</Text>

{visibleOutlets.map((outlet) => (
<OutletCard
key={outlet.outletId}
outlet={outlet}
onPress={() =>
navigation.navigate("OutletDetail", { outletId: outlet.outletId })
}
/>
))}

{visibleOutlets.length === 0 ? (
<EmptyCard
title="No outlet found"
text="This brand is not currently listed in this country."
/>
) : null}

<TouchableOpacity
activeOpacity={0.86}
style={styles.backButton}
onPress={() =>
navigation.navigate("BrandResults", {
brandId: brand.brandId,
mode: "chooseCountry",
})
}
>
<Text style={styles.backText}>← Choose another country</Text>
</TouchableOpacity>
</View>
)}
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F7F8FA" },
content: { padding: 20, paddingTop: 64, paddingBottom: 120 },

heroCard: {
backgroundColor: "#0B1F3A",
borderRadius: 30,
padding: 24,
marginBottom: 18,
},

heroLabel: {
color: "#C9A227",
fontWeight: "900",
fontSize: 12,
letterSpacing: 1.2,
marginBottom: 10,
},

heroTitle: {
color: "#FFFFFF",
fontSize: 32,
fontWeight: "900",
marginBottom: 8,
},

heroText: {
color: "#D8DEE9",
fontSize: 15,
lineHeight: 22,
},

sectionBlock: { marginBottom: 18 },

sectionTitle: {
fontSize: 22,
fontWeight: "900",
color: "#0B1F3A",
marginBottom: 14,
},

countryRow: {
backgroundColor: "#FFFFFF",
borderRadius: 22,
padding: 16,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 12,
flexDirection: "row",
alignItems: "center",
},

countryFlag: {
fontSize: 30,
marginRight: 14,
},

countryContent: {
flex: 1,
},

countryName: {
color: "#0B1F3A",
fontSize: 18,
fontWeight: "900",
},

countryMeta: {
color: "#687386",
fontSize: 13,
fontWeight: "700",
marginTop: 3,
},

arrow: {
color: "#C9A227",
fontSize: 22,
fontWeight: "900",
},

card: {
backgroundColor: "#FFFFFF",
borderRadius: 24,
overflow: "hidden",
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 12,
},

outletContent: { padding: 18 },

outletName: {
fontSize: 18,
fontWeight: "900",
color: "#0B1F3A",
},

outletLocation: {
marginTop: 6,
color: "#666666",
fontWeight: "700",
},

tapText: {
marginTop: 12,
color: "#0B1F3A",
fontWeight: "900",
},

backButton: {
backgroundColor: "#0B1F3A",
borderRadius: 999,
paddingVertical: 14,
alignItems: "center",
marginTop: 8,
},

backText: {
color: "#C9A227",
fontWeight: "900",
fontSize: 14,
},

emptyCard: {
backgroundColor: "#FFFFFF",
borderRadius: 22,
padding: 18,
borderWidth: 1,
borderColor: "#E5E7EB",
},

emptyTitle: {
color: "#0B1F3A",
fontSize: 18,
fontWeight: "900",
marginBottom: 6,
},

emptyText: {
color: "#666666",
lineHeight: 21,
},
});