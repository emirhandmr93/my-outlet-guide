import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { heroAssets } from "../media/heroAssets";
import { useNotificationSettings } from "../contexts/NotificationSettingsContext";
import { useTranslation } from "../hooks/useTranslation";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

export function NotificationSettingsScreen() {
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    isLoggedIn,
    isLoading,
    isSaving,
    permissionStatus,
    pushSupported,
    settings,
    setNotificationsEnabled,
    setTripRemindersEnabled,
    tokenRegistrationStatus,
    registeredToken,
    registrationError,
  } = useNotificationSettings();

  const enabled = settings?.enabled === true;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <LocalHeroImageCard imageSource={heroAssets.notifications} style={styles.heroCard} contentStyle={styles.heroInner}>
        <Text style={styles.kicker}>{t("notifications.kicker")}</Text>
        <Text style={styles.pageTitle}>{t("notifications.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("notifications.subtitle")}</Text>
      </LocalHeroImageCard>

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


          <CategoryRow
            icon="🗓️"
            title={t("notifications.tripRemindersCategory")}
            description={t("notifications.tripRemindersCategoryDesc")}
            status={t("notifications.categoryActive")}
            enabled={settings?.tripRemindersEnabled === true}
            disabled={isLoading || isSaving || !enabled}
            onLabel={t("common.on")}
            offLabel={t("common.off")}
            onPress={() => setTripRemindersEnabled(settings?.tripRemindersEnabled !== true)}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{t("notifications.unsupportedCategoriesTitle")}</Text>
            <Text style={styles.infoText}>{t("notifications.unsupportedCategoriesBody")}</Text>
          </View>

        </>
      )}
    </ScrollView>
  );
}

function CategoryRow({
  icon,
  title,
  description,
  status,
  enabled,
  disabled,
  onLabel,
  offLabel,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  status: string;
  enabled: boolean;
  disabled: boolean;
  onLabel: string;
  offLabel: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      activeOpacity={0.86}
      disabled={disabled}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={[styles.toggle, enabled && styles.toggleActive]}>
        <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>{enabled ? onLabel : offLabel}</Text>
      </View>
    </TouchableOpacity>
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

  heroCard: { marginBottom: 16 },
  heroInner: { padding: 24 },

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

  statusText: {
    marginTop: 6,
    color: "#0B1F3A",
    fontSize: 12,
    fontWeight: "900",
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
