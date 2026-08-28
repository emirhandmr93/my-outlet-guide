import { useNavigation } from "@react-navigation/native";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { brands } from "../constants/brands";
import { outletBrands } from "../constants/outletBrands";
import { outlets } from "../constants/outlets";
import { isWebSeoPublicOutlet } from "../constants/webSeo";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";

function interpolate(template: string, count: number) {
  return template.replace("{count}", String(count));
}

export function BrandWishlistScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const {
    favoriteBrandIds,
    favoritesError,
    favoritesLoading,
    reloadFavorites,
    toggleFavoriteBrand,
  } = useFavorites();
  const wishlistedBrands = brands
    .filter((brand) => brand.brandStatus === "active" && favoriteBrandIds.includes(brand.brandId))
    .sort((first, second) => first.brandName.localeCompare(second.brandName));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("brandWishlist.title")}</Text>
      <Text style={styles.subtitle}>{t("brandWishlist.subtitle")}</Text>

      {!isAuthenticated ? (
        <MessageCard
          title={t("brandWishlist.signInTitle")}
          text={t("brandWishlist.signInText")}
          buttonText={t("profile.signIn")}
          onPress={() => navigation.navigate("Login")}
        />
      ) : favoritesLoading ? (
        <View style={styles.messageCard}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.messageTitle, styles.loadingTitle]}>
            {t("brandWishlist.loadingTitle")}
          </Text>
          <Text style={[styles.messageText, styles.loadingText]}>
            {t("brandWishlist.loadingText")}
          </Text>
        </View>
      ) : favoritesError && wishlistedBrands.length === 0 ? (
        <MessageCard
          title={t("brandWishlist.errorTitle")}
          text={t("brandWishlist.permissionDenied")}
          buttonText={t("brandWishlist.retry")}
          onPress={() => void reloadFavorites()}
        />
      ) : wishlistedBrands.length === 0 ? (
        <MessageCard
          title={t("brandWishlist.emptyTitle")}
          text={t("brandWishlist.emptyText")}
          buttonText={t("brandWishlist.explore")}
          onPress={() => navigation.navigate("MainTabs", { screen: "Explore" })}
        />
      ) : (
        <>
          {favoritesError ? (
            <View style={styles.syncWarning}>
              <Text style={styles.syncWarningText}>
                {t("brandWishlist.permissionDenied")}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void reloadFavorites()}
              >
                <Text style={styles.syncWarningAction}>
                  {t("brandWishlist.retry")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {wishlistedBrands.map((brand) => {
            const matchingOutletIds = new Set(outletBrands.filter(
              (relation) => relation.brandId === brand.brandId && relation.relationStatus === "active",
            ).map((relation) => relation.outletId));
            const outletCount = outlets.filter((outlet) =>
              matchingOutletIds.has(outlet.outletId) &&
              outlet.status === "active" &&
              (Platform.OS !== "web" || isWebSeoPublicOutlet(outlet)),
            ).length;
            return (
              <TouchableOpacity
                key={brand.brandId}
                activeOpacity={0.86}
                style={styles.brandCard}
                onPress={() => navigation.navigate("BrandResults", { brandId: brand.brandId })}
              >
                <View style={styles.brandCopy}>
                  <Text style={styles.brandName}>{brand.brandName}</Text>
                  <Text style={styles.brandMeta}>
                    {interpolate(t("brandWishlist.outletCount"), outletCount)}
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t("brandWishlist.remove")}
                  style={styles.removeButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    void toggleFavoriteBrand(brand.brandId);
                  }}
                >
                  <Text style={styles.removeText}>♥</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

function MessageCard({ title, text, buttonText, onPress }: {
  title: string;
  text: string;
  buttonText: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.messageCard}>
      <Text style={styles.messageTitle}>{title}</Text>
      <Text style={styles.messageText}>{text}</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
        <Text style={styles.primaryButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 820, alignSelf: "center", padding: spacing.xl, paddingTop: 60, paddingBottom: 120 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: "900" },
  subtitle: { color: colors.goldDark, fontSize: 15, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.xl },
  brandCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  brandCopy: { flex: 1 },
  brandName: { color: colors.textPrimary, fontSize: 18, fontWeight: "900" },
  brandMeta: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.xs },
  removeButton: { width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: colors.dangerSoft, marginStart: spacing.md },
  removeText: { color: colors.danger, fontSize: 22 },
  messageCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  messageTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: "900" },
  messageText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  loadingTitle: { textAlign: "center", marginTop: spacing.md },
  loadingText: { textAlign: "center" },
  syncWarning: { flexDirection: "row", alignItems: "center", backgroundColor: colors.goldSoft, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  syncWarningText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  syncWarningAction: { color: colors.primary, fontSize: 13, fontWeight: "900", marginStart: spacing.md },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  primaryButtonText: { color: colors.textInverse, fontWeight: "900" },
});
