import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { outlets } from "../constants/outlets";
import { useTranslation } from "../hooks/useTranslation";
import { getImageSource, getOutletCardHeroImage } from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const headerOutlet = outlets.find(
  (outlet) => outlet.outletId === "la-vallee-village",
);
const headerHeroImage = headerOutlet
  ? getOutletCardHeroImage(headerOutlet, {
      mode: getConfiguredOutletMediaMode(),
    })
  : undefined;

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
  const { t } = useTranslation();
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
            <Text style={styles.languageText}>🇬🇧 EN</Text>
          </TouchableOpacity>
        </View>
      </View>

      {headerHeroImage ? (
        <ImageBackground
          source={getImageSource(headerHeroImage)}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </ImageBackground>
      ) : null}
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
    minHeight: 280,
    borderRadius: radius.hero,
    overflow: "hidden",
    backgroundColor: colors.primary,
    ...shadows.premium,
  },

  heroImage: {
    borderRadius: radius.hero,
  },

  overlay: {
    flex: 1,
    minHeight: 280,
    padding: spacing.xxl,
    justifyContent: "flex-end",
    backgroundColor: "rgba(11,31,58,0.64)",
  },

  title: {
    color: colors.textInverse,
    fontSize: typography.h1,
    lineHeight: typography.lineH1,
    fontWeight: typography.weightBlack,
    letterSpacing: -0.7,
    marginBottom: spacing.md,
  },

  subtitle: {
    color: "#EEF2F7",
    fontSize: typography.body,
    lineHeight: typography.lineBody,
    fontWeight: typography.weightMedium,
    maxWidth: 310,
  },
});
