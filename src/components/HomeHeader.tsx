import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { languages } from "../constants/languages";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const homeHeroPremiumImage = require("../../assets/home/home-hero-premium.png");

type HomeHeaderProps = {
  userName?: string;
  isGuest?: boolean;
  onPressMenu?: () => void;
  onPressNotifications?: () => void;
  onPressLanguage?: () => void;
};

function getGreeting(
  t: (key: string) => string,
  userName?: string,
  isGuest?: boolean,
) {
  if (isGuest || !userName) {
    return t("home.header.welcome");
  }

  const hour = new Date().getHours();

  if (hour < 12) {
    return `${t("home.header.goodMorning")},\n${userName}`;
  }

  if (hour < 18) {
    return `${t("home.header.goodAfternoon")},\n${userName}`;
  }

  return `${t("home.header.goodEvening")},\n${userName}`;
}

export function HomeHeader({
  userName,
  isGuest,
  onPressMenu,
  onPressNotifications,
  onPressLanguage,
}: HomeHeaderProps) {
  const { t, language } = useTranslation();
  const selectedLanguage =
    languages.find((item) => item.languageCode === language) ?? languages[0];
  const title = getGreeting(t, userName, isGuest);
  const subtitle =
    isGuest || !userName
      ? t("home.header.guestSubtitle")
      : t("home.header.userSubtitle");

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.84}
          onPress={onPressMenu}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View pointerEvents="none" style={styles.brandWrap}>
          <Image
            source={require("../../assets/brand/app-icon.png")}
            style={styles.brandIcon}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>MY OUTLET GUIDE</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.84}
            onPress={onPressNotifications}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            activeOpacity={0.84}
            onPress={onPressLanguage}
          >
            <Text style={styles.languageText}>
              {selectedLanguage.flag}{" "}
              {selectedLanguage.languageCode.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ImageBackground
        source={homeHeroPremiumImage}
        style={styles.hero}
        imageStyle={styles.heroImage}
        resizeMode="cover"
      >
        <View style={styles.heroScrim} />
        <View style={styles.heroTextScrim} />
        <View style={styles.heroTextScrimDeep} />
        <View style={styles.heroTextScrimAnchor} />
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />
        <View style={styles.heroPatternRow}>
          <View style={styles.patternDot} />
          <View style={styles.patternLine} />
          <View style={styles.patternDotMuted} />
        </View>
        <View style={styles.overlay}>
          <View style={styles.heroBrandMark}>
            <Image
              source={require("../../assets/brand/app-icon.png")}
              style={styles.heroBrandIcon}
              resizeMode="contain"
            />
            <Text style={styles.heroLabel}>{t("home.heroLabel")}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    position: "relative",
  },

  brandWrap: {
    position: "absolute",
    left: 62,
    right: 132,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  brandIcon: {
    width: 34,
    height: 34,
    marginRight: spacing.xs,
  },

  brandText: {
    color: colors.primary,
    fontSize: typography.bodySmall,
    fontWeight: typography.weightBlack,
    letterSpacing: 0.7,
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },

  languageButton: {
    height: 46,
    minWidth: 74,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    ...shadows.soft,
  },

  menuIcon: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: typography.weightBlack,
    marginTop: -1,
  },

  bellIcon: {
    fontSize: 20,
    marginTop: -1,
  },

  languageText: {
    color: colors.textPrimary,
    fontSize: typography.bodySmall,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },

  hero: {
    minHeight: 260,
    borderRadius: radius.hero,
    overflow: "hidden",
    backgroundColor: colors.primary,
    ...shadows.premium,
  },

  heroImage: {
    borderRadius: radius.hero,
  },

  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,18,34,0.08)",
  },

  heroTextScrim: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "78%",
    height: "88%",
    backgroundColor: "rgba(6,18,34,0.34)",
  },

  heroTextScrimDeep: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "64%",
    height: "76%",
    backgroundColor: "rgba(5,15,30,0.38)",
  },

  heroTextScrimAnchor: {
    position: "absolute",
    left: 0,
    right: "28%",
    bottom: 0,
    height: "48%",
    backgroundColor: "rgba(4,12,24,0.34)",
  },

  heroGlowTop: {
    position: "absolute",
    top: -70,
    right: -44,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(201,162,39,0.22)",
  },

  heroGlowBottom: {
    position: "absolute",
    bottom: -90,
    left: -60,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroPatternRow: {
    position: "absolute",
    top: spacing.xl,
    right: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  patternDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },

  patternLine: {
    width: 54,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.34)",
  },

  patternDotMuted: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.42)",
  },

  overlay: {
    flex: 1,
    minHeight: 260,
    padding: spacing.xxl,
    justifyContent: "flex-end",
  },

  heroBrandMark: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7,22,42,0.76)",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },

  heroBrandIcon: {
    width: 22,
    height: 22,
    marginRight: spacing.sm,
  },

  heroLabel: {
    color: "#F6D86A",
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  title: {
    color: colors.textInverse,
    textShadowColor: "rgba(0,0,0,0.42)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: typography.h1,
    lineHeight: typography.lineH1,
    fontWeight: typography.weightBlack,
    letterSpacing: -0.7,
    marginBottom: spacing.md,
  },

  subtitle: {
    color: "#F7FAFF",
    textShadowColor: "rgba(0,0,0,0.36)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    fontWeight: typography.weightMedium,
    maxWidth: 310,
  },
});
