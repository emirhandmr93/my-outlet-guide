import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NearbyOutletsMap } from "../components/NearbyOutletsMap";
import { outlets } from "../constants/outlets";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import { useTranslation } from "../hooks/useTranslation";
import type { RootStackParamList } from "../navigation/types";
import {
  getNearbyOutlets,
  getOutletMapsUrl,
  type NearbyOutlet,
  type UserCoordinates,
} from "../services/nearbyOutlets";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { openExternalUrl } from "../utils/externalUrl";
import { formatOutletLocationSubtitle } from "../utils/locationDisplay";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";

type LocationState = "idle" | "loading" | "ready" | "denied" | "services_off" | "error";

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function NearbyOutletsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [nearby, setNearby] = useState<NearbyOutlet[]>([]);

  async function locateOutlets() {
    if (locationState === "loading") return;
    setLocationState("loading");
    try {
      if (Platform.OS !== "web" && !(await Location.hasServicesEnabledAsync())) {
        setLocationState("services_off");
        return;
      }
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== "granted") permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationState("denied");
        return;
      }

      const lastKnown = Platform.OS === "web"
        ? null
        : await Location.getLastKnownPositionAsync({ maxAge: 300_000, requiredAccuracy: 5_000 });
      const position = lastKnown ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(nextLocation);
      setNearby(getNearbyOutlets(outlets, nextLocation, 30));
      setLocationState("ready");
    } catch {
      setLocationState("error");
    }
  }

  function openOutlet(outlet: NearbyOutlet) {
    navigation.navigate("OutletDetail", { outletId: outlet.outletId });
  }

  function openMap(outlet: NearbyOutlet) {
    void openExternalUrl(getOutletMapsUrl(outlet, Platform.OS === "ios"));
  }

  const statusCopy = locationState === "denied"
    ? { title: t("nearby.deniedTitle"), body: t("nearby.deniedBody") }
    : locationState === "services_off"
      ? { title: t("nearby.servicesOffTitle"), body: t("nearby.servicesOffBody") }
      : locationState === "error"
        ? { title: t("nearby.errorTitle"), body: t("nearby.errorBody") }
        : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        isDesktopWeb && styles.desktopContent,
        {
          paddingTop: isDesktopWeb ? spacing.xxl : getScreenTopInset(insets.top),
          paddingBottom: isDesktopWeb ? spacing.xxl : getFloatingTabClearance(insets.bottom),
        },
      ]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.heroCard}>
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.heroIcon}>
          <MaterialCommunityIcons name="map-marker-radius" size={31} color={colors.gold} />
        </View>
        <Text style={[styles.kicker, isNativeRTL && styles.rtlText]}>{t("nearby.kicker")}</Text>
        <Text style={[styles.title, isNativeRTL && styles.rtlText]}>{t("nearby.title")}</Text>
        <Text style={[styles.subtitle, isNativeRTL && styles.rtlText]}>{t("nearby.subtitle")}</Text>
      </View>

      {locationState === "idle" ? (
        <View style={styles.permissionCard}>
          <Text style={[styles.sectionTitle, isNativeRTL && styles.rtlText]}>{t("nearby.permissionTitle")}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtlText]}>{t("nearby.permissionBody")}</Text>
          <Text style={[styles.privacyText, isNativeRTL && styles.rtlText]}>{t("nearby.locationPrivacy")}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => void locateOutlets()}>
            <Text style={styles.primaryButtonText}>{t("nearby.useLocation")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {locationState === "loading" ? (
        <View style={styles.statusCard} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loadingText}>{t("nearby.locating")}</Text>
        </View>
      ) : null}

      {statusCopy ? (
        <View style={styles.statusCard} accessibilityLiveRegion="polite">
          <Text style={[styles.sectionTitle, isNativeRTL && styles.rtlText]}>{statusCopy.title}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtlText]}>{statusCopy.body}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => void locateOutlets()}>
            <Text style={styles.secondaryButtonText}>{t("nearby.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {locationState === "ready" && userLocation ? (
        <>
          <View style={styles.mapCard}>
            <Text style={[styles.sectionTitle, isNativeRTL && styles.rtlText]}>{t("nearby.mapTitle")}</Text>
            <Text style={[styles.body, isNativeRTL && styles.rtlText]}>{t("nearby.mapBody")}</Text>
            <NearbyOutletsMap
              userLocation={userLocation}
              outlets={nearby.slice(0, 12)}
              fallbackText={t("nearby.mapFallback")}
              onSelect={openOutlet}
            />
          </View>

          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, isNativeRTL && styles.rtlText]}>{t("nearby.listTitle")}</Text>
            <Text style={styles.resultCount}>{nearby.length}</Text>
          </View>
          {nearby.length === 0 ? (
            <View style={styles.statusCard}><Text style={styles.body}>{t("nearby.noResults")}</Text></View>
          ) : nearby.map((outlet) => (
            <View key={outlet.outletId} style={styles.outletCard}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={outlet.name}
                activeOpacity={0.75}
                style={styles.outletCopy}
                onPress={() => openOutlet(outlet)}
              >
                <Text style={[styles.outletName, isNativeRTL && styles.rtlText]}>{outlet.name}</Text>
                <Text style={[styles.outletLocation, isNativeRTL && styles.rtlText]}>
                  {formatOutletLocationSubtitle(outlet.cityId, outlet.countryId, language)}
                </Text>
                <Text style={[styles.distance, isNativeRTL && styles.rtlText]}>
                  {interpolate(t("nearby.distance"), { distance: outlet.distanceKm.toFixed(1) })}
                </Text>
              </TouchableOpacity>
              <View style={[styles.cardActions, isNativeRTL && styles.rowReverse]}>
                <TouchableOpacity accessibilityRole="button" style={styles.actionButton} onPress={() => openMap(outlet)}>
                  <Text style={styles.actionButtonText}>{t("nearby.openMap")}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={styles.actionButton} onPress={() => openOutlet(outlet)}>
                  <Text style={styles.actionButtonText}>{t("nearby.openOutlet")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  desktopContent: { width: "100%", maxWidth: 980, alignSelf: "center", paddingHorizontal: 24 },
  heroCard: { backgroundColor: colors.primary, borderRadius: radius.xxl, padding: spacing.xl },
  heroIcon: { width: 56, height: 56, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, marginBottom: spacing.lg },
  kicker: { color: colors.gold, fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  title: { color: colors.textInverse, fontSize: 29, fontWeight: "900", marginTop: spacing.sm },
  subtitle: { color: "rgba(255,255,255,0.82)", fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  permissionCard: { backgroundColor: colors.surface, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  statusCard: { minHeight: 150, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  mapCard: { backgroundColor: colors.surface, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { color: colors.textPrimary, fontSize: 21, fontWeight: "900" },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: spacing.sm },
  privacyText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: spacing.md },
  primaryButton: { minHeight: 50, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: radius.pill, marginTop: spacing.lg, paddingHorizontal: spacing.xl },
  primaryButtonText: { color: colors.textInverse, fontSize: 15, fontWeight: "900" },
  secondaryButton: { minHeight: 46, alignItems: "center", justifyContent: "center", backgroundColor: colors.goldSoft, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderGold, marginTop: spacing.lg, paddingHorizontal: spacing.xl },
  secondaryButtonText: { color: colors.primary, fontSize: 14, fontWeight: "900" },
  loadingText: { color: colors.textPrimary, fontSize: 15, fontWeight: "800", marginTop: spacing.md },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  resultCount: { minWidth: 32, textAlign: "center", color: colors.primary, backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 9, fontWeight: "900" },
  outletCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  outletCopy: { minHeight: 72 },
  outletName: { color: colors.textPrimary, fontSize: 18, fontWeight: "900" },
  outletLocation: { color: colors.textSecondary, fontSize: 14, marginTop: spacing.xs },
  distance: { color: colors.goldDark, fontSize: 14, fontWeight: "900", marginTop: spacing.sm },
  cardActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionButton: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, paddingHorizontal: spacing.md },
  actionButtonText: { color: colors.primary, fontSize: 13, fontWeight: "900", textAlign: "center" },
  rowReverse: { flexDirection: "row-reverse" },
  rtlText: { textAlign: "right" },
});
