import {
  AGODA_AFFILIATE_CLICK_BASE_URL,
  AGODA_PROMO_ID,
  AGODA_TARGET_URL,
  AIRALO_CAMPAIGN_ID,
  AIRALO_PROGRAM_ID,
  AIRALO_TARGET_URL,
  AVIASALES_AFFILIATE_MARKER,
  KIWITAXI_AFFILIATE_CLICK_BASE_URL,
  KIWITAXI_PROMO_ID,
  KIWITAXI_TARGET_URL,
  TIQETS_AFFILIATE_CLICK_BASE_URL,
  TIQETS_PROMO_ID,
  TIQETS_TARGET_URL,
  TRAVELPAYOUTS_PROJECT_ID,
  TRAVELPAYOUTS_REDIRECT_BASE_URL,
} from "../constants/travelAffiliate";

export type TravelBasketCategory = "hotel" | "transfer" | "esim" | "activities";
export type TravelBasketPlacement = "travel_basket_hub" | "outlet_detail" | "trip_detail";
export type TravelBasketProvider = "agoda" | "kiwitaxi" | "airalo" | "tiqets";

type TravelBasketAffiliateInput = {
  category: TravelBasketCategory;
  placement: TravelBasketPlacement;
  contextId?: string;
};

type CustomLinkInput = {
  clickBaseUrl: string;
  promoId: string;
  targetUrl: string;
  subId?: string;
};

type RedirectLinkInput = {
  programId: string;
  targetUrl: string;
  subId?: string;
  campaignId?: string;
};

const TRUSTED_TARGET_HOSTS = new Set([
  "www.agoda.com",
  "kiwitaxi.com",
  "www.airalo.com",
  "www.tiqets.com",
]);

const PROVIDERS: Record<TravelBasketCategory, TravelBasketProvider> = {
  hotel: "agoda",
  transfer: "kiwitaxi",
  esim: "airalo",
  activities: "tiqets",
};

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

export function buildTravelpayoutsRedirectLink(input: RedirectLinkInput): string {
  const targetUrl = getTrustedTargetUrl(input.targetUrl);
  const affiliateUrl = new URL(TRAVELPAYOUTS_REDIRECT_BASE_URL);
  const parameters: Record<string, string> = {
    marker: getAffiliateMarker(input.subId),
    trs: TRAVELPAYOUTS_PROJECT_ID,
    p: input.programId,
    u: targetUrl.toString(),
  };
  if (input.campaignId) parameters.campaign_id = input.campaignId;
  affiliateUrl.search = new URLSearchParams(parameters).toString();
  return affiliateUrl.toString();
}

export function getTravelBasketProvider(category: TravelBasketCategory): TravelBasketProvider {
  return PROVIDERS[category];
}

export function buildTravelBasketAffiliateUrl(input: TravelBasketAffiliateInput): string {
  const subId = [input.category, input.placement, input.contextId]
    .filter(Boolean)
    .join("_");

  switch (input.category) {
    case "hotel":
      return buildTravelpayoutsCustomLink({
        clickBaseUrl: AGODA_AFFILIATE_CLICK_BASE_URL,
        promoId: AGODA_PROMO_ID,
        targetUrl: AGODA_TARGET_URL,
        subId,
      });
    case "transfer":
      return buildTravelpayoutsCustomLink({
        clickBaseUrl: KIWITAXI_AFFILIATE_CLICK_BASE_URL,
        promoId: KIWITAXI_PROMO_ID,
        targetUrl: KIWITAXI_TARGET_URL,
        subId,
      });
    case "esim":
      return buildTravelpayoutsRedirectLink({
        programId: AIRALO_PROGRAM_ID,
        campaignId: AIRALO_CAMPAIGN_ID,
        targetUrl: AIRALO_TARGET_URL,
        subId,
      });
    case "activities":
      return buildTravelpayoutsCustomLink({
        clickBaseUrl: TIQETS_AFFILIATE_CLICK_BASE_URL,
        promoId: TIQETS_PROMO_ID,
        targetUrl: TIQETS_TARGET_URL,
        subId,
      });
  }
}
