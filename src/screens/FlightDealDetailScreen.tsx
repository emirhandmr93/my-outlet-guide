import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import { heroAssets } from "../media/heroAssets";
import { RootStackParamList } from "../navigation/types";
import { buildAviasalesAffiliateSearchUrl } from "../services/aviasalesAffiliateLink";
import { getUserFlightPriceDeal, UserFlightPriceDeal, UserFlightPriceDealResult } from "../services/flightPriceDealDetailService";
import colors from "../theme/colors";
import { supportedLanguageCodes } from "../translations/translations";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";
import { formatIsoDateOnly } from "../utils/dateOnly";

type ViewState = "loading" | "found" | "not_found" | "invalid" | "read_failed";

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`%{${key}}`, String(value)), template);
}


export function FlightDealDetailScreen() {
  const { t, language } = useTranslation();
  const { currentUser } = useUser();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "FlightDealDetail">>();
  const { dealId } = route.params;
  const insets = useSafeAreaInsets();
  const { isNativeRTL } = useLayoutDirection();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 1024;
  const [state, setState] = useState<ViewState>(currentUser ? "loading" : "not_found");
  const [deal, setDeal] = useState<UserFlightPriceDeal | null>(null);
  const [reload, setReload] = useState(0);
  const [opening, setOpening] = useState(false);
  const locale = supportedLanguageCodes.includes(language) ? language : "en";

  useEffect(() => {
    let active = true;
    if (!currentUser?.userId) { setDeal(null); setState("not_found"); return () => { active = false; }; }
    setState("loading");
    setDeal(null);
    getUserFlightPriceDeal(currentUser.userId, dealId).then((result: UserFlightPriceDealResult) => {
      if (!active) return;
      if (result.status === "found") { setDeal(result.deal); setState("found"); }
      else setState(result.status);
    });
    return () => { active = false; };
  }, [currentUser?.userId, dealId, reload]);

  const currencyFormatter = useMemo(() => {
    try { return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }); }
    catch { return null; }
  }, [locale]);
  const formatPrice = (value: number) => { try { return currencyFormatter?.format(value) ?? `€${value.toFixed(2)}`; } catch { return `€${value}`; } };
  const formatDate = formatIsoDateOnly;

  async function openProvider() {
    if (!deal || opening) return;
    setOpening(true);
    try {
      const rolling = deal.schemaVersion === 2;
      const url = buildAviasalesAffiliateSearchUrl({
        originIata: deal.originAirportCode, destinationIata: deal.destinationAirportCode,
        departDate: rolling ? deal.offerDepartDate : deal.departDate,
        ...((rolling ? deal.offerReturnDate : deal.returnDate) ? { returnDate: rolling ? deal.offerReturnDate : deal.returnDate } : {}),
        adults: rolling ? 1 : deal.adults, children: rolling ? 0 : deal.children, infants: rolling ? 0 : deal.infants,
        tripClass: deal.tripClass, currency: "EUR", locale,
        subId: rolling ? "app_rolling_flight_deal_detail" : "app_flight_deal_detail",
      });
      if (Platform.OS === "web") await Linking.openURL(url);
      else await WebBrowser.openBrowserAsync(url);
    } catch { Alert.alert(t("flightDealDetail.openFailedTitle"), t("flightDealDetail.openFailedBody")); }
    finally { setOpening(false); }
  }

  const hero = <LocalHeroImageCard imageSource={heroAssets.flightDeals} responsiveWeb style={styles.hero} contentStyle={styles.heroContent}>
    <Text style={styles.kicker}>{t("flightDealDetail.kicker")}</Text>
    <Text accessibilityRole="header" style={styles.heroTitle}>{t("flightDealDetail.title")}</Text>
    <Text style={styles.heroSubtitle}>{t("flightDealDetail.subtitle")}</Text>
  </LocalHeroImageCard>;

  let body;
  if (!currentUser) body = <StateCard title={t("flightDealDetail.signInTitle")} body={t("flightDealDetail.signInBody")}>
    <Action label={t("flightDealDetail.signInCta")} onPress={() => navigation.navigate("Login")} />
  </StateCard>;
  else if (state === "loading") body = <View accessibilityLiveRegion="polite" accessibilityRole="progressbar"><StateCard title={t("flightDealDetail.loadingTitle")} body={t("flightDealDetail.loadingBody")} /></View>;
  else if (state !== "found" || !deal) body = <StateCard title={t("flightDealDetail.unavailableTitle")} body={t("flightDealDetail.unavailableBody")}>
    <Action label={t("flightDealDetail.retry")} onPress={() => setReload(value => value + 1)} />
  </StateCard>;
  else body = <>
    <View style={styles.highlight}>
      <Text accessibilityRole="header" style={[styles.route, isNativeRTL && styles.rtl]}>{deal.originAirportCode} → {deal.destinationAirportCode}</Text>
      <Text style={[styles.discount, isNativeRTL && styles.rtl]}>{interpolate(t("flightDealDetail.discountBelowAverage"), { discount: `${deal.discountPercent}%` })}</Text>
      <Text style={styles.badge}>{t(deal.schemaVersion === 2 ? "flightDealDetail.rollingCachedBadge" : "flightDealDetail.cachedBadge")}</Text>
    </View>
    <View style={styles.grid}>
      <Metric label={t("flightDealDetail.trackedFare")} value={formatPrice(deal.currentPrice)} />
      <Metric label={t("flightDealDetail.recentAverage")} value={formatPrice(deal.averagePrice)} />
      <Metric label={t("flightDealDetail.thresholdReached")} value={`${deal.matchedThreshold}%`} />
      <Metric label={t("flightDealDetail.trackingWindow")} value={`${deal.historyWindowDays} ${t("flightDealDetail.days")}`} />
      <Metric label={t("flightDealDetail.sampleCount")} value={String(deal.priceSampleCount)} />
      <Metric label={t("flightDealDetail.lastChecked")} value={formatDate(deal.snapshotDate)} />
    </View>
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{t(deal.schemaVersion === 2 ? "flightDealDetail.rollingOfferProfile" : "flightDealDetail.tripProfile")}</Text>
      <Detail label={deal.tripType === "round_trip" ? t("flightDealDetail.roundTrip") : t("flightDealDetail.oneWay")} value="" />
      {deal.schemaVersion === 1 ? <>
        <Detail label={t("flightDealDetail.departureDate")} value={formatDate(deal.departDate)} />
        {deal.returnDate ? <Detail label={t("flightDealDetail.returnDate")} value={formatDate(deal.returnDate)} /> : null}
        <Detail label={t("flightDealDetail.adults")} value={String(deal.adults)} />
        <Detail label={t("flightDealDetail.children")} value={String(deal.children)} />
        <Detail label={t("flightDealDetail.infants")} value={String(deal.infants)} />
        <Detail label={t("flightDealDetail.passengers")} value={`${deal.adults + deal.children + deal.infants}`} />
      </> : <>
        <Detail label={t("flightDealDetail.offerDepartureDate")} value={formatDate(deal.offerDepartDate)} />
        {deal.offerReturnDate ? <Detail label={t("flightDealDetail.offerReturnDate")} value={formatDate(deal.offerReturnDate)} /> : null}
        <Detail label={t("flightDealDetail.transfers")} value={String(deal.offerTransfers)} />
        {deal.offerAirline ? <Detail label={t("flightDealDetail.airline")} value={deal.offerAirline} /> : null}
        {deal.offerFlightNumber ? <Detail label={t("flightDealDetail.flightNumber")} value={deal.offerFlightNumber} /> : null}
      </>}
      <Detail label={deal.tripClass === "economy" ? t("flightDealDetail.economy") : t("flightDealDetail.business")} value={deal.directOnly ? t("flightDealDetail.directOnly") : t("flightDealDetail.allFlights")} />
    </View>
    <View style={styles.disclosure}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{t("flightDealDetail.sourceTitle")}</Text>
      <Text style={styles.notice}>{t(deal.schemaVersion === 2 ? "flightDealDetail.rollingScopeNotice" : "flightDealDetail.cachedPriceNotice")}</Text>
      <Text style={styles.notice}>{t("flightDealDetail.thirdPartyNotice")}</Text>
      <Text style={styles.notice}>{t("flightDealDetail.affiliateNotice")}</Text>
      <Text style={styles.notice}>{t(deal.schemaVersion === 2 ? "flightDealDetail.rollingPassengerNotice" : "flightDealDetail.passengerScopeNotice")}</Text>
      {deal.directOnly ? <Text style={styles.directNotice}>{t("flightDealDetail.directFilterNotice")}</Text> : null}
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("flightDealDetail.providerCta")} accessibilityState={{ disabled: opening, busy: opening }} disabled={opening} onPress={openProvider} style={[styles.cta, opening && styles.disabled]}>
      <Text style={styles.ctaText}>{opening ? t("flightDealDetail.openingProvider") : t("flightDealDetail.providerCta")}</Text>
    </TouchableOpacity>
  </>;

  return <ScrollView style={styles.screen} contentContainerStyle={[styles.content, desktop && styles.desktop, { paddingTop: desktop ? 32 : getScreenTopInset(insets.top), paddingBottom: desktop ? 32 : getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
    {hero}{body}
  </ScrollView>;
}

function StateCard({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) { return <View style={styles.card}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text><Text style={styles.notice}>{body}</Text>{children}</View>; }
function Action({ label, onPress }: { label: string; onPress: () => void }) { return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.cta}><Text style={styles.ctaText}>{label}</Text></TouchableOpacity>; }
function Metric({ label, value }: { label: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }
function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text>{value ? <Text style={styles.detailValue}>{value}</Text> : null}</View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: 16, gap: 18 }, desktop: { width: "100%", maxWidth: 920, alignSelf: "center" },
  hero: { borderRadius: 24 }, heroContent: { padding: 24, minHeight: 190, justifyContent: "flex-end" }, kicker: { color: colors.gold, fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  heroTitle: { color: colors.textInverse, fontSize: 30, fontWeight: "900", marginTop: 6 }, heroSubtitle: { color: "rgba(255,255,255,.9)", fontSize: 16, lineHeight: 23, marginTop: 7 },
  highlight: { backgroundColor: colors.primary, borderRadius: 22, padding: 22 }, route: { color: colors.textInverse, fontSize: 28, fontWeight: "900" }, discount: { color: colors.gold, fontSize: 20, fontWeight: "900", marginTop: 8 }, rtl: { textAlign: "right" },
  badge: { alignSelf: "flex-start", color: colors.primary, backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, overflow: "hidden", fontWeight: "900", marginTop: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, metric: { minWidth: "46%", flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16 }, metricLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "700" }, metricValue: { color: colors.textPrimary, fontSize: 19, fontWeight: "900", marginTop: 6 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18, gap: 12 }, sectionTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: "900" },
  detail: { flexDirection: "row", justifyContent: "space-between", gap: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, paddingVertical: 7 }, detailLabel: { color: colors.textSecondary, fontWeight: "700", flex: 1 }, detailValue: { color: colors.textPrimary, fontWeight: "900", textAlign: "right", flex: 1 },
  disclosure: { backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, borderRadius: 22, padding: 18, gap: 10 }, notice: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 }, directNotice: { color: colors.textPrimary, fontSize: 14, lineHeight: 21, fontWeight: "800" },
  cta: { backgroundColor: colors.gold, borderRadius: 15, padding: 16, alignItems: "center", marginTop: 4 }, ctaText: { color: colors.primary, fontWeight: "900", fontSize: 15 }, disabled: { opacity: 0.6 },
});
