import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
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
import { SearchResultItem } from "../components/SearchResultItem";
import { outlets } from "../constants/outlets";
import { getImageSource, getOutletCardHeroImage } from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import { searchApp } from "../services/searchEngine";
import type { SearchResult } from "../services/searchTypes";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { formatCountryDisplayName, formatCityDisplayName } from "../utils/locationDisplay";

const screenWidth = Dimensions.get("window").width;
const carouselWidth = screenWidth - spacing.xl * 2;
const outletCardWidth = carouselWidth;
const cityCardWidth = Math.round(screenWidth * 0.42);
const floatingTabBarHeight = 76;
const floatingTabBarBottomOffset = Platform.OS === "ios" ? 18 : 12;
const homeTabBarClearanceGap = 72;

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
  icon: string;
  image: ImageSourcePropType;
  route: string;
  params?: Record<string, string>;
};

const featuredSlides: FeaturedSlide[] = [
  {
    id: "discover-outlets",
    kickerKey: "home.featured.discover.kicker",
    titleKey: "home.featured.discover.title",
    subtitleKey: "home.featured.discover.subtitle",
    ctaKey: "home.featured.discover.cta",
    icon: "⌕",
    image: require("../../assets/home/featured-discover-outlets.png"),
    route: "Explore",
  },
  {
    id: "plan-trip",
    kickerKey: "home.featured.trip.kicker",
    titleKey: "home.featured.trip.title",
    subtitleKey: "home.featured.trip.subtitle",
    ctaKey: "home.featured.trip.cta",
    icon: "✈",
    image: require("../../assets/home/featured-plan-trip.png"),
    route: "CreateTrip",
  },
  {
    id: "savings-guide",
    kickerKey: "home.featured.savings.kicker",
    titleKey: "home.featured.savings.title",
    subtitleKey: "home.featured.savings.subtitle",
    ctaKey: "home.featured.savings.cta",
    icon: "%",
    image: require("../../assets/home/featured-savings-guide.png"),
    route: "Savings",
  },
  {
    id: "offline-availability",
    kickerKey: "home.featured.offline.kicker",
    titleKey: "home.featured.offline.title",
    subtitleKey: "home.featured.offline.subtitle",
    ctaKey: "home.featured.offline.cta",
    icon: "↓",
    image: require("../../assets/home/featured-offline-availability.png"),
    route: "OfflinePacks",
  },
];

const shoppingTools = [
  {
    id: "taxfree",
    icon: "€",
    titleKey: "home.tools.taxfree.title",
    textKey: "home.tools.taxfree.text",
    route: "TaxFreeCalculator",
    tone: "#FFF7E0",
  },
  {
    id: "currency",
    icon: "$",
    titleKey: "home.tools.currency.title",
    textKey: "home.tools.currency.text",
    route: "CurrencySettings",
    tone: "#EEF2FF",
  },
  {
    id: "flights",
    icon: "✈",
    titleKey: "home.tools.flights.title",
    textKey: "home.tools.flights.text",
    route: "FlightDeals",
    tone: "#EAF7EF",
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
  },
  {
    id: "bicester-village",
    title: "Bicester Village",
    location: "London, UK",
    textKey: "home.outlets.bicester.text",
  },
  {
    id: "serravalle-designer-outlet",
    title: "Serravalle",
    location: "Milan, Italy",
    textKey: "home.outlets.serravalle.text",
  },
  {
    id: "the-mall-firenze",
    title: "The Mall Firenze",
    location: "Florence, Italy",
    textKey: "home.outlets.theMall.text",
  },
  {
    id: "designer-outlet-parndorf",
    title: "Parndorf",
    location: "Vienna, Austria",
    textKey: "home.outlets.parndorf.text",
  },
];

const quickMenuItems = [
  { id: "browse", titleKey: "home.quick.browse", icon: "🏬", route: "Explore" },
  {
    id: "taxfree",
    titleKey: "home.quick.taxfree",
    icon: "💰",
    route: "TaxFreeCalculator",
  },
  {
    id: "offline",
    titleKey: "home.quick.offline",
    icon: "📥",
    route: "OfflinePacks",
  },
];

