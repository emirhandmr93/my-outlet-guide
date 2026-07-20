import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { useAuth } from "../contexts/AuthContext";
import { heroAssets } from "../media/heroAssets";
import { deleteAccountWithBackend, getCallableErrorCode, getSafeCallableErrorMessage, mapDeleteAccountError } from "../services/accountDeletionCallable";
import { useTranslation } from "../hooks/useTranslation";

export function DeleteAccountScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [deleting, setDeleting] = useState(false);

  function showMessage(title: string, message: string) {
    if (Platform.OS === "web") {
      globalThis.alert(`${title}\n\n${message}`);
      return;
    }

    Alert.alert(title, message);
  }

  async function handleConfirmedDelete() {
    if (!currentUser) {
      navigation.navigate("Login");
      return;
    }

    try {
      setDeleting(true);
      await deleteAccountWithBackend();
      showMessage(t("deleteAccount.deletedTitle"), t("deleteAccount.deletedMessage"));
      navigation.navigate("Login");
    } catch (error) {
      if (__DEV__) {
        console.log("Delete account callable failed", {
          code: getCallableErrorCode(error),
          message: getSafeCallableErrorMessage(error),
        });
      }

      const failureKind = mapDeleteAccountError(error);
      if (failureKind === "recent-login") {
        showMessage(t("deleteAccount.reauthTitle"), t("deleteAccount.reauthMessage"));
        navigation.navigate("Login");
        return;
      }
      if (failureKind === "sign-in-required") {
        showMessage(t("deleteAccount.signInRequiredTitle"), t("deleteAccount.signInRequiredMessage"));
        navigation.navigate("Login");
        return;
      }
      if (failureKind === "service-retry") {
        showMessage(t("deleteAccount.failedTitle"), t("deleteAccount.serviceRetryMessage"));
        return;
      }

      showMessage(t("deleteAccount.failedTitle"), t("deleteAccount.failedMessage"));
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    if (Platform.OS === "web") {
      if (globalThis.confirm(t("deleteAccount.confirmMessage"))) {
        void handleConfirmedDelete();
      }
      return;
    }

    Alert.alert(
      t("deleteAccount.title"),
      t("deleteAccount.confirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: handleConfirmedDelete,
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LocalHeroImageCard imageSource={heroAssets.security} style={styles.heroCard} contentStyle={styles.heroInner}>
        <Text style={styles.pageTitle}>{t("deleteAccount.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("deleteAccount.subtitle")}</Text>
      </LocalHeroImageCard>

      {!currentUser && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("deleteAccount.signInRequiredTitle")}</Text>
          <Text style={styles.cardText}>{t("deleteAccount.signInRequiredMessage")}</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginButtonText}>{t("deleteAccount.signInRequiredButton")}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("deleteAccount.whatDeleted")}</Text>
        <Text style={styles.cardText}>{t("deleteAccount.itemAccount")}</Text>
        <Text style={styles.cardText}>{t("deleteAccount.itemFavorites")}</Text>
        <Text style={styles.cardText}>{t("deleteAccount.itemTrips")}</Text>
        <Text style={styles.cardText}>
          {t("deleteAccount.itemFlightPrefs")}
        </Text>
        <Text style={styles.cardText}>
          {t("deleteAccount.itemNotifications")}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("deleteAccount.reviewsTitle")}</Text>
        <Text style={styles.cardText}>{t("deleteAccount.reviewsText")}</Text>
        <Text style={styles.cardText}>{t("deleteAccount.reviewsAnonymousText")}</Text>
        <Text style={styles.cardText}>{t("deleteAccount.reviewsNoRelinkText")}</Text>
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, (!currentUser || deleting) && styles.disabledButton]}
        disabled={!currentUser || deleting}
        onPress={confirmDelete}
      >
        <Text style={styles.deleteButtonText}>{deleting ? t("deleteAccount.deleting") : t("deleteAccount.button")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },

  heroCard: { marginBottom: 22 },
  heroInner: { padding: 24 },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  pageSubtitle: {
    fontSize: 15,
    color: "#D8DEE9",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 8,
  },

  cardText: {
    color: "#666666",
    lineHeight: 22,
  },

  deleteButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },

  disabledButton: {
    opacity: 0.55,
  },

  loginButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
  },
});
