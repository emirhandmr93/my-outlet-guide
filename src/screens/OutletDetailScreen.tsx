import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandsCard } from "../components/cards/BrandsCard";
import { MapsCard } from "../components/cards/MapsCard";
import { QuickFactsCard } from "../components/cards/QuickFactsCard";
import { RestaurantsCard } from "../components/cards/RestaurantsCard";
import { ReviewStatsCard } from "../components/cards/ReviewStatsCard";
import { ServicesCard } from "../components/cards/ServicesCard";
import { TaxFreeCard } from "../components/cards/TaxFreeCard";
import { TransportationCard } from "../components/cards/TransportationCard";
import { WebsiteCard } from "../components/cards/WebsiteCard";
import { OutletHero } from "../components/OutletHero";
import { ReviewItem } from "../components/ReviewItem";
import { ReviewTabs } from "../components/ReviewTabs";
import { WriteReviewButton } from "../components/WriteReviewButton";
import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";
import { useReviewHelpful } from "../contexts/ReviewHelpfulContext";
import { useReviews } from "../contexts/ReviewsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { getBrandCategoryGroupsForOutlet } from "../services/brandService";
import { getRestaurantsForOutlet } from "../services/restaurantService";
import { getTransportationForOutlet } from "../services/transportationService";
import { CurrentWeather, getCurrentWeather } from "../services/weatherService";
import { requireAuth } from "../utils/requireAuth";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const fallbackImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1400&auto=format&fit=crop";

