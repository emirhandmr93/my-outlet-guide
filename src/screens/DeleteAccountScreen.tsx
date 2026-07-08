import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { deleteAccountAndUserData, isRecentLoginRequired } from "../services/accountDeletionService";
import { useTranslation } from "../hooks/useTranslation";

export function DeleteAccountScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmedDelete() {
    if (!currentUser) {
      navigation.navigate("Login");
      return;
    }

    try {
      setDeleting(true);
      await deleteAccountAndUserData(currentUser);
      Alert.alert(t("deleteAccount.deletedTitle"), t("deleteAccount.deletedMessage"));
      navigation.navigate("MainTabs", { screen: "Profile" });
    } catch (error) {
      if (isRecentLoginRequired(error)) {
        Alert.alert(t("deleteAccount.reauthTitle"), t("deleteAccount.reauthMessage"));
        navigation.navigate("Login");
        return;
      }

      Alert.alert(t("deleteAccount.failedTitle"), t("deleteAccount.failedMessage"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("deleteAccount.title")}</Text>

      <Text style={styles.pageSubtitle}>{t("deleteAccount.subtitle")}</Text>

      {!currentUser && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("deleteAccount.signInRequiredTitle")}</Text>
          <Text style={styles.cardText}>{t("deleteAccount.signInRequiredMessage")}</Text>
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
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, (!currentUser || deleting) && styles.disabledButton]}
        disabled={!currentUser || deleting}
        onPress={() =>
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
          )
        }
      >
        <Text style={styles.deleteButtonText}>{deleting ? t("deleteAccount.deleting") : t("deleteAccount.button")}</Text>
      </TouchableOpacity>
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

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
  },
});
