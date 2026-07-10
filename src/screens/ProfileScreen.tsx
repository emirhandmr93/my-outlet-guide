import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { resolveVisibleFavoriteOutlets } from "../utils/favoriteOutlets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFloatingTabClearance,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

type ProfileRouteName =
  | "Login"
  | "MyTrips"
  | "LanguageSettings"
  | "CurrencySettings"
  | "NotificationSettings"
  | "OfflinePacks"
  | "MyReviews"
  | "HelpFaq"
  | "ContactUs"
  | "PrivacyPolicy"
  | "TermsConditions"
  | "DeleteAccount"
  | "MediaCredits";

function getInitials(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "MO";
  }

  return cleanValue
    .split(" ")
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { trips } = useTrips();
  const { favoriteIds } = useFavorites();
  const visibleFavoriteOutlets = isAuthenticated
    ? resolveVisibleFavoriteOutlets(favoriteIds)
    : [];
  const [displayName, setDisplayName] = useState("");

  const accountName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    t("profile.guestShopper");

  useEffect(() => {
    if (currentUser) {
      setDisplayName(
        currentUser.displayName || currentUser.email?.split("@")[0] || "",
      );
    }
  }, [currentUser]);

  function goTo(routeName: ProfileRouteName) {
    const parentNavigation = navigation.getParent?.();

    if (parentNavigation) {
      parentNavigation.navigate(routeName);
      return;
    }

    navigation.navigate(routeName);
  }

  async function handleSaveDisplayName() {
    if (!currentUser) {
      return;
    }

    const cleanName = displayName.trim();

    if (!cleanName) {
      Alert.alert(t("common.error"), t("profile.displayNameEmptyError"));
      return;
    }

    await updateProfile(currentUser, {
      displayName: cleanName,
    });

    Alert.alert(t("common.success"), t("profile.displayNameUpdated"));
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: getFloatingTabClearance(insets.bottom) },
      ]}
      scrollIndicatorInsets={{
        bottom: getScrollIndicatorBottomInset(insets.bottom),
      }}
    >
      <View style={styles.heroCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(accountName)}</Text>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.kicker}>{t("profile.kicker")}</Text>
          <Text style={styles.pageTitle}>{accountName}</Text>
          <Text style={styles.pageSubtitle}>
            {isAuthenticated
              ? t("profile.syncedText")
              : t("profile.signInText")}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{trips.length}</Text>
          <Text style={styles.statLabel}>{t("profile.stats.trips")}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{visibleFavoriteOutlets.length}</Text>
          <Text style={styles.statLabel}>{t("profile.stats.favorites")}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {isAuthenticated
              ? t("profile.status.sync")
              : t("profile.status.guest")}
          </Text>
          <Text style={styles.statLabel}>{t("profile.stats.status")}</Text>
        </View>
      </View>

      <View style={styles.authCard}>
        <Text style={styles.sectionTitle}>{t("profile.account")}</Text>

        <Text style={styles.authTitle}>
          {isAuthenticated
            ? currentUser?.email || t("profile.signedIn")
            : t("profile.guestUser")}
        </Text>

        {isAuthenticated ? (
          <View style={styles.displayNameBox}>
            <Text style={styles.displayNameLabel}>
              {t("profile.displayName")}
            </Text>

            <TextInput
              style={styles.displayNameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t("profile.displayNamePlaceholder")}
              placeholderTextColor="#8A8A8A"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveDisplayName}
            >
              <Text style={styles.primaryButtonText}>
                {t("profile.saveName")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => goTo("Login")}
          >
            <Text style={styles.primaryButtonText}>{t("profile.signIn")}</Text>
          </TouchableOpacity>
        )}

        {isAuthenticated && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogout}
          >
            <Text style={styles.secondaryButtonText}>
              {t("profile.signOut")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.groupTitle}>
        {t("profile.groups.travelShopping")}
      </Text>

      <ProfileRow
        icon="🧳"
        title={t("profile.myTrips")}
        subtitle={t("profile.subtitles.myTrips")}
        onPress={() => goTo("MyTrips")}
      />
      <ProfileRow
        icon="💾"
        title={t("profile.offlinePacks")}
        subtitle={t("profile.subtitles.offlinePacks")}
        onPress={() => goTo("OfflinePacks")}
      />
      <ProfileRow
        icon="⭐"
        title={t("profile.myReviews")}
        subtitle={t("profile.subtitles.myReviews")}
        onPress={() => goTo("MyReviews")}
      />

      <Text style={styles.groupTitle}>{t("profile.groups.preferences")}</Text>

      <ProfileRow
        icon="🌍"
        title={t("profile.language")}
        subtitle={t("profile.subtitles.language")}
        onPress={() => goTo("LanguageSettings")}
      />
      <ProfileRow
        icon="💱"
        title={t("profile.currency")}
        subtitle={t("profile.subtitles.currency")}
        onPress={() => goTo("CurrencySettings")}
      />
      <ProfileRow
        icon="🔔"
        title={t("profile.notifications")}
        subtitle={t("profile.subtitles.notifications")}
        onPress={() => goTo("NotificationSettings")}
      />

      <Text style={styles.groupTitle}>{t("profile.groups.supportLegal")}</Text>

      <ProfileRow
        icon="❓"
        title={t("profile.helpFaq")}
        subtitle={t("profile.subtitles.helpFaq")}
        onPress={() => goTo("HelpFaq")}
      />
      <ProfileRow
        icon="✉️"
        title={t("profile.contactUs")}
        subtitle={t("profile.subtitles.contactUs")}
        onPress={() => goTo("ContactUs")}
      />
      <ProfileRow
        icon="🔒"
        title={t("profile.privacyPolicy")}
        subtitle={t("profile.subtitles.privacyPolicy")}
        onPress={() => goTo("PrivacyPolicy")}
      />
      <ProfileRow
        icon="📄"
        title={t("profile.termsConditions")}
        subtitle={t("profile.subtitles.termsConditions")}
        onPress={() => goTo("TermsConditions")}
      />
      <ProfileRow
        icon="🖼️"
        title={t("profile.mediaCredits")}
        subtitle={t("profile.subtitles.mediaCredits")}
        onPress={() => goTo("MediaCredits")}
      />
      <ProfileRow
        icon="🗑️"
        title={t("profile.deleteAccount")}
        subtitle={t("profile.subtitles.deleteAccount")}
        danger
        onPress={() => goTo("DeleteAccount")}
      />

      <Text style={styles.versionText}>My Outlet Guide v1.0</Text>
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  title,
  subtitle,
  danger,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.rowIconBox}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>

      <View style={styles.rowContent}>
        <Text style={[styles.rowText, danger && styles.dangerText]}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },

  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 22,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  avatarText: {
    color: "#0B1F3A",
    fontSize: 22,
    fontWeight: "900",
  },

  heroContent: {
    flex: 1,
  },

  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 6,
  },

  pageTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },

  pageSubtitle: {
    color: "#D8DEE9",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  statValue: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },

  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionTitle: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

  authTitle: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
  },

  displayNameBox: {
    marginTop: 14,
  },

  displayNameLabel: {
    color: "#0B1F3A",
    fontWeight: "900",
    marginBottom: 8,
  },

  displayNameInput: {
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#0B1F3A",
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  secondaryButtonText: {
    color: "#0B1F3A",
    fontWeight: "900",
    textAlign: "center",
  },

  groupTitle: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 10,
  },

  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  rowIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rowIcon: {
    fontSize: 20,
  },

  rowContent: {
    flex: 1,
  },

  rowText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0B1F3A",
  },

  rowSubtitle: {
    color: "#666666",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  dangerText: {
    color: "#DC2626",
  },

  arrow: {
    fontSize: 26,
    color: "#C9A227",
    marginLeft: 10,
  },

  versionText: {
    color: "#999999",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "700",
  },
});