const outletLocalImages: Record<string, any[]> = {
  "la-vallee-village": [
    require("../../assets/outlet-images/la-vallee/hero.webp"),
    require("../../assets/outlet-images/la-vallee/gallery1.webp"),
    require("../../assets/outlet-images/la-vallee/gallery2.webp"),
    require("../../assets/outlet-images/la-vallee/gallery3.webp"),
  ],
  "bicester-village": [
    require("../../assets/outlet-images/bicester/hero.webp"),
    require("../../assets/outlet-images/bicester/gallery1.webp"),
    require("../../assets/outlet-images/bicester/gallery2.webp"),
    require("../../assets/outlet-images/bicester/gallery3.webp"),
  ],
  "serravalle-designer-outlet": [
    require("../../assets/outlet-images/serravalle/hero.webp"),
    require("../../assets/outlet-images/serravalle/gallery1.webp"),
    require("../../assets/outlet-images/serravalle/gallery2.webp"),
    require("../../assets/outlet-images/serravalle/gallery3.webp"),
  ],
  "designer-outlet-parndorf": [
    require("../../assets/outlet-images/parndorf/hero.webp"),
    require("../../assets/outlet-images/parndorf/gallery1.webp"),
    require("../../assets/outlet-images/parndorf/gallery2.webp"),
    require("../../assets/outlet-images/parndorf/gallery3.webp"),
  ],
  "fidenza-village": [
    require("../../assets/outlet-images/fidenza/hero.webp"),
    require("../../assets/outlet-images/fidenza/gallery1.webp"),
    require("../../assets/outlet-images/fidenza/gallery2.webp"),
    require("../../assets/outlet-images/fidenza/gallery3.webp"),
  ],
  "ingolstadt-village": [
    require("../../assets/outlet-images/ingolstadt/hero.webp"),
    require("../../assets/outlet-images/ingolstadt/gallery1.webp"),
    require("../../assets/outlet-images/ingolstadt/gallery2.webp"),
    require("../../assets/outlet-images/ingolstadt/gallery3.webp"),
  ],
  "wertheim-village": [
    require("../../assets/outlet-images/wertheim/hero.webp"),
    require("../../assets/outlet-images/wertheim/gallery1.webp"),
    require("../../assets/outlet-images/wertheim/gallery2.webp"),
    require("../../assets/outlet-images/wertheim/gallery3.webp"),
  ],
  "the-mall-firenze": [
    require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery1.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery2.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery3.webp"),
  ],
  "barberino": [
    require("../../assets/outlet-images/barberino/hero.webp"),
    require("../../assets/outlet-images/barberino/gallery1.webp"),
    require("../../assets/outlet-images/barberino/gallery2.webp"),
    require("../../assets/outlet-images/barberino/gallery3.webp"),
  ],
  "noventa": [
    require("../../assets/outlet-images/noventa/hero.webp"),
    require("../../assets/outlet-images/noventa/gallery1.webp"),
    require("../../assets/outlet-images/noventa/gallery2.webp"),
    require("../../assets/outlet-images/noventa/gallery3.webp"),
  ],

  "outletcity-metzingen": [
    require("../../assets/outlet-images/metzingen/hero.webp"),
    require("../../assets/outlet-images/metzingen/gallery1.webp"),
    require("../../assets/outlet-images/metzingen/gallery2.webp"),
    require("../../assets/outlet-images/metzingen/gallery3.webp"),
  ],

  "designer-outlet-troyes": [
require("../../assets/outlet-images/troyes/hero.webp"),
require("../../assets/outlet-images/troyes/gallery1.webp"),
require("../../assets/outlet-images/troyes/gallery2.webp"),
require("../../assets/outlet-images/troyes/gallery3.webp"),
],

"designer-outlet-provence": [
require("../../assets/outlet-images/provence/hero.webp"),
require("../../assets/outlet-images/provence/gallery1.webp"),
require("../../assets/outlet-images/provence/gallery2.webp"),
require("../../assets/outlet-images/provence/gallery3.webp"),
],
"designer-outlet-roermond": [
require("../../assets/outlet-images/roermond/hero.webp"),
require("../../assets/outlet-images/roermond/gallery1.webp"),
require("../../assets/outlet-images/roermond/gallery2.webp"),
require("../../assets/outlet-images/roermond/gallery3.webp"),
],
"castel-romano": [
require("../../assets/outlet-images/castel-romano/hero.webp"),
require("../../assets/outlet-images/castel-romano/gallery1.webp"),
require("../../assets/outlet-images/castel-romano/gallery2.webp"),
require("../../assets/outlet-images/castel-romano/gallery3.webp"),
],
"cheshire-oaks": [
require("../../assets/outlet-images/cheshire-oaks/hero.webp"),
require("../../assets/outlet-images/cheshire-oaks/gallery1.webp"),
require("../../assets/outlet-images/cheshire-oaks/gallery2.webp"),
require("../../assets/outlet-images/cheshire-oaks/gallery3.webp"),
],
"designer-outlet-berlin": [
require("../../assets/outlet-images/berlin/hero.webp"),
require("../../assets/outlet-images/berlin/gallery1.webp"),
require("../../assets/outlet-images/berlin/gallery2.webp"),
require("../../assets/outlet-images/berlin/gallery3.webp"),
],
"designer-outlet-neumunster": [
require("../../assets/outlet-images/neumunster/hero.webp"),
require("../../assets/outlet-images/neumunster/gallery1.webp"),
require("../../assets/outlet-images/neumunster/gallery2.webp"),
require("../../assets/outlet-images/neumunster/gallery3.webp"),
],
"designer-outlet-roosendaal": [
require("../../assets/outlet-images/roosendaal/hero.webp"),
require("../../assets/outlet-images/roosendaal/gallery1.webp"),
require("../../assets/outlet-images/roosendaal/gallery2.webp"),
require("../../assets/outlet-images/roosendaal/gallery3.webp"),
],
"la-reggia": [
require("../../assets/outlet-images/la-reggia/hero.webp"),
require("../../assets/outlet-images/la-reggia/gallery1.webp"),
require("../../assets/outlet-images/la-reggia/gallery2.webp"),
require("../../assets/outlet-images/la-reggia/gallery3.webp"),
],
"designer-outlet-malaga": [
require("../../assets/outlet-images/malaga/hero.webp"),
require("../../assets/outlet-images/malaga/gallery1.webp"),
require("../../assets/outlet-images/malaga/gallery2.webp"),
require("../../assets/outlet-images/malaga/gallery3.webp"),
],
"montabaur-the-style-outlets": [
require("../../assets/outlet-images/montabaur/hero.webp"),
require("../../assets/outlet-images/montabaur/gallery1.webp"),
require("../../assets/outlet-images/montabaur/gallery2.webp"),
require("../../assets/outlet-images/montabaur/gallery3.webp"),
],

"zweibrucken-fashion-outlet": [
require("../../assets/outlet-images/zweibrucken/hero.webp"),
require("../../assets/outlet-images/zweibrucken/gallery1.webp"),
require("../../assets/outlet-images/zweibrucken/gallery2.webp"),
require("../../assets/outlet-images/zweibrucken/gallery3.webp"),
],
"maasmechelen-village": [
require("../../assets/outlet-images/maasmechelen/hero.webp"),
require("../../assets/outlet-images/maasmechelen/gallery1.webp"),
require("../../assets/outlet-images/maasmechelen/gallery2.webp"),
require("../../assets/outlet-images/maasmechelen/gallery3.webp"),
],

"las-rozas-village": [
require("../../assets/outlet-images/las-rozas/hero.webp"),
require("../../assets/outlet-images/las-rozas/gallery1.webp"),
require("../../assets/outlet-images/las-rozas/gallery2.webp"),
require("../../assets/outlet-images/las-rozas/gallery3.webp"),
],
"city-outlet-bad-munstereifel": [
require("../../assets/outlet-images/bad-munstereifel/hero.webp"),
require("../../assets/outlet-images/bad-munstereifel/gallery1.webp"),
require("../../assets/outlet-images/bad-munstereifel/gallery2.webp"),
require("../../assets/outlet-images/bad-munstereifel/gallery3.webp"),
],

"designer-outlets-wolfsburg": [
require("../../assets/outlet-images/wolfsburg/hero.webp"),
require("../../assets/outlet-images/wolfsburg/gallery1.webp"),
require("../../assets/outlet-images/wolfsburg/gallery2.webp"),
require("../../assets/outlet-images/wolfsburg/gallery3.webp"),
],
};

