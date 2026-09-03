import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { officialCampaignHostsByOutlet } from "../constants/officialCampaignHosts";
import type { TranslationLanguage } from "../translations/locale";
import {
  getCanonicalCampaignOutletName,
  sanitizeCampaignPresentationText,
} from "./outletCampaignDisplayIntegrity";
import { resolveCampaignDisplayText } from "./outletCampaignLocalization";

export const OUTLET_CAMPAIGNS_COLLECTION = "outletCampaigns";

export type OutletCampaign = {
  type: "offer" | "event";
  campaignId: string;
  outletId: string;
  outletName: string;
  brandName: string;
  headline: string;
  summary: string;
  conditions: string;
  discountLabel: string;
  discountPercent: number | null;
  startsOn: string;
  endsOn: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  featuredPriority: number;
  sourceUrl: string;
  sourceHost: string;
  sourceLocale: "en";
};

function requiredString(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength
    ? value.trim()
    : null;
}

function optionalString(value: unknown, maxLength: number): string {
  return typeof value === "string" && value.length <= maxLength ? value.trim() : "";
}

function timestampDate(value: unknown): Date | null {
  if (!(value instanceof Timestamp)) return null;
  const date = value.toDate();
  return Number.isFinite(date.getTime()) ? date : null;
}

export function isOfficialCampaignSourceUrl(outletId: string, sourceUrl: string, declaredHost?: string): boolean {
  try {
    const parsed = new URL(sourceUrl);
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === "https:"
      && !parsed.username
      && !parsed.password
      && officialCampaignHostsByOutlet[outletId]?.includes(host) === true
      && (!declaredHost || host === declaredHost.toLowerCase());
  } catch {
    return false;
  }
}

export function parsePublishedOutletCampaign(
  snapshot: QueryDocumentSnapshot<DocumentData> | { id: string; data(): DocumentData },
  now = new Date(),
  language: TranslationLanguage = "en",
): OutletCampaign | null {
  const data = snapshot.data();
  const campaignId = requiredString(data.campaignId, 180);
  const outletId = requiredString(data.outletId, 160);
  const storedOutletName = requiredString(data.outletName, 240);
  const brandName = requiredString(data.brandName, 160);
  const headline = requiredString(data.headline, 200);
  const summary = requiredString(data.summary, 700);
  const discountLabel = requiredString(data.discountLabel, 160);
  const startsOn = requiredString(data.startsOn, 10);
  const endsOn = requiredString(data.endsOn, 10);
  const startsAt = timestampDate(data.startsAt);
  const endsAt = timestampDate(data.endsAt);
  const sourceUrl = requiredString(data.sourceUrl, 2_048);
  const sourceHost = requiredString(data.sourceHost, 253);
  const timeZone = requiredString(data.timeZone, 80);
  const verification = data.verification && typeof data.verification === "object"
    ? data.verification as Record<string, unknown>
    : null;
  const type = data.type === "event" ? "event" : data.type === "offer" ? "offer" : null;
  const evidenceValid = type === "offer"
    ? verification?.discountEvidence === true
    : type === "event" && verification?.eventEvidence === true;
  const canonicalOutletName = outletId ? getCanonicalCampaignOutletName(outletId) : null;
  if (data.schemaVersion !== 2 || data.status !== "published" || data.active !== true
    || data.autoPublished !== true || data.sourceLocale !== "en"
    || verification?.status !== "verified" || verification.officialDomain !== true
    || verification.explicitDateRange !== true || !evidenceValid
    || verification.approvalRequired !== false
    || !type || campaignId !== snapshot.id || !outletId || !storedOutletName || !canonicalOutletName
    || !brandName || !headline || !summary || !discountLabel || !startsOn || !endsOn
    || !startsAt || !endsAt || !sourceUrl || !sourceHost || !timeZone
    || !/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn)
    || now < startsAt || now >= endsAt
    || !isOfficialCampaignSourceUrl(outletId, sourceUrl, sourceHost)) return null;

  const englishText = sanitizeCampaignPresentationText({
    brandName,
    headline,
    summary,
    conditions: optionalString(data.conditions, 900),
    discountLabel,
  }, outletId, canonicalOutletName);
  const localizedDisplayText = resolveCampaignDisplayText(data.localizedText, language, englishText);
  const displayText = sanitizeCampaignPresentationText(localizedDisplayText, outletId, canonicalOutletName);

  return {
    type,
    campaignId,
    outletId,
    outletName: canonicalOutletName,
    brandName: displayText.brandName,
    headline: displayText.headline,
    summary: displayText.summary,
    conditions: displayText.conditions,
    discountLabel: displayText.discountLabel,
    discountPercent: typeof data.discountPercent === "number" && Number.isFinite(data.discountPercent)
      ? data.discountPercent
      : null,
    startsOn,
    endsOn,
    startsAt,
    endsAt,
    timeZone,
    featuredPriority: typeof data.featuredPriority === "number" && Number.isFinite(data.featuredPriority)
      ? data.featuredPriority
      : 0,
    sourceUrl,
    sourceHost,
    sourceLocale: data.sourceLocale,
  };
}

