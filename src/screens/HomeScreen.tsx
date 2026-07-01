import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
Alert,
Dimensions,
ImageBackground,
ImageSourcePropType,
Modal,
NativeScrollEvent,
NativeSyntheticEvent,
ScrollView,
Share,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";
import { DashboardSectionHeader } from "../components/DashboardSectionHeader";
import { HomeHeader } from "../components/HomeHeader";
import { SearchBar } from "../components/SearchBar";
import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const screenWidth = Dimensions.get("window").width;
const carouselWidth = screenWidth - spacing.xl * 2;
const outletCardWidth = Math.round(screenWidth * 0.64);
const cityCardWidth = Math.round(screenWidth * 0.42);

type HomeRouteItem = {
id: string;
title: string;
country: string;
text: string;
image: ImageSourcePropType;
route: string;
params: Record<string, string>;
};

type FeaturedSlide = {
id: string;
kicker: string;
title: string;
subtitle: string;
cta: string;
image: ImageSourcePropType;
route: string;
params?: Record<string, string>;
};

const featuredSlides: FeaturedSlide[] = [
{
id: "featured-outlet",
kicker: "FEATURED DEAL",
title: "Luxury Shopping in Europe",
subtitle: "Discover today's featured outlet destination.",
cta: "Explore Now",
image: require("../../assets/outlet-images/bicester/hero.webp"),
route: "OutletDetail",
params: { outletId: "bicester-village" },
},

{
id: "flight-alert",
kicker: "FLIGHT DEAL",
title: "Never Miss the Best Fares",
subtitle: "Create route alerts for your next shopping trip.",
cta: "Create Alert",
image: require("../../assets/city-images/Paris.webp"),
route: "FlightDeals",
},

{
id: "shopping-event",
kicker: "SHOPPING EVENT",
title: "Summer Shopping Festival",
subtitle: "Exclusive events and seasonal experiences.",
cta: "View Event",
image: require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
route: "OutletDetail",
params: { outletId: "the-mall-firenze" },
},


{
id: "shopping-guide",
kicker: "SHOPPING GUIDE",
title: "Everything You Need Before Shopping",
subtitle: "Tax Free • Tips • Savings",
cta: "Open Guide",
image: require("../../assets/outlet-images/la-vallee/gallery1.webp"),
route: "TaxFreeCalculator",
},

{
id: "flash-sale",
kicker: "FLASH SALE",
title: "Limited-Time Outlet Offers",
subtitle: "Don't miss today's best deals.",
cta: "See Deals",
image: require("../../assets/outlet-images/serravalle/hero.webp"),
route: "OutletDetail",
params: { outletId: "serravalle-designer-outlet" },
},

];

const shoppingTools = [
{
id: "savings",
icon: "%",
title: "Savings",
text: "Tax Free and smart shopping tools.",
route: "Savings",
tone: "#EAF7EF",
},
{
id: "flights",
icon: "✈️",
title: "Flight Deals",
text: "Get notified when fares drop 15%, 30% or 45%.",
route: "FlightDeals",
tone: "#F1ECFF",
},
{
id: "taxfree",
icon: "€",
title: "Tax Free",
text: "Estimate your refund and check minimum spend.",
route: "TaxFreeCalculator",
tone: "#FFF7E0",
},
{
id: "offline",
icon: "↓",
title: "Offline",
text: "Save guides for your trip.",
route: "OfflinePacks",
tone: "#EAF3FF",
},
];

const popularCities: HomeRouteItem[] = [
{
id: "paris",
title: "Paris",
country: "France",
text: "Luxury outlet routes",
image: require("../../assets/city-images/Paris.webp"),
route: "CityResults",
params: { cityId: "paris" },
},
{
id: "milan",
title: "Milan",
country: "Italy",
text: "Designer outlet access",
image: require("../../assets/city-images/Milano.webp"),
route: "CityResults",
params: { cityId: "milan" },
},
{
id: "london",
title: "London",
country: "United Kingdom",
text: "Premium shopping trips",
image: require("../../assets/city-images/London.webp"),
route: "CityResults",
params: { cityId: "london" },
},
{
id: "munich",
title: "Munich",
country: "Germany",
text: "Bavarian shopping routes",
image: require("../../assets/city-images/Munich.webp"),
route: "Country",
params: { countryId: "germany" },
},
{
id: "vienna",
title: "Vienna",
country: "Austria",
text: "Elegant outlet escapes",
image: require("../../assets/city-images/Vienna.webp"),
route: "Country",
params: { countryId: "austria" },
},
];

