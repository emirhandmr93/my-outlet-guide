import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import {
  Image,
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

import { outlets } from "../constants/outlets";
import { CountryFlag } from "../components/CountryFlag";
import { useFavorites } from "../contexts/FavoritesContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { getImageSource, getOutletCardHeroImage } from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import { getCountryName } from "../services/locationService";
import { formatCityDisplayName, formatCountryDisplayName } from "../utils/locationDisplay";
import { formatStoresCountText } from "../utils/outletDisplayFormatters";
import { formatRating } from "../services/reviewsRatingsService";
import { requireAuth } from "../utils/requireAuth";
import { recordRecentVisit } from "../services/recentVisitsService";
import { cities } from "../constants/cities";

type RouteParams = {
  CityResults: {
    cityId: string;
  };
};

type OutletItem = (typeof outlets)[number];

const cityNames: Record<string, string> = {
  paris: "Paris",
  milan: "Milan",
  london: "London",
};

function hasTaxFree(value: unknown) {
  return value === true || value === "TRUE" || value === "true";
}

function StatCard({ value, label }: { value: ReactNode; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OutletResultCard({
  outlet,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  outlet: OutletItem;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const { t, language } = useTranslation();
  const heroImage = getOutletCardHeroImage(outlet, {
    mode: getConfiguredOutletMediaMode(),
  });
  const displayRating = formatRating(outlet.rating);

  return (
    <TouchableOpacity
      style={styles.outletCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {heroImage ? (
        <Image source={getImageSource(heroImage)} style={styles.outletImage} />
      ) : (
        <View style={styles.outletImagePlaceholder}>
          <Text style={styles.outletImageIcon}>🛍️</Text>
        </View>
      )}

      <View style={styles.outletContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardBadge}>
            {hasTaxFree(outlet.taxFreeAvailable)
              ? t("city.taxFree")
              : t("city.limited")}
          </Text>
          <View style={styles.cardActions}>
            {displayRating ? (
              <Text style={styles.rating}>★ {displayRating}</Text>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? t("outlet.removeFavorite")
                  : t("outlet.addFavorite")
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
        </View>

        <Text style={styles.cardTitle}>{outlet.name}</Text>
        <Text style={styles.cardText}>
          {formatCountryDisplayName(outlet.countryId, language)} • {formatStoresCountText(outlet.storesCountText, language)}
        </Text>
        <Text style={styles.tapText}>{t("city.viewOutlet")}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function CityResultsScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RouteParams, "CityResults">>();
  const { isLoggedIn } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites();

  const cityId = route.params?.cityId || "paris";
  const cityName = formatCityDisplayName(cityId, language) || cityNames[cityId] || cityId;
  const cityOutlets = outlets.filter((outlet) => outlet.cityId === cityId);
  const visitedCity = cities.find((item) => item.cityId === route.params?.cityId);

  useEffect(() => {
    if (Platform.OS !== "web" && visitedCity) void recordRecentVisit("city", visitedCity.cityId);
  }, [visitedCity?.cityId]);

  return (
    <ScrollView
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
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("city.heroLabel")}</Text>
        {cityOutlets[0] ? <CountryFlag countryId={cityOutlets[0].countryId} size={36} style={styles.heroFlag} /> : null}
        <Text style={styles.heroTitle}>{cityName}</Text>
        <Text style={styles.heroText}>{t("city.heroText")}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={cityOutlets.length} label={t("city.outlets")} />
        <StatCard
          value={cityOutlets[0] ? <View style={styles.countryStatValue}><CountryFlag countryId={cityOutlets[0].countryId} size={20} /><Text style={styles.statNumber}>{formatCountryDisplayName(cityOutlets[0].countryId, language)}</Text></View> : "—"}
          label={t("city.country")}
        />
      </View>

      <Text style={styles.sectionTitle}>{t("city.availableOutlets")}</Text>
      {cityOutlets.map((outlet) => (
        <OutletResultCard
          key={outlet.outletId}
          outlet={outlet}
          isFavorite={isFavorite(outlet.outletId)}
          onPress={() =>
            navigation.navigate("OutletDetail", { outletId: outlet.outletId })
          }
          onToggleFavorite={() => {
            if (requireAuth({ isLoggedIn, navigation })) {
              toggleFavorite(outlet.outletId);
            }
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 152 },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    color: "#C9A227",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  heroFlag: { marginBottom: 8 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroText: { color: "#D8DEE9", fontSize: 15, lineHeight: 22 },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statNumber: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  countryStatValue: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0B1F3A",
    marginTop: 10,
    marginBottom: 12,
  },
  outletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  outletImage: { width: "100%", height: 168, backgroundColor: "#E5E7EB" },
  outletImagePlaceholder: {
    height: 168,
    backgroundColor: "#0B1F3A",
    alignItems: "center",
    justifyContent: "center",
  },
  outletImageIcon: { fontSize: 40 },
  outletContent: { padding: 18 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  cardBadge: {
    backgroundColor: "#FFF8E1",
    color: "#0B1F3A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    flexShrink: 1,
    maxWidth: "62%",
  },
  rating: { color: "#C9A227", fontWeight: "900", flexShrink: 0 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 6,
    lineHeight: 24,
    flexShrink: 1,
  },
  cardText: {
    color: "#666666",
    lineHeight: 21,
    fontWeight: "600",
    flexShrink: 1,
  },
  dateText: { marginTop: 10, color: "#C9A227", fontWeight: "900" },
  tapText: { marginTop: 12, color: "#0B1F3A", fontWeight: "900" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  emptyText: { color: "#666666", lineHeight: 21 },
});
