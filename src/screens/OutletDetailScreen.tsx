import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

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
import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";
import { useReviews } from "../contexts/ReviewsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  getImageSource,
  getOutletMediaImages,
  type OutletMediaImage,
} from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import { getBrandCategoryGroupsForOutlet } from "../services/brandService";
import { getRestaurantsForOutlet } from "../services/restaurantService";
import { getOutletTransportationV2Summary } from "../services/transportationV2Service";
import { CurrentWeather, getCurrentWeather } from "../services/weatherService";
import {
  getAverageReviewRating,
  getCategoryAverage,
  getPublishedReviews,
  isFirestorePermissionDenied,
} from "../services/reviewsRatingsService";
import { requireAuth } from "../utils/requireAuth";
import { requireReviewAuth } from "../utils/reviewAuthGuard";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const outletMediaMode = getConfiguredOutletMediaMode();

type RouteParams = {
  OutletDetail: {
    outletId: string;
    reviewsRefresh?: number;
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

export function OutletDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "OutletDetail">>();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { reviews, deleteReview, reportReview, toggleHelpful, loadReviews } = useReviews();
  const { currentUser, isLoggedIn } = useUser();
  const { toggleFavorite, isFavorite } = useFavorites();

  const outlet =
    outlets.find((item) => item?.outletId === route.params?.outletId) ||
    outlets.find((item) => Boolean(item)) ||
    outlets[0];

  const safeGalleryImages = useMemo(() => {
    return getOutletMediaImages(outlet, { mode: outletMediaMode });
  }, [outlet.galleryImages, outlet.heroImage, outlet.outletId]);

  const [selectedImage, setSelectedImage] = useState<OutletMediaImage | null>(
    safeGalleryImages[0] ?? null,
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [reviewSort, setReviewSort] = useState<"helpful" | "recent">("helpful");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const [sectionPositions, setSectionPositions] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (route.params?.reviewsRefresh) {
      loadReviews();
    }
  }, [loadReviews, route.params?.reviewsRefresh]);

  useEffect(() => {
    setSelectedImage(safeGalleryImages[0] ?? null);
  }, [safeGalleryImages]);

  useEffect(() => {
    async function loadWeather() {
      try {
        setWeatherLoading(true);
        setWeatherError(false);

        const result = await getCurrentWeather(
          Number(outlet.latitude),
          Number(outlet.longitude),
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
  const transportationSummaryItems = getOutletTransportationV2Summary(outlet.outletId);
  const restaurantItems = getRestaurantsForOutlet(outlet.outletId);
  const outletReviews = getPublishedReviews(
    reviews.filter((review) => review.outletId === outlet.outletId),
  );
  const averageRating = getAverageReviewRating(outletReviews);
  const currentUserReview = currentUser
    ? outletReviews.find((review) => review.userId === currentUser.userId)
    : undefined;

  const sortedReviews = [...outletReviews].sort((a, b) => {
    if (reviewSort === "helpful") {
      return (
        (b.helpfulCount || 0) - (a.helpfulCount || 0) ||
        b.createdAt.localeCompare(a.createdAt)
      );
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
  const showReviewActionError = (error: unknown) => {
    console.log("Review action error", error);
    Alert.alert(
      t("review.actionErrorTitle"),
      isFirestorePermissionDenied(error)
        ? t("review.actionPermissionErrorText")
        : t("common.error"),
    );
  };

  const currentGalleryIndex = selectedImage
    ? safeGalleryImages.indexOf(selectedImage)
    : -1;

  const airportSummary =
    Array.isArray(outlet.airports) && outlet.airports.length > 0
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
    if (weatherLoading) return t("weather.title");
    if (weatherError || !weather) return t("weather.unavailable");
    return `${weather.icon || "⛅"} ${weather.temperature}°C`;
  }

  function showPreviousImage() {
    if (safeGalleryImages.length === 0) {
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
      return;
    }

    if (currentGalleryIndex === safeGalleryImages.length - 1) {
      setSelectedImage(safeGalleryImages[0]);
      return;
    }

    setSelectedImage(safeGalleryImages[currentGalleryIndex + 1]);
  }

  return (
    <View style={styles.screenRoot}>
      <View
        pointerEvents="none"
        style={[styles.topSafeScrim, { height: insets.top }]}
      />
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: getScreenTopInset(insets.top),
            paddingBottom: getFloatingTabClearance(insets.bottom),
          },
        ]}
        scrollIndicatorInsets={{
          top: getScreenTopInset(insets.top),
          bottom: getScrollIndicatorBottomInset(insets.bottom),
        }}
      >
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
          onPressHeroImage={() => {
            if (selectedImage) {
              setIsGalleryOpen(true);
            }
          }}
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
              <Text style={styles.galleryCloseText}>
                {t("outlet.galleryClose")}
              </Text>
            </TouchableOpacity>

            <View style={styles.galleryModalImageWrapper}>
              <TouchableOpacity
                style={styles.galleryArrowLeft}
                onPress={showPreviousImage}
              >
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
                {selectedImage ? (
                  <Image
                    source={getImageSource(selectedImage)}
                    style={styles.galleryModalImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.galleryNoImagePlaceholder}>
                    <Text style={styles.galleryNoImageIcon}>🛍️</Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.galleryArrowRight}
                onPress={showNextImage}
              >
                <Text style={styles.galleryArrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{getWeatherBadgeText()}</Text>
          <Text style={styles.badge}>{outlet.status}</Text>
          {averageRating ? (
            <Text style={styles.badge}>⭐ {averageRating}</Text>
          ) : null}
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
            <Text style={styles.ctaText}>
              {favorite ? t("outlet.saved") : t("outlet.favorite")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.ctaButton}
            onPress={() => {
              if (!requireAuth({ isLoggedIn, navigation })) {
                return;
              }

              navigation.navigate("CreateTrip", { outletId: outlet.outletId });
            }}
          >
            <Text style={styles.ctaIcon}>🧳</Text>
            <Text style={styles.ctaText}>{t("outlet.createTrip")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.ctaButton}
            onPress={() => Linking.openURL(outlet.googleMapsUrl)}
          >
            <Text style={styles.ctaIcon}>📍</Text>
            <Text style={styles.ctaText}>{t("outlet.directions")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.anchorRow}>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => scrollToSection("overview")}
          >
            <Text style={styles.anchorPill}>{t("outlet.anchorOverview")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => scrollToSection("brands")}
          >
            <Text style={styles.anchorPill}>{t("outlet.anchorBrands")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => scrollToSection("transport")}
          >
            <Text style={styles.anchorPill}>{t("outlet.anchorTransport")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => scrollToSection("food")}
          >
            <Text style={styles.anchorPill}>{t("outlet.anchorFood")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() => scrollToSection("reviews")}
          >
            <Text style={styles.anchorPill}>{t("outlet.anchorReviews")}</Text>
          </TouchableOpacity>
        </View>

        <View
          onLayout={(event) =>
            setSectionPosition("overview", event.nativeEvent.layout.y)
          }
        >
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
            reviewCount={outletReviews.length}
            rating={averageRating ?? undefined}
            airportSummary={airportSummary}
            onPressStores={() => scrollToSection("brands")}
            onPressTaxFree={() => scrollToSection("taxFree")}
            onPressAirport={() => scrollToSection("transport")}
            onPressRating={() => scrollToSection("reviews")}
          />
        </View>

        <View
          onLayout={(event) =>
            setSectionPosition("taxFree", event.nativeEvent.layout.y)
          }
        >
          <TaxFreeCard
            title={t("outlet.taxFree")}
            vatRate={outlet.vatRate}
            minimumSpend={outlet.minimumTaxFreeSpend}
            officeInfo={outlet.taxFreeOfficeInfo}
          />
        </View>

        <View
          onLayout={(event) =>
            setSectionPosition("brands", event.nativeEvent.layout.y)
          }
        >
          <BrandsCard
            title={t("outlet.brands")}
            brandSearch={brandSearch}
            setBrandSearch={setBrandSearch}
            openCategory={openCategory}
            setOpenCategory={setOpenCategory}
            brandCategoryGroups={brandCategoryGroups}
          />
        </View>

        <View
          onLayout={(event) =>
            setSectionPosition("transport", event.nativeEvent.layout.y)
          }
        >
          <TransportationCard
            title={t("outlet.transportation")}
            summaryItems={transportationSummaryItems}
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

        <View
          onLayout={(event) =>
            setSectionPosition("food", event.nativeEvent.layout.y)
          }
        >
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

        <View
          style={styles.reviewCard}
          onLayout={(event) =>
            setSectionPosition("reviews", event.nativeEvent.layout.y)
          }
        >
          <View style={styles.reviewHeaderRow}>
            <View style={styles.reviewHeaderText}>
              <Text style={styles.sectionTitle}>{t("outlet.reviews")}</Text>
              <Text style={styles.reviewSubtitle}>
                {t("outlet.reviewSharePrompt")}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.writeReviewButton}
              onPress={() => {
                if (
                  requireReviewAuth({
                    navigation,
                    user: currentUser,
                    action: "writeReview",
                    message: t("review.signInToWrite"),
                  })
                ) {
                  navigation.navigate("WriteReview", {
                    outletId: outlet.outletId,
                    reviewId: currentUserReview?.reviewId,
                  });
                }
              }}
            >
              <Text style={styles.writeReviewButtonText}>
                {currentUserReview ? t("writeReview.editTitle") : t("writeReview.title")}
              </Text>
            </TouchableOpacity>
          </View>

          <ReviewStatsCard
            summaryText={`⭐ ${averageRating ?? "0.0"} (${outletReviews.length} ${t(
              "outlet.reviewLabel",
            )})`}
            transportationTitle={t("outlet.transportationRating")}
            transportationValue={getCategoryAverage(outletReviews, "transportation")}
            brandsTitle={t("outlet.brandsRating")}
            brandsValue={getCategoryAverage(outletReviews, "brands")}
            restaurantsTitle={t("outlet.restaurantsRating")}
            restaurantsValue={getCategoryAverage(outletReviews, "restaurants")}
            servicesTitle={t("outlet.servicesRating")}
            servicesValue={getCategoryAverage(outletReviews, "services")}
          />

          <View style={styles.reviewSortRow}>
            {[
              { key: "helpful" as const, label: t("outlet.reviewSortHelpful") },
              { key: "recent" as const, label: t("outlet.reviewSortRecent") },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.84}
                style={[
                  styles.reviewSortPill,
                  reviewSort === item.key && styles.reviewSortPillActive,
                ]}
                onPress={() => setReviewSort(item.key)}
              >
                <Text
                  style={[
                    styles.reviewSortText,
                    reviewSort === item.key && styles.reviewSortTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {outletReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <ReviewItem
                key={review.reviewId}
                review={review}
                currentUserId={currentUser?.userId}
                editedText={t("outlet.edited")}
                helpfulText={t("review.helpful")}
                helpfulActiveText={t("review.helpfulActive")}
                previousCommentLabel={t("outlet.previousComment")}
                previousTitleLabel={t("outlet.previousTitle")}
                editText={t("common.edit")}
                deleteText={t("review.deleteTitle")}
                reportText={t("review.report")}
                anonymousAccountText={t("reviews.anonymousAccount")}
                onHelpful={async () => {
                  if (
                    requireReviewAuth({
                      navigation,
                      user: currentUser,
                      action: "helpful",
                      message: t("review.signInToHelpful"),
                    }) &&
                    currentUser
                  ) {
                    if (review.userId === currentUser.userId) {
                      Alert.alert(t("review.helpfulOwnReviewMessage"));
                      return;
                    }
                    try {
                      await toggleHelpful(review, currentUser.userId);
                    } catch (error) {
                      showReviewActionError(error);
                    }
                  }
                }}
                onEdit={() =>
                  navigation.navigate("WriteReview", {
                    outletId: outlet.outletId,
                    reviewId: review.reviewId,
                  })
                }
                onDelete={() => {
                  if (!currentUser) return;
                  Alert.alert(t("review.deleteTitle"), t("review.deleteBody"), [
                    { text: t("review.deleteCancel"), style: "cancel" },
                    {
                      text: t("review.deleteConfirm"),
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteReview(outlet.outletId, review.reviewId, currentUser.userId);
                        } catch (error) {
                          console.log("Review delete error", error);
                          Alert.alert(t("review.deleteErrorTitle"), t("review.deleteErrorText"));
                        }
                      },
                    },
                  ]);
                }}
                onReport={async () => {
                  if (requireAuth({ isLoggedIn, navigation }) && currentUser) {
                    try {
                      await reportReview(
                        outlet.outletId,
                        review.reviewId,
                        currentUser.userId,
                        "other",
                      );
                    } catch (error) {
                      showReviewActionError(error);
                    }
                  }
                }}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>{t("outlet.noReviews")}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.background },
  topSafeScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.xl,
    paddingTop: 64,
    paddingBottom: 168,
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

  galleryNoImagePlaceholder: {
    width: screenWidth,
    height: screenHeight * 0.75,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  galleryNoImageIcon: {
    fontSize: 56,
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
    flexShrink: 1,
  },

  ctaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  ctaButton: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 104,
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
    flexShrink: 1,
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
    flexShrink: 1,
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

  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  reviewHeaderText: {
    flex: 1,
  },

  reviewSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: typography.weightBold,
    lineHeight: 21,
  },

  reviewSortRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  reviewSortPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },

  reviewSortPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  reviewSortText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
  },

  reviewSortTextActive: {
    color: colors.textInverse,
  },

  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  writeReviewButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },

  writeReviewButtonText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: "900",
  },
});