const recommendedOutlets = [
{
id: "la-vallee-village",
title: "La Vallée Village",
location: "Paris, France",
text: "Luxury shopping near Disneyland Paris.",
image: require("../../assets/outlet-images/la-vallee/hero.webp"),
},
{
id: "bicester-village",
title: "Bicester Village",
location: "London, UK",
text: "One of Europe’s most iconic luxury outlets.",
image: require("../../assets/outlet-images/bicester/hero.webp"),
},
{
id: "serravalle-designer-outlet",
title: "Serravalle",
location: "Milan, Italy",
text: "Large designer outlet village in Italy.",
image: require("../../assets/outlet-images/serravalle/hero.webp"),
},
{
id: "the-mall-firenze",
title: "The Mall Firenze",
location: "Florence, Italy",
text: "Premium fashion destination in Tuscany.",
image: require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
},
{
id: "parndorf-designer-outlet",
title: "Parndorf",
location: "Vienna, Austria",
text: "Popular outlet route near Vienna.",
image: require("../../assets/outlet-images/parndorf/hero.webp"),
},
];

const quickMenuItems = [
{ id: "browse", title: "Browse Outlets", icon: "🏬", route: "Explore" },
{ id: "flights", title: "Flight Deals", icon: "✈️", route: "FlightDeals" },
{ id: "taxfree", title: "Tax Free Center", icon: "💰", route: "TaxFreeCalculator" },
{ id: "offline", title: "Offline Packs", icon: "📥", route: "OfflinePacks" },
];

export function HomeScreen() {
const navigation = useNavigation<any>();
const { t } = useTranslation();
const { trips } = useTrips();
const { favoriteIds } = useFavorites();
const [searchQuery, setSearchQuery] = useState("");
const [activeSlideIndex, setActiveSlideIndex] = useState(0);
const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
const carouselRef = useRef<ScrollView | null>(null);

const latestTrip = trips[0];
const favoriteOutlets = outlets.filter((outlet) => favoriteIds.includes(outlet.outletId));
const firstFavorite = favoriteOutlets[0];
const slides = useMemo(() => featuredSlides, []);

useEffect(() => {
const interval = setInterval(() => {
const nextIndex = (activeSlideIndex + 1) % slides.length;
carouselRef.current?.scrollTo({ x: nextIndex * carouselWidth, animated: true });
setActiveSlideIndex(nextIndex);
}, 5500);

return () => clearInterval(interval);
}, [activeSlideIndex, slides.length]);

function handleCarouselScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
const nextIndex = Math.round(event.nativeEvent.contentOffset.x / carouselWidth);

if (nextIndex !== activeSlideIndex) {
setActiveSlideIndex(nextIndex);
}
}

function navigateTo(route: string, params?: Record<string, string>) {
setIsQuickMenuOpen(false);

if (params) {
navigation.navigate(route, params);
return;
}

navigation.navigate(route);
}

function handleQuickSearch() {
const normalizedQuery = searchQuery.trim();

if (!normalizedQuery) {
navigation.navigate("Explore");
return;
}

navigation.navigate("Explore", { initialQuery: normalizedQuery });
}

function openSlide(slide: FeaturedSlide) {
navigateTo(slide.route, slide.params);
}

async function shareApp() {
await Share.share({
message: "Discover premium outlets and plan smarter shopping trips with My Outlet Guide.",
});
}

function rateApp() {
Alert.alert("Rate My Outlet Guide", "App Store rating will be connected before launch.");
}

