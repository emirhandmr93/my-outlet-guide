import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import {
  Alert,
  Platform,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { outlets } from "../constants/outlets";
import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import { getHomeFeatureImage, getOutletPrimaryImage } from "../media/imageResolvers";
import type { RootStackParamList } from "../navigation/types";
import {
  formatCampaignDate,
  getActiveOutletCampaign,
  type OutletCampaign,
} from "../services/outletCampaignService";
import colors from "../theme/colors";
import { openExternalBrowserUrl } from "../utils/externalUrl";
import { trackProductEvent } from "../utils/productAnalytics";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

type ViewState = "loading" | "found" | "unavailable";

function campaignImage(outletId: string) {
  const outlet = outlets.find(item => item.outletId === outletId);
  if (!outlet) return getHomeFeatureImage("discover-outlets");
  try { return getOutletPrimaryImage(outlet); } catch { return getHomeFeatureImage("discover-outlets"); }
}

export function CampaignDetailScreen() {
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CampaignDetail">>();
  const { campaignId } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 1024;
  const [state, setState] = useState<ViewState>("loading");
  const [campaign, setCampaign] = useState<OutletCampaign | null>(null);
  const [reload, setReload] = useState(0);
  const [opening, setOpening] = useState(false);
  const [sharingVisual, setSharingVisual] = useState(false);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    let active = true;
    setState("loading");
    void getActiveOutletCampaign(campaignId, language)
      .then(result => {
        if (!active) return;
        setCampaign(result);
        setState(result ? "found" : "unavailable");
      })
      .catch(() => {
        if (active) setState("unavailable");
      });
    return () => { active = false; };
  }, [campaignId, language, reload]);

  const image = useMemo(() => campaignImage(campaign?.outletId ?? ""), [campaign?.outletId]);

  async function openSource() {
    if (!campaign || opening) return;
    setOpening(true);
    try {
      if (!(await openExternalBrowserUrl(campaign.sourceUrl))) throw new Error("source_rejected");
    } catch {
      Alert.alert(t("campaign.openFailedTitle"), t("campaign.openFailedBody"));
    } finally {
      setOpening(false);
    }
  }

  async function shareCampaign() {
    if (!campaign) return;
    const url = `https://myoutletguide.com/${language}/campaign/${encodeURIComponent(campaign.campaignId)}`;
    await Share.share({ message: `${campaign.headline}\n${campaign.outletName}\n${url}`, url, title: campaign.headline });
    trackProductEvent("campaign_share", { campaign_id: campaign.campaignId, outlet_id: campaign.outletId });
  }

  async function shareCampaignVisual() {
    if (!campaign || sharingVisual) return;
    if (Platform.OS === "web") { await shareCampaign(); return; }
    setSharingVisual(true);
    try {
      if (!shareCardRef.current || !(await Sharing.isAvailableAsync())) throw new Error("sharing_unavailable");
      const uri = await captureRef(shareCardRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: 1080,
        height: 1080,
      });
      await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: campaign.headline });
      trackProductEvent("campaign_share", {
        campaign_id: campaign.campaignId,
        outlet_id: campaign.outletId,
        share_format: "image",
      });
    } catch {
      Alert.alert(t("campaign.shareVisualFailedTitle"), t("campaign.shareVisualFailedBody"));
    } finally {
      setSharingVisual(false);
    }
  }

  function openTravelBasket() {
    if (!campaign) return;
    trackProductEvent("campaign_travel_basket_open", { campaign_id: campaign.campaignId, outlet_id: campaign.outletId });
    navigation.navigate("TravelBasket", {
      outletId: campaign.outletId,
      campaignId: campaign.campaignId,
      source: "campaign_detail",
    });
  }

  let body;
  if (state === "loading") {
    body = <StateCard title={t("campaign.loadingTitle")} body={t("campaign.loadingBody")} />;
  } else if (state !== "found" || !campaign) {
    body = (
      <StateCard title={t("campaign.unavailableTitle")} body={t("campaign.unavailableBody")}>
        <Action label={t("campaign.retry")} onPress={() => setReload(value => value + 1)} />
      </StateCard>
    );
  } else {
    body = (
      <>
        <View ref={shareCardRef} collapsable={false} style={styles.shareCaptureCard}>
          <LocalHeroImageCard imageSource={image} responsiveWeb style={styles.hero} contentStyle={styles.heroContent}>
            <Text style={[styles.kicker, isNativeRTL && styles.rtl]}>{campaign.discountLabel}</Text>
            <Text accessibilityRole="header" style={[styles.heroTitle, isNativeRTL && styles.rtl]}>{campaign.headline}</Text>
            <Text style={[styles.heroBrand, isNativeRTL && styles.rtl]}>{campaign.brandName}</Text>
            <Text style={[styles.heroSubtitle, isNativeRTL && styles.rtl]}>{campaign.outletName}</Text>
            <Text style={[styles.shareBrand, isNativeRTL && styles.rtl]}>MY OUTLET GUIDE</Text>
          </LocalHeroImageCard>
        </View>

        <View style={styles.card}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, isNativeRTL && styles.rtl]}>{campaign.headline}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtl]}>{campaign.summary}</Text>
        </View>

        <View style={styles.grid}>
          <Metric label={t("campaign.starts")} value={formatCampaignDate(campaign.startsOn, language)} rtl={isNativeRTL} />
          <Metric label={t("campaign.ends")} value={formatCampaignDate(campaign.endsOn, language)} rtl={isNativeRTL} />
        </View>

        <View style={styles.card}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, isNativeRTL && styles.rtl]}>{t("campaign.conditionsTitle")}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtl]}>{campaign.conditions || t("campaign.conditionsFallback")}</Text>
        </View>

        <View style={styles.sourceCard}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, isNativeRTL && styles.rtl]}>{t("campaign.sourceTitle")}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtl]}>{t("campaign.sourceBody")}</Text>
          <Text numberOfLines={2} style={[styles.sourceHost, isNativeRTL && styles.rtl]}>{campaign.sourceHost}</Text>
          <Action label={opening ? t("campaign.openingSource") : t("campaign.openSource")} onPress={openSource} disabled={opening} />
        </View>

        <TouchableOpacity style={styles.outletButton} onPress={() => navigation.navigate("OutletDetail", { outletId: campaign.outletId })}>
          <Text style={styles.outletButtonText}>{t("campaign.viewOutlet")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.travelButton} onPress={openTravelBasket}>
          <Text style={styles.travelButtonText}>{t("campaign.planTrip")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={() => void shareCampaign()}>
          <Text style={styles.shareButtonText}>{t("campaign.share")}</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={sharingVisual} style={[styles.shareVisualButton, sharingVisual && styles.disabled]} onPress={() => void shareCampaignVisual()}>
          <Text style={styles.shareVisualButtonText}>{t(sharingVisual ? "campaign.preparingVisual" : "campaign.shareVisual")}</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        desktop && styles.desktop,
        { paddingTop: desktop ? 32 : getScreenTopInset(insets.top), paddingBottom: desktop ? 32 : getFloatingTabClearance(insets.bottom) },
      ]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      {body}
    </ScrollView>
  );
}

