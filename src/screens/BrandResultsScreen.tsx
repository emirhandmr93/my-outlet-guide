import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

import { brands } from "../constants/brands/index";
import { outletBrands } from "../constants/outletBrands/index";
import { outlets } from "../constants/outlets";
import { countries } from "../constants/countries";
import { CountryFlag } from "../components/CountryFlag";
import { useFavorites } from "../contexts/FavoritesContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { getImageSource, getOutletCardHeroImage } from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../utils/locationDisplay";
import { requireAuth } from "../utils/requireAuth";
import { recordRecentVisit } from "../services/recentVisitsService";

type RouteParams = {
  BrandResults: {
    brandId: string;
    mode?: "chooseCountry";
  };
};

type OutletItem = (typeof outlets)[number];

function OutletCard({
  outlet,
  isFavorite,
  onPress,
  onToggleFavorite,
  language,
  cardStyle,
  imageStyle,
}: {
  outlet: OutletItem;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  language: ReturnType<typeof useTranslation>["language"];
  cardStyle?: object;
  imageStyle?: object;
}) {
  const { t } = useTranslation();
  const heroImage = getOutletCardHeroImage(outlet, {
    mode: getConfiguredOutletMediaMode(),
  });
  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {heroImage ? (
        <Image
          source={getImageSource(heroImage)}
          style={[styles.outletImage, imageStyle]}
        />
      ) : null}
      <View style={styles.outletContent}>
        <View style={styles.outletHeaderRow}>
          <Text style={styles.outletName} numberOfLines={2}>
            {outlet.name}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? t("outlet.removeFavorite") : t("outlet.addFavorite")
            }
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.outletLocation}>
          {formatCityDisplayName(outlet.cityId, language)}, {" "}
          {formatCountryDisplayName(outlet.countryId, language)}
        </Text>
        <Text style={styles.tapText}>{t("brand.viewOutlet")}</Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function BrandResultsScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RouteParams, "BrandResults">>();
  const { isLoggedIn } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const desktopSidebarWidth = 216;
  const desktopHorizontalPadding = 68;
  const contentWidth = Math.min(
    Math.max(width - desktopSidebarWidth - desktopHorizontalPadding, 0),
    1180,
  );
  const countryCardWidth = (contentWidth - 24) / 3;
  const outletColumnCount = contentWidth >= 960 ? 3 : 2;
  const outletCardWidth =
    (contentWidth - 12 * (outletColumnCount - 1)) / outletColumnCount;

  const brand =
    brands.find((item) => item.brandId === route.params?.brandId) || brands[0];
  const visitedBrand = brands.find((item) => item.brandId === route.params?.brandId);

  useEffect(() => {
    if (Platform.OS !== "web" && visitedBrand) void recordRecentVisit("brand", visitedBrand.brandId);
  }, [visitedBrand?.brandId]);

  const matchingOutletIds = outletBrands
    .filter(
      (item) =>
        item.brandId === brand.brandId && item.relationStatus === "active",
    )
    .map((item) => item.outletId);

  const matchingOutlets = outlets.filter((outlet) =>
    matchingOutletIds.includes(outlet.outletId),
  );

  const countryIds = Array.from(
    new Set(matchingOutlets.map((outlet) => outlet.countryId)),
  );

  const matchingCountries = countries.filter((country) =>
    countryIds.includes(country.countryId),
  );

  function openCountryResults(countryId: string) {
    navigation.navigate("BrandResults", {
      brandId: brand.brandId,
      mode: "chooseCountry",
      selectedCountryId: countryId,
    });
  }

  const selectedCountryId = (route.params as any)?.selectedCountryId;

  const visibleOutlets = selectedCountryId
    ? matchingOutlets.filter((outlet) => outlet.countryId === selectedCountryId)
    : [];

  const selectedCountry = countries.find(
    (country) => country.countryId === selectedCountryId,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktopWeb
          ? styles.desktopContent
          : {
              paddingTop: getScreenTopInset(insets.top),
              paddingBottom: getFloatingTabClearance(insets.bottom),
            },
      ]}
      scrollIndicatorInsets={{
        top: getScreenTopInset(insets.top),
        bottom: getScrollIndicatorBottomInset(insets.bottom),
      }}
    >
      <View style={[styles.innerContent, isDesktopWeb && { width: contentWidth }]}>
        <View style={[styles.heroCard, isDesktopWeb && styles.desktopHeroCard]}>
          <Text style={styles.heroLabel}>{t("brand.heroLabel")}</Text>
          <Text style={[styles.heroTitle, isDesktopWeb && styles.desktopHeroTitle]}>
            {brand.brandName}
          </Text>
          <Text style={[styles.heroText, isDesktopWeb && styles.desktopHeroText]}>
            {t("brand.heroText")}
          </Text>
        </View>

        {!selectedCountryId ? (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{t("brand.chooseCountry")}</Text>

            <View style={isDesktopWeb && styles.desktopGrid}>
              {matchingCountries.map((country) => (
                <TouchableOpacity
                  key={country.countryId}
                  activeOpacity={0.88}
                  style={[
                    styles.countryRow,
                    isDesktopWeb && { width: countryCardWidth, marginBottom: 0 },
                  ]}
                  onPress={() => openCountryResults(country.countryId)}
                >
                  <CountryFlag countryId={country.countryId} size={28} style={styles.countryFlag} />

                  <View style={styles.countryContent}>
                    <Text style={styles.countryName} numberOfLines={2}>
                      {formatCountryDisplayName(country.countryId, language)}
                    </Text>
                    <Text style={styles.countryMeta}>
                      {
                        matchingOutlets.filter(
                          (outlet) => outlet.countryId === country.countryId,
                        ).length
                      }{" "}
                      {t("brand.outlets")}
                    </Text>
                  </View>

                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>

            {matchingCountries.length === 0 ? (
              <View style={isDesktopWeb && styles.desktopEmptyCard}>
                <EmptyCard
                  title={t("brand.noOutletLocationTitle")}
                  text={t("brand.noOutletLocationText")}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>
              {brand.brandName} {t("brand.in")} {" "}
              {selectedCountry
                ? formatCountryDisplayName(selectedCountry.countryId, language)
                : ""}
            </Text>

            <View style={isDesktopWeb && styles.desktopGrid}>
              {visibleOutlets.map((outlet) => (
                <OutletCard
                  key={outlet.outletId}
                  outlet={outlet}
                  language={language}
                  cardStyle={
                    isDesktopWeb
                      ? { width: outletCardWidth, marginBottom: 0 }
                      : undefined
                  }
                  imageStyle={
                    isDesktopWeb ? styles.desktopOutletImage : undefined
                  }
                  isFavorite={isFavorite(outlet.outletId)}
                  onPress={() =>
                    navigation.navigate("OutletDetail", {
                      outletId: outlet.outletId,
                    })
                  }
                  onToggleFavorite={() => {
                    if (requireAuth({ isLoggedIn, navigation })) {
                      toggleFavorite(outlet.outletId);
                    }
                  }}
                />
              ))}
            </View>

            {visibleOutlets.length === 0 ? (
              <View style={isDesktopWeb && styles.desktopEmptyCard}>
                <EmptyCard
                  title={t("brand.noOutletTitle")}
                  text={t("brand.noOutletText")}
                />
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.86}
              style={[styles.backButton, isDesktopWeb && styles.desktopBackButton]}
              onPress={() =>
                navigation.navigate("BrandResults", {
                  brandId: brand.brandId,
                  mode: "chooseCountry",
                  selectedCountryId: undefined,
                })
              }
            >
              <Text style={styles.backText}>
                {t("brand.chooseAnotherCountry")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 152 },
  desktopContent: {
    width: "100%",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  innerContent: { width: "100%" },

  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
  },
  desktopHeroCard: { minHeight: 220, padding: 32, justifyContent: "center" },

  heroLabel: {
    color: "#C9A227",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  desktopHeroTitle: { fontSize: 38, lineHeight: 46 },

  heroText: {
    color: "#D8DEE9",
    fontSize: 15,
    lineHeight: 22,
  },
  desktopHeroText: { maxWidth: 640 },

  sectionBlock: { marginBottom: 18 },
  desktopGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 14,
  },

  countryRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  countryFlag: {
    fontSize: 30,
    marginRight: 14,
  },

  countryContent: {
    flex: 1,
    minWidth: 0,
  },

  countryName: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    flexShrink: 1,
  },

  countryMeta: {
    color: "#687386",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },

  arrow: {
    color: "#C9A227",
    fontSize: 22,
    fontWeight: "900",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  outletImage: { width: "100%", height: 156, backgroundColor: "#E5E7EB" },
  desktopOutletImage: { height: 174 },

  outletContent: { padding: 18 },
  outletHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  outletName: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: "900",
    color: "#0B1F3A",
    lineHeight: 23,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  favoriteButtonActive: {
    backgroundColor: "#FFF8E1",
    borderColor: "#C9A227",
  },
  favoriteButtonText: { color: "#C9A227", fontSize: 20, fontWeight: "900" },

  outletLocation: {
    marginTop: 6,
    color: "#666666",
    fontWeight: "700",
    lineHeight: 20,
    flexShrink: 1,
  },

  tapText: {
    marginTop: 12,
    color: "#0B1F3A",
    fontWeight: "900",
  },

  backButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  desktopBackButton: { width: 320, alignSelf: "flex-start" },

  backText: {
    color: "#C9A227",
    fontWeight: "900",
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  desktopEmptyCard: { width: "100%", maxWidth: 540, alignSelf: "center" },

  emptyTitle: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#666666",
    lineHeight: 21,
  },
});
