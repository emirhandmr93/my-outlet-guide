import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useLanguage } from "../contexts/LanguageContext";
import { hasPremiumOutletMap } from "../features/premiumOutletMaps/availability";
import { openExternalUrl } from "../utils/externalUrl";
import { trackProductEvent } from "../utils/productAnalytics";
import { trackWebEvent } from "../utils/webAnalytics";

const APP_STORE_URL = "https://apps.apple.com/app/id6791893523";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.myoutletguide.app";
const MAX_MOBILE_WIDTH = 1024;

type StorePlatform = "ios" | "android";
type ContextKind = "outlet" | "transportation" | "brand" | "country" | "city" | "tax_free" | "index";
type WebContext = { kind: ContextKind; id?: string; outletId?: string };
type LinkItem = { label: string; path: string; key: string };

type Copy = {
  openOutlet: string;
  openApp: string;
  related: string;
  outlet: string;
  transportation: string;
  map: string;
  taxFree: string;
  explore: string;
  index: string;
  nearby: string;
};

const COPY: Record<string, Copy> = {
  en: { openOutlet: "Open this outlet in the app", openApp: "Continue in the app", related: "Related", outlet: "Outlet guide", transportation: "Transportation", map: "3D map", taxFree: "Tax Free", explore: "Explore outlets", index: "Outlet Index", nearby: "Nearby outlets" },
  tr: { openOutlet: "Bu outlet'i uygulamada aç", openApp: "Uygulamada devam et", related: "İlgili", outlet: "Outlet rehberi", transportation: "Ulaşım", map: "3D harita", taxFree: "Tax Free", explore: "Outletleri keşfet", index: "Outlet Endeksi", nearby: "Yakındaki outletler" },
  es: { openOutlet: "Abrir este outlet en la app", openApp: "Continuar en la app", related: "Relacionado", outlet: "Guía del outlet", transportation: "Transporte", map: "Mapa 3D", taxFree: "Tax Free", explore: "Explorar outlets", index: "Índice de outlets", nearby: "Outlets cercanos" },
  fr: { openOutlet: "Ouvrir cet outlet dans l’app", openApp: "Continuer dans l’app", related: "À découvrir", outlet: "Guide de l’outlet", transportation: "Transport", map: "Carte 3D", taxFree: "Tax Free", explore: "Explorer les outlets", index: "Indice Outlet", nearby: "Outlets à proximité" },
  de: { openOutlet: "Dieses Outlet in der App öffnen", openApp: "In der App fortfahren", related: "Passend dazu", outlet: "Outlet-Guide", transportation: "Anreise", map: "3D-Karte", taxFree: "Tax Free", explore: "Outlets entdecken", index: "Outlet-Index", nearby: "Outlets in der Nähe" },
  ar: { openOutlet: "افتح هذا الأوتلت في التطبيق", openApp: "المتابعة في التطبيق", related: "روابط ذات صلة", outlet: "دليل الأوتلت", transportation: "المواصلات", map: "خريطة 3D", taxFree: "استرداد الضريبة", explore: "استكشف الأوتلت", index: "مؤشر الأوتلت", nearby: "أوتلت قريبة" },
  ru: { openOutlet: "Открыть этот аутлет в приложении", openApp: "Продолжить в приложении", related: "Связанные разделы", outlet: "Гид по аутлету", transportation: "Транспорт", map: "3D-карта", taxFree: "Tax Free", explore: "Найти аутлеты", index: "Индекс аутлетов", nearby: "Аутлеты рядом" },
  zh: { openOutlet: "在应用中打开此奥特莱斯", openApp: "在应用中继续", related: "相关内容", outlet: "奥特莱斯指南", transportation: "交通", map: "3D 地图", taxFree: "退税", explore: "探索奥特莱斯", index: "奥特莱斯指数", nearby: "附近奥特莱斯" },
};

function detectStorePlatform(): StorePlatform | null {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return null;
  const userAgent = navigator.userAgent ?? "";
  const iPadOsDesktopMode = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(userAgent) || iPadOsDesktopMode) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return null;
}

function stripLanguage(path: string) {
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, "").replace(/^\/+|\/+$/g, "");
}

function parseContext(path: string): WebContext | null {
  const segments = stripLanguage(path).split("/").filter(Boolean);
  if (segments[0] === "outlet" && segments[1]) return { kind: "outlet", id: segments[1], outletId: segments[1] };
  if (segments[0] === "transportation" && segments[1]) return { kind: "transportation", id: segments[1], outletId: segments[1] };
  if (segments[0] === "brand" && segments[1]) return { kind: "brand", id: segments[1] };
  if (segments[0] === "country" && segments[1]) return { kind: "country", id: segments[1] };
  if (segments[0] === "city" && segments[1]) return { kind: "city", id: segments[1] };
  if (segments[0] === "calculator" && segments[1] === "tax-free") return { kind: "tax_free" };
  if (segments[0] === "research" && segments[1] === "european-outlet-shopping-index") return { kind: "index" };
  return null;
}

