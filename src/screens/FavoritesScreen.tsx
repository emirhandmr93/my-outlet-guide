import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { resolveVisibleFavoriteOutlets } from "../utils/favoriteOutlets";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../utils/locationDisplay";

export function FavoritesScreen() {
  const {
    favoriteIds,
    favoritesError,
    favoritesLoading,
    reloadFavorites,
  } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const navigation = useNavigation<any>();

  const favoriteOutlets = resolveVisibleFavoriteOutlets(favoriteIds);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("favorites.title")}</Text>
      <Text style={styles.pageSubtitle}>{t("favorites.subtitle")}</Text>

      {!isAuthenticated ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("favorites.signInTitle")}</Text>

          <Text style={styles.emptyText}>{t("favorites.signInText")}</Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.signInButtonText}>{t("profile.signIn")}</Text>
          </TouchableOpacity>
        </View>
      ) : favoritesLoading && favoriteOutlets.length === 0 ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#0B1F3A" size="large" />
        </View>
      ) : favoritesError && favoriteOutlets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("favorites.title")}</Text>

          <Text style={styles.emptyText}>
            {t("favorites.permissionDenied")}
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => void reloadFavorites()}
          >
            <Text style={styles.signInButtonText}>
              {t("brandWishlist.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : favoriteOutlets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("favorites.emptyTitle")}</Text>

          <Text style={styles.emptyText}>{t("favorites.emptyText")}</Text>
        </View>
      ) : (
        <>
          {favoritesError ? (
            <View style={styles.syncWarning}>
              <Text style={styles.syncWarningText}>
                {t("favorites.permissionDenied")}
              </Text>
              <TouchableOpacity onPress={() => void reloadFavorites()}>
                <Text style={styles.syncWarningAction}>
                  {t("brandWishlist.retry")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {favoriteOutlets.map((outlet) => (
            <TouchableOpacity
              key={outlet.outletId}
              style={styles.card}
              activeOpacity={0.86}
              onPress={() =>
                navigation.navigate("OutletDetail", {
                  outletId: outlet.outletId,
                })
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardLabel}>
                    {t("favorites.cardLabel")}
                  </Text>

                  <Text style={styles.cardTitle}>{outlet.name}</Text>

                  <Text style={styles.cardText}>
                    {formatCityDisplayName(outlet.cityId, language)},{" "}
                    {formatCountryDisplayName(outlet.countryId, language)}
                  </Text>
                </View>

                <Text style={styles.cardArrow}>
                  {isNativeRTL ? "‹" : "›"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1F3A",
  },

  pageSubtitle: {
    fontSize: 15,
    color: "#C9A227",
    marginTop: 6,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardCopy: {
    flex: 1,
  },

  cardArrow: {
    fontSize: 28,
    color: "#C9A227",
    fontWeight: "700",
    marginStart: 12,
  },

  cardLabel: {
    fontSize: 13,
    color: "#C9A227",
    fontWeight: "700",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },

  syncWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7DA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  syncWarningText: {
    flex: 1,
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
  },

  syncWarningAction: {
    color: "#0B1F3A",
    fontSize: 13,
    fontWeight: "900",
    marginStart: 12,
  },

  signInButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },

  signInButtonText: {
    color: "#C9A227",
    fontWeight: "900",
  },
});
