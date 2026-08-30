import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const PROVIDERS = new Set(["aviasales", "agoda", "kiwitaxi", "yesim", "tiqets"]);
const CATEGORIES = new Set(["flight", "hotel", "transfer", "esim", "activities"]);
const PLACEMENTS = new Set([
  "travel_basket_hub", "outlet_detail", "trip_detail", "campaign_detail", "flight_search", "flight_deal_detail",
]);
const PLATFORMS = new Set(["ios", "android", "web"]);
const LOCALES = new Set(["en", "tr", "es", "fr", "de", "ru", "ar", "zh"]);
const SAFE_ID = /^[a-z0-9][a-z0-9_-]{0,179}$/i;

function enumValue(value: unknown, values: Set<string>, field: string) {
  if (typeof value !== "string" || !values.has(value)) throw new HttpsError("invalid-argument", `${field} is invalid.`);
  return value;
}

function optionalId(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !SAFE_ID.test(value)) throw new HttpsError("invalid-argument", `${field} is invalid.`);
  return value;
}

export const trackTravelPartnerClick = onCall({
  region: "us-central1", memory: "256MiB", timeoutSeconds: 15, maxInstances: 10,
}, async request => {
  const data = request.data && typeof request.data === "object" && !Array.isArray(request.data)
    ? request.data as Record<string, unknown>
    : {};
  const provider = enumValue(data.provider, PROVIDERS, "provider");
  const category = enumValue(data.category, CATEGORIES, "category");
  const placement = enumValue(data.placement, PLACEMENTS, "placement");
  const platform = enumValue(data.platform, PLATFORMS, "platform");
  const locale = enumValue(data.locale, LOCALES, "locale");
  if (typeof data.monetized !== "boolean") throw new HttpsError("invalid-argument", "monetized is invalid.");

  await getFirestore().collection("travelPartnerClickEvents").add({
    schemaVersion: 1,
    provider,
    category,
    placement,
    platform,
    locale,
    monetized: data.monetized,
    campaignId: optionalId(data.campaignId, "campaignId"),
    outletId: optionalId(data.outletId, "outletId"),
    countryId: optionalId(data.countryId, "countryId"),
    cityId: optionalId(data.cityId, "cityId"),
    authenticated: Boolean(request.auth?.uid),
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 400 * 24 * 60 * 60 * 1_000),
  });
  return { recorded: true };
});
