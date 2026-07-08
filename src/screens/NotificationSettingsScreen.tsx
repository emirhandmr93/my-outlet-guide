import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useNotificationSettings } from "../contexts/NotificationSettingsContext";
import { useTranslation } from "../hooks/useTranslation";

export function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const {
    isLoggedIn,
    isLoading,
    isSaving,
    permissionStatus,
    pushSupported,
    settings,
    setNotificationsEnabled,
    tokenRegistrationStatus,
    registeredToken,
    registrationError,
  } = useNotificationSettings();

  const enabled = settings?.enabled === true;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("notifications.kicker")}</Text>
        <Text style={styles.pageTitle}>{t("notifications.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("notifications.subtitle")}</Text>
      </View>

      {!isLoggedIn ? (
        <StatusCard
          title={t("notifications.signInRequiredTitle")}
          body={t("notifications.signInRequiredBody")}
        />
      ) : (
        <>
          <StatusCard
            title={pushSupported ? t("notifications.deviceStatusTitle") : t("notifications.pushUnavailableTitle")}
            body={
              pushSupported
                ? t(`notifications.permission.${permissionStatus}`)
                : t("notifications.pushUnavailableBody")
            }
          />

          <StatusCard
            title={t("notifications.tokenStatusTitle")}
            body={
              registrationError ??
              (registeredToken
                ? `${t(`notifications.token.${tokenRegistrationStatus}`)} ${registeredToken.slice(0, 18)}…`
                : t(`notifications.token.${tokenRegistrationStatus}`))
            }
          />

          <StatusCard
            title={t("notifications.deliveryStatusTitle")}
            body={t("notifications.deliveryStatusBody")}
          />

          <TouchableOpacity
            style={[styles.row, (isLoading || isSaving) && styles.rowDisabled]}
            activeOpacity={0.86}
            disabled={isLoading || isSaving}
            onPress={() => setNotificationsEnabled(!enabled)}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>🔔</Text>
            </View>

            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{t("notifications.cloudPreferences")}</Text>
              <Text style={styles.rowDescription}>
                {pushSupported
                  ? t("notifications.cloudPreferencesDesc")
                  : t("notifications.cloudPreferencesUnavailableDesc")}
              </Text>
            </View>

            <View style={[styles.toggle, enabled && styles.toggleActive]}>
              <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>
                {enabled ? t("common.on") : t("common.off")}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{t("notifications.categoriesUnavailableTitle")}</Text>
            <Text style={styles.infoText}>{t("notifications.categoriesUnavailableBody")}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{body}</Text>
    </View>
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
    padding: 24,
    marginBottom: 16,
  },

  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#D8DEE9",
    marginTop: 8,
    lineHeight: 20,
  },

  infoBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C9A227",
    marginBottom: 16,
  },

  infoTitle: {
    color: "#0B1F3A",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 5,
  },

  infoText: {
    color: "#666666",
    lineHeight: 20,
    fontWeight: "700",
  },

  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  rowDisabled: {
    opacity: 0.6,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 20,
  },

  rowContent: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0B1F3A",
  },

  rowDescription: {
    marginTop: 4,
    color: "#666666",
    lineHeight: 18,
    fontSize: 13,
  },

  toggle: {
    minWidth: 58,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginLeft: 10,
  },

  toggleActive: {
    backgroundColor: "#0B1F3A",
    borderColor: "#0B1F3A",
  },

  toggleText: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "900",
  },

  toggleTextActive: {
    color: "#FFFFFF",
  },
});
