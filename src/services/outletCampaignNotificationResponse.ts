import { getNotificationResponseIdentity } from "./flightPriceNotificationResponse";

export type OutletCampaignNotificationParseResult =
  | { status: "ignored" }
  | { status: "invalid_outlet_campaign"; responseIdentity?: string }
  | { status: "target"; target: { campaignId: string; responseIdentity: string; responseKey: string } };

const CAMPAIGN_ID_PATTERN = /^[a-z0-9][a-z0-9-]{7,179}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function parseOutletCampaignNotificationResponse(
  response: unknown,
  defaultActionIdentifier: string,
): OutletCampaignNotificationParseResult {
  const actionIdentifier = isObject(response) ? response.actionIdentifier : undefined;
  if (typeof actionIdentifier === "string" && actionIdentifier !== defaultActionIdentifier) return { status: "ignored" };
  const notification = isObject(response) ? response.notification : undefined;
  const request = isObject(notification) ? notification.request : undefined;
  const content = isObject(request) ? request.content : undefined;
  const data = isObject(content) ? content.data : undefined;
  if (!isObject(data) || data.type !== "outletCampaign") return { status: "ignored" };

  const responseIdentity = getNotificationResponseIdentity(response) ?? undefined;
  const keys = isPlainObject(data) ? Object.keys(data) : [];
  const validPayload = actionIdentifier === defaultActionIdentifier && responseIdentity &&
    keys.length === 2 && keys.includes("type") && keys.includes("campaignId") &&
    typeof data.campaignId === "string" && CAMPAIGN_ID_PATTERN.test(data.campaignId);
  if (!validPayload) return responseIdentity
    ? { status: "invalid_outlet_campaign", responseIdentity }
    : { status: "invalid_outlet_campaign" };

  const campaignId = data.campaignId as string;
  return { status: "target", target: {
    campaignId,
    responseIdentity,
    responseKey: JSON.stringify([responseIdentity, campaignId]),
  } };
}

export function isSameCampaignRoute(route: unknown, campaignId: string): boolean {
  if (!isObject(route) || route.name !== "CampaignDetail" || !isObject(route.params)) return false;
  return route.params.campaignId === campaignId;
}
