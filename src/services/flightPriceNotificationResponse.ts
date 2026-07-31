export type FlightPriceNotificationTarget = {
  eventId: string;
  notificationIdentifier: string;
  actionIdentifier: string;
  responseIdentity: string;
  responseKey: string;
};

export type FlightPriceNotificationParseResult =
  | { status: "ignored" }
  | { status: "invalid_flight_price"; responseIdentity?: string }
  | { status: "target"; target: FlightPriceNotificationTarget };

const EVENT_ID_PATTERN = /^[0-9a-f]{64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function getResponseParts(response: unknown) {
  if (!isObject(response) || typeof response.actionIdentifier !== "string") return null;
  const notification = response.notification;
  if (!isObject(notification) || !isObject(notification.request)) return null;

  return {
    actionIdentifier: response.actionIdentifier,
    request: notification.request,
  };
}

function isValidNotificationIdentifier(value: unknown): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    value.trim() === value &&
    new TextEncoder().encode(value).length <= 512 &&
    !CONTROL_CHARACTER_PATTERN.test(value);
}

export function getNotificationResponseIdentity(response: unknown): string | null {
  const parts = getResponseParts(response);
  if (!parts || !isValidNotificationIdentifier(parts.request.identifier)) return null;
  return JSON.stringify([parts.request.identifier, parts.actionIdentifier]);
}

export function parseFlightPriceNotificationResponse(
  response: unknown,
  defaultActionIdentifier: string,
): FlightPriceNotificationParseResult {
  const actionIdentifier = isObject(response) ? response.actionIdentifier : undefined;
  if (typeof actionIdentifier === "string" && actionIdentifier !== defaultActionIdentifier) return { status: "ignored" };

  const notification = isObject(response) ? response.notification : undefined;
  const request = isObject(notification) ? notification.request : undefined;
  const content = isObject(request) ? request.content : undefined;
  const data = isObject(content) ? content.data : undefined;
  if (!isObject(data) || data.type !== "flightPriceAlert") return { status: "ignored" };

  const parts = getResponseParts(response);
  const responseIdentity = getNotificationResponseIdentity(response) ?? undefined;
  const keys = isPlainObject(data) ? Object.keys(data) : [];
  const validPayload = isPlainObject(data) && keys.length === 2 &&
    keys.includes("type") &&
    keys.includes("eventId") &&
    typeof data.eventId === "string" &&
    EVENT_ID_PATTERN.test(data.eventId);

  if (!parts || parts.actionIdentifier !== defaultActionIdentifier || !responseIdentity || !validPayload) {
    return responseIdentity
      ? { status: "invalid_flight_price", responseIdentity }
      : { status: "invalid_flight_price" };
  }

  const eventId = data.eventId as string;
  return {
    status: "target",
    target: {
      eventId,
      notificationIdentifier: parts.request.identifier as string,
      actionIdentifier: parts.actionIdentifier,
      responseIdentity,
      responseKey: JSON.stringify([responseIdentity, eventId]),
    },
  };
}

export function isSameFlightDealRoute(route: unknown, eventId: string): boolean {
  if (!isObject(route) || route.name !== "FlightDealDetail" || !isObject(route.params)) return false;
  return route.params.dealId === eventId;
}
