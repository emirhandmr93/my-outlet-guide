import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { countries } from "../constants/countries";
import { outlets } from "../constants/outlets";
import { getTaxFreeRule, taxFreeRules } from "../constants/taxFreeRules";
import { useFavorites } from "../contexts/FavoritesContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { getImageSource, getOutletCardHeroImage } from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import { getCityName } from "../services/locationService";
import { formatRating } from "../services/reviewsRatingsService";
import { requireAuth } from "../utils/requireAuth";

type RouteParams = {
  Country: {
    countryId?: string;
  };
};

type OutletItem = (typeof outlets)[number];

function hasTaxFree(value: unknown) {
  return value === true || value === "TRUE" || value === "true";
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function OutletCard({
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
  const { t } = useTranslation();
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
              ? t("country.taxFree")
              : t("country.limited")}
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
          {getCityName(outlet.cityId)} • {outlet.storesCountText}
        </Text>
        <Text style={styles.tapText}>{t("country.viewOutlet")}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function CountryScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RouteParams, "Country">>();
  const { isLoggedIn } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites();

  const countryId = route.params?.countryId || "france";
  const country =
    countries.find((item) => item.countryId === countryId) || countries[0];
  const rule = getTaxFreeRule(country.countryId) || taxFreeRules[0];
  const countryOutlets = outlets.filter(
    (outlet) => outlet.countryId === country.countryId,
  );
  const shoppingCities = Array.from(
    new Set(countryOutlets.map((outlet) => outlet.cityId)),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroFlag}>{country.countryFlag}</Text>
        <Text style={styles.heroTitle}>{country.countryName}</Text>
        <Text style={styles.heroText}>
          {t("country.heroPrefix")} {country.countryName}.
        </Text>
      </View>

      <View style={styles.infoGrid}>
        <InfoCard title={t("country.currency")} value={country.currency} />
        <InfoCard
          title={t("country.taxFree")}
          value={
            hasTaxFree(country.taxFreeAvailable)
              ? t("country.yes")
              : t("country.limited")
          }
        />
        <InfoCard title={t("country.vatRate")} value={`${rule.vatRate}%`} />
        <InfoCard
          title={t("country.minimum")}
          value={`${rule.currency} ${rule.minimumPurchaseAmount ?? 0}`}
        />
      </View>

      <Text style={styles.sectionTitle}>{t("country.shoppingCities")}</Text>
      {shoppingCities.map((cityId) => (
        <TouchableOpacity
          key={cityId}
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("CityResults", { cityId })}
        >
          <Text style={styles.cardTitle}>{getCityName(cityId)}</Text>
          <Text style={styles.cardText}>{t("country.viewOutletsInCity")}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>
        {countryOutlets.length} {t("country.outletsAvailable")}
      </Text>
      {countryOutlets.map((outlet) => (
        <OutletCard
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

      <Text style={styles.sectionTitle}>{t("country.quickAccess")}</Text>
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("TaxFreeCalculator")}
      >
        <Text style={styles.actionButtonText}>
          {t("country.taxFreeCalculator")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButtonSecondary}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("TaxFreeGuide")}
      >
        <Text style={styles.actionButtonSecondaryText}>
          {t("country.taxFreeGuide")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
  heroFlag: { fontSize: 38, marginBottom: 10 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroText: { color: "#D8DEE9", fontSize: 15, lineHeight: 22 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoTitle: { color: "#666666", fontSize: 13, fontWeight: "800" },
  infoValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
    color: "#0B1F3A",
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 21,
    fontWeight: "900",
    color: "#0B1F3A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  outletImage: { width: "100%", height: 150, backgroundColor: "#E5E7EB" },
  outletImagePlaceholder: {
    height: 140,
    backgroundColor: "#0B1F3A",
    alignItems: "center",
    justifyContent: "center",
  },
  outletImageIcon: { fontSize: 40 },
  outletContent: { padding: 18 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  },
  rating: { color: "#C9A227", fontWeight: "900" },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  cardTitle: { fontSize: 18, fontWeight: "900", color: "#0B1F3A" },
  cardText: {
    marginTop: 6,
    color: "#666666",
    lineHeight: 21,
    fontWeight: "600",
  },
  tapText: { marginTop: 12, color: "#0B1F3A", fontWeight: "900" },
  actionButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
  },
  actionButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonSecondaryText: {
    color: "#0B1F3A",
    textAlign: "center",
    fontWeight: "900",
  },
});
