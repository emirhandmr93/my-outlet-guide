import { createNavigationContainerRef, NavigationContainer, type RouteProp } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Platform, Pressable, useWindowDimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
BrandResultsScreen,
BrandWishlistScreen,
CampaignDetailScreen,
CityResultsScreen,
ContactUsScreen,
CountryScreen,
CreateTripScreen,
CurrencySettingsScreen,
DeleteAccountScreen,
EditorialMethodologyScreen,
ExploreScreen,
FavoritesScreen,
FlightDealDetailScreen,
FlightDealSettingsScreen,
FlightDealsScreen,
FlightSearchScreen,
HelpFaqScreen,
HomeScreen,
LanguageSettingsScreen,
LoginScreen,
MediaCreditsScreen,
MyReviewsScreen,
MyTripsScreen,
NearbyOutletsScreen,
NotificationSettingsScreen,
OfflinePacksScreen,
OnboardingScreen,
OutletDetailScreen,
OutletShoppingIndexScreen,
PriceAdvantageCalculatorScreen,
PrivacyPolicyScreen,
ProfileScreen,
ReviewModerationScreen,
SavingsScreen,
SmartShoppingCalculatorScreen,
TaxFreeCalculatorScreen,
TaxFreeGuideScreen,
TermsConditionsScreen,
TransportationScreen,
TravelBasketScreen,
TravelHubScreen,
TripDetailScreen,
TripSegmentEditorScreen,
VisitModeScreen,
WriteReviewScreen,
} from "./screenRegistry";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { NativeDirectionRoot, useLayoutDirection } from "../hooks/useLayoutDirection";
import { hasSeenOnboarding } from "../services/onboardingStorage";
import {
getNotificationResponseIdentity,
isSameFlightDealRoute,
parseFlightPriceNotificationResponse,
} from "../services/flightPriceNotificationResponse";
import colors from "../theme/colors";

import type { MainTabParamList, RootStackParamList } from "./types";
import { useNavigationFonts } from "./useNavigationFonts";
import { createWebLinking } from "./webLinking";
import { syncWebSeo } from "../utils/webSeo";
import { trackWebPageView } from "../utils/webAnalytics";
import { trackNativeScreen } from "../utils/productAnalytics";
import { notificationResponseApi } from "../services/notificationResponseApi";
import {
floatingTabBarHeight,
floatingTabBarMinimumTouchTarget,
getFloatingTabBarBottomOffset,
} from "../utils/safeAreaLayout";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();
const MAX_HANDLED_NOTIFICATION_RESPONSES = 100;

type DesktopHomeStackParamList = {
HomeRoot: undefined;
CampaignDetail: RootStackParamList["CampaignDetail"];
OutletDetail: RootStackParamList["OutletDetail"] & { reviewsRefresh?: number };
BrandResults: RootStackParamList["BrandResults"] & { selectedCountryId?: string };
Country: RootStackParamList["Country"];
CityResults: RootStackParamList["CityResults"];
Transportation: RootStackParamList["Transportation"];
VisitMode: RootStackParamList["VisitMode"];
CreateTrip: undefined;
NotificationSettings: undefined;
LanguageSettings: undefined;
};

type DesktopExploreStackParamList = {
ExploreRoot: MainTabParamList["Explore"];
OutletDetail: RootStackParamList["OutletDetail"] & { reviewsRefresh?: number };
BrandResults: RootStackParamList["BrandResults"] & { selectedCountryId?: string };
Country: RootStackParamList["Country"];
CityResults: RootStackParamList["CityResults"];
Transportation: RootStackParamList["Transportation"];
VisitMode: RootStackParamList["VisitMode"];
CreateTrip: undefined;
};

const DesktopHomeStack = createNativeStackNavigator<DesktopHomeStackParamList>();
const DesktopExploreStack = createNativeStackNavigator<DesktopExploreStackParamList>();

function HeaderBackIcon({ color, label, onPress, isRTL }: { color?: string; label: string; onPress: () => void; isRTL: boolean }) {
return (
<Pressable
accessibilityRole="button"
accessibilityLabel={label}
onPress={onPress}
hitSlop={12}
style={{ paddingHorizontal: 8, paddingVertical: 6 }}
>
<Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={26} color={color ?? "#0B1F3A"} />
</Pressable>
);
}