function sortCampaigns(campaigns: OutletCampaign[]): OutletCampaign[] {
  return campaigns.sort((left, right) =>
    right.featuredPriority - left.featuredPriority
      || left.endsAt.getTime() - right.endsAt.getTime()
      || left.campaignId.localeCompare(right.campaignId),
  );
}

export function subscribeActiveOutletCampaigns(
  onCampaigns: (campaigns: OutletCampaign[]) => void,
  onError?: (error: unknown) => void,
  language: TranslationLanguage = "en",
): Unsubscribe {
  const activeQuery = query(
    collection(db, OUTLET_CAMPAIGNS_COLLECTION),
    where("status", "==", "published"),
    where("active", "==", true),
    orderBy("featuredPriority", "desc"),
    limit(60),
  );
  let documents: QueryDocumentSnapshot<DocumentData>[] = [];
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  const clearExpiryTimer = () => {
    if (expiryTimer !== undefined) clearTimeout(expiryTimer);
    expiryTimer = undefined;
  };
  const emitCurrentCampaigns = () => {
    const now = new Date();
    const campaigns = sortCampaigns(documents
      .map(document => parsePublishedOutletCampaign(document, now, language))
      .filter((campaign): campaign is OutletCampaign => campaign !== null));
    onCampaigns(campaigns);
    clearExpiryTimer();
    const nearestExpiry = campaigns.reduce<number | null>((nearest, campaign) => {
      const expiresAt = campaign.endsAt.getTime();
      return nearest === null || expiresAt < nearest ? expiresAt : nearest;
    }, null);
    if (nearestExpiry !== null) {
      const maximumDelay = 2_147_483_647;
      const delay = Math.min(maximumDelay, Math.max(25, nearestExpiry - now.getTime() + 25));
      expiryTimer = setTimeout(emitCurrentCampaigns, delay);
    }
  };
  const unsubscribe = onSnapshot(activeQuery, snapshot => {
    documents = [...snapshot.docs];
    emitCurrentCampaigns();
  }, error => {
    documents = [];
    clearExpiryTimer();
    onCampaigns([]);
    onError?.(error);
  });
  return () => {
    clearExpiryTimer();
    unsubscribe();
  };
}

export function subscribeActiveOutletCampaignsForOutlet(
  outletId: string,
  onCampaigns: (campaigns: OutletCampaign[]) => void,
  onError?: (error: unknown) => void,
  language: TranslationLanguage = "en",
): Unsubscribe {
  if (!/^[a-z0-9-]{2,160}$/.test(outletId)) {
    onCampaigns([]);
    return () => undefined;
  }
  const outletQuery = query(
    collection(db, OUTLET_CAMPAIGNS_COLLECTION),
    where("outletId", "==", outletId),
    where("status", "==", "published"),
    where("active", "==", true),
    orderBy("featuredPriority", "desc"),
    limit(100),
  );
  let documents: QueryDocumentSnapshot<DocumentData>[] = [];
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  const clearExpiryTimer = () => {
    if (expiryTimer !== undefined) clearTimeout(expiryTimer);
    expiryTimer = undefined;
  };
  const emitCurrentCampaigns = () => {
    const now = new Date();
    const campaigns = sortCampaigns(documents
      .map(document => parsePublishedOutletCampaign(document, now, language))
      .filter((campaign): campaign is OutletCampaign => campaign !== null));
    onCampaigns(campaigns);
    clearExpiryTimer();
    const nearestExpiry = campaigns.reduce<number | null>((nearest, campaign) => {
      const expiresAt = campaign.endsAt.getTime();
      return nearest === null || expiresAt < nearest ? expiresAt : nearest;
    }, null);
    if (nearestExpiry !== null) {
      const delay = Math.min(2_147_483_647, Math.max(25, nearestExpiry - now.getTime() + 25));
      expiryTimer = setTimeout(emitCurrentCampaigns, delay);
    }
  };
  const unsubscribe = onSnapshot(outletQuery, snapshot => {
    documents = [...snapshot.docs];
    emitCurrentCampaigns();
  }, error => {
    documents = [];
    clearExpiryTimer();
    onCampaigns([]);
    onError?.(error);
  });
  return () => {
    clearExpiryTimer();
    unsubscribe();
  };
}

export async function getActiveOutletCampaign(
  campaignId: string,
  language: TranslationLanguage = "en",
): Promise<OutletCampaign | null> {
  if (!/^[a-z0-9-]{8,180}$/.test(campaignId)) return null;
  const snapshot = await getDoc(doc(db, OUTLET_CAMPAIGNS_COLLECTION, campaignId));
  return snapshot.exists() ? parsePublishedOutletCampaign(snapshot, new Date(), language) : null;
}

export function formatCampaignDate(dateOnly: string, language: TranslationLanguage): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!match) return dateOnly;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  try {
    return new Intl.DateTimeFormat(language, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  } catch {
    return dateOnly;
  }
}