return (
<>
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<HomeHeader
userName="Emirhan"
onPressMenu={() => setIsQuickMenuOpen(true)}
onPressNotifications={() => navigation.navigate("NotificationSettings")}
onPressLanguage={() => navigation.navigate("LanguageSettings")}
/>

<SearchBar
value={searchQuery}
placeholder={t("home.search") === "home.search" ? "Search and explore cities, outlets, brands..." : t("home.search")}
onChangeText={setSearchQuery}
onSubmitEditing={handleQuickSearch}
/>

<DashboardSectionHeader
title="Featured"
subtitle="Handpicked deals, trips and shopping updates."
/>

<View style={styles.carouselWrap}>
<ScrollView
ref={carouselRef}
horizontal
pagingEnabled
showsHorizontalScrollIndicator={false}
decelerationRate="fast"
snapToInterval={carouselWidth}
snapToAlignment="start"
onMomentumScrollEnd={handleCarouselScroll}
>
{slides.map((slide) => (
<TouchableOpacity
key={slide.id}
activeOpacity={0.9}
style={styles.slideOuter}
onPress={() => openSlide(slide)}
>
<ImageBackground
source={slide.image}
style={styles.slideImage}
imageStyle={styles.slideImageRadius}
>
<View style={styles.slideOverlay} />
<View style={styles.slideContent}>
<Text style={styles.slideKicker}>{slide.kicker}</Text>
<Text style={styles.slideTitle}>{slide.title}</Text>
<Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
<View style={styles.slideAction}>
<Text style={styles.slideActionText}>{slide.cta}</Text>
<Text style={styles.slideActionArrow}>→</Text>
</View>
</View>
</ImageBackground>
</TouchableOpacity>
))}
</ScrollView>

<View style={styles.dotsRow}>
{slides.map((slide, index) => (
<View
key={`${slide.id}-dot`}
style={[styles.dot, index === activeSlideIndex && styles.dotActive]}
/>
))}
</View>
</View>

<DashboardSectionHeader title="Shopping tools" subtitle="Plan your savings before you shop." />

<View style={styles.toolsGrid}>
{shoppingTools.map((tool) => (
<TouchableOpacity
key={tool.id}
style={[styles.toolCard, { backgroundColor: tool.tone }]}
activeOpacity={0.88}
onPress={() => navigateTo(tool.route)}
>
<Text style={styles.toolIcon}>{tool.icon}</Text>
<Text style={styles.toolTitle}>{tool.title}</Text>
<Text style={styles.toolText}>{tool.text}</Text>
</TouchableOpacity>
))}
</View>

<DashboardSectionHeader title="Your activity" subtitle="Fast access to your saved shopping plans." />

<View style={styles.activityCard}>
<View style={styles.activityColumn}>
<Text style={styles.activityIcon}>🧳</Text>
<Text style={styles.activityLabel}>Shopping trip</Text>
<Text style={styles.activityValue}>{latestTrip ? latestTrip.tripName : "No trip yet"}</Text>
<Text style={styles.activityText}>
{latestTrip ? `${latestTrip.startDate} - ${latestTrip.endDate}` : "Create a trip to unlock reminders."}
</Text>
</View>

<View style={styles.activityDivider} />

<View style={styles.activityColumn}>
<Text style={styles.activityIcon}>♡</Text>
<Text style={styles.activityLabel}>Favorites</Text>
<Text style={styles.activityValue}>
{favoriteIds.length > 0 ? favoriteIds.length : "No favorite outlets yet"}
</Text>
<Text style={styles.activityText}>
{firstFavorite ? firstFavorite.name : "Save outlets you want to follow."}
</Text>
</View>
</View>

<DashboardSectionHeader title="Popular cities" subtitle="Start with the most loved shopping destinations." />

<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
{popularCities.map((city) => (
<TouchableOpacity
key={city.id}
style={styles.cityCard}
activeOpacity={0.9}
onPress={() => navigateTo(city.route, city.params)}
>
<ImageBackground source={city.image} style={styles.cityImage} imageStyle={styles.cityImageRadius}>
<View style={styles.cityOverlay} />
<View style={styles.cityContent}>
<Text style={styles.cityKicker}>{city.country}</Text>
<Text style={styles.cityTitle}>{city.title}</Text>
<Text style={styles.cityText}>{city.text}</Text>
</View>
</ImageBackground>
</TouchableOpacity>
))}
</ScrollView>

<DashboardSectionHeader title="Recommended outlets" subtitle="Premium destinations to start exploring." />

<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
{recommendedOutlets.map((outlet) => (
<TouchableOpacity
key={outlet.id}
style={styles.outletCard}
activeOpacity={0.9}
onPress={() => navigateTo("OutletDetail", { outletId: outlet.id })}
>
<ImageBackground source={outlet.image} style={styles.outletImage} imageStyle={styles.outletImageRadius}>
<View style={styles.outletOverlay} />
<View style={styles.outletBadge}>
<Text style={styles.outletBadgeText}>Recommended</Text>
</View>
</ImageBackground>

<View style={styles.outletBody}>
<Text style={styles.outletLocation}>{outlet.location}</Text>
<Text style={styles.outletTitle}>{outlet.title}</Text>
<Text style={styles.outletText}>{outlet.text}</Text>
<Text style={styles.tapText}>View outlet →</Text>
</View>
</TouchableOpacity>
))}
</ScrollView>
</ScrollView>

<Modal visible={isQuickMenuOpen} transparent animationType="fade">
<TouchableOpacity
style={styles.menuBackdrop}
activeOpacity={1}
onPress={() => setIsQuickMenuOpen(false)}
>
<View style={styles.quickMenu}>
<Text style={styles.quickMenuTitle}>Quick Menu</Text>

{quickMenuItems.map((item) => (
<TouchableOpacity
key={item.id}
style={styles.quickMenuItem}
activeOpacity={0.84}
onPress={() => navigateTo(item.route)}
>
<Text style={styles.quickMenuIcon}>{item.icon}</Text>
<Text style={styles.quickMenuText}>{item.title}</Text>
<Text style={styles.quickMenuArrow}>→</Text>
</TouchableOpacity>
))}

<TouchableOpacity style={styles.quickMenuItem} activeOpacity={0.84} onPress={rateApp}>
<Text style={styles.quickMenuIcon}>⭐</Text>
<Text style={styles.quickMenuText}>Rate App</Text>
<Text style={styles.quickMenuArrow}>→</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.quickMenuItemLast} activeOpacity={0.84} onPress={shareApp}>
<Text style={styles.quickMenuIcon}>📤</Text>
<Text style={styles.quickMenuText}>Share App</Text>
<Text style={styles.quickMenuArrow}>→</Text>
</TouchableOpacity>
</View>
</TouchableOpacity>
</Modal>
</>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.background,
},

content: {
padding: spacing.xl,
paddingTop: 70,
paddingBottom: 120,
},

carouselWrap: {
marginBottom: spacing.lg,
},

slideOuter: {
width: carouselWidth,
paddingRight: spacing.sm,
},

slideImage: {
height: 238,
overflow: "hidden",
justifyContent: "flex-end",
...shadows.premium,
},

slideImageRadius: {
borderRadius: radius.hero,
},

slideOverlay: {
...StyleSheet.absoluteFillObject,
backgroundColor: "rgba(0, 0, 0, 0.44)",
borderRadius: radius.hero,
},

slideContent: {
padding: spacing.xl,
},

slideKicker: {
color: colors.gold,
fontSize: typography.caption,
fontWeight: typography.weightBlack,
letterSpacing: 1.2,
textTransform: "uppercase",
marginBottom: spacing.xs,
},

slideTitle: {
color: colors.textInverse,
fontSize: typography.h1,
lineHeight: typography.lineH1,
fontWeight: typography.weightBlack,
letterSpacing: -0.6,
marginBottom: spacing.xs,
},

slideSubtitle: {
color: "#EEF2F7",
fontSize: typography.body,
lineHeight: typography.lineBody,
fontWeight: typography.weightMedium,
marginBottom: spacing.md,
},

slideAction: {
alignSelf: "flex-start",
flexDirection: "row",
alignItems: "center",
backgroundColor: colors.surface,
borderRadius: radius.pill,
paddingHorizontal: spacing.lg,
paddingVertical: spacing.sm,
},

slideActionText: {
color: colors.primary,
fontSize: typography.caption,
fontWeight: typography.weightBlack,
marginRight: spacing.xs,
},

slideActionArrow: {
color: colors.primary,
fontSize: typography.body,
fontWeight: typography.weightBlack,
},

dotsRow: {
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: spacing.xs,
marginTop: spacing.sm,
},

dot: {
width: 7,
height: 7,
borderRadius: radius.pill,
backgroundColor: colors.borderStrong,
},

dotActive: {
width: 22,
backgroundColor: colors.gold,
},

toolsGrid: {
flexDirection: "row",
flexWrap: "wrap",
gap: spacing.md,
marginBottom: spacing.lg,
},

toolCard: {
width: (screenWidth - spacing.xl * 2 - spacing.md) / 2,
borderRadius: radius.xl,
padding: spacing.lg,
borderWidth: 1,
borderColor: colors.border,
...shadows.card,
},

toolIcon: {
width: 34,
height: 34,
borderRadius: radius.pill,
backgroundColor: colors.primary,
color: colors.textInverse,
textAlign: "center",
textAlignVertical: "center",
fontSize: typography.body,
fontWeight: typography.weightBlack,
marginBottom: spacing.md,
overflow: "hidden",
lineHeight: 34,
},

toolTitle: {
fontSize: typography.bodyLarge,
fontWeight: typography.weightBlack,
color: colors.textPrimary,
marginBottom: spacing.xs,
},

toolText: {
color: colors.textSecondary,
fontSize: typography.caption,
lineHeight: 19,
},

activityCard: {
flexDirection: "row",
backgroundColor: colors.surface,
borderRadius: radius.xxl,
padding: spacing.lg,
borderWidth: 1,
borderColor: colors.border,
marginBottom: spacing.lg,
...shadows.card,
},

activityColumn: {
flex: 1,
},

activityIcon: {
fontSize: 24,
marginBottom: spacing.sm,
},