function navigationScreenOptions(t: ReturnType<typeof useTranslation>["t"], isNativeRTL: boolean) {
return ({ navigation }: { navigation: { canGoBack: () => boolean; goBack: () => void } }) => ({
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
headerLeft: ({ tintColor }: { tintColor?: string }) =>
navigation.canGoBack() ? <HeaderBackIcon color={tintColor} label={t("nav.back")} onPress={() => navigation.goBack()} isRTL={isNativeRTL} /> : null,
});
}

function DesktopHomeNavigator() {
const { t } = useTranslation();
const { isNativeRTL } = useLayoutDirection();

return (
<DesktopHomeStack.Navigator screenOptions={navigationScreenOptions(t, isNativeRTL)}>
<DesktopHomeStack.Screen name="HomeRoot" component={HomeScreen} options={{ headerShown: false }} />
<DesktopHomeStack.Screen name="CampaignDetail" component={CampaignDetailScreen} options={{ title: t("nav.campaign") }} />
<DesktopHomeStack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: t("nav.outlet") }} />
<DesktopHomeStack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: t("nav.brand") }} />
<DesktopHomeStack.Screen name="Transportation" component={TransportationScreen} options={{ title: t("nav.transportation") }} />
<DesktopHomeStack.Screen name="VisitMode" component={VisitModeScreen} options={{ title: t("visitMode.title") }} />
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
const { isNativeRTL } = useLayoutDirection();
const initialQuery = route.params?.initialQuery;
const initialTab = route.params?.initialTab;
const navigatorKey = `${initialQuery ?? ""}:${initialTab ?? ""}`;

return (
<DesktopExploreStack.Navigator key={navigatorKey} screenOptions={navigationScreenOptions(t, isNativeRTL)}>
<DesktopExploreStack.Screen
name="ExploreRoot"
component={ExploreScreen}
initialParams={route.params}
options={{ headerShown: false }}
/>
<DesktopExploreStack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: t("nav.outlet") }} />
<DesktopExploreStack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: t("nav.brand") }} />
<DesktopExploreStack.Screen name="Transportation" component={TransportationScreen} options={{ title: t("nav.transportation") }} />
<DesktopExploreStack.Screen name="VisitMode" component={VisitModeScreen} options={{ title: t("visitMode.title") }} />
<DesktopExploreStack.Screen name="Country" component={CountryScreen} options={{ title: t("nav.country") }} />
<DesktopExploreStack.Screen name="CityResults" component={CityResultsScreen} options={{ title: t("nav.city") }} />
<DesktopExploreStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} />
</DesktopExploreStack.Navigator>
);
}

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
return <Ionicons name={focused ? "airplane" : "airplane-outline"} size={size + 1} color={color} />;
}

return <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />;
}

function MainTabs() {
const { t } = useTranslation();
const { width } = useWindowDimensions();
const insets = useSafeAreaInsets();
const isDesktopWeb = Platform.OS === "web" && width >= 1024;
const mobileTabBarBottomOffset = getFloatingTabBarBottomOffset(
Platform.OS,
insets.bottom,
);

const tabLabels: Record<string, string> = {
Home: t("nav.home"),
Explore: t("nav.explore"),
MyTrips: t("nav.trips"),
Savings: t("nav.savings"),
Profile: t("nav.profile"),
};

return (
<Tab.Navigator
key={isDesktopWeb ? "desktop" : "mobile"}
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
tabBarHideOnKeyboard: !isDesktopWeb,
tabBarItemStyle: isDesktopWeb
? {
height: 52,
marginHorizontal: 12,
marginVertical: 4,
borderRadius: 13,
}
: {
minHeight: floatingTabBarMinimumTouchTarget,
},
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
bottom: mobileTabBarBottomOffset,
height: floatingTabBarHeight,
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
<Tab.Screen name="MyTrips" component={TravelHubScreen} />
<Tab.Screen name="Savings" component={SavingsScreen} />
<Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
);
}

