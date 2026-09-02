import { addBreadcrumb } from "@sentry/react-native";
import { Platform } from "react-native";

import { trackWebEvent } from "./webAnalytics";

export type ProductAnalyticsEvent =
  | "app_store_click"
  | "favorite_outlet"
  | "favorite_brand"
  | "flight_alert_create"
  | "google_play_click"
  | "outbound_affiliate_click"
  | "outlet_search"
  | "tax_free_calculator_use"
  | "trip_create"
  | "campaign_share"
  | "campaign_save"
  | "campaign_unsave"
  | "campaign_travel_basket_open"
  | "campaign_notification_open"
  | "outlet_match_brand_add"
  | "outlet_match_location_rank"
  | "outlet_match_share";

type ProductAnalyticsValue = string | number | boolean;
type ProductAnalyticsParameters = Record<string, ProductAnalyticsValue | null | undefined>;

const PARAMETER_KEY = /^[a-z][a-z0-9_]{0,39}$/;
const MAX_PARAMETERS = 20;
const MAX_STRING_LENGTH = 120;

function sanitizeParameters(parameters: ProductAnalyticsParameters): Record<string, ProductAnalyticsValue> {
  const safe: Record<string, ProductAnalyticsValue> = {};

  for (const [key, value] of Object.entries(parameters).slice(0, MAX_PARAMETERS)) {
    if (!PARAMETER_KEY.test(key) || value === null || value === undefined) continue;
    if (typeof value === "string") safe[key] = value.slice(0, MAX_STRING_LENGTH);
    else if (typeof value === "number" && Number.isFinite(value)) safe[key] = value;
    else if (typeof value === "boolean") safe[key] = value;
  }

  return safe;
}

export function trackProductEvent(event: ProductAnalyticsEvent, parameters: ProductAnalyticsParameters = {}) {
  const safeParameters = sanitizeParameters(parameters);
  if (Platform.OS === "web") {
    trackWebEvent(event, safeParameters);
    return;
  }

  addBreadcrumb({
    category: "product",
    level: "info",
    message: event,
    data: safeParameters,
  });
}

let lastNativeScreen = "";

export function trackNativeScreen(screenName: string | undefined) {
  if (Platform.OS === "web" || !screenName || screenName === lastNativeScreen) return;
  lastNativeScreen = screenName;
  addBreadcrumb({ category: "navigation", level: "info", message: "screen_view", data: { screen_name: screenName.slice(0, MAX_STRING_LENGTH) } });
}
