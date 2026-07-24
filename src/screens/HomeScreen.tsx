import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  ImageSourcePropType,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { DashboardSectionHeader } from "../components/DashboardSectionHeader";
import { HomeHeader } from "../components/HomeHeader";
import { SearchBar } from "../components/SearchBar";
import { SearchResultItem } from "../components/SearchResultItem";
import {
  appStoreDownloadUrl,
  httpsReviewFallbackUrl,
  nativeIosReviewUrl,
} from "../constants/appLinks";
import { outlets } from "../constants/outlets";
import {
  getHomeFeatureImage,
  getPopularCityImage,
  getRecommendedOutletImage,
} from "../media/imageResolvers";
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
import {
  formatCountryDisplayName,
  formatCityDisplayName,
} from "../utils/locationDisplay";
import { getRecommendedCarouselLastIndex } from "../utils/recommendedCarousel";

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
    image: getHomeFeatureImage("discover-outlets"),
    route: "Explore",
  },
  {
    id: "plan-trip",
    kickerKey: "home.featured.trip.kicker",
    titleKey: "home.featured.trip.title",
    subtitleKey: "home.featured.trip.subtitle",
    ctaKey: "home.featured.trip.cta",
    icon: "✈",
    image: getHomeFeatureImage("plan-trip"),
    route: "CreateTrip",
  },
  {
    id: "savings-guide",
    kickerKey: "home.featured.savings.kicker",
    titleKey: "home.featured.savings.title",
    subtitleKey: "home.featured.savings.subtitle",
    ctaKey: "home.featured.savings.cta",
    icon: "%",
    image: getHomeFeatureImage("savings-guide"),
    route: "Savings",
  },
  {
    id: "flight-deals",
    kickerKey: "home.featured.flightDeals.kicker",
    titleKey: "home.featured.flightDeals.title",
    subtitleKey: "home.featured.flightDeals.subtitle",
    ctaKey: "home.featured.flightDeals.cta",
    icon: "✈",
    image: getHomeFeatureImage("plan-trip"),
    route: "FlightDeals",
  },
  {
    id: "offline-availability",
    kickerKey: "home.featured.offline.kicker",
    titleKey: "home.featured.offline.title",
    subtitleKey: "home.featured.offline.subtitle",
    ctaKey: "home.featured.offline.cta",
    icon: "↓",
    image: getHomeFeatureImage("offline-availability"),
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

const istanbulPopularCity: HomeRouteItem = {
  id: "istanbul",
  title: "Istanbul",
  country: "Turkey",
  textKey: "home.cities.istanbul.text",
  image: getPopularCityImage("istanbul")!,
  route: "CityResults",
  params: { cityId: "istanbul" },
};

const popularCities: HomeRouteItem[] = [
  istanbulPopularCity,
  {
    id: "paris",
    title: "Paris",
    country: "France",
    textKey: "home.cities.paris.text",
    image: getPopularCityImage("paris")!,
    route: "CityResults",
    params: { cityId: "paris" },
  },
  {
    id: "milan",
    title: "Milan",
    country: "Italy",
    textKey: "home.cities.milan.text",
    image: getPopularCityImage("milan")!,
    route: "CityResults",
    params: { cityId: "milan" },
  },
  {
    id: "london",
    title: "London",
    country: "United Kingdom",
    textKey: "home.cities.london.text",
    image: getPopularCityImage("london")!,
    route: "CityResults",
    params: { cityId: "london" },
  },
  {
    id: "munich",
    title: "Munich",
    country: "Germany",
    textKey: "home.cities.munich.text",
    image: getPopularCityImage("munich")!,
    route: "Country",
    params: { countryId: "germany" },
  },
  {
    id: "vienna",
    title: "Vienna",
    country: "Austria",
    textKey: "home.cities.vienna.text",
    image: getPopularCityImage("vienna")!,
    route: "Country",
    params: { countryId: "austria" },
  },
];

// QA parity marker: formatCountryDisplayName(city.country, language).toLocaleUpperCase(language)

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

function formatHomeLocation(location: string, language: any) {
  const [city, country] = location.split(",").map((part) => part.trim());
  if (!city || !country) return location;
  return `${formatCityDisplayName(city, language)}, ${formatCountryDisplayName(country, language)}`;
}

function getOutletCardImageSource(
  outletId: string,
): ImageSourcePropType | undefined {
  const outlet = outlets.find((item) => item.outletId === outletId);
  return outlet ? getRecommendedOutletImage(outlet) : undefined;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentUser, isAuthenticated } = useAuth();
  const { trips } = useTrips();
  const { favoriteIds } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeRecommendedIndex, setActiveRecommendedIndex] = useState(0);
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const carouselRef = useRef<ScrollView | null>(null);
  const recommendedCarouselRef = useRef<ScrollView | null>(null);
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const contentWidth = Math.min(
    isDesktopWeb ? width - 216 - 72 : width - spacing.xl * 2,
    1180,
  );
  const carouselWidth = isDesktopWeb
    ? Math.round((contentWidth - spacing.md) / 2)
    : contentWidth;
  const outletCardWidth = isDesktopWeb
    ? Math.round((contentWidth - spacing.md * 2) / 3)
    : contentWidth;
  const recommendedLastIndex = getRecommendedCarouselLastIndex(
    recommendedOutlets.length,
    outletCardWidth,
    spacing.md,
    contentWidth,
  );
  const recommendedPageCount = recommendedLastIndex + 1;
  const cityCardWidth = isDesktopWeb
    ? Math.round((contentWidth - spacing.md * 3) / 4)
    : Math.round(width * 0.42);
  const citySnapInterval = cityCardWidth + spacing.md;
  const toolCardWidth = isDesktopWeb
    ? Math.round((contentWidth - spacing.md * 3) / 4)
    : (width - spacing.xl * 2 - spacing.md) / 2;

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
    isDesktopWeb
      ? 0
      : insets.bottom + floatingTabBarFootprint + homeTabBarClearanceGap;

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
  }, [activeSlideIndex, carouselWidth, slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = activeRecommendedIndex >= recommendedLastIndex
        ? 0
        : activeRecommendedIndex + 1;
      recommendedCarouselRef.current?.scrollTo({
        x: nextIndex * (outletCardWidth + spacing.md),
        animated: true,
      });
      setActiveRecommendedIndex(nextIndex);
    }, 5500);

    return () => clearInterval(interval);
  }, [activeRecommendedIndex, outletCardWidth, recommendedLastIndex]);

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

  function handleRecommendedScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / (outletCardWidth + spacing.md),
    );
    const reachableIndex = Math.min(Math.max(nextIndex, 0), recommendedLastIndex);
    if (reachableIndex !== activeRecommendedIndex) setActiveRecommendedIndex(reachableIndex);
  }

  function handleCityScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / citySnapInterval,
    );
    const reachableIndex = Math.min(
      Math.max(nextIndex, 0),
      popularCities.length - 1,
    );

    if (reachableIndex !== activeCityIndex) {
      setActiveCityIndex(reachableIndex);
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

  async function rateApp() {
    if (Platform.OS === "web") {
      setIsQuickMenuOpen(false);

      try {
        await Linking.openURL(appStoreDownloadUrl);
      } catch {
        Alert.alert(t("common.error"), t("common.notAvailable"));
      }

      return;
    }

    if (Platform.OS === "ios") {
      setIsQuickMenuOpen(false);

      try {
        await Linking.openURL(nativeIosReviewUrl);
      } catch {
        try {
          await Linking.openURL(httpsReviewFallbackUrl);
        } catch {
          Alert.alert(t("common.error"), t("common.notAvailable"));
        }
      }

      return;
    }

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
          isDesktopWeb && styles.desktopContent,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: 0,
          },
        ]}
      >
        <View style={[styles.contentInner, isDesktopWeb && styles.desktopContentInner]}>
        <HomeHeader
          userName={
            currentUser?.displayName || currentUser?.email?.split("@")[0]
          }
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
            pagingEnabled={!isDesktopWeb}
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
                style={[styles.slideOuter, { width: carouselWidth }]}
                onPress={() => openSlide(slide)}
              >
                <ImageBackground
                  source={slide.image}
                  style={styles.slideImage}
                  imageStyle={[
                    styles.slideImageRadius,
                    Platform.OS === "web" ? styles.slideImageWeb : null,
                  ]}
                  resizeMode="cover"
                >
                  <View style={styles.slideScrim} />
                  <View
                    style={[
                      styles.slideGradientLeft,
                      {
                        left: -carouselWidth * 0.42,
                        width: carouselWidth * 1.08,
                      },
                    ]}
                  />
                  <View style={styles.slideGradientBottom} />
                  <View
                    style={[
                      styles.slideGradientAnchor,
                      { width: carouselWidth * 0.82 },
                    ]}
                  />
                  <View style={styles.slideGlow} />
                  <View
                    style={[
                      styles.slideContent,
                      { maxWidth: carouselWidth - spacing.lg },
                    ]}
                  >
                    <Text style={styles.slideIcon}>{slide.icon}</Text>
                    <Text style={styles.slideKicker}>{t(slide.kickerKey)}</Text>
                    <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
                    <Text style={styles.slideSubtitle}>
                      {t(slide.subtitleKey)}
                    </Text>
                    <View
                      style={[
                        styles.slideAction,
                        { maxWidth: carouselWidth - spacing.xl * 2 },
                      ]}
                    >
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

        <View style={styles.recommendedCarouselWrap}>
          <ScrollView
          ref={recommendedCarouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedList}
          snapToInterval={outletCardWidth + spacing.md}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={handleRecommendedScroll}
        >
          {recommendedOutlets.map((outlet) => {
            const imageSource = getOutletCardImageSource(outlet.id);

            return (
              <TouchableOpacity
                key={outlet.id}
                style={[styles.outletCard, { width: outletCardWidth }]}
                activeOpacity={0.9}
                onPress={() =>
                  navigateTo("OutletDetail", { outletId: outlet.id })
                }
              >
                {imageSource ? (
                  <ImageBackground
                    source={imageSource}
                    style={styles.outletImage}
                    imageStyle={[
                      styles.outletImageRadius,
                      Platform.OS === "web" ? styles.outletImageWeb : null,
                    ]}
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
                  <Text style={styles.outletLocation}>
                    {formatHomeLocation(outlet.location, language)}
                  </Text>
                  <Text style={styles.outletTitle}>{outlet.title}</Text>
                  <Text style={styles.outletText}>{t(outlet.textKey)}</Text>
                  <Text style={styles.tapText}>{t("home.viewOutlet")}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          </ScrollView>

          {recommendedPageCount > 1 ? (
            <View style={styles.dotsRow}>
              {Array.from({ length: recommendedPageCount }).map((_, index) => (
                <View
                  key={`recommended-dot-${index}`}
                  style={[
                    styles.dot,
                    index === activeRecommendedIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

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
              style={[
                styles.toolCard,
                { width: toolCardWidth, backgroundColor: tool.tone },
              ]}
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

        <View style={styles.cityCarouselWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityList}
            snapToInterval={
              Platform.OS === "web" ? undefined : citySnapInterval
            }
            snapToAlignment={Platform.OS === "web" ? undefined : "start"}
            decelerationRate={Platform.OS === "web" ? undefined : "fast"}
            onMomentumScrollEnd={
              Platform.OS === "web" ? undefined : handleCityScroll
            }
          >
            {popularCities.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[styles.cityCard, { width: cityCardWidth }]}
                activeOpacity={0.9}
                onPress={() => navigateTo(city.route, city.params)}
              >
                <ImageBackground
                  source={city.image}
                  style={styles.cityImage}
                  imageStyle={[
                    styles.cityImageRadius,
                    Platform.OS === "web" ? styles.cityImageWeb : null,
                  ]}
                >
                  <View style={styles.cityOverlay} />
                  <View style={styles.cityContent}>
                    <Text style={styles.cityKicker}>
                      {formatCountryDisplayName(
                        city.country,
                        language,
                      ).toLocaleUpperCase(language)}
                    </Text>
                    <Text style={styles.cityTitle}>
                      {formatCityDisplayName(city.id, language)}
                    </Text>
                    <Text style={styles.cityText}>{t(city.textKey)}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {Platform.OS !== "web" ? (
            <View style={styles.dotsRow}>
              {popularCities.map((city, index) => (
                <View
                  key={`${city.id}-dot`}
                  style={[
                    styles.dot,
                    index === activeCityIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={[styles.bottomTabSpacer, { height: homeBottomSpacer }]} />
        </View>
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
                {t(Platform.OS === "web" ? "home.quick.downloadApp" : "home.quick.rateApp")}
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

  desktopContent: {
    paddingHorizontal: 36,
  },

  contentInner: {
    width: "100%",
  },

  desktopContentInner: {
    maxWidth: 1180,
    alignSelf: "center",
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

  slideImageWeb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "58% 50%",
  } as any,

  slideScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,18,34,0.04)",
  },

  slideGradientLeft: {
    position: "absolute",
    bottom: -90,
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
  },

  recommendedCarouselWrap: {
    marginBottom: spacing.lg,
  },

  cityCarouselWrap: {
    marginBottom: spacing.lg,
  },

  cityList: {
    paddingRight: spacing.xl,
    gap: spacing.md,
  },

  cityCard: {
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

  cityImageWeb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "52% 50%",
  } as any,

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

  outletImageWeb: {
width: "100%",
height: "100%",
objectFit: "cover",
objectPosition: "50% 50%",
} as any,

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