export function AppNavigator() {
const { t } = useTranslation();
const { isLanguageResolved, language } = useLanguage();
const { direction, isNativeRTL } = useLayoutDirection();
const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
const [isOnboardingGateReady, setIsOnboardingGateReady] = useState(false);
const [isNavigationReady, setIsNavigationReady] = useState(false);
const [navigationFontsLoaded, navigationFontError] = useNavigationFonts();
const handledResponseKeys = useRef(new Map<string, true>());
const responseProcessingQueue = useRef(Promise.resolve());

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
if (!navigationRef.isReady()) return;
if (Platform.OS !== "web") {
trackNativeScreen(navigationRef.getCurrentRoute()?.name);
return;
}
const path = createWebLinking(language).getPathFromState?.(navigationRef.getRootState()) ?? `/${language}`;
if (`${window.location.pathname}${window.location.search}` !== path) window.history.replaceState(window.history.state, "", path);
syncWebSeo(language, path);
trackWebPageView(path, document.title);
}

function handleNavigationReady() {
setIsNavigationReady(true);
syncWebPath();
}

useEffect(() => {
if (Platform.OS === "web" || !isOnboardingGateReady || shouldShowOnboarding ||
  !isNavigationReady || !navigationRef.isReady()) return;

let active = true;

async function safelyClearMatchingLastResponse(responseIdentity: string) {
if (!active) return;
try {
const lastResponse = await notificationResponseApi.getLastNotificationResponseAsync();
if (!active || getNotificationResponseIdentity(lastResponse) !== responseIdentity) return;
await notificationResponseApi.clearLastNotificationResponseAsync();
} catch {
// Notification state is best-effort and must not affect navigation or startup.
}
}

function enqueueResponse(response: unknown) {
const result = parseFlightPriceNotificationResponse(response, notificationResponseApi.DEFAULT_ACTION_IDENTIFIER);
if (result.status === "ignored") return;

let shouldNavigate = false;
if (result.status === "target" && !handledResponseKeys.current.has(result.target.responseKey)) {
handledResponseKeys.current.set(result.target.responseKey, true);
shouldNavigate = true;
while (handledResponseKeys.current.size > MAX_HANDLED_NOTIFICATION_RESPONSES) {
const oldestKey = handledResponseKeys.current.keys().next().value;
if (oldestKey === undefined) break;
handledResponseKeys.current.delete(oldestKey);
}
}

const responseIdentity = result.status === "target" ? result.target.responseIdentity : result.responseIdentity;
responseProcessingQueue.current = responseProcessingQueue.current.then(async () => {
if (!active) return;
if (result.status === "target" && shouldNavigate) {
if (!navigationRef.isReady()) return;
if (!isSameFlightDealRoute(navigationRef.getCurrentRoute(), result.target.eventId)) {
navigationRef.navigate("FlightDealDetail", { dealId: result.target.eventId });
}
}
if (responseIdentity) await safelyClearMatchingLastResponse(responseIdentity);
}).catch(() => {
// A response-processing failure must not break processing of later responses.
});
}

const subscription = notificationResponseApi.addNotificationResponseReceivedListener(enqueueResponse);
void notificationResponseApi.getLastNotificationResponseAsync()
  .then(response => {
    if (active && response) enqueueResponse(response);
  })
  .catch(() => {
    // Notification state is unavailable; app startup should continue normally.
  });

return () => {
active = false;
subscription.remove();
};
}, [isNavigationReady, isOnboardingGateReady, shouldShowOnboarding]);

useEffect(() => { syncWebPath(); }, [language]);

if (!isLanguageResolved || !isOnboardingGateReady || (!navigationFontsLoaded && !navigationFontError)) {
return (
<View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary }}>
<ActivityIndicator color={colors.gold} />
</View>
);
}

if (shouldShowOnboarding) {
return (
<NativeDirectionRoot>
<OnboardingScreen onComplete={() => setShouldShowOnboarding(false)} />
</NativeDirectionRoot>
);
}

