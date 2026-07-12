import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslation } from "../hooks/useTranslation";
import { heroAssets } from "../media/heroAssets";
import { markOnboardingSeen } from "../services/onboardingStorage";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import typography from "../theme/typography";

type OnboardingPageKey = "outletDiscovery" | "tripPlanning" | "savingsTools" | "flightDeals";

type OnboardingPage = {
  key: OnboardingPageKey;
  hero: (typeof heroAssets)["explore"] | (typeof heroAssets)["trips"] | (typeof heroAssets)["savings"] | (typeof heroAssets)["flightDeals"];
};

const onboardingPages: OnboardingPage[] = [
  { key: "outletDiscovery", hero: heroAssets.explore },
  { key: "tripPlanning", hero: heroAssets.trips },
  { key: "savingsTools", hero: heroAssets.savings },
  { key: "flightDeals", hero: heroAssets.flightDeals },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [pageIndex, setPageIndex] = useState(0);
  const page = onboardingPages[pageIndex];
  const isLastPage = pageIndex === onboardingPages.length - 1;
  const compact = height < 700;
  const headerPaddingTop = insets.top + (compact ? 12 : 16);
  const footerPaddingBottom = Math.max(insets.bottom, compact ? spacing.sm : spacing.md);

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
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar style="light" />
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={[styles.topRow, { paddingTop: headerPaddingTop }]}>
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

        <ImageBackground
          source={page.hero}
          resizeMode="cover"
          style={[styles.visualCard, compact && styles.visualCardCompact]}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroImageScrim} />
          <View style={styles.searchPill}>
            <Feather name={page.key === "flightDeals" ? "bell" : "search"} size={15} color={colors.gold} />
            <Text style={styles.searchPillText}>{t(`onboarding.pages.${page.key}.visual`)}</Text>
          </View>
        </ImageBackground>

        <View style={styles.copyBlock}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
          <Text style={[styles.body, compact && styles.bodyCompact]}>{body}</Text>
        </View>

        <View style={styles.indicators} accessibilityLabel={t("onboarding.accessibility.pageIndicator")}>
          {onboardingPages.map((item, index) => (
            <View key={item.key} style={[styles.indicator, index === pageIndex && styles.indicatorActive]} />
          ))}
        </View>

        <View style={[styles.footerRow, { paddingBottom: footerPaddingBottom }]}>
          {pageIndex > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("onboarding.accessibility.back")}
              onPress={() => setPageIndex((current) => Math.max(0, current - 1))}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>{t("onboarding.back")}</Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLastPage ? t("onboarding.accessibility.start") : t("onboarding.accessibility.next")}
            onPress={isLastPage ? completeOnboarding : () => setPageIndex((current) => current + 1)}
            style={[styles.primaryButton, pageIndex === 0 && styles.primaryButtonFull]}
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
  container: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: "space-between" },
  containerCompact: { paddingHorizontal: spacing.lg },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  brand: { color: colors.gold, fontSize: typography.caption, fontWeight: typography.weightBlack, letterSpacing: 1.1, textTransform: "uppercase" },
  skipButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", minHeight: 40, justifyContent: "center" },
  skipText: { color: colors.textInverse, fontWeight: typography.weightExtraBold, fontSize: typography.bodySmall },
  visualCard: { width: "100%", height: 286, borderRadius: 30, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: "rgba(201,162,39,0.28)", justifyContent: "flex-end", overflow: "hidden", marginTop: spacing.lg, marginBottom: spacing.lg },
  visualCardCompact: { height: 248, marginTop: spacing.md, marginBottom: spacing.md },
  heroImage: { borderRadius: 30 },
  heroImageScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,31,68,0.16)" },
  searchPill: { alignSelf: "center", marginHorizontal: spacing.lg, marginBottom: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: "rgba(10,31,68,0.68)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  searchPillText: { color: colors.textInverse, fontSize: typography.caption, fontWeight: typography.weightBold },
  copyBlock: { alignItems: "center", paddingHorizontal: spacing.sm, marginTop: spacing.xs },
  title: { color: colors.textInverse, fontSize: typography.h1, lineHeight: typography.lineH1, fontWeight: typography.weightBlack, textAlign: "center" },
  titleCompact: { fontSize: typography.h2, lineHeight: typography.lineH2 },
  body: { marginTop: spacing.md, color: "rgba(255,255,255,0.78)", fontSize: typography.bodyLarge, lineHeight: 24, textAlign: "center", fontWeight: typography.weightSemiBold },
  bodyCompact: { fontSize: typography.body, lineHeight: typography.lineBody },
  indicators: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginTop: spacing.md },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)" },
  indicatorActive: { width: 26, backgroundColor: colors.gold },
  footerRow: { flexDirection: "row", gap: spacing.md, alignItems: "center", paddingTop: spacing.md },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.textInverse, fontWeight: typography.weightBlack, fontSize: typography.body },
  primaryButton: { flex: 1.35, minHeight: 54, borderRadius: 18, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  primaryButtonFull: { flex: 1 },
  primaryButtonText: { color: colors.primary, fontWeight: typography.weightBlack, fontSize: typography.bodyLarge },
});
