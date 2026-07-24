import { createNavigationContainerRef, NavigationContainer, type RouteProp } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Platform, useWindowDimensions, View } from "react-native";
import { useEffect, useState } from "react";
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
import { MediaCreditsScreen } from "../screens/MediaCreditsScreen";
import { MyReviewsScreen } from "../screens/MyReviewsScreen";
import { MyTripsScreen } from "../screens/MyTripsScreen";
import { NotificationSettingsScreen } from "../screens/NotificationSettingsScreen";
import { OfflinePacksScreen } from "../screens/OfflinePacksScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { OutletDetailScreen } from "../screens/OutletDetailScreen";
import { PriceAdvantageCalculatorScreen } from "../screens/PriceAdvantageCalculatorScreen";
import { ReviewModerationScreen } from "../screens/ReviewModerationScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SavingsScreen } from "../screens/SavingsScreen";
import { SmartShoppingCalculatorScreen } from "../screens/SmartShoppingCalculatorScreen";
import { TaxFreeCalculatorScreen } from "../screens/TaxFreeCalculatorScreen";
import { TermsConditionsScreen } from "../screens/TermsConditionsScreen";
import { TransportationScreen } from "../screens/TransportationScreen";
import { TripDetailScreen } from "../screens/TripDetailScreen";
import { TripSegmentEditorScreen } from "../screens/TripSegmentEditorScreen";
import { WriteReviewScreen } from "../screens/WriteReviewScreen";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { hasSeenOnboarding } from "../services/onboardingStorage";
import colors from "../theme/colors";

import type { MainTabParamList, RootStackParamList } from "./types";
import { createWebLinking } from "./webLinking";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

type DesktopHomeStackParamList = {
HomeRoot: undefined;
OutletDetail: RootStackParamList["OutletDetail"] & { reviewsRefresh?: number };
BrandResults: RootStackParamList["BrandResults"] & { selectedCountryId?: string };
Country: RootStackParamList["Country"];
CityResults: RootStackParamList["CityResults"];
Transportation: RootStackParamList["Transportation"];
CreateTrip: undefined;
NotificationSettings: undefined;
LanguageSettings: undefined;
};

type DesktopTripsStackParamList = { MyTripsRoot: undefined; TripDetail: RootStackParamList["TripDetail"]; CreateTrip: undefined; TripSegmentEditor: RootStackParamList["TripSegmentEditor"]; };

type DesktopExploreStackParamList = {
ExploreRoot: MainTabParamList["Explore"];
OutletDetail: RootStackParamList["OutletDetail"] & { reviewsRefresh?: number };
BrandResults: RootStackParamList["BrandResults"] & { selectedCountryId?: string };
Country: RootStackParamList["Country"];
CityResults: RootStackParamList["CityResults"];
Transportation: RootStackParamList["Transportation"];
CreateTrip: undefined;
};

const DesktopHomeStack = createNativeStackNavigator<DesktopHomeStackParamList>();
const DesktopExploreStack = createNativeStackNavigator<DesktopExploreStackParamList>();
const DesktopTripsStack = createNativeStackNavigator<DesktopTripsStackParamList>();

function desktopBrowseScreenOptions(t: ReturnType<typeof useTranslation>["t"]) {
return {
headerShown: true,
headerBackTitle: t("nav.back"),
headerTintColor: "#0B1F3A",
headerTitleStyle: {
color: "#0B1F3A",
fontWeight: "900" as const,
},
headerStyle: {
backgroundColor: "#FFFFFF",
},
};
}

function DesktopHomeNavigator() {
const { t } = useTranslation();

return (
<DesktopHomeStack.Navigator screenOptions={desktopBrowseScreenOptions(t)}>
<DesktopHomeStack.Screen name="HomeRoot" component={HomeScreen} options={{ headerShown: false }} />
<DesktopHomeStack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: t("nav.outlet") }} />
<DesktopHomeStack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: t("nav.brand") }} />
<DesktopHomeStack.Screen name="Transportation" component={TransportationScreen} options={{ title: t("nav.transportation") }} />
<DesktopHomeStack.Screen name="Country" component={CountryScreen} options={{ title: t("nav.country") }} />
<DesktopHomeStack.Screen name="CityResults" component={CityResultsScreen} options={{ title: t("nav.city") }} />
<DesktopHomeStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} />
<DesktopHomeStack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ title: t("nav.language") }} />
<DesktopHomeStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: t("nav.notifications") }} />
</DesktopHomeStack.Navigator>
);
}

function DesktopExploreNavigator({ route }: { route: RouteProp<MainTabParamList, "Explore"> }) {
const { t } = useTranslation();
const initialQuery = route.params?.initialQuery;
const initialTab = route.params?.initialTab;
const navigatorKey = `${initialQuery ?? ""}:${initialTab ?? ""}`;

return (
<DesktopExploreStack.Navigator key={navigatorKey} screenOptions={desktopBrowseScreenOptions(t)}>
<DesktopExploreStack.Screen
name="ExploreRoot"
component={ExploreScreen}
initialParams={route.params}
options={{ headerShown: false }}
/>
<DesktopExploreStack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: t("nav.outlet") }} />
<DesktopExploreStack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: t("nav.brand") }} />
<DesktopExploreStack.Screen name="Transportation" component={TransportationScreen} options={{ title: t("nav.transportation") }} />
<DesktopExploreStack.Screen name="Country" component={CountryScreen} options={{ title: t("nav.country") }} />
<DesktopExploreStack.Screen name="CityResults" component={CityResultsScreen} options={{ title: t("nav.city") }} />
<DesktopExploreStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} />
</DesktopExploreStack.Navigator>
);
}

