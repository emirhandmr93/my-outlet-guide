import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { type NavigationProp, type RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { outlets } from "../constants/outlets";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import type { RootStackParamList } from "../navigation/types";
import { type TravelBasketCategory, type TravelBasketPlacement } from "../services/travelBasketAffiliateLinks";
import { getTravelBasketOutboundLink } from "../services/travelPartnerConfig";
import { recordTravelPartnerClick } from "../services/travelPartnerClickAnalytics";
import colors from "../theme/colors";
import { getTravelBasketEsimCopy } from "../translations/travelBasketEsimCopy";
import { formatIsoDateOnly } from "../utils/dateOnly";
import { openExternalBrowserUrl } from "../utils/externalUrl";
import { formatCityDisplayName, formatCountryDisplayName } from "../utils/locationDisplay";
import { trackProductEvent } from "../utils/productAnalytics";
import { getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

type BasketItem = {
  category: "flight" | TravelBasketCategory;
  provider: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  showTurkeyAccessNotice?: boolean;
};

const BASKET_ITEMS: readonly BasketItem[] = [
  { category: "flight", provider: "Aviasales", icon: "airplane-search", titleKey: "travelBasket.flightTitle", bodyKey: "travelBasket.flightBody", ctaKey: "travelBasket.flightCta" },
  { category: "hotel", provider: "Agoda", icon: "bed-outline", titleKey: "travelBasket.hotelTitle", bodyKey: "travelBasket.hotelBody", ctaKey: "travelBasket.hotelCta" },
  { category: "transfer", provider: "Kiwitaxi", icon: "car-outline", titleKey: "travelBasket.transferTitle", bodyKey: "travelBasket.transferBody", ctaKey: "travelBasket.transferCta" },
  { category: "esim", provider: "Yesim", icon: "sim-outline", titleKey: "travelBasket.esimTitle", bodyKey: "travelBasket.esimBody", ctaKey: "travelBasket.esimCta", showTurkeyAccessNotice: true },
  { category: "activities", provider: "Tiqets", icon: "ticket-confirmation-outline", titleKey: "travelBasket.activitiesTitle", bodyKey: "travelBasket.activitiesBody", ctaKey: "travelBasket.activitiesCta" },
] as const;

export function TravelBasketScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "TravelBasket">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { trips } = useTrips();
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const [openingCategory, setOpeningCategory] = useState<TravelBasketCategory | null>(null);

  const context = useMemo(() => {
    const tripId = route.params?.tripId;
    const trip = tripId
      ? trips.find((candidate) => candidate.id === tripId || candidate.tripId === tripId)
      : undefined;
    const segment = trip?.segments[0];
    const outletId = route.params?.outletId ?? trip?.outletId ?? segment?.outletId;
    const outlet = outletId ? outlets.find((candidate) => candidate.outletId === outletId) : undefined;
    const destination = trip?.city
      ?? trip?.destination
      ?? segment?.cityName
      ?? (outlet?.cityId ? formatCityDisplayName(outlet.cityId, language) : "");
    const country = trip?.country
      ?? segment?.countryName
      ?? (outlet?.countryId ? formatCountryDisplayName(outlet.countryId, language) : "");
    const label = [destination, country].filter(Boolean).join(" · ");
    const dates = trip ? `${formatIsoDateOnly(trip.startDate)} – ${formatIsoDateOnly(trip.endDate)}` : "";
    const partnerDestination = trip?.city
      ?? trip?.destination
      ?? segment?.cityName
      ?? (outlet?.cityId ? formatCityDisplayName(outlet.cityId, "en") : "");
    const partnerCountry = trip?.country
      ?? segment?.countryName
      ?? (outlet?.countryId ? formatCountryDisplayName(outlet.countryId, "en") : "");
    return {
      contextId: route.params?.campaignId ?? trip?.id ?? outlet?.outletId,
      campaignId: route.params?.campaignId,
      outletId,
      countryId: outlet?.countryId,
      cityId: outlet?.cityId ?? segment?.cityId,
      dates,
      startDate: trip?.startDate ?? route.params?.startDate,
      endDate: trip?.endDate ?? route.params?.endDate,
      partnerDestination,
      partnerCountry,
      label,
      outletName: trip?.outletName ?? segment?.outletName ?? outlet?.outletName ?? "",
    };
  }, [language, route.params?.campaignId, route.params?.endDate, route.params?.outletId, route.params?.startDate, route.params?.tripId, trips]);

  const placement: TravelBasketPlacement = route.params?.source ?? "travel_basket_hub";

  async function openPartner(category: TravelBasketCategory) {
    if (openingCategory) return;
    setOpeningCategory(category);
    try {
      const outboundLink = await getTravelBasketOutboundLink({
        category,
        placement,
        contextId: context.contextId,
        searchContext: {
          destination: context.partnerDestination,
          country: context.partnerCountry,
          startDate: context.startDate,
          endDate: context.endDate,
        },
      });
      trackProductEvent("outbound_affiliate_click", {
        affiliate: outboundLink.provider,
        category,
        monetized: outboundLink.monetized,
        placement,
        context_prefilled: Boolean(context.partnerDestination || context.startDate),
      });
      void recordTravelPartnerClick({
        provider: outboundLink.provider,
        category,
        monetized: outboundLink.monetized,
        placement,
        locale: language,
        campaignId: context.campaignId,
        outletId: context.outletId,
        countryId: context.countryId,
        cityId: context.cityId,
      });
      if (!(await openExternalBrowserUrl(outboundLink.url))) throw new Error("partner_open_failed");
    } catch {
      Alert.alert(t("travelBasket.openFailedTitle"), t("travelBasket.openFailedBody"));
    } finally {
      setOpeningCategory(null);
    }
  }

  function openItem(category: BasketItem["category"]) {
    if (category === "flight") {
      navigation.navigate("FlightSearch", {
        campaignId: context.campaignId,
        outletId: context.outletId,
        countryId: context.countryId,
        cityId: context.cityId,
        source: placement,
      });
      return;
    }
    void openPartner(category);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        isDesktopWeb && styles.desktopContent,
        { paddingTop: isDesktopWeb ? 32 : getScreenTopInset(insets.top), paddingBottom: Math.max(insets.bottom, 24) + 20 },
      ]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.hero}>
        <Text style={[styles.kicker, isNativeRTL && styles.rtlText]}>{t("travelBasket.kicker")}</Text>
        <Text style={[styles.heroTitle, isNativeRTL && styles.rtlText]}>{t("travelBasket.title")}</Text>
        <Text style={[styles.heroBody, isNativeRTL && styles.rtlText]}>{t("travelBasket.subtitle")}</Text>
      </View>

      <View style={styles.contextCard}>
        <Text style={[styles.contextTitle, isNativeRTL && styles.rtlText]}>{t("travelBasket.contextTitle")}</Text>
        <Text style={[styles.contextValue, isNativeRTL && styles.rtlText]}>
          {context.label || context.outletName || t("travelBasket.contextFallback")}
        </Text>
        {context.outletName && context.label ? <Text style={[styles.contextMeta, isNativeRTL && styles.rtlText]}>{context.outletName}</Text> : null}
        {context.dates ? <Text style={[styles.contextMeta, isNativeRTL && styles.rtlText]}>{context.dates}</Text> : null}
        {context.partnerDestination || context.startDate ? (
          <View style={styles.smartContextRow}>
            <MaterialCommunityIcons name="auto-fix" size={16} color={colors.goldDark} />
            <Text style={[styles.smartContextText, isNativeRTL && styles.rtlText]}>{t("travelBasket.smartContextApplied")}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        {BASKET_ITEMS.map((item) => {
          const isOpening = item.category !== "flight" && openingCategory === item.category;
          const esimCopy = item.category === "esim" ? getTravelBasketEsimCopy(language) : null;
          return (
            <View key={item.category} style={[styles.itemCard, isDesktopWeb && styles.desktopItemCard]}>
              <View style={[styles.itemHeader, isNativeRTL && styles.rowReverse]}>
                <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.iconCircle}>
                  <MaterialCommunityIcons name={item.icon} size={25} color={colors.gold} />
                </View>
                <Text style={styles.provider}>{item.provider}</Text>
              </View>
              <Text style={[styles.itemTitle, isNativeRTL && styles.rtlText]}>{t(item.titleKey)}</Text>
              <Text style={[styles.itemBody, isNativeRTL && styles.rtlText]}>{esimCopy?.body ?? t(item.bodyKey)}</Text>
              {item.showTurkeyAccessNotice && esimCopy ? (
                <View style={[styles.itemNotice, isNativeRTL && styles.rowReverse]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={17} color={colors.goldDark} />
                  <Text style={[styles.itemNoticeText, isNativeRTL && styles.rtlText]}>{esimCopy.turkeyNotice}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                accessibilityRole={item.category === "flight" ? "button" : "link"}
                accessibilityLabel={`${t(item.ctaKey)} · ${item.provider}`}
                activeOpacity={0.78}
                disabled={Boolean(openingCategory)}
                onPress={() => openItem(item.category)}
                style={[styles.itemButton, openingCategory && styles.disabledButton]}
              >
                {isOpening
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Text style={styles.itemButtonText}>{t(item.ctaKey)}</Text>}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.disclosureCard}>
        <View style={[styles.disclosureHeader, isNativeRTL && styles.rowReverse]}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.success} />
          <Text style={[styles.disclosureTitle, isNativeRTL && styles.rtlText]}>{t("travelBasket.disclosureTitle")}</Text>
        </View>
        <Text style={[styles.disclosureBody, isNativeRTL && styles.rtlText]}>{t("travelBasket.disclosureBody")}</Text>
        <Text style={[styles.providerNotice, isNativeRTL && styles.rtlText]}>{t("travelBasket.providerNotice")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 16, paddingHorizontal: 16 },
  desktopContent: { alignSelf: "center", maxWidth: 1120, paddingHorizontal: 24, width: "100%" },
  hero: { backgroundColor: colors.primary, borderRadius: 28, padding: 24 },
  kicker: { color: colors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  heroTitle: { color: colors.textInverse, fontSize: 30, fontWeight: "900", lineHeight: 36, marginTop: 10 },
  heroBody: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 },
  contextCard: { backgroundColor: colors.goldSoft, borderColor: "#E7D79A", borderRadius: 20, borderWidth: 1, padding: 16 },
  contextTitle: { color: colors.goldDark, fontSize: 12, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" },
  contextValue: { color: colors.primary, fontSize: 19, fontWeight: "900", marginTop: 7 },
  contextMeta: { color: colors.textSecondary, fontSize: 13, fontWeight: "700", marginTop: 5 },
  smartContextRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 10 },
  smartContextText: { color: colors.goldDark, flex: 1, fontSize: 12, fontWeight: "800", lineHeight: 17 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  itemCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 24, borderWidth: 1, padding: 18, width: "100%" },
  desktopItemCard: { width: "48.8%" },
  itemHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  rowReverse: { flexDirection: "row-reverse" },
  iconCircle: { alignItems: "center", backgroundColor: colors.goldSoft, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  provider: { backgroundColor: colors.surfaceMuted, borderRadius: 999, color: colors.textSecondary, fontSize: 11, fontWeight: "900", overflow: "hidden", paddingHorizontal: 10, paddingVertical: 5 },
  itemTitle: { color: colors.primary, fontSize: 20, fontWeight: "900", marginTop: 15 },
  itemBody: { color: colors.textSecondary, flexGrow: 1, fontSize: 14, lineHeight: 21, marginTop: 7 },
  itemNotice: { alignItems: "flex-start", backgroundColor: colors.warningSoft, borderColor: "#E8CF88", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, marginTop: 12, padding: 11 },
  itemNoticeText: { color: colors.goldDark, flex: 1, fontSize: 12, fontWeight: "800", lineHeight: 17 },
  itemButton: { alignItems: "center", backgroundColor: colors.gold, borderRadius: 16, justifyContent: "center", marginTop: 16, minHeight: 48, paddingHorizontal: 14, paddingVertical: 13 },
  itemButtonText: { color: colors.primary, fontWeight: "900", textAlign: "center" },
  disabledButton: { opacity: 0.6 },
  disclosureCard: { backgroundColor: colors.successSoft, borderColor: "#BDE5CA", borderRadius: 20, borderWidth: 1, padding: 17 },
  disclosureHeader: { alignItems: "center", flexDirection: "row", gap: 9 },
  disclosureTitle: { color: colors.primary, flex: 1, fontSize: 16, fontWeight: "900" },
  disclosureBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 9 },
  providerNotice: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
});
