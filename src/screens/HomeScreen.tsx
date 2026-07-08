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
textKey: string;
image: ImageSourcePropType;
route: string;
params: Record<string, string>;
};

type FeaturedSlide = {
id: string;
kickerKey: string;
titleKey: string;
subtitleKey: string;
ctaKey: string;
image: ImageSourcePropType;
route: string;
params?: Record<string, string>;
};

const featuredSlides: FeaturedSlide[] = [
{
id: "featured-outlet",
kickerKey: "home.featured.outlet.kicker",
titleKey: "home.featured.outlet.title",
subtitleKey: "home.featured.outlet.subtitle",
ctaKey: "home.featured.outlet.cta",
image: require("../../assets/outlet-images/bicester/hero.webp"),
route: "OutletDetail",
params: { outletId: "bicester-village" },
},


{
id: "shopping-event",
kickerKey: "home.featured.event.kicker",
titleKey: "home.featured.event.title",
subtitleKey: "home.featured.event.subtitle",
ctaKey: "home.featured.event.cta",
image: require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
route: "OutletDetail",
params: { outletId: "the-mall-firenze" },
},


{
id: "shopping-guide",
kickerKey: "home.featured.guide.kicker",
titleKey: "home.featured.guide.title",
subtitleKey: "home.featured.guide.subtitle",
ctaKey: "home.featured.guide.cta",
image: require("../../assets/outlet-images/la-vallee/gallery1.webp"),
route: "TaxFreeCalculator",
},

{
id: "flash-sale",
kickerKey: "home.featured.flash.kicker",
titleKey: "home.featured.flash.title",
subtitleKey: "home.featured.flash.subtitle",
ctaKey: "home.featured.flash.cta",
image: require("../../assets/outlet-images/serravalle/hero.webp"),
route: "OutletDetail",
params: { outletId: "serravalle-designer-outlet" },
},

];

const shoppingTools = [
{
id: "savings",
icon: "%",
titleKey: "home.tools.savings.title",
textKey: "home.tools.savings.text",
route: "Savings",
tone: "#EAF7EF",
},
{
id: "taxfree",
icon: "€",
titleKey: "home.tools.taxfree.title",
textKey: "home.tools.taxfree.text",
route: "TaxFreeCalculator",
tone: "#FFF7E0",
},
{
id: "offline",
icon: "↓",
titleKey: "home.tools.offline.title",
textKey: "home.tools.offline.text",
route: "OfflinePacks",
tone: "#EAF3FF",
},
];

const popularCities: HomeRouteItem[] = [
{
id: "paris",
title: "Paris",
country: "France",
textKey: "home.cities.paris.text",
image: require("../../assets/city-images/Paris.webp"),
route: "CityResults",
params: { cityId: "paris" },
},
{
id: "milan",
title: "Milan",
country: "Italy",
textKey: "home.cities.milan.text",
image: require("../../assets/city-images/Milano.webp"),
route: "CityResults",
params: { cityId: "milan" },
},
{
id: "london",
title: "London",
country: "United Kingdom",
textKey: "home.cities.london.text",
image: require("../../assets/city-images/London.webp"),
route: "CityResults",
params: { cityId: "london" },
},
{
id: "munich",
title: "Munich",
country: "Germany",
textKey: "home.cities.munich.text",
image: require("../../assets/city-images/Munich.webp"),
route: "Country",
params: { countryId: "germany" },
},
{
id: "vienna",
title: "Vienna",
country: "Austria",
textKey: "home.cities.vienna.text",
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
textKey: "home.outlets.laVallee.text",
image: require("../../assets/outlet-images/la-vallee/hero.webp"),
},
{
id: "bicester-village",
title: "Bicester Village",
location: "London, UK",
textKey: "home.outlets.bicester.text",
image: require("../../assets/outlet-images/bicester/hero.webp"),
},
{
id: "serravalle-designer-outlet",
title: "Serravalle",
location: "Milan, Italy",
textKey: "home.outlets.serravalle.text",
image: require("../../assets/outlet-images/serravalle/hero.webp"),
},
{
id: "the-mall-firenze",
title: "The Mall Firenze",
location: "Florence, Italy",
textKey: "home.outlets.theMall.text",
image: require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
},
{
id: "parndorf-designer-outlet",
title: "Parndorf",
location: "Vienna, Austria",
textKey: "home.outlets.parndorf.text",
image: require("../../assets/outlet-images/parndorf/hero.webp"),
},
];

const quickMenuItems = [
{ id: "browse", titleKey: "home.quick.browse", icon: "🏬", route: "Explore" },
{ id: "taxfree", titleKey: "home.quick.taxfree", icon: "💰", route: "TaxFreeCalculator" },
{ id: "offline", titleKey: "home.quick.offline", icon: "📥", route: "OfflinePacks" },
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
message: t("home.shareMessage"),
});
}

