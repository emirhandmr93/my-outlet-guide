import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import { heroAssets } from "../media/heroAssets";
import type { RootStackParamList } from "../navigation/types";
import colors from "../theme/colors";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

type ToolRoute = "FlightSearch" | "FlightDeals" | "MyTripsList";
type ToolIcon = "airplane-search" | "bell-ring-outline" | "bag-suitcase-outline";

export function TravelHubScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const navigateToTool = navigation.navigate as (route: ToolRoute) => void;
  const tools: { route: ToolRoute; icon: ToolIcon; title: string; body: string; badge: string }[] = [
    { route: "FlightSearch", icon: "airplane-search", title: t("travelHub.flightSearchTitle"), body: t("travelHub.flightSearchBody"), badge: t("travelHub.flightSearchBadge") },
    { route: "FlightDeals", icon: "bell-ring-outline", title: t("travelHub.priceAlertsTitle"), body: t("travelHub.priceAlertsBody"), badge: t("travelHub.priceAlertsBadge") },
    { route: "MyTripsList", icon: "bag-suitcase-outline", title: t("travelHub.myTripsTitle"), body: t("travelHub.myTripsBody"), badge: t("travelHub.myTripsBadge") },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        isDesktopWeb && styles.desktopContent,
        { paddingTop: isDesktopWeb ? 32 : getScreenTopInset(insets.top), paddingBottom: isDesktopWeb ? 32 : getFloatingTabClearance(insets.bottom) },
      ]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <LocalHeroImageCard imageSource={heroAssets.trips} responsiveWeb style={styles.hero} contentStyle={styles.heroContent}>
        <Text style={[styles.kicker, isNativeRTL && styles.rtlText]}>{t("travelHub.kicker")}</Text>
        <Text style={[styles.heroTitle, isNativeRTL && styles.rtlText]}>{t("travelHub.title")}</Text>
        <Text style={[styles.heroSubtitle, isNativeRTL && styles.rtlText]}>{t("travelHub.subtitle")}</Text>
      </LocalHeroImageCard>

      <Text style={[styles.toolsTitle, isNativeRTL && styles.rtlText]}>{t("travelHub.toolsTitle")}</Text>
      <View style={[styles.toolsGrid, isNativeRTL && styles.rowReverse]}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.route}
            accessibilityRole="button"
            accessibilityLabel={tool.title}
            activeOpacity={0.72}
            onPress={() => navigateToTool(tool.route)}
            style={[styles.toolCard, isDesktopWeb && styles.desktopToolCard]}
          >
            <View style={[styles.cardHeader, isNativeRTL && styles.rowReverse]}>
              <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.iconCircle}>
                <MaterialCommunityIcons name={tool.icon} size={27} color={colors.gold} />
              </View>
              <View style={styles.badge}><Text style={styles.badgeText}>{tool.badge}</Text></View>
            </View>
            <Text style={[styles.cardTitle, isNativeRTL && styles.rtlText]}>{tool.title}</Text>
            <Text style={[styles.cardBody, isNativeRTL && styles.rtlText]}>{tool.body}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 18 },
  desktopContent: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingHorizontal: 24 },
  hero: { borderRadius: 24 },
  heroContent: { minHeight: 190, padding: 24, justifyContent: "flex-end" },
  kicker: { color: colors.gold, fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  heroTitle: { color: colors.textInverse, fontSize: 30, fontWeight: "900", marginTop: 6 },
  heroSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 16, lineHeight: 23, marginTop: 7, maxWidth: 680 },
  toolsTitle: { color: colors.textPrimary, fontSize: 21, fontWeight: "900", marginTop: 2 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  toolCard: { width: "100%", minHeight: 180, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 18, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  desktopToolCard: { flexGrow: 1, flexBasis: 240, width: "auto" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 },
  rowReverse: { flexDirection: "row-reverse" },
  iconCircle: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  badge: { flexShrink: 1, borderRadius: 999, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.borderGold, paddingHorizontal: 11, paddingVertical: 6 },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: "900", textAlign: "center" },
  cardTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "900" },
  cardBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  rtlText: { textAlign: "right" },
});
