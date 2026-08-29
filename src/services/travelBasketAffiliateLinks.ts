import {
  AGODA_TARGET_URL,
  AVIASALES_AFFILIATE_MARKER,
  KIWITAXI_AFFILIATE_CLICK_BASE_URL,
  KIWITAXI_PROMO_ID,
  KIWITAXI_TARGET_URL,
  TIQETS_AFFILIATE_CLICK_BASE_URL,
  TIQETS_PROMO_ID,
  TIQETS_TARGET_URL,
  YESIM_AFFILIATE_URL,
} from "../constants/travelAffiliate";

export type TravelBasketCategory = "hotel" | "transfer" | "esim" | "activities";
export type TravelBasketPlacement = "travel_basket_hub" | "outlet_detail" | "trip_detail" | "campaign_detail";
export type TravelBasketProvider = "agoda" | "kiwitaxi" | "yesim" | "tiqets";

type TravelBasketOutboundInput = {
  category: TravelBasketCategory;
  placement: TravelBasketPlacement;
  contextId?: string;
  overrides?: TravelPartnerOverrides;
};

export type TravelPartnerOverride = { url: string; monetized: boolean };
export type TravelPartnerOverrides = Partial<Record<TravelBasketProvider, TravelPartnerOverride>>;

export type TravelBasketOutboundLink = {
  monetized: boolean;
  provider: TravelBasketProvider;
  url: string;
};

type CustomLinkInput = {
  clickBaseUrl: string;
  promoId: string;
  targetUrl: string;
  subId?: string;
};

const TRUSTED_TARGET_HOSTS = new Set([
  "www.agoda.com",
  "kiwitaxi.com",
  "yesim.tpo.lu",
  "www.tiqets.com",
]);

function isTrustedOutboundUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password && (
      TRUSTED_TARGET_HOSTS.has(host) || host.endsWith(".travelpayouts.com")
    );
  } catch { return false; }
}

export function parseTravelPartnerOverrides(value: unknown): TravelPartnerOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const result: TravelPartnerOverrides = {};
  for (const provider of ["agoda", "kiwitaxi", "yesim", "tiqets"] as const) {
    const candidate = source[provider];
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const data = candidate as Record<string, unknown>;
    if (data.enabled !== true || typeof data.url !== "string" || typeof data.monetized !== "boolean" ||
      !isTrustedOutboundUrl(data.url)) continue;
    result[provider] = { url: data.url, monetized: data.monetized };
  }
  return result;
}

export function normalizeTravelAffiliateSubId(value: string | undefined): string {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/[ -]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80)
    .replace(/_+$/g, "");
}

function getTrustedTargetUrl(value: string): URL {
  const target = new URL(value);
  if (
    target.protocol !== "https:" ||
    target.username ||
    target.password ||
    !TRUSTED_TARGET_HOSTS.has(target.hostname.toLowerCase())
  ) {
    throw new Error("Travel basket target must be a trusted HTTPS partner URL");
  }
  return target;
}

function getAffiliateMarker(subId: string | undefined): string {
  const normalizedSubId = normalizeTravelAffiliateSubId(subId);
  return normalizedSubId
    ? `${AVIASALES_AFFILIATE_MARKER}.${normalizedSubId}`
    : AVIASALES_AFFILIATE_MARKER;
}

export function buildTravelpayoutsCustomLink(input: CustomLinkInput): string {
  const targetUrl = getTrustedTargetUrl(input.targetUrl);
  const affiliateUrl = new URL(input.clickBaseUrl);
  if (affiliateUrl.protocol !== "https:" || !affiliateUrl.hostname.endsWith(".travelpayouts.com")) {
    throw new Error("Custom affiliate link must use a Travelpayouts HTTPS click host");
  }

  affiliateUrl.search = new URLSearchParams({
    shmarker: getAffiliateMarker(input.subId),
    promo_id: input.promoId,
    source_type: "customlink",
    type: "click",
    custom_url: targetUrl.toString(),
  }).toString();
  return affiliateUrl.toString();
}

export function buildTravelBasketOutboundLink(input: TravelBasketOutboundInput): TravelBasketOutboundLink {
  const subId = [input.category, input.placement, input.contextId]
    .filter(Boolean)
    .join("_");

  const providerByCategory: Record<TravelBasketCategory, TravelBasketProvider> = {
    hotel: "agoda", transfer: "kiwitaxi", esim: "yesim", activities: "tiqets",
  };
  const configured = input.overrides?.[providerByCategory[input.category]];
  if (configured && isTrustedOutboundUrl(configured.url)) {
    return { provider: providerByCategory[input.category], url: configured.url, monetized: configured.monetized };
  }

  switch (input.category) {
    case "hotel":
      // Agoda does not accept the current Travelpayouts Mobile app project.
      // Keep accommodation useful without sending unsupported affiliate traffic.
      return { monetized: false, provider: "agoda", url: getTrustedTargetUrl(AGODA_TARGET_URL).toString() };
    case "transfer":
      return {
        monetized: true,
        provider: "kiwitaxi",
        url: buildTravelpayoutsCustomLink({
          clickBaseUrl: KIWITAXI_AFFILIATE_CLICK_BASE_URL,
          promoId: KIWITAXI_PROMO_ID,
          targetUrl: KIWITAXI_TARGET_URL,
          subId,
        }),
      };
    case "esim":
      return {
        monetized: true,
        provider: "yesim",
        url: getTrustedTargetUrl(YESIM_AFFILIATE_URL).toString(),
      };
    case "activities":
      return {
        monetized: true,
        provider: "tiqets",
        url: buildTravelpayoutsCustomLink({
          clickBaseUrl: TIQETS_AFFILIATE_CLICK_BASE_URL,
          promoId: TIQETS_PROMO_ID,
          targetUrl: TIQETS_TARGET_URL,
          subId,
        }),
      };
  }
}
