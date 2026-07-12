import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "../hooks/useTranslation";
import { heroAssets } from "../media/heroAssets";
import { markOnboardingSeen } from "../services/onboardingStorage";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import typography from "../theme/typography";

type OnboardingPageKey = "outletDiscovery" | "tripPlanning" | "savingsTools" | "flightDeals";

type OnboardingPage = {
  key: OnboardingPageKey;
  icon: "shopping" | "calendar-check" | "receipt-text-outline" | "airplane-clock";
  hero: (typeof heroAssets)["explore"] | (typeof heroAssets)["trips"] | (typeof heroAssets)["savings"] | (typeof heroAssets)["flightDeals"];
};

const onboardingPages: OnboardingPage[] = [
  { key: "outletDiscovery", icon: "shopping", hero: heroAssets.explore },
  { key: "tripPlanning", icon: "calendar-check", hero: heroAssets.trips },
  { key: "savingsTools", icon: "receipt-text-outline", hero: heroAssets.savings },
  { key: "flightDeals", icon: "airplane-clock", hero: heroAssets.flightDeals },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [pageIndex, setPageIndex] = useState(0);
  const page = onboardingPages[pageIndex];
  const isLastPage = pageIndex === onboardingPages.length - 1;
  const compact = height < 700;

  const title = useMemo(() => t(`onboarding.pages.${page.key}.title`), [page.key, t]);
  const body = useMemo(() => t(`onboarding.pages.${page.key}.body`), [page.key, t]);

  async function completeOnboarding() {
    try {
      await markOnboardingSeen();
    } finally {
      onComplete();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>{t("onboarding.brand")}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.accessibility.skip")}
            hitSlop={10}
            onPress={completeOnboarding}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
          </Pressable>
        </View>

        <View style={[styles.visualCard, compact && styles.visualCardCompact]}>
          <View style={styles.glow} />
          <ImageBackground
            source={page.hero}
            resizeMode="cover"
            style={styles.heroImageFrame}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroImageScrim} />
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name={page.icon} size={compact ? 34 : 42} color={colors.gold} />
            </View>
          </ImageBackground>
          <View style={styles.searchPill}>
            <Feather name={page.key === "flightDeals" ? "bell" : "search"} size={16} color={colors.gold} />
            <Text style={styles.searchPillText}>{t(`onboarding.pages.${page.key}.visual`)}</Text>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
          <Text style={[styles.body, compact && styles.bodyCompact]}>{body}</Text>
        </View>

        <View style={styles.indicators} accessibilityLabel={t("onboarding.accessibility.pageIndicator")}>
          {onboardingPages.map((item, index) => (
            <View key={item.key} style={[styles.indicator, index === pageIndex && styles.indicatorActive]} />
          ))}
        </View>

        <View style={styles.footerRow}>
          {pageIndex > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("onboarding.accessibility.back")}
              onPress={() => setPageIndex((current) => Math.max(0, current - 1))}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{t("onboarding.back")}</Text>
            </Pressable>
          ) : (
            <View style={styles.secondaryButtonSpacer} />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLastPage ? t("onboarding.accessibility.start") : t("onboarding.accessibility.next")}
            onPress={isLastPage ? completeOnboarding : () => setPageIndex((current) => current + 1)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>{isLastPage ? t("onboarding.start") : t("onboarding.next")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg, justifyContent: "space-between" },
  containerCompact: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: colors.gold, fontSize: typography.caption, fontWeight: typography.weightBlack, letterSpacing: 1.1, textTransform: "uppercase" },
  skipButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" },
  skipText: { color: colors.textInverse, fontWeight: typography.weightExtraBold, fontSize: typography.bodySmall },
  visualCard: { minHeight: 260, borderRadius: 34, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: "rgba(201,162,39,0.35)", alignItems: "center", justifyContent: "center", overflow: "hidden", marginVertical: spacing.xl },
  visualCardCompact: { minHeight: 210, marginVertical: spacing.md },
  glow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(201,162,39,0.16)", top: -46, right: -38 },
  heroImageFrame: { width: "100%", minHeight: 166, borderRadius: 30, overflow: "hidden", justifyContent: "flex-end", padding: spacing.md, backgroundColor: colors.primary },
  heroImage: { borderRadius: 30 },
  heroImageScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,31,68,0.18)" },
  iconBadge: { width: 76, height: 76, borderRadius: 24, backgroundColor: "rgba(10,31,68,0.64)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  searchPill: { marginTop: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.10)" },
  searchPillText: { color: colors.textInverse, fontSize: typography.caption, fontWeight: typography.weightBold },
  copyBlock: { alignItems: "center", paddingHorizontal: spacing.sm },
  title: { color: colors.textInverse, fontSize: typography.h1, lineHeight: typography.lineH1, fontWeight: typography.weightBlack, textAlign: "center" },
  titleCompact: { fontSize: typography.h2, lineHeight: typography.lineH2 },
  body: { marginTop: spacing.md, color: "rgba(255,255,255,0.78)", fontSize: typography.bodyLarge, lineHeight: 24, textAlign: "center", fontWeight: typography.weightSemiBold },
  bodyCompact: { fontSize: typography.body, lineHeight: typography.lineBody },
  indicators: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginTop: spacing.lg },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)" },
  indicatorActive: { width: 26, backgroundColor: colors.gold },
  footerRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.textInverse, fontWeight: typography.weightBlack, fontSize: typography.body },
  secondaryButtonSpacer: { flex: 1 },
  primaryButton: { flex: 1.35, minHeight: 54, borderRadius: 18, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: colors.primary, fontWeight: typography.weightBlack, fontSize: typography.bodyLarge },
});
