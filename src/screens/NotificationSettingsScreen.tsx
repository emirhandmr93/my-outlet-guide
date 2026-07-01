import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useNotificationSettings } from "../contexts/NotificationSettingsContext";
import { useTranslation } from "../hooks/useTranslation";

export function NotificationSettingsScreen() {
  const { t } = useTranslation();

  const {
    flightDeals,
    setFlightDeals,
    flightReminders,
    setFlightReminders,
    taxFreeReminders,
    setTaxFreeReminders,
    dealReminders,
    setDealReminders,
    eventReminders,
    setEventReminders,
    favoriteOutletAlerts,
    setFavoriteOutletAlerts,
    favoriteBrandAlerts,
    setFavoriteBrandAlerts,
    majorPromotionsOnly,
    setMajorPromotionsOnly,
  } = useNotificationSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>NOTIFICATIONS</Text>
        <Text style={styles.pageTitle}>{t("notifications.title")}</Text>
        <Text style={styles.pageSubtitle}>{t("notifications.subtitle")}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Smart alerts only</Text>
        <Text style={styles.infoText}>{t("notifications.info")}</Text>
      </View>

      <Text style={styles.groupTitle}>Travel alerts</Text>

      <NotificationRow
        icon="✈️"
        title="Flight Deals"
        description="Receive price-drop alerts for selected routes."
        enabled={flightDeals}
        onPress={() => setFlightDeals(!flightDeals)}
      />

      <NotificationRow
        icon="🧳"
        title={t("notifications.flightReminders")}
        description={t("notifications.flightRemindersDesc")}
        enabled={flightReminders}
        onPress={() => setFlightReminders(!flightReminders)}
      />

      <NotificationRow
        icon="🧾"
        title={t("notifications.taxFree")}
        description={t("notifications.taxFreeDesc")}
        enabled={taxFreeReminders}
        onPress={() => setTaxFreeReminders(!taxFreeReminders)}
      />

      <Text style={styles.groupTitle}>Shopping alerts</Text>

      <NotificationRow
        icon="🏷️"
        title={t("notifications.deals")}
        description={t("notifications.dealsDesc")}
        enabled={dealReminders}
        onPress={() => setDealReminders(!dealReminders)}
      />

      <NotificationRow
        icon="🎪"
        title={t("notifications.events")}
        description={t("notifications.eventsDesc")}
        enabled={eventReminders}
        onPress={() => setEventReminders(!eventReminders)}
      />

      <NotificationRow
        icon="⭐"
        title={t("notifications.favoriteOutlet")}
        description={t("notifications.favoriteOutletDesc")}
        enabled={favoriteOutletAlerts}
        onPress={() => setFavoriteOutletAlerts(!favoriteOutletAlerts)}
      />

      <NotificationRow
        icon="🛍️"
        title={t("notifications.favoriteBrand")}
        description={t("notifications.favoriteBrandDesc")}
        enabled={favoriteBrandAlerts}
        onPress={() => setFavoriteBrandAlerts(!favoriteBrandAlerts)}
      />

      <NotificationRow
        icon="✨"
        title={t("notifications.majorPromotions")}
        description={t("notifications.majorPromotionsDesc")}
        enabled={majorPromotionsOnly}
        onPress={() => setMajorPromotionsOnly(!majorPromotionsOnly)}
      />
    </ScrollView>
  );
}

function NotificationRow({
  icon,
  title,
  description,
  enabled,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>

      <View style={[styles.toggle, enabled && styles.toggleActive]}>
        <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>
          {enabled ? t("common.on") : t("common.off")}
        </Text>
      </View>
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

  groupTitle: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 10,
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