function getImageSource(image: any) {
  return typeof image === "string" ? { uri: image } : image;
}

type RouteParams = {
  OutletDetail: {
    outletId: string;
  };
};

const cityNames: Record<string, string> = {
  paris: "Paris",
  milan: "Milan",
  london: "London",
  vienna: "Vienna",
  munich: "Munich",
  frankfurt: "Frankfurt",
  fidenza: "Fidenza",
  florence: "Florence",
  venice: "Venice",
};

const countryNames: Record<string, string> = {
  france: "France",
  italy: "Italy",
  "united-kingdom": "United Kingdom",
  austria: "Austria",
  germany: "Germany",
};

function getReviewAverage(review: any) {
  return (
    (
      review.overallRating +
      review.transportationRating +
      review.brandVarietyRating +
      review.restaurantsRating +
      review.servicesRating
    ) / 5
  ).toFixed(1);
}

export function OutletDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "OutletDetail">>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { reviews } = useReviews();
  const { isLoggedIn } = useUser();
  const { currentUser } = useUser();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleHelpful, getHelpfulItem } = useReviewHelpful();

  const outlet =
    outlets.find((item) => item?.outletId === route.params?.outletId) || outlets.find((item) => Boolean(item)) || outlets[0];

  const safeGalleryImages = useMemo(() => {
    const localImages = outletLocalImages[outlet.outletId];

    if (localImages?.length) {
      return localImages;
    }

    const images = [outlet.heroImage, ...(outlet.galleryImages ?? [])].filter(Boolean);

    if (images.length > 0) {
      return images;
    }

    return [
      fallbackImage,
      "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1400&auto=format&fit=crop",
    ];
  }, [outlet.galleryImages, outlet.heroImage, outlet.outletId]);

  const [selectedImage, setSelectedImage] = useState(
    safeGalleryImages[0] || fallbackImage
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [reviewSort, setReviewSort] = useState<"helpful" | "recent">("helpful");
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    setSelectedImage(safeGalleryImages[0] || fallbackImage);
  }, [safeGalleryImages]);

  useEffect(() => {
    async function loadWeather() {
      try {
        setWeatherLoading(true);
        setWeatherError(false);

        const result = await getCurrentWeather(
          Number(outlet.latitude),
          Number(outlet.longitude)
        );

        setWeather(result);
      } catch (error) {
        console.log("Weather load error", error);
        setWeatherError(true);
      } finally {
        setWeatherLoading(false);
      }
    }

    loadWeather();
  }, [outlet.latitude, outlet.longitude]);

  const favorite = isFavorite(outlet.outletId);
  const brandCategoryGroups = getBrandCategoryGroupsForOutlet(outlet.outletId);
  const transportationItems = getTransportationForOutlet(outlet.outletId);
  const restaurantItems = getRestaurantsForOutlet(outlet.outletId);
  const outletReviews = reviews.filter((review) => review.outletId === outlet.outletId);
  const currentUserReview = outletReviews.find(
    (review) => review.userId === currentUser?.userId
  );

  const averageRating =
    outletReviews.length > 0
      ? (
          outletReviews.reduce(
            (sum, review) => sum + Number(getReviewAverage(review)),
            0
          ) / outletReviews.length
        ).toFixed(1)
      : "0.0";

  const averageTransportationRating =
    outletReviews.length > 0
      ? (
          outletReviews.reduce(
            (sum, review) => sum + review.transportationRating,
            0
          ) / outletReviews.length
        ).toFixed(1)
      : "0.0";

  const averageBrandVarietyRating =
    outletReviews.length > 0
      ? (
          outletReviews.reduce(
            (sum, review) => sum + review.brandVarietyRating,
            0
          ) / outletReviews.length
        ).toFixed(1)
      : "0.0";

  const averageRestaurantsRating =
    outletReviews.length > 0
      ? (
          outletReviews.reduce(
            (sum, review) => sum + review.restaurantsRating,
            0
          ) / outletReviews.length
        ).toFixed(1)
      : "0.0";

  const averageServicesRating =
    outletReviews.length > 0
      ? (
          outletReviews.reduce(
            (sum, review) => sum + review.servicesRating,
            0
          ) / outletReviews.length
        ).toFixed(1)
      : "0.0";

  const sortedReviews = [...outletReviews].sort((a, b) => {
    if (reviewSort === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return (
      getHelpfulItem(b.reviewId).helpfulCount -
      getHelpfulItem(a.reviewId).helpfulCount
    );
  });

  const currentGalleryIndex = safeGalleryImages.indexOf(selectedImage);

  const airportSummary = Array.isArray(outlet.airports) && outlet.airports.length > 0
    ? outlet.airports
        .map((airport) => `${airport.code} • ${airport.distanceKm} km`)
        .join("\n")
    : `${outlet.airportDistanceKm} km`;

  function setSectionPosition(section: string, y: number) {
    setSectionPositions((current) => ({ ...current, [section]: y }));
  }

  function scrollToSection(section: string) {
    const y = sectionPositions[section] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(y - 92, 0), animated: true });
  }

  function getWeatherBadgeText() {
    if (weatherLoading) return "Weather";
    if (weatherError || !weather) return "Weather unavailable";
    return `${weather.icon || "⛅"} ${weather.temperature}°C`;
  }

  function showPreviousImage() {
    if (safeGalleryImages.length === 0) {
      setSelectedImage(fallbackImage);
      return;
    }

    if (currentGalleryIndex <= 0) {
      setSelectedImage(safeGalleryImages[safeGalleryImages.length - 1]);
      return;
    }

    setSelectedImage(safeGalleryImages[currentGalleryIndex - 1]);
  }

  function showNextImage() {
    if (safeGalleryImages.length === 0) {
      setSelectedImage(fallbackImage);
      return;
    }

    if (currentGalleryIndex === safeGalleryImages.length - 1) {
      setSelectedImage(safeGalleryImages[0]);
      return;
    }

    setSelectedImage(safeGalleryImages[currentGalleryIndex + 1]);
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <OutletHero
        name={outlet.name}
        location={`${cityNames[outlet.cityId] || outlet.cityId}, ${
          countryNames[outlet.countryId] || outlet.countryId
        }`}
        selectedImage={selectedImage}
        galleryImages={safeGalleryImages}
        favoriteButtonText={
          favorite ? t("outlet.removeFavorite") : t("outlet.addFavorite")
        }
        onPressHeroImage={() => setIsGalleryOpen(true)}
        onPressGalleryImage={setSelectedImage}
        onPressFavorite={() => {
          if (!requireAuth({ isLoggedIn, navigation })) {
            return;
          }

          toggleFavorite(outlet.outletId);
        }}
      />

      <Modal visible={isGalleryOpen} animationType="fade">
        <View style={styles.galleryModal}>
          <TouchableOpacity
            style={styles.galleryCloseButton}
            onPress={() => setIsGalleryOpen(false)}
          >
            <Text style={styles.galleryCloseText}>Close</Text>
          </TouchableOpacity>

          <View style={styles.galleryModalImageWrapper}>
            <TouchableOpacity style={styles.galleryArrowLeft} onPress={showPreviousImage}>
              <Text style={styles.galleryArrowText}>‹</Text>
            </TouchableOpacity>

            <ScrollView
              style={styles.galleryZoomScroll}
              contentContainerStyle={styles.galleryZoomContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={getImageSource(selectedImage || fallbackImage)}
                style={styles.galleryModalImage}
                resizeMode="contain"
              />
            </ScrollView>

            <TouchableOpacity style={styles.galleryArrowRight} onPress={showNextImage}>
              <Text style={styles.galleryArrowText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{getWeatherBadgeText()}</Text>
        <Text style={styles.badge}>{outlet.status}</Text>
        <Text style={styles.badge}>⭐ {outlet.rating}</Text>
      </View>

      <View style={styles.ctaRow}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={[styles.ctaButton, favorite && styles.ctaButtonActive]}
          onPress={() => {
            if (!requireAuth({ isLoggedIn, navigation })) {
              return;
            }

            toggleFavorite(outlet.outletId);
          }}
        >
          <Text style={styles.ctaIcon}>{favorite ? "♥" : "♡"}</Text>
          <Text style={styles.ctaText}>{favorite ? "Saved" : "Favorite"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.ctaButton}
          onPress={() => navigation.navigate("CreateTrip", { outletId: outlet.outletId })}
        >
          <Text style={styles.ctaIcon}>🧳</Text>
          <Text style={styles.ctaText}>Create Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.ctaButton}
          onPress={() => Linking.openURL(outlet.googleMapsUrl)}
        >
          <Text style={styles.ctaIcon}>📍</Text>
          <Text style={styles.ctaText}>Directions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.anchorRow}>
        <TouchableOpacity activeOpacity={0.86} onPress={() => scrollToSection("overview")}>
          <Text style={styles.anchorPill}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={() => scrollToSection("brands")}>
          <Text style={styles.anchorPill}>Brands</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={() => scrollToSection("transport")}>
          <Text style={styles.anchorPill}>Transport</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={() => scrollToSection("food")}>
          <Text style={styles.anchorPill}>Food</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.86} onPress={() => scrollToSection("reviews")}>
          <Text style={styles.anchorPill}>Reviews</Text>
        </TouchableOpacity>
      </View>

      <View onLayout={(event) => setSectionPosition("overview", event.nativeEvent.layout.y)}>
      <QuickFactsCard
        title={t("outlet.quickFacts")}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        weatherLoadingText={t("weather.loading")}
        weatherUnavailableText={t("weather.unavailable")}
        cityName={cityNames[outlet.cityId] || outlet.cityId}
        openingHoursLabel={t("outlet.openingHours")}
        openingHours={outlet.openingHours}
        addressLabel={t("outlet.address")}
        address={outlet.address}
        storesCountText={outlet.storesCountText}
        cityCenterDistanceKm={outlet.cityCenterDistanceKm}
        airportDistanceKm={outlet.airportDistanceKm}
        reviewCountLabel={t("outlet.reviewCount")}
        reviewCount={outletReviews.length || outlet.reviewCount}
        rating={outlet.rating}
        airportSummary={airportSummary}
        onPressStores={() => scrollToSection("brands")}
        onPressTaxFree={() => scrollToSection("taxFree")}
        onPressAirport={() => scrollToSection("transport")}
        onPressRating={() => scrollToSection("reviews")}
      />
      </View>

      <View onLayout={(event) => setSectionPosition("taxFree", event.nativeEvent.layout.y)}>
      <TaxFreeCard
