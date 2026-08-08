import { Platform } from "react-native";
import { findWebSeoPage } from "../constants/webSeo";

const GA_MEASUREMENT_ID = "G-E5LLLD6ZM8";
const isProductionWeb = Platform.OS === "web" && process.env.NODE_ENV === "production";

type AnalyticsParameters = Record<string, string | number | boolean>;
type Gtag = (command: "config" | "event" | "js", target: string | Date, parameters?: AnalyticsParameters) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let initialized = false;
let lastPagePath = "";

function initializeWebAnalytics() {
  if (!isProductionWeb || typeof window === "undefined" || typeof document === "undefined") return false;
  if (initialized) return true;

  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag(...args: unknown[]) { window.dataLayer?.push(args); } as Gtag;
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
  return true;
}

export function trackWebEvent(name: string, parameters: AnalyticsParameters = {}) {
  if (!initializeWebAnalytics()) return;
  window.gtag?.("event", name, parameters);
}

export function trackWebPageView(path: string, title: string) {
  if (!initializeWebAnalytics() || lastPagePath === path) return;
  lastPagePath = path;
  window.gtag?.("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_title: title,
  });

  const page = findWebSeoPage(path);
  const localizedPath = path.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const viewEvent = page?.kind === "outlet" ? "outlet_detail_view"
    : page?.kind === "country" ? "country_view"
      : page?.kind === "city" ? "city_view"
        : page?.kind === "brand" ? "brand_view"
          : localizedPath === "/tax-free-guide" ? "tax_free_guide_view"
            : localizedPath === "/flight-deals" ? "flight_deals_view"
              : undefined;
  if (viewEvent) window.gtag?.("event", viewEvent, { content_id: page?.path ?? path });
}
