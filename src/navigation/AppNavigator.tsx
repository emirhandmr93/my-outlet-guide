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
return (
<Tab.Navigator
screenOptions={({ route }) => ({
headerShown: false,
tabBarActiveTintColor: "#C9A227",
tabBarInactiveTintColor: "rgba(255,255,255,0.72)",
tabBarIcon: ({ color, focused }) => (
<TabIcon routeName={route.name} color={color} focused={focused} />
),
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
return (
<NavigationContainer>
<Stack.Navigator
screenOptions={{
headerShown: true,
headerBackTitle: "Back",
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

<Stack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: "Outlet" }} />
<Stack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: "Brand" }} />
<Stack.Screen name="Transportation" component={TransportationScreen} options={{ title: "Transportation" }} />
<Stack.Screen name="Country" component={CountryScreen} options={{ title: "Country" }} />
<Stack.Screen name="CityResults" component={CityResultsScreen} options={{ title: "City" }} />

<Stack.Screen name="MyTrips" component={MyTripsScreen} options={{ title: "My Trips" }} />
<Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: "Create Trip" }} />
<Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: "Trip Detail" }} />

<Stack.Screen name="Savings" component={SavingsScreen} options={{ title: "Savings" }} />
<Stack.Screen name="SmartShoppingCalculator" component={SmartShoppingCalculatorScreen} options={{ title: "Smart Shopping" }} />
<Stack.Screen name="PriceAdvantageCalculator" component={PriceAdvantageCalculatorScreen} options={{ title: "Price Advantage" }} />
<Stack.Screen name="TaxFreeCalculator" component={TaxFreeCalculatorScreen} options={{ title: "Tax Free Calculator" }} />
<Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ title: "Language" }} />
<Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} options={{ title: "Currency" }} />
<Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: "Notifications" }} />
<Stack.Screen name="OfflinePacks" component={OfflinePacksScreen} options={{ title: "Offline Packs" }} />

<Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: "Write Review" }} />
<Stack.Screen name="FlightDealSettings" component={FlightDealSettingsScreen} options={{ title: "Flight Deals" }} />
<Stack.Screen name="FlightDeals" component={FlightDealsScreen} options={{ title: "Flight Deals" }} />
<Stack.Screen name="FlightDealDetail" component={FlightDealDetailScreen} options={{ title: "Flight Deal" }} />

<Stack.Screen name="Login" component={LoginScreen} options={{ title: "Sign In" }} />
<Stack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: "My Reviews" }} />
<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: "Privacy Policy" }} />
<Stack.Screen name="TermsConditions" component={TermsConditionsScreen} options={{ title: "Terms & Conditions" }} />
<Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: "Contact Us" }} />
<Stack.Screen name="HelpFaq" component={HelpFaqScreen} options={{ title: "Help & FAQ" }} />
<Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: "Delete Account" }} />
</Stack.Navigator>
</NavigationContainer>
);
}