title="Tax Free"
vatRate={outlet.vatRate}
refundRate={
(outlet as any).estimatedRefundRate > 0
? `≈${(outlet as any).estimatedRefundRate}%`
: "Not Available"
}
minimumSpend={outlet.minimumTaxFreeSpend}
officeInfo={outlet.taxFreeOfficeInfo}
/>
      </View>

      <View onLayout={(event) => setSectionPosition("brands", event.nativeEvent.layout.y)}>
      <BrandsCard
        title={t("outlet.brands")}
        brandSearch={brandSearch}
        setBrandSearch={setBrandSearch}
        openCategory={openCategory}
        setOpenCategory={setOpenCategory}
        brandCategoryGroups={brandCategoryGroups}
      />
      </View>

      <View onLayout={(event) => setSectionPosition("transport", event.nativeEvent.layout.y)}>
      <TransportationCard
        title={t("outlet.transportation")}
        transportationItems={transportationItems}
        notAvailableText={t("common.notAvailable")}
        buttonText={t("outlet.viewTransportationGuide")}
        onPressGuide={() =>
          navigation.navigate("Transportation", {
            outletId: outlet.outletId,
          })
        }
      />
      </View>

      <MapsCard
        title={t("outlet.maps")}
        googleText={t("outlet.googleMaps")}
        appleText={t("outlet.appleMaps")}
        yandexText={t("outlet.yandexMaps")}
        onPressGoogle={() => Linking.openURL(outlet.googleMapsUrl)}
        onPressApple={() => Linking.openURL(outlet.appleMapsUrl)}
        onPressYandex={() => Linking.openURL(outlet.yandexMapsUrl)}
      />

      <WebsiteCard
        title={t("website.title")}
        description={t("website.description")}
        buttonText={t("website.visit")}
        onPress={() => Linking.openURL(outlet.websiteUrl)}
      />

      <View onLayout={(event) => setSectionPosition("food", event.nativeEvent.layout.y)}>
      <RestaurantsCard
        title={t("outlet.restaurantsCafes")}
        restaurants={restaurantItems}
        notAvailableText={t("common.notAvailable")}
      />
      </View>

      <ServicesCard
        title={t("outlet.services")}
        services={outlet.services}
        notAvailableText={t("common.notAvailable")}
      />

      <View style={styles.reviewCard} onLayout={(event) => setSectionPosition("reviews", event.nativeEvent.layout.y)}>
        <Text style={styles.sectionTitle}>{t("outlet.reviews")}</Text>

        <ReviewStatsCard
          summaryText={`⭐ ${averageRating} (${outletReviews.length} ${t(
            "outlet.reviewLabel"
          )})`}
          transportationTitle={t("outlet.transportationRating")}
          transportationValue={averageTransportationRating}
          brandsTitle={t("outlet.brandsRating")}
          brandsValue={averageBrandVarietyRating}
          restaurantsTitle={t("outlet.restaurantsRating")}
          restaurantsValue={averageRestaurantsRating}
          servicesTitle={t("outlet.servicesRating")}
          servicesValue={averageServicesRating}
        />

        <ReviewTabs
          activeTab={reviewSort}
          helpfulText={t("outlet.mostHelpful")}
          recentText={t("outlet.recent")}
          onChangeTab={setReviewSort}
        />

        {!currentUserReview && (
          <WriteReviewButton
            title={t("outlet.writeReview")}
            onPress={() => {
              if (!requireAuth({ isLoggedIn, navigation })) {
                return;
              }

              navigation.navigate("WriteReview", {
                outletId: outlet.outletId,
              });
            }}
          />
        )}

        {outletReviews.length > 0 ? (
          sortedReviews.map((review) => {
            const helpfulItem = getHelpfulItem(review.reviewId);

            return (
              <ReviewItem
                key={review.reviewId}
                userName={review.userName}
                rating={getReviewAverage(review)}
                comment={review.comment}
                createdAt={review.createdAt}
                isEdited={review.isEdited}
                updatedAt={review.updatedAt}
                previousComment={review.previousComment}
                editedText={t("outlet.edited")}
                previousCommentTitle={t("outlet.previousComment")}
                helpfulText={t("outlet.helpful")}
                helpfulCount={helpfulItem.helpfulCount}
                isHelpfulByCurrentUser={helpfulItem.isHelpfulByCurrentUser}
                canEdit={currentUser?.userId === review.userId}
                editText={t("outlet.editReview")}
                onPressHelpful={() => toggleHelpful(review.reviewId)}
                onPressEdit={() => {
                  if (!requireAuth({ isLoggedIn, navigation })) {
                    return;
                  }

                  navigation.navigate("WriteReview", {
                    outletId: outlet.outletId,
                    reviewId: review.reviewId,
                  });
                }}
              />
            );
          })
        ) : (
          <Text style={styles.emptyText}>{t("outlet.noReviews")}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.xl,
    paddingTop: 64,
    paddingBottom: 120,
  },

  galleryModal: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  galleryModalImageWrapper: {
    width: "100%",
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
  },

  galleryModalImage: {
    width: screenWidth,
    height: screenHeight * 0.75,
  },

  galleryCloseButton: {
    position: "absolute",
    top: 60,
    right: spacing.xl,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  galleryCloseText: {
    color: colors.textInverse,
    fontWeight: "900",
    fontSize: typography.body,
  },

  galleryArrowLeft: {
    position: "absolute",
    left: spacing.sm,
    zIndex: 10,
    padding: spacing.lg,
  },

  galleryArrowRight: {
    position: "absolute",
    right: spacing.sm,
    zIndex: 10,
    padding: spacing.lg,
  },

  galleryArrowText: {
    color: colors.textInverse,
    fontSize: 54,
    fontWeight: "300",
  },

  galleryZoomScroll: {
    width: screenWidth,
    height: screenHeight * 0.75,
  },

  galleryZoomContent: {
    justifyContent: "center",
    alignItems: "center",
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  badge: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
    overflow: "hidden",
  },

  ctaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  ctaButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
  },

  ctaButtonActive: {
    backgroundColor: colors.gold,
  },

  ctaIcon: {
    color: colors.textInverse,
    fontSize: 19,
    fontWeight: typography.weightBlack,
    marginBottom: spacing.xs,
  },

  ctaText: {
    color: colors.textInverse,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },

  anchorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  anchorPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    overflow: "hidden",
  },

  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: "900",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