function rateApp() {
Alert.alert(t("home.rateApp.title"), t("home.rateApp.message"));
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
placeholder={t("home.searchFallback")}
onChangeText={setSearchQuery}
onSubmitEditing={handleQuickSearch}
/>

<DashboardSectionHeader
title={t("home.sections.featured.title")}
subtitle={t("home.sections.featured.subtitle")}
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
<Text style={styles.slideKicker}>{t(slide.kickerKey)}</Text>
<Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
<Text style={styles.slideSubtitle}>{t(slide.subtitleKey)}</Text>
<View style={styles.slideAction}>
<Text style={styles.slideActionText}>{t(slide.ctaKey)}</Text>
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

<DashboardSectionHeader title={t("home.sections.tools.title")} subtitle={t("home.sections.tools.subtitle")} />

<View style={styles.toolsGrid}>
{shoppingTools.map((tool) => (
<TouchableOpacity
key={tool.id}
style={[styles.toolCard, { backgroundColor: tool.tone }]}
activeOpacity={0.88}
onPress={() => navigateTo(tool.route)}
>
<Text style={styles.toolIcon}>{tool.icon}</Text>
<Text style={styles.toolTitle}>{t(tool.titleKey)}</Text>
<Text style={styles.toolText}>{t(tool.textKey)}</Text>
</TouchableOpacity>
))}
</View>

<DashboardSectionHeader title={t("home.sections.activity.title")} subtitle={t("home.sections.activity.subtitle")} />

<View style={styles.activityCard}>
<View style={styles.activityColumn}>
<Text style={styles.activityIcon}>🧳</Text>
<Text style={styles.activityLabel}>{t("home.activity.tripLabel")}</Text>
<Text style={styles.activityValue}>{latestTrip ? latestTrip.tripName : t("home.activity.noTrip")}</Text>
<Text style={styles.activityText}>
{latestTrip ? latestTrip.visitDate || latestTrip.outletName : t("home.activity.createTripReminder")}
</Text>
</View>

<View style={styles.activityDivider} />

<View style={styles.activityColumn}>
<Text style={styles.activityIcon}>♡</Text>
<Text style={styles.activityLabel}>{t("home.activity.favoritesLabel")}</Text>
<Text style={styles.activityValue}>
{favoriteIds.length > 0 ? favoriteIds.length : t("home.activity.noFavorites")}
</Text>
<Text style={styles.activityText}>
{firstFavorite ? firstFavorite.name : t("home.activity.saveOutlets")}
</Text>
</View>
</View>

<DashboardSectionHeader title={t("home.sections.cities.title")} subtitle={t("home.sections.cities.subtitle")} />

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
<Text style={styles.cityText}>{t(city.textKey)}</Text>
</View>
</ImageBackground>
</TouchableOpacity>
))}
</ScrollView>

<DashboardSectionHeader title={t("home.sections.outlets.title")} subtitle={t("home.sections.outlets.subtitle")} />

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
<Text style={styles.outletBadgeText}>{t("home.recommended")}</Text>
</View>
</ImageBackground>

<View style={styles.outletBody}>
<Text style={styles.outletLocation}>{outlet.location}</Text>
<Text style={styles.outletTitle}>{outlet.title}</Text>
<Text style={styles.outletText}>{t(outlet.textKey)}</Text>
<Text style={styles.tapText}>{t("home.viewOutlet")}</Text>
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
<Text style={styles.quickMenuTitle}>{t("home.quick.title")}</Text>

{quickMenuItems.map((item) => (
<TouchableOpacity
key={item.id}
style={styles.quickMenuItem}
activeOpacity={0.84}
onPress={() => navigateTo(item.route)}
>
<Text style={styles.quickMenuIcon}>{item.icon}</Text>
<Text style={styles.quickMenuText}>{t(item.titleKey)}</Text>
<Text style={styles.quickMenuArrow}>→</Text>
</TouchableOpacity>
))}

<TouchableOpacity style={styles.quickMenuItem} activeOpacity={0.84} onPress={rateApp}>
<Text style={styles.quickMenuIcon}>⭐</Text>
<Text style={styles.quickMenuText}>{t("home.quick.rateApp")}</Text>
<Text style={styles.quickMenuArrow}>→</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.quickMenuItemLast} activeOpacity={0.84} onPress={shareApp}>
<Text style={styles.quickMenuIcon}>📤</Text>
<Text style={styles.quickMenuText}>{t("home.quick.shareApp")}</Text>
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