const outletMediaMode = getConfiguredOutletMediaMode();
const recommendedOutletFallbackImage = require("../../assets/home/recommended-outlet-generic.png");

function formatHomeLocation(location: string, language: any) {
  const [city, country] = location.split(",").map((part) => part.trim());
  if (!city || !country) return location;
  return `${formatCityDisplayName(city, language)}, ${formatCountryDisplayName(country, language)}`;
}

function getOutletCardImageSource(
  outletId: string,
): ImageSourcePropType | undefined {
  const outlet = outlets.find((item) => item.outletId === outletId);
  if (!outlet) return undefined;

  const heroImage = getOutletCardHeroImage(outlet, { mode: outletMediaMode });
  return heroImage ? getImageSource(heroImage) : recommendedOutletFallbackImage;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentUser, isAuthenticated } = useAuth();
  const { trips } = useTrips();
  const { favoriteIds } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const carouselRef = useRef<ScrollView | null>(null);

  const latestTrip = trips[0];
  const favoriteOutlets = outlets.filter((outlet) =>
    favoriteIds.includes(outlet.outletId),
  );
  const firstFavorite = favoriteOutlets[0];
  const slides = useMemo(() => featuredSlides, []);
  const searchSuggestions = useMemo(() => {
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    return searchApp(normalizedQuery, 6);
  }, [searchQuery]);
  const showSearchSuggestions = searchQuery.trim().length >= 2;
  const floatingTabBarFootprint = Math.max(
    tabBarHeight,
    floatingTabBarHeight + floatingTabBarBottomOffset,
  );
  const homeBottomSpacer =
    insets.bottom + floatingTabBarFootprint + homeTabBarClearanceGap;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeSlideIndex + 1) % slides.length;
      carouselRef.current?.scrollTo({
        x: nextIndex * carouselWidth,
        animated: true,
      });
      setActiveSlideIndex(nextIndex);
    }, 5500);

    return () => clearInterval(interval);
  }, [activeSlideIndex, slides.length]);

  function handleCarouselScroll(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / carouselWidth,
    );

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

  function openSearchSuggestion(item: SearchResult) {
    setSearchQuery("");
    navigateTo(item.routeName, item.routeParams);
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
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{
          top: insets.top,
          bottom: homeBottomSpacer,
        }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: 0,
          },
        ]}
      >
        <HomeHeader
          userName={currentUser?.displayName || currentUser?.email?.split("@")[0]}
          isGuest={!isAuthenticated}
          onPressMenu={() => setIsQuickMenuOpen(true)}
          onPressNotifications={() =>
            navigation.navigate("NotificationSettings")
          }
          onPressLanguage={() => navigation.navigate("LanguageSettings")}
        />

        <View style={styles.searchBlock}>
          <SearchBar
            value={searchQuery}
            placeholder={t("home.searchFallback")}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleQuickSearch}
          />
          {showSearchSuggestions ? (
            <View style={styles.suggestionPanel}>
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((item) => (
                  <SearchResultItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onPress={() => openSearchSuggestion(item)}
                  />
                ))
              ) : (
                <Text style={styles.noResultsText}>
                  {t("home.search.noResults")}
                </Text>
              )}
            </View>
          ) : null}
        </View>

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
                  resizeMode="cover"
                >
                  <View style={styles.slideScrim} />
                  <View style={styles.slideGradientLeft} />
                  <View style={styles.slideGradientBottom} />
                  <View style={styles.slideGradientAnchor} />
                  <View style={styles.slideGlow} />
                  <View style={styles.slideContent}>
                    <Text style={styles.slideIcon}>{slide.icon}</Text>
                    <Text style={styles.slideKicker}>{t(slide.kickerKey)}</Text>
                    <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
                    <Text style={styles.slideSubtitle}>
                      {t(slide.subtitleKey)}
                    </Text>
                    <View style={styles.slideAction}>
                      <Text style={styles.slideActionText}>
                        {t(slide.ctaKey)}
                      </Text>
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
                style={[
                  styles.dot,
                  index === activeSlideIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <DashboardSectionHeader
          title={t("home.sections.outlets.title")}
          subtitle={t("home.sections.outlets.subtitle")}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedList}
          snapToInterval={outletCardWidth + spacing.md}
          snapToAlignment="start"
          decelerationRate="fast"
        >
          {recommendedOutlets.map((outlet) => {
            const imageSource = getOutletCardImageSource(outlet.id);

            return (
              <TouchableOpacity
                key={outlet.id}
                style={styles.outletCard}
                activeOpacity={0.9}
                onPress={() =>
                  navigateTo("OutletDetail", { outletId: outlet.id })
                }
              >
                {imageSource ? (
                  <ImageBackground
                    source={imageSource}
                    style={styles.outletImage}
                    imageStyle={styles.outletImageRadius}
                  >
                    <View style={styles.outletOverlay} />
                    <View style={styles.outletBadge}>
                      <Text style={styles.outletBadgeText}>
                        {t("home.recommended")}
                      </Text>
                    </View>
                  </ImageBackground>
                ) : null}

                <View style={styles.outletBody}>
                  <Text style={styles.outletLocation}>{formatHomeLocation(outlet.location, language)}</Text>
                  <Text style={styles.outletTitle}>{outlet.title}</Text>
                  <Text style={styles.outletText}>{t(outlet.textKey)}</Text>
                  <Text style={styles.tapText}>{t("home.viewOutlet")}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <DashboardSectionHeader
          title={t("home.sections.activity.title")}
          subtitle={t("home.sections.activity.subtitle")}
        />

        <View style={styles.activityCard}>
          <View style={styles.activityColumn}>
            <Text style={styles.activityIcon}>🧳</Text>
            <Text style={styles.activityLabel}>
              {t("home.activity.tripLabel")}
            </Text>
            <Text style={styles.activityValue}>
              {latestTrip ? latestTrip.tripName : t("home.activity.noTrip")}
            </Text>
            <Text style={styles.activityText}>
              {latestTrip
                ? latestTrip.visitDate || latestTrip.outletName
                : t("home.activity.createTripReminder")}
            </Text>
          </View>

          <View style={styles.activityDivider} />

          <View style={styles.activityColumn}>
            <Text style={styles.activityIcon}>♡</Text>
            <Text style={styles.activityLabel}>
              {t("home.activity.favoritesLabel")}
            </Text>
            <Text style={styles.activityValue}>
              {favoriteIds.length > 0
                ? favoriteIds.length
                : t("home.activity.noFavorites")}
            </Text>
            <Text style={styles.activityText}>
              {firstFavorite
                ? firstFavorite.name
                : t("home.activity.saveOutlets")}
            </Text>
          </View>
        </View>

        <DashboardSectionHeader
          title={t("home.sections.tools.title")}
          subtitle={t("home.sections.tools.subtitle")}
        />

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

        <DashboardSectionHeader
          title={t("home.sections.cities.title")}
          subtitle={t("home.sections.cities.subtitle")}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {popularCities.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={styles.cityCard}
              activeOpacity={0.9}
              onPress={() => navigateTo(city.route, city.params)}
            >
              <ImageBackground
                source={city.image}
                style={styles.cityImage}
                imageStyle={styles.cityImageRadius}
              >
                <View style={styles.cityOverlay} />
                <View style={styles.cityContent}>
                  <Text style={styles.cityKicker}>{formatCountryDisplayName(city.country, language).toLocaleUpperCase(language)}</Text>
                  <Text style={styles.cityTitle}>{formatCityDisplayName(city.id, language)}</Text>
                  <Text style={styles.cityText}>{t(city.textKey)}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.bottomTabSpacer, { height: homeBottomSpacer }]} />
      </ScrollView>

      <View
        pointerEvents="none"
        style={[styles.statusBarScrim, { height: insets.top }]}
      />

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

            <TouchableOpacity
              style={styles.quickMenuItem}
              activeOpacity={0.84}
              onPress={rateApp}
            >
              <Text style={styles.quickMenuIcon}>⭐</Text>
              <Text style={styles.quickMenuText}>
                {t("home.quick.rateApp")}
              </Text>
              <Text style={styles.quickMenuArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickMenuItemLast}
              activeOpacity={0.84}
              onPress={shareApp}
            >
              <Text style={styles.quickMenuIcon}>📤</Text>
              <Text style={styles.quickMenuText}>
                {t("home.quick.shareApp")}
              </Text>
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
    paddingTop: spacing.md,
    paddingBottom: 0,
  },

  bottomTabSpacer: {
    flexShrink: 0,
  },

  statusBarScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: colors.background,
  },

  searchBlock: {
    marginBottom: spacing.md,
  },

  suggestionPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    ...shadows.card,
  },

  noResultsText: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    padding: spacing.md,
    textAlign: "center",
  },

  carouselWrap: {
    marginBottom: spacing.xxl,
  },

  slideOuter: {
    width: carouselWidth,
    paddingRight: spacing.sm,
  },

  slideImage: {
    minHeight: 244,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderRadius: radius.hero,
    backgroundColor: colors.primary,
    ...shadows.premium,
  },

  slideImageRadius: {
    borderRadius: radius.hero,
  },

  slideScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,18,34,0.04)",
  },

  slideGradientLeft: {
    position: "absolute",
    left: -carouselWidth * 0.42,
    bottom: -90,
    width: carouselWidth * 1.08,
    height: 360,
    borderRadius: 220,
    backgroundColor: "rgba(4,12,24,0.54)",
    transform: [{ scaleX: 1.18 }],
  },

  slideGradientBottom: {
    position: "absolute",
    left: -40,
    right: -40,
    bottom: -126,
    height: 260,
    borderRadius: 150,
    backgroundColor: "rgba(4,12,24,0.34)",
  },

  slideGradientAnchor: {
    position: "absolute",
    left: -90,
    bottom: -44,
    width: carouselWidth * 0.82,
    height: 232,
    borderRadius: 150,
    backgroundColor: "rgba(4,12,24,0.24)",
  },

  slideGlow: {
    position: "absolute",
    top: -74,
    right: -48,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(201,162,39,0.18)",
  },

  slideContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    maxWidth: carouselWidth - spacing.lg,
  },

  slideIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    color: colors.gold,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 42,
    overflow: "hidden",
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
    marginBottom: spacing.lg,
  },

  slideKicker: {
    color: "#F6D86A",
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },

  slideTitle: {
    color: colors.textInverse,
    textShadowColor: "rgba(0,0,0,0.44)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: typography.h1,
    lineHeight: typography.lineH1,
    fontWeight: typography.weightBlack,
    letterSpacing: -0.6,
    marginBottom: spacing.xs,
  },

  slideSubtitle: {
    color: "#F7FAFF",
    textShadowColor: "rgba(0,0,0,0.36)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    fontWeight: typography.weightMedium,
    marginBottom: spacing.xl,
  },

  slideAction: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: carouselWidth - spacing.xl * 2,
    minHeight: 40,
  },

  slideActionText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    marginRight: spacing.xs,
    flexShrink: 1,
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
    marginTop: spacing.lg,
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
    minHeight: 150,
    borderRadius: radius.xl,
    padding: spacing.md,
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
    minWidth: 0,
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
    flexShrink: 1,
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

  recommendedList: {
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
    minHeight: 150,
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
    flexShrink: 1,
  },

  outletText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    flexShrink: 1,
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
    flexShrink: 1,
  },

  quickMenuArrow: {
    color: colors.gold,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
  },
});
