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
export type TravelBasketPlacement = "travel_basket_hub" | "outlet_detail" | "trip_detail";
export type TravelBasketProvider = "agoda" | "kiwitaxi" | "yesim" | "tiqets";

type TravelBasketOutboundInput = {
  category: TravelBasketCategory;
  placement: TravelBasketPlacement;
  contextId?: string;
};

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
