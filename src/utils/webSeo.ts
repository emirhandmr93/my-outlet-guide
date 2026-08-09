import { Platform } from "react-native";
import type { TranslationLanguage } from "../translations/locale";
import { findWebSeoPage, resolveWebSeo } from "../constants/webSeo";

function upsertMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) { element = document.createElement("meta"); element.name = name; document.head.appendChild(element); }
  element.content = content;
}

export function syncWebSeo(language: TranslationLanguage, pathname: string) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const metadata = resolveWebSeo(language, findWebSeoPage(pathname));
  document.title = metadata.title;
  upsertMeta("description", metadata.description);
  upsertMeta("robots", metadata.robots);
  document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach(element => element.remove());
  if (metadata.canonical) {
    const canonical = document.createElement("link"); canonical.rel = "canonical"; canonical.href = metadata.canonical; document.head.appendChild(canonical);
  }
  for (const alternate of metadata.alternates) {
    const element = document.createElement("link"); element.rel = "alternate"; element.hreflang = alternate.language; element.href = alternate.href; document.head.appendChild(element);
  }
  document.documentElement.lang = metadata.language;
  document.documentElement.dir = metadata.direction;
}
