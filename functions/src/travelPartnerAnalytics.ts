import { createHash } from "node:crypto";

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
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 30;

function enumValue(value: unknown, values: Set<string>, field: string) {
  if (typeof value !== "string" || !values.has(value)) throw new HttpsError("invalid-argument", `${field} is invalid.`);
  return value;
}

function optionalId(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !SAFE_ID.test(value)) throw new HttpsError("invalid-argument", `${field} is invalid.`);
  return value;
}

function rateLimitIdentity(request: { auth?: { uid?: string }; app?: { appId?: string }; rawRequest: { ip?: string } }) {
  const uid = request.auth?.uid;
  if (typeof uid === "string" && uid) return `user:${uid}`;
  const ip = request.rawRequest.ip?.trim();
  if (!ip) throw new HttpsError("unauthenticated", "Analytics attestation is unavailable.");
  const appId = request.app?.appId;
  return `${typeof appId === "string" && appId ? `app:${appId}` : "anonymous"}:ip:${ip}`;
}

async function reserveAnalyticsEvent(identity: string, now: Date) {
  const db = getFirestore();
  const rateLimitId = createHash("sha256").update(identity).digest("hex");
  const ref = db.collection("travelPartnerClickRateLimits").doc(rateLimitId);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data() ?? {};
    const windowStartedAt = data.windowStartedAt instanceof Timestamp ? data.windowStartedAt.toDate() : null;
    const withinWindow = windowStartedAt !== null && now.getTime() - windowStartedAt.getTime() < RATE_LIMIT_WINDOW_MS;
    const count = withinWindow && typeof data.count === "number" ? data.count : 0;
    if (count >= RATE_LIMIT_MAX_EVENTS) {
      throw new HttpsError("resource-exhausted", "Too many analytics events.");
    }
    transaction.set(ref, {
      count: count + 1,
      windowStartedAt: Timestamp.fromDate(withinWindow && windowStartedAt ? windowStartedAt : now),
      updatedAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(now.getTime() + 24 * 60 * 60 * 1_000),
    }, { merge: true });
  });
}

export const trackTravelPartnerClick = onCall({
  region: "us-central1", memory: "256MiB", timeoutSeconds: 15, maxInstances: 10,
}, async request => {
  const now = new Date();
  const data = request.data && typeof request.data === "object" && !Array.isArray(request.data)
    ? request.data as Record<string, unknown>
    : {};
  const provider = enumValue(data.provider, PROVIDERS, "provider");
  const category = enumValue(data.category, CATEGORIES, "category");
  const placement = enumValue(data.placement, PLACEMENTS, "placement");
  const platform = enumValue(data.platform, PLATFORMS, "platform");
  const locale = enumValue(data.locale, LOCALES, "locale");
  if (typeof data.monetized !== "boolean") throw new HttpsError("invalid-argument", "monetized is invalid.");
  await reserveAnalyticsEvent(rateLimitIdentity(request), now);

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
    expiresAt: Timestamp.fromMillis(now.getTime() + 400 * 24 * 60 * 60 * 1_000),
  });
  return { recorded: true };
});