activityDivider: {
width: StyleSheet.hairlineWidth,
backgroundColor: colors.border,
marginHorizontal: spacing.md,
},

activityLabel: {
color: colors.gold,
fontSize: typography.small,
fontWeight: typography.weightBlack,
textTransform: "uppercase",
marginBottom: spacing.xs,
},

activityValue: {
color: colors.textPrimary,
fontSize: typography.bodyLarge,
fontWeight: typography.weightBlack,
marginBottom: spacing.xs,
},

activityText: {
color: colors.textSecondary,
fontSize: typography.caption,
lineHeight: 18,
},

horizontalList: {
paddingRight: spacing.xl,
gap: spacing.md,
marginBottom: spacing.lg,
},

cityCard: {
width: cityCardWidth,
height: 148,
borderRadius: radius.xl,
overflow: "hidden",
backgroundColor: colors.surface,
...shadows.card,
},

cityImage: {
flex: 1,
justifyContent: "flex-end",
},

cityImageRadius: {
borderRadius: radius.xl,
},

cityOverlay: {
...StyleSheet.absoluteFillObject,
backgroundColor: "rgba(0, 0, 0, 0.34)",
borderRadius: radius.xl,
},

cityContent: {
padding: spacing.md,
},

cityKicker: {
color: colors.gold,
fontSize: typography.small,
fontWeight: typography.weightBlack,
textTransform: "uppercase",
marginBottom: spacing.xs,
},

cityTitle: {
color: colors.textInverse,
fontSize: typography.h3,
fontWeight: typography.weightBlack,
marginBottom: spacing.xs,
},

cityText: {
color: "#EEF2F7",
fontSize: typography.caption,
fontWeight: typography.weightBold,
lineHeight: 18,
},

outletCard: {
width: outletCardWidth,
backgroundColor: colors.surface,
borderRadius: radius.xxl,
overflow: "hidden",
borderWidth: 1,
borderColor: colors.border,
...shadows.card,
},

outletImage: {
height: 166,
},

outletImageRadius: {
borderTopLeftRadius: radius.xxl,
borderTopRightRadius: radius.xxl,
},

outletOverlay: {
...StyleSheet.absoluteFillObject,
backgroundColor: "rgba(0, 0, 0, 0.12)",
},

outletBadge: {
position: "absolute",
top: spacing.md,
left: spacing.md,
backgroundColor: colors.surface,
borderRadius: radius.pill,
paddingHorizontal: spacing.md,
paddingVertical: spacing.xs,
},

outletBadgeText: {
color: colors.primary,
fontSize: typography.small,
fontWeight: typography.weightBlack,
},

outletBody: {
padding: spacing.md,
},

outletLocation: {
fontSize: typography.small,
color: colors.gold,
fontWeight: typography.weightBlack,
textTransform: "uppercase",
marginBottom: spacing.xs,
},

outletTitle: {
color: colors.textPrimary,
fontSize: typography.h3,
fontWeight: typography.weightBlack,
letterSpacing: -0.3,
marginBottom: spacing.xs,
},

outletText: {
fontSize: typography.caption,
color: colors.textSecondary,
lineHeight: 18,
},

tapText: {
marginTop: spacing.sm,
color: colors.primary,
fontWeight: typography.weightBlack,
fontSize: typography.bodySmall,
},

menuBackdrop: {
flex: 1,
backgroundColor: "rgba(11,31,58,0.32)",
padding: spacing.xl,
justifyContent: "flex-start",
},

quickMenu: {
marginTop: 74,
backgroundColor: colors.surface,
borderRadius: radius.xxl,
padding: spacing.lg,
borderWidth: 1,
borderColor: colors.border,
...shadows.premium,
},

quickMenuTitle: {
color: colors.textPrimary,
fontSize: typography.h3,
fontWeight: typography.weightBlack,
marginBottom: spacing.md,
},

quickMenuItem: {
flexDirection: "row",
alignItems: "center",
paddingVertical: spacing.md,
borderBottomWidth: StyleSheet.hairlineWidth,
borderBottomColor: colors.border,
},

quickMenuItemLast: {
flexDirection: "row",
alignItems: "center",
paddingVertical: spacing.md,
},

quickMenuIcon: {
fontSize: 20,
width: 32,
},

quickMenuText: {
flex: 1,
color: colors.textPrimary,
fontSize: typography.body,
fontWeight: typography.weightBold,
},

quickMenuArrow: {
color: colors.gold,
fontSize: typography.bodyLarge,
fontWeight: typography.weightBlack,
},
});
