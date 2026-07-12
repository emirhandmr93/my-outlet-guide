import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CONTACT_EMAIL, INSTAGRAM_HANDLE, INSTAGRAM_URL, WEBSITE_URL, mailtoUrl } from "../constants/externalLinks";
import { useTranslation } from "../hooks/useTranslation";

export function ContactUsScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("contact.title")}</Text>

      <Text style={styles.pageSubtitle}>{t("contact.subtitle")}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("contact.emailTitle")}</Text>

        <Text style={styles.cardText}>{t("contact.emailText")}</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Linking.openURL(mailtoUrl(CONTACT_EMAIL))}
        >
          <Text style={styles.actionButtonText}>{CONTACT_EMAIL}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("contact.instagramTitle")}</Text>

        <Text style={styles.cardText}>{t("contact.instagramText")}</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Linking.openURL(INSTAGRAM_URL)}
        >
          <Text style={styles.actionButtonText}>{INSTAGRAM_HANDLE}</Text>
        </TouchableOpacity>
      </View>

      {WEBSITE_URL ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("contact.websiteTitle")}</Text>

          <Text style={styles.cardText}>{t("contact.websiteText")}</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(WEBSITE_URL)}
          >
            <Text style={styles.actionButtonText}>{WEBSITE_URL.replace(/^https?:\/\/(www\.)?/, "")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("contact.featureTitle")}</Text>

        <Text style={styles.cardText}>{t("contact.featureText")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("contact.problemTitle")}</Text>

        <Text style={styles.cardText}>{t("contact.problemText")}</Text>
      </View>
    </ScrollView>
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
    marginBottom: 6,
  },

  cardText: {
    color: "#666666",
    lineHeight: 22,
    marginBottom: 10,
  },

  actionButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 14,
    padding: 13,
  },

  actionButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "800",
  },
});