return (
<NativeDirectionRoot>
<NavigationContainer direction={direction} ref={navigationRef} linking={webLinking} onReady={handleNavigationReady} onStateChange={syncWebPath}>
<Stack.Navigator
screenOptions={navigationScreenOptions(t, isNativeRTL)}
>
<Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

<Stack.Screen name="OutletDetail" component={OutletDetailScreen} options={{ title: t("nav.outlet") }} />
<Stack.Screen name="BrandResults" component={BrandResultsScreen} options={{ title: t("nav.brand") }} />
<Stack.Screen name="Transportation" component={TransportationScreen} options={{ title: t("nav.transportation") }} />
<Stack.Screen name="VisitMode" component={VisitModeScreen} options={{ title: t("visitMode.title") }} />
<Stack.Screen name="Country" component={CountryScreen} options={{ title: t("nav.country") }} />
<Stack.Screen name="CityResults" component={CityResultsScreen} options={{ title: t("nav.city") }} />

<Stack.Screen name="MyTrips" component={MyTripsScreen} options={{ title: t("nav.myTrips") }} />
<Stack.Screen name="MyTripsList" component={MyTripsScreen} options={{ title: t("nav.myTrips") }} />
<Stack.Screen name="NearbyOutlets" component={NearbyOutletsScreen} options={{ title: t("nav.nearbyOutlets") }} />
<Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t("nav.favorites") }} />
<Stack.Screen name="BrandWishlist" component={BrandWishlistScreen} options={{ title: t("nav.brandWishlist") }} />
<Stack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: t("nav.createTrip") }} />
<Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t("nav.tripDetail") }} />
<Stack.Screen name="TripSegmentEditor" component={TripSegmentEditorScreen} options={{ title: t("tripDetail.addRouteCta") }} />

<Stack.Screen name="Savings" component={SavingsScreen} options={{ title: t("nav.savings") }} />
<Stack.Screen name="SmartShoppingCalculator" component={SmartShoppingCalculatorScreen} options={{ title: t("nav.smartShopping") }} />
<Stack.Screen name="PriceAdvantageCalculator" component={PriceAdvantageCalculatorScreen} options={{ title: t("nav.priceAdvantage") }} />
<Stack.Screen name="TaxFreeCalculator" component={TaxFreeCalculatorScreen} options={{ title: t("nav.taxFreeCalculator") }} />
<Stack.Screen name="TaxFreeGuide" component={TaxFreeGuideScreen} options={{ title: t("nav.taxFreeGuide") }} />
<Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ title: t("nav.language") }} />
<Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} options={{ title: t("nav.currency") }} />
<Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: t("nav.notifications") }} />
<Stack.Screen name="OfflinePacks" component={OfflinePacksScreen} options={{ title: t("nav.offlinePacks") }} />

<Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: t("nav.writeReview") }} />
<Stack.Screen name="FlightDealSettings" component={FlightDealSettingsScreen} options={{ title: t("nav.flightDeals") }} />
<Stack.Screen name="FlightDeals" component={FlightDealsScreen} options={{ title: t("nav.flightDeals") }} />
<Stack.Screen name="FlightSearch" component={FlightSearchScreen} options={{ title: t("nav.flightSearch") }} />
<Stack.Screen name="FlightDealDetail" component={FlightDealDetailScreen} options={{ title: t("nav.flightDeal") }} />
<Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} options={{ title: t("nav.campaign") }} />
<Stack.Screen name="TravelBasket" component={TravelBasketScreen} options={{ title: t("nav.travelBasket") }} />

<Stack.Screen name="Login" component={LoginScreen} options={{ title: t("nav.signIn") }} />
<Stack.Screen name="MyReviews" component={MyReviewsScreen} options={{ title: t("nav.myReviews") }} />
<Stack.Screen name="ReviewModeration" component={ReviewModerationScreen} options={{ title: t("moderation.title") }} />
<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t("nav.privacyPolicy") }} />
<Stack.Screen name="TermsConditions" component={TermsConditionsScreen} options={{ title: t("nav.termsConditions") }} />
<Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: t("nav.contactUs") }} />
<Stack.Screen name="HelpFaq" component={HelpFaqScreen} options={{ title: t("nav.helpFaq") }} />
<Stack.Screen name="OutletShoppingIndex" component={OutletShoppingIndexScreen} options={{ title: "My Outlet Guide" }} />
<Stack.Screen name="EditorialMethodology" component={EditorialMethodologyScreen} options={{ title: "My Outlet Guide" }} />
<Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: t("nav.deleteAccount") }} />
<Stack.Screen name="MediaCredits" component={MediaCreditsScreen} options={{ title: t("nav.mediaCredits") }} />
</Stack.Navigator>
</NavigationContainer>
</NativeDirectionRoot>
);
}
