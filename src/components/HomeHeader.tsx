import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { languages } from "../constants/languages";
import { LanguageFlag } from "./LanguageFlag";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const homeHeroPremiumImage = require("../../assets/home/home-hero-premium.png");
const brandIcon = require("../../assets/icon.png");

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
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const isCompactMobile = !isDesktopWeb && width < 400;
  const selectedLanguage =
    languages.find((item) => item.languageCode === language) ?? languages[0];
  const title = getGreeting(t, userName, isGuest);
  const subtitle =
    isGuest || !userName
      ? t("home.header.guestSubtitle")
      : t("home.header.userSubtitle");

  return (
    <View style={styles.wrapper}>
      <View style={[styles.topBar, isDesktopWeb ? styles.topBarDesktop : null]}>
        {!isDesktopWeb ? (
          <TouchableOpacity
            style={[styles.iconButton, isCompactMobile ? styles.iconButtonCompact : null]}
            activeOpacity={0.84}
            onPress={onPressMenu}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        ) : null}

        <View
          pointerEvents="none"
          style={[styles.brandWrap, isDesktopWeb ? styles.brandWrapDesktop : null, isCompactMobile ? styles.brandWrapCompact : null]}
        >
          <Image
            source={brandIcon}
            style={[styles.brandIcon, isDesktopWeb ? styles.brandIconDesktop : null, isCompactMobile ? styles.brandIconCompact : null]}
            resizeMode="contain"
          />
          <Text
            style={[styles.brandText, isDesktopWeb ? styles.brandTextDesktop : null, isCompactMobile ? styles.brandTextCompact : null]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            MY OUTLET GUIDE
          </Text>
        </View>

        <View style={[styles.rightActions, isCompactMobile ? styles.rightActionsCompact : null]}>
          {isDesktopWeb ? (
            <TouchableOpacity
              style={[styles.iconButton, styles.desktopMenuButton]}
              activeOpacity={0.84}
              onPress={onPressMenu}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.iconButton, isCompactMobile ? styles.iconButtonCompact : null]}
            activeOpacity={0.84}
            onPress={onPressNotifications}
          >
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageButton, isCompactMobile ? styles.languageButtonCompact : null]}
            activeOpacity={0.84}
            onPress={onPressLanguage}
          >
            <View style={[styles.languageContent, isCompactMobile ? styles.languageContentCompact : null]}>
              <LanguageFlag
                flag={selectedLanguage.flag}
                languageName={selectedLanguage.languageName}
                size={isCompactMobile ? 18 : 20}
              />
              <Text style={styles.languageText}>
                {selectedLanguage.languageCode.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ImageBackground
        source={homeHeroPremiumImage}
        style={[styles.hero, isDesktopWeb ? styles.heroDesktop : null]}
        imageStyle={[
          styles.heroImage,
          Platform.OS === "web" ? styles.heroImageWeb : null,
        ]}
        resizeMode="cover"
      >
        <View style={styles.heroScrim} />
        {Platform.OS !== "web" ? (
<>
<View style={styles.heroGradientLeft} />
<View style={styles.heroGradientBottom} />
<View style={styles.heroGradientAnchor} />
<View style={styles.heroGlowTop} />
<View style={styles.heroGlowBottom} />
</>
) : null}
        <View style={styles.heroPatternRow}>
          <View style={styles.patternDot} />
          <View style={styles.patternLine} />
          <View style={styles.patternDotMuted} />
        </View>
        <View style={[styles.overlay, isDesktopWeb ? styles.overlayDesktop : null]}>
          <View style={styles.heroBrandMark}>
            <Image
              source={brandIcon}
              style={styles.heroBrandIcon}
              resizeMode="contain"
            />
            <Text style={styles.heroLabel}>{t("home.heroLabel")}</Text>
          </View>
          <Text style={[styles.title, isDesktopWeb ? styles.titleDesktop : null]}>{title}</Text>
          <Text style={[styles.subtitle, isDesktopWeb ? styles.subtitleDesktop : null]}>
            {subtitle}
          </Text>
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

  topBarDesktop: {
    minHeight: 52,
    marginTop: spacing.md,
  },

  brandWrap: {
    position: "absolute",
    left: 62,
    right: 132,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    flexShrink: 1,
  },

  brandWrapCompact: {
    left: 48,
    right: 120,
    height: 44,
  },

  brandWrapDesktop: {
    position: "relative",
    left: undefined,
    right: undefined,
    height: 52,
    justifyContent: "flex-start",
  },

  brandIcon: {
    width: 34,
    height: 34,
    marginRight: spacing.xs,
  },

  brandIconDesktop: {
    width: 38,
    height: 38,
  },

  brandIconCompact: {
    width: 28,
    height: 28,
    marginRight: 4,
  },

  brandText: {
    color: colors.primary,
    fontSize: typography.bodySmall,
    fontWeight: typography.weightBlack,
    letterSpacing: 0.7,
    flexShrink: 1,
  },

  brandTextCompact: {
    fontSize: 12,
    letterSpacing: 0.45,
  },

  brandTextDesktop: {
    fontSize: typography.body,
    letterSpacing: 0.9,
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  rightActionsCompact: {
    gap: 4,
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

  iconButtonCompact: {
    width: 44,
    height: 44,
  },

  desktopMenuButton: {
    width: 42,
    height: 42,
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

  languageButtonCompact: {
    height: 44,
    minWidth: 68,
    paddingHorizontal: 6,
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
  },

  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  languageContentCompact: {
    gap: 4,
  },

  hero: {
    minHeight: 260,
    borderRadius: radius.hero,
    overflow: "hidden",
    backgroundColor: colors.primary,
    ...shadows.premium,
  },

  heroDesktop: {
    minHeight: 332,
  },

  heroImage: {
    borderRadius: radius.hero,
  },

  heroImageWeb: {
width: "100%",
height: "100%",
objectFit: "cover",
objectPosition: "50% 50%",
} as any,


  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,18,34,0.03)",
  },

  heroGradientLeft: {
    position: "absolute",
    left: -150,
    bottom: -96,
    width: 430,
    height: 380,
    borderRadius: 220,
    backgroundColor: "rgba(4,12,24,0.48)",
    transform: [{ scaleX: 1.22 }],
  },

  heroGradientBottom: {
    position: "absolute",
    left: -42,
    right: -42,
    bottom: -130,
    height: 260,
    borderRadius: 150,
    backgroundColor: "rgba(4,12,24,0.30)",
  },

  heroGradientAnchor: {
    position: "absolute",
    left: -82,
    bottom: -34,
    width: 330,
    height: 230,
    borderRadius: 150,
    backgroundColor: "rgba(4,12,24,0.20)",
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

  overlayDesktop: {
    minHeight: 332,
    paddingHorizontal: 40,
    paddingVertical: 36,
  },

  heroBrandMark: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7,22,42,0.42)",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
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

  titleDesktop: {
    fontSize: 42,
    lineHeight: 50,
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

  subtitleDesktop: {
    fontSize: 18,
    lineHeight: 27,
    maxWidth: 500,
  },
});
