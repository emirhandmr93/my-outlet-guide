import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { AppOnlyFeatureNotice } from "../components/AppOnlyFeatureNotice";
import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { heroAssets } from "../media/heroAssets";
import { useNotificationSettings } from "../contexts/NotificationSettingsContext";
import { useTranslation } from "../hooks/useTranslation";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

export function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
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
      contentContainerStyle={[
        styles.content,
        isDesktopWeb && styles.contentDesktop,
        {
          paddingTop: isDesktopWeb ? 34 : getScreenTopInset(insets.top),
          paddingBottom: isDesktopWeb ? 32 : getFloatingTabClearance(insets.bottom),
        },
      ]}
      scrollIndicatorInsets={{ bottom: isDesktopWeb ? 32 : getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <LocalHeroImageCard imageSource={heroAssets.notifications} style={styles.heroCard} contentStyle={styles.heroInner}>
        <Text style={styles.kicker}>{t("notifications.kicker")}</Text>
        <Text style={styles.pageTitle}>{t("notifications.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("notifications.subtitle")}</Text>
      </LocalHeroImageCard>

      {isWeb ? (
        <AppOnlyFeatureNotice
          badge={t("appOnly.badge")}
          title={t("appOnly.notificationsTitle")}
          body={t("appOnly.notificationsBody")}
          helperText={t("appOnly.helper")}
          ctaLabel={t("appOnly.cta")}
        />
      ) : !isLoggedIn ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t("notifications.signInRequiredTitle")}</Text>
          <Text style={styles.infoText}>{t("notifications.signInRequiredBody")}</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signInButtonText}>{t("notifications.signInCta")}</Text>
          </TouchableOpacity>
        </View>
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

  contentDesktop: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: 34,
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
  signInButton: { backgroundColor: "#0B1F3A", borderRadius: 14, paddingVertical: 13, paddingHorizontal: 18, alignItems: "center", marginTop: 16 },
  signInButtonText: { color: "#FFFFFF", fontWeight: "900" },

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
