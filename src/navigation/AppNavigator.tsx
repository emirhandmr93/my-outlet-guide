import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { BrandResultsScreen } from "../screens/BrandResultsScreen";
import { CityResultsScreen } from "../screens/CityResultsScreen";
import { ContactUsScreen } from "../screens/ContactUsScreen";
import { CountryScreen } from "../screens/CountryScreen";
import { CreateTripScreen } from "../screens/CreateTripScreen";
import { CurrencySettingsScreen } from "../screens/CurrencySettingsScreen";
import { DeleteAccountScreen } from "../screens/DeleteAccountScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { FlightDealDetailScreen } from "../screens/FlightDealDetailScreen";
import { FlightDealSettingsScreen } from "../screens/FlightDealSettingsScreen";
import { FlightDealsScreen } from "../screens/FlightDealsScreen";
import { HelpFaqScreen } from "../screens/HelpFaqScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LanguageSettingsScreen } from "../screens/LanguageSettingsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { MyReviewsScreen } from "../screens/MyReviewsScreen";
import { MyTripsScreen } from "../screens/MyTripsScreen";
import { NotificationSettingsScreen } from "../screens/NotificationSettingsScreen";
import { OfflinePacksScreen } from "../screens/OfflinePacksScreen";
import { OutletDetailScreen } from "../screens/OutletDetailScreen";
import { PriceAdvantageCalculatorScreen } from "../screens/PriceAdvantageCalculatorScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SavingsScreen } from "../screens/SavingsScreen";
import { SmartShoppingCalculatorScreen } from "../screens/SmartShoppingCalculatorScreen";
import { TaxFreeCalculatorScreen } from "../screens/TaxFreeCalculatorScreen";
import { TermsConditionsScreen } from "../screens/TermsConditionsScreen";
import { TransportationScreen } from "../screens/TransportationScreen";
import { TripDetailScreen } from "../screens/TripDetailScreen";
import { WriteReviewScreen } from "../screens/WriteReviewScreen";
import { useTranslation } from "../hooks/useTranslation";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({
routeName,
color,
focused,
}: {
routeName: string;
color: string;
focused: boolean;
}) {
const size = routeName === "Home" ? (focused ? 25 : 23) : focused ? 24 : 22;

if (routeName === "Home") {
return <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />;
}

if (routeName === "Explore") {
return <Feather name="search" size={size} color={color} />;
}

if (routeName === "Savings") {
return <MaterialCommunityIcons name="cash-multiple" size={size + 1} color={color} />;
}

if (routeName === "Favorites") {
return <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />;
}

return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
}

function MainTabs() {
const { t } = useTranslation();

const tabLabels: Record<string, string> = {
Home: t("nav.home"),
Explore: t("nav.explore"),
Savings: t("nav.savings"),
Favorites: t("nav.favorites"),
Profile: t("nav.profile"),
};

return (
<Tab.Navigator
screenOptions={({ route }) => ({
headerShown: false,
tabBarActiveTintColor: "#C9A227",
tabBarInactiveTintColor: "rgba(255,255,255,0.72)",
tabBarIcon: ({ color, focused }) => (
<TabIcon routeName={route.name} color={color} focused={focused} />
),
tabBarLabel: tabLabels[route.name] ?? route.name,
tabBarLabelStyle: {
fontSize: 11,
fontWeight: "900",
marginTop: 2,
},
tabBarStyle: {
position: "absolute",
left: 14,
right: 14,
bottom: Platform.OS === "ios" ? 18 : 12,
height: 76,
backgroundColor: "#0B1F3A",
borderTopWidth: 0,
borderRadius: 28,
paddingTop: 8,
paddingBottom: Platform.OS === "ios" ? 14 : 10,
shadowColor: "#0B1F3A",
shadowOpacity: 0.24,
shadowRadius: 18,
shadowOffset: { width: 0, height: 10 },
elevation: 14,
},
})}
>
<Tab.Screen name="Home" component={HomeScreen} />
<Tab.Screen name="Explore" component={ExploreScreen} />
<Tab.Screen name="Savings" component={SavingsScreen} />
<Tab.Screen name="Favorites" component={FavoritesScreen} />
<Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
);
}

export function AppNavigator() {
const { t } = useTranslation();

return (
<NavigationContainer>
<Stack.Navigator
screenOptions={{
headerShown: true,
headerBackTitle: t("nav.back"),
headerTintColor: "#0B1F3A",
headerTitleStyle: {
color: "#0B1F3A",
fontWeight: "900",
},
headerStyle: {
backgroundColor: "#FFFFFF",
},
}}
>
<Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

<Stack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: t("nav.outlet") }} />
<Stack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: t("nav.brand") }} />
<Stack.Screen name="Transportation" component={TransportationScreen} options={{ title: t("nav.transportation") }} />
<Stack.Screen name="Country" component={CountryScreen} options={{ title: t("nav.country") }} />
<Stack.Screen name="CityResults" component={CityResultsScreen} options={{ title: t("nav.city") }} />

<Stack.Screen name="MyTrips" component={MyTripsScreen} options={{ title: t("nav.myTrips") }} />
<Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} />
<Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t("nav.tripDetail") }} />

<Stack.Screen name="Savings" component={SavingsScreen} options={{ title: t("nav.savings") }} />
<Stack.Screen name="SmartShoppingCalculator" component={SmartShoppingCalculatorScreen} options={{ title: t("nav.smartShopping") }} />
<Stack.Screen name="PriceAdvantageCalculator" component={PriceAdvantageCalculatorScreen} options={{ title: t("nav.priceAdvantage") }} />
<Stack.Screen name="TaxFreeCalculator" component={TaxFreeCalculatorScreen} options={{ title: t("nav.taxFreeCalculator") }} />
<Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ title: t("nav.language") }} />
<Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} options={{ title: t("nav.currency") }} />
<Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: t("nav.notifications") }} />
<Stack.Screen name="OfflinePacks" component={OfflinePacksScreen} options={{ title: t("nav.offlinePacks") }} />

<Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: t("nav.writeReview") }} />
<Stack.Screen name="FlightDealSettings" component={FlightDealSettingsScreen} options={{ title: t("nav.flightDeals") }} />
<Stack.Screen name="FlightDeals" component={FlightDealsScreen} options={{ title: t("nav.flightDeals") }} />
<Stack.Screen name="FlightDealDetail" component={FlightDealDetailScreen} options={{ title: t("nav.flightDeal") }} />

<Stack.Screen name="Login" component={LoginScreen} options={{ title: t("nav.signIn") }} />
<Stack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: t("nav.myReviews") }} />
<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t("nav.privacyPolicy") }} />
<Stack.Screen name="TermsConditions" component={TermsConditionsScreen} options={{ title: t("nav.termsConditions") }} />
<Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: t("nav.contactUs") }} />
<Stack.Screen name="HelpFaq" component={HelpFaqScreen} options={{ title: t("nav.helpFaq") }} />
<Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: t("nav.deleteAccount") }} />
</Stack.Navigator>
</NavigationContainer>
);
}