function localizedPath(language: string, path: string) {
  return `/${language}/${path}`.replace(/\/+$/, "");
}

function relatedLinks(context: WebContext, language: string, copy: Copy): LinkItem[] {
  if (context.outletId) {
    const links: LinkItem[] = [];
    if (context.kind === "transportation") links.push({ key: "outlet", label: copy.outlet, path: localizedPath(language, `outlet/${context.outletId}`) });
    else links.push({ key: "transportation", label: copy.transportation, path: localizedPath(language, `transportation/${context.outletId}`) });
    if (hasPremiumOutletMap(context.outletId)) links.push({ key: "map", label: copy.map, path: localizedPath(language, `outlet/${context.outletId}/3d-map`) });
    links.push({ key: "tax_free", label: copy.taxFree, path: localizedPath(language, "calculator/tax-free") });
    return links.slice(0, 3);
  }

  if (context.kind === "tax_free") {
    return [
      { key: "explore", label: copy.explore, path: localizedPath(language, "explore") },
      { key: "index", label: copy.index, path: localizedPath(language, "research/european-outlet-shopping-index") },
      { key: "nearby", label: copy.nearby, path: localizedPath(language, "nearby-outlets") },
    ];
  }

  return [
    { key: "explore", label: copy.explore, path: localizedPath(language, "explore") },
    { key: "tax_free", label: copy.taxFree, path: localizedPath(language, "calculator/tax-free") },
    { key: "index", label: copy.index, path: localizedPath(language, "research/european-outlet-shopping-index") },
  ];
}

function useWebPath() {
  const [path, setPath] = useState(() => typeof window === "undefined" ? "" : window.location.pathname);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const history = window.history as any;
    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);
    const sync = () => setPath(window.location.pathname);

    history.pushState = (...args: any[]) => { const result = originalPush(...args); sync(); return result; };
    history.replaceState = (...args: any[]) => { const result = originalReplace(...args); sync(); return result; };
    window.addEventListener("popstate", sync);
    sync();

    return () => {
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return path;
}

export function WebSeoConversionStrip() {
  const { language } = useLanguage();
  const { width } = useWindowDimensions();
  const path = useWebPath();
  const storePlatform = useMemo(detectStorePlatform, []);
  const context = useMemo(() => parseContext(path), [path]);
  const copy = COPY[language] ?? COPY.en;
  const links = useMemo(() => context ? relatedLinks(context, language, copy) : [], [context, copy, language]);

  if (Platform.OS !== "web" || width > MAX_MOBILE_WIDTH || !storePlatform || !context) return null;

  const storeUrl = storePlatform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
  const primaryLabel = context.outletId ? copy.openOutlet : copy.openApp;
  const rtl = language === "ar";

  function openAppStore() {
    trackProductEvent("app_download_click", {
      source: "seo_conversion_strip",
      store_platform: storePlatform,
      content_type: context?.kind ?? "unknown",
      content_id: context?.id,
    });
    trackProductEvent(storePlatform === "ios" ? "app_store_click" : "google_play_click", {
      source: "seo_conversion_strip",
      content_type: context?.kind ?? "unknown",
    });
    if (context?.outletId) {
      trackProductEvent("outlet_open", {
        source: "seo_app_cta",
        outlet_id: context.outletId,
      });
    }
    void openExternalUrl(storeUrl);
  }

  function openRelated(item: LinkItem) {
    trackWebEvent("seo_related_click", {
      source_path: path,
      destination_key: item.key,
      content_type: context?.kind ?? "unknown",
    });
    if (typeof window !== "undefined") window.location.assign(item.path);
  }

  return (
    <View style={[styles.shell, rtl && styles.rtl]} accessibilityRole="summary">
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={primaryLabel}
        onPress={openAppStore}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text numberOfLines={1} style={styles.primaryText}>{primaryLabel}</Text>
      </Pressable>
      <Text style={styles.relatedLabel}>{copy.related}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.links}>
        {links.map(item => (
          <Pressable
            key={item.key}
            accessibilityRole="link"
            accessibilityLabel={item.label}
            onPress={() => openRelated(item)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <Text style={styles.chipText}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: "center",
    backgroundColor: "#FFFDF5",
    borderBottomColor: "#E8D998",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: "100%",
    zIndex: 999,
  },
  rtl: { flexDirection: "row-reverse" },
  primary: {
    backgroundColor: "#D6AD27",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 36,
    maxWidth: 176,
    paddingHorizontal: 11,
  },
  primaryText: { color: "#0B1F3A", fontSize: 12, fontWeight: "900" },
  relatedLabel: { color: "#6B7280", fontSize: 10, fontWeight: "800" },
  links: { alignItems: "center", gap: 6, paddingEnd: 8 },
  chip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE1E7",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 10,
  },
  chipText: { color: "#0B1F3A", fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.68 },
});
