import { useEffect, useMemo, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useLanguage } from "../contexts/LanguageContext";
import { openExternalUrl } from "../utils/externalUrl";

const APP_STORE_URL = "https://apps.apple.com/app/id6791893523";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.myoutletguide.app";
const DISMISS_KEY = "my_outlet_guide_mobile_download_banner_dismissed";
const MAX_MOBILE_WIDTH = 1024;

type StorePlatform = "ios" | "android";

type BannerCopy = {
  subtitle: string;
  action: string;
  close: string;
};

const COPY: Record<string, BannerCopy> = {
  en: { subtitle: "Get the full outlet experience in the app", action: "Get the app", close: "Close app download banner" },
  tr: { subtitle: "Tam outlet deneyimi için uygulamayı kullan", action: "Uygulamayı indir", close: "Uygulama indirme bandını kapat" },
  es: { subtitle: "Disfruta de la experiencia completa en la app", action: "Descargar app", close: "Cerrar banner de descarga" },
  fr: { subtitle: "Profitez de l’expérience complète dans l’app", action: "Télécharger", close: "Fermer la bannière de téléchargement" },
  de: { subtitle: "Das vollständige Outlet-Erlebnis in der App", action: "App laden", close: "Download-Banner schließen" },
  ar: { subtitle: "استمتع بتجربة الأوتلت الكاملة في التطبيق", action: "تنزيل التطبيق", close: "إغلاق شريط تنزيل التطبيق" },
  ru: { subtitle: "Полный функционал аутлет-гайда доступен в приложении", action: "Скачать", close: "Закрыть баннер загрузки приложения" },
  zh: { subtitle: "在应用中获得完整奥特莱斯体验", action: "下载应用", close: "关闭应用下载横幅" },
};

function detectStorePlatform(): StorePlatform | null {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return null;

  const userAgent = navigator.userAgent ?? "";
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean; platform?: string } };
  const iPadOsDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/iPhone|iPad|iPod/i.test(userAgent) || iPadOsDesktopMode) return "ios";
  if (/Android/i.test(userAgent)) return "android";

  if (nav.userAgentData?.mobile === true) {
    const platform = nav.userAgentData.platform?.toLowerCase() ?? "";
    if (platform.includes("android")) return "android";
    if (platform.includes("ios")) return "ios";
  }

  return null;
}

function wasDismissedThisSession() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissal() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    // Storage can be unavailable in strict/private browsing modes. Hiding in memory is enough.
  }
}

export function MobileWebDownloadBanner() {
  const { language } = useLanguage();
  const { width } = useWindowDimensions();
  const [storePlatform, setStorePlatform] = useState<StorePlatform | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const platform = detectStorePlatform();
    setStorePlatform(platform);
    setDismissed(platform === null || wasDismissedThisSession());
  }, []);

  const copy = COPY[language] ?? COPY.en;
  const storeUrl = useMemo(() => {
    if (storePlatform === "ios") return APP_STORE_URL;
    if (storePlatform === "android") return PLAY_STORE_URL;
    return null;
  }, [storePlatform]);

  if (Platform.OS !== "web" || dismissed || !storeUrl || width > MAX_MOBILE_WIDTH) return null;

  const rtl = language === "ar";

  return (
    <View style={[styles.banner, rtl && styles.bannerRtl]} accessibilityRole="summary">
      <Image source={require("../../assets/icon.png")} style={styles.icon} accessibilityIgnoresInvertColors />
      <View style={styles.copyWrap}>
        <Text numberOfLines={1} style={[styles.title, rtl && styles.rtlText]}>My Outlet Guide</Text>
        <Text numberOfLines={1} style={[styles.subtitle, rtl && styles.rtlText]}>{copy.subtitle}</Text>
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={copy.action}
        hitSlop={8}
        onPress={() => void openExternalUrl(storeUrl)}
        style={({ pressed }) => [styles.downloadLink, pressed && styles.pressed]}
      >
        <Text style={styles.downloadLinkText}>{copy.action}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.close}
        hitSlop={10}
        onPress={() => {
          rememberDismissal();
          setDismissed(true);
        }}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <Text style={styles.closeText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: "center",
    backgroundColor: "#0B1F3A",
    borderBottomColor: "rgba(214, 173, 39, 0.45)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
    zIndex: 1000,
  },
  bannerRtl: {
    flexDirection: "row-reverse",
  },
  icon: {
    borderRadius: 9,
    height: 40,
    width: 40,
  },
  copyWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  rtlText: {
    textAlign: "right",
  },
  downloadLink: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 4,
  },
  downloadLinkText: {
    color: "#D6AD27",
    fontSize: 13,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  closeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 28,
  },
  closeText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 25,
    fontWeight: "300",
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.68,
  },
});