function StateCard({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return <View style={styles.card}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text><Text style={styles.body}>{body}</Text>{children}</View>;
}

function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.cta, disabled && styles.disabled]}><Text style={styles.ctaText}>{label}</Text></TouchableOpacity>;
}

function Metric({ label, value, rtl }: { label: string; value: string; rtl: boolean }) {
  return <View style={styles.metric}><Text style={[styles.metricLabel, rtl && styles.rtl]}>{label}</Text><Text style={[styles.metricValue, rtl && styles.rtl]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: 16 },
  desktop: { width: "100%", maxWidth: 920, alignSelf: "center" },
  shareCaptureCard: { aspectRatio: 1, alignSelf: "center", backgroundColor: colors.primary, borderRadius: 24, maxWidth: 560, overflow: "hidden", width: "100%" },
  hero: { borderRadius: 24, flex: 1 },
  heroContent: { flex: 1, padding: 24, justifyContent: "flex-end" },
  kicker: { color: colors.gold, fontSize: 15, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  heroTitle: { color: colors.textInverse, fontSize: 30, lineHeight: 36, fontWeight: "900", marginTop: 7 },
  heroBrand: { color: colors.gold, fontSize: 17, lineHeight: 23, fontWeight: "900", marginTop: 10 },
  heroSubtitle: { color: "rgba(255,255,255,.92)", fontSize: 16, lineHeight: 23, fontWeight: "700", marginTop: 5 },
  shareBrand: { color: colors.textInverse, fontSize: 11, fontWeight: "900", letterSpacing: 1.4, marginTop: 16, opacity: 0.9 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18, gap: 10 },
  sourceCard: { backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold, borderRadius: 22, padding: 18, gap: 10 },
  sectionTitle: { color: colors.textPrimary, fontSize: 19, lineHeight: 25, fontWeight: "900" },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  sourceHost: { color: colors.textPrimary, fontSize: 13, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metric: { minWidth: "46%", flexGrow: 1, backgroundColor: colors.primary, borderRadius: 18, padding: 16 },
  metricLabel: { color: "rgba(255,255,255,.72)", fontSize: 12, fontWeight: "800" },
  metricValue: { color: colors.textInverse, fontSize: 17, fontWeight: "900", marginTop: 6 },
  cta: { backgroundColor: colors.gold, borderRadius: 15, padding: 15, alignItems: "center", marginTop: 4 },
  ctaText: { color: colors.primary, fontWeight: "900", fontSize: 15 },
  outletButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 15, padding: 15, alignItems: "center" },
  outletButtonText: { color: colors.primary, fontWeight: "900", fontSize: 15 },
  travelButton: { backgroundColor: colors.primary, borderRadius: 15, padding: 15, alignItems: "center" },
  travelButtonText: { color: colors.textInverse, fontWeight: "900", fontSize: 15 },
  shareButton: { backgroundColor: colors.goldSoft, borderColor: colors.gold, borderWidth: 1, borderRadius: 15, padding: 15, alignItems: "center" },
  shareButtonText: { color: colors.primary, fontWeight: "900", fontSize: 15 },
  shareVisualButton: { backgroundColor: colors.gold, borderRadius: 15, padding: 15, alignItems: "center" },
  shareVisualButtonText: { color: colors.primary, fontWeight: "900", fontSize: 15 },
  disabled: { opacity: 0.6 },
  rtl: { textAlign: "right" },
});
