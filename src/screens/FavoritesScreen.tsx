import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { outlets } from "../constants/outlets";
import { useFavorites } from "../contexts/FavoritesContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../utils/locationDisplay";

export function FavoritesScreen() {
  const { favoriteIds, favoritesError } = useFavorites();
  const { isLoggedIn } = useUser();
  const { t, language } = useTranslation();
  const navigation = useNavigation<any>();

  const favoriteOutlets = outlets.filter((outlet) =>
    favoriteIds.includes(outlet.outletId),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("favorites.title")}</Text>
      <Text style={styles.pageSubtitle}>{t("favorites.subtitle")}</Text>

      {favoritesError === "permission-denied" ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("favorites.signInTitle")}</Text>

          <Text style={styles.emptyText}>
            {t("favorites.permissionDenied")}
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.signInButtonText}>{t("profile.signIn")}</Text>
          </TouchableOpacity>
        </View>
      ) : !isLoggedIn ? (
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
      ) : favoriteOutlets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t("favorites.emptyTitle")}</Text>

          <Text style={styles.emptyText}>{t("favorites.emptyText")}</Text>
        </View>
      ) : (
        favoriteOutlets.map((outlet) => (
          <TouchableOpacity
            key={outlet.outletId}
            style={styles.card}
            activeOpacity={0.86}
            onPress={() =>
              navigation.navigate("OutletDetail", { outletId: outlet.outletId })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardCopy}>
                <Text style={styles.cardLabel}>{t("favorites.cardLabel")}</Text>

                <Text style={styles.cardTitle}>{outlet.name}</Text>

                <Text style={styles.cardText}>
                  {formatCityDisplayName(outlet.cityId, language)},{" "}
                  {formatCountryDisplayName(outlet.countryId, language)}
                </Text>
              </View>

              <Text style={styles.cardArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))
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
    marginLeft: 12,
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