function DesktopTripsNavigator() { const { t } = useTranslation(); return <DesktopTripsStack.Navigator screenOptions={desktopBrowseScreenOptions(t)}><DesktopTripsStack.Screen name="MyTripsRoot" component={MyTripsScreen} options={{ headerShown: false }} /><DesktopTripsStack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t("nav.tripDetail") }} /><DesktopTripsStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} /><DesktopTripsStack.Screen name="TripSegmentEditor" component={TripSegmentEditorScreen} options={{ title: t("tripDetail.addRouteCta") }} /></DesktopTripsStack.Navigator>; }

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

if (routeName === "MyTrips") {
return <MaterialCommunityIcons name={focused ? "briefcase-clock" : "briefcase-clock-outline"} size={size + 1} color={color} />;
}

return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
}

function MainTabs() {
const { t, language } = useTranslation();
const { width } = useWindowDimensions();
const isDesktopWeb = Platform.OS === "web" && width >= 1024;

const tabLabels: Record<string, string> = {
Home: t("nav.home"),
Explore: t("nav.explore"),
MyTrips: t("nav.trips"),
Savings: t("nav.savings"),
Profile: t("nav.profile"),
};

return (
<Tab.Navigator
key={`${language}-${isDesktopWeb ? "desktop" : "mobile"}`}
screenOptions={({ route }) => ({
headerShown: false,
tabBarActiveTintColor: "#C9A227",
tabBarInactiveTintColor: "rgba(255,255,255,0.72)",
tabBarIcon: ({ color, focused }) => (
<TabIcon routeName={route.name} color={color} focused={focused} />
),
tabBarLabel: tabLabels[route.name] ?? route.name,
tabBarLabelStyle: {
fontSize: isDesktopWeb ? 13 : 11,
fontWeight: "900",
marginTop: isDesktopWeb ? 0 : 2,
},
tabBarActiveBackgroundColor: isDesktopWeb ? "rgba(201,162,39,0.14)" : undefined,
tabBarInactiveBackgroundColor: isDesktopWeb ? "transparent" : undefined,
tabBarItemStyle: isDesktopWeb
? {
height: 52,
marginHorizontal: 12,
marginVertical: 4,
borderRadius: 13,
}
: undefined,
tabBarLabelPosition: isDesktopWeb ? "beside-icon" : "below-icon",
tabBarPosition: isDesktopWeb ? "left" : "bottom",
tabBarStyle: {
...(isDesktopWeb
? {
width: 216,
backgroundColor: "#0B1F3A",
borderTopWidth: 0,
borderRightWidth: 0,
paddingTop: 24,
paddingBottom: 24,
}
: {
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
}),
},
})}
>
<Tab.Screen name="Home" component={isDesktopWeb ? DesktopHomeNavigator : HomeScreen} />
<Tab.Screen name="Explore" component={isDesktopWeb ? DesktopExploreNavigator : ExploreScreen} />
<Tab.Screen name="MyTrips" component={isDesktopWeb ? DesktopTripsNavigator : MyTripsScreen} />
<Tab.Screen name="Savings" component={SavingsScreen} />
<Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
);
}

export function AppNavigator() {
const { t } = useTranslation();
const { isLanguageResolved, language } = useLanguage();
const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
const [isOnboardingGateReady, setIsOnboardingGateReady] = useState(false);

useEffect(() => {
if (!isLanguageResolved) return;
let isMounted = true;

async function resolveOnboardingGate() {
if (Platform.OS === "web") {
if (isMounted) {
setShouldShowOnboarding(false);
setIsOnboardingGateReady(true);
}
return;
}

try {
const seen = await hasSeenOnboarding();
if (isMounted) setShouldShowOnboarding(!seen);
} catch {
if (isMounted) setShouldShowOnboarding(false);
} finally {
if (isMounted) setIsOnboardingGateReady(true);
}
}

resolveOnboardingGate();
return () => {
isMounted = false;
};
}, [isLanguageResolved]);

const webLinking = Platform.OS === "web" ? createWebLinking(language) : undefined;

function syncWebPath() {
if (Platform.OS !== "web" || !navigationRef.isReady()) return;
const path = createWebLinking(language).getPathFromState?.(navigationRef.getRootState()) ?? `/${language}`;
if (`${window.location.pathname}${window.location.search}` !== path) window.history.replaceState(window.history.state, "", path);
}

useEffect(() => { syncWebPath(); }, [language]);

if (!isLanguageResolved || !isOnboardingGateReady) {
return (
<View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary }}>
<ActivityIndicator color={colors.gold} />
</View>
);
}

if (shouldShowOnboarding) {
return <OnboardingScreen onComplete={() => setShouldShowOnboarding(false)} />;
}

return (
<NavigationContainer ref={navigationRef} linking={webLinking} onReady={syncWebPath} onStateChange={syncWebPath}>
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
<Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t("nav.favorites") }} />
<Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} />
<Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t("nav.tripDetail") }} />
<Stack.Screen name="TripSegmentEditor" component={TripSegmentEditorScreen} options={{ title: t("tripDetail.addRouteCta") }} />

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
<Stack.Screen name="ReviewModeration" component={ReviewModerationScreen} options={{ title: t("moderation.title") }} />
<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t("nav.privacyPolicy") }} />
<Stack.Screen name="TermsConditions" component={TermsConditionsScreen} options={{ title: t("nav.termsConditions") }} />
<Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: t("nav.contactUs") }} />
<Stack.Screen name="HelpFaq" component={HelpFaqScreen} options={{ title: t("nav.helpFaq") }} />
<Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: t("nav.deleteAccount") }} />
<Stack.Screen name="MediaCredits" component={MediaCreditsScreen} options={{ title: t("nav.mediaCredits") }} />
</Stack.Navigator>
</NavigationContainer>
);
}
