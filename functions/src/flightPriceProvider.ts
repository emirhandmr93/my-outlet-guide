export type ProviderFlightTripType = "round_trip" | "one_way";

export type ProviderFlightTripClass = "economy" | "business";

export type ProviderFlightPriceQuery = {
  originAirportCode: string;
  destinationAirportCode: string;
  tripType: ProviderFlightTripType;
  departDate: string;
  returnDate?: string;
  tripClass: ProviderFlightTripClass;
  directOnly: boolean;
  currency: "EUR";
};

export type RollingRouteFlightPriceQuery = {
  originAirportCode: string;
  destinationAirportCode: string;
  tripType: ProviderFlightTripType;
  tripClass: ProviderFlightTripClass;
  directOnly: boolean;
  currency: "EUR";
  monitoringMode: "rolling_route";
  monitoringWindowDays: 365;
};

export type AviasalesCachedPrice = {
  price: number;
  currency: "EUR";
  originAirportCode: string;
  destinationAirportCode: string;
  departDate: string;
  returnDate?: string;
  tripClass: ProviderFlightTripClass;
  directOnly: boolean;
  transfers: number;
  airline?: string;
  flightNumber?: string;
  sourceFoundAt?: string;
};

export type AviasalesProviderErrorCode =
  | "invalid_query"
  | "missing_token"
  | "timeout"
  | "network_error"
  | "provider_http_4xx"
  | "provider_http_5xx"
  | "invalid_json"
  | "provider_error"
  | "invalid_response";

export class AviasalesProviderError extends Error {
  constructor(public readonly code: AviasalesProviderErrorCode, public readonly status?: number) {
    super(code);
    this.name = "AviasalesProviderError";
  }
}

const ENDPOINT = "https://api.travelpayouts.com/aviasales/v3/get_latest_prices";
const DAY_MS = 86_400_000;

function parseCalendarDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date
    : null;
}

function normalizeQuery(query: ProviderFlightPriceQuery): ProviderFlightPriceQuery {
  const originAirportCode = typeof query.originAirportCode === "string" ? query.originAirportCode.toUpperCase() : "";
  const destinationAirportCode = typeof query.destinationAirportCode === "string" ? query.destinationAirportCode.toUpperCase() : "";
  const depart = parseCalendarDate(query.departDate);
  const returnDate = query.returnDate;
  const returning = parseCalendarDate(returnDate);
  const valid =
    /^[A-Z]{3}$/.test(originAirportCode) &&
    /^[A-Z]{3}$/.test(destinationAirportCode) &&
    originAirportCode !== destinationAirportCode &&
    depart !== null &&
    (query.tripType === "round_trip" || query.tripType === "one_way") &&
    (query.tripType === "round_trip"
      ? returning !== null && returning.getTime() >= depart.getTime()
      : returnDate === undefined) &&
    (query.tripClass === "economy" || query.tripClass === "business") &&
    typeof query.directOnly === "boolean" &&
    query.currency === "EUR";
  if (!valid) throw new AviasalesProviderError("invalid_query");
  return { ...query, originAirportCode, destinationAirportCode };
}

export function buildAviasalesLatestPricesRequest(query: ProviderFlightPriceQuery): URL {
  const normalized = normalizeQuery(query);
  const parameters = new URLSearchParams({
    origin: normalized.originAirportCode,
    destination: normalized.destinationAirportCode,
    beginning_of_period: normalized.departDate,
    period_type: "day",
    one_way: String(normalized.tripType === "one_way"),
    sorting: "price",
    trip_class: normalized.tripClass === "economy" ? "0" : "1",
    currency: "EUR",
    market: "us",
    limit: "100",
    page: "1",
    show_to_affiliates: "true",
  });
  if (normalized.tripType === "round_trip") {
    const depart = parseCalendarDate(normalized.departDate)!;
    const returning = parseCalendarDate(normalized.returnDate)!;
    parameters.set("trip_duration", String((returning.getTime() - depart.getTime()) / DAY_MS));
  }
  const url = new URL(ENDPOINT);
  url.search = parameters.toString();
  return url;
}

function safeOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 200) : undefined;
}

function normalizeRollingQuery(query: RollingRouteFlightPriceQuery): RollingRouteFlightPriceQuery {
  const originAirportCode = typeof query.originAirportCode === "string" ? query.originAirportCode.toUpperCase() : "";
  const destinationAirportCode = typeof query.destinationAirportCode === "string" ? query.destinationAirportCode.toUpperCase() : "";
  if (
    !/^[A-Z]{3}$/.test(originAirportCode) || !/^[A-Z]{3}$/.test(destinationAirportCode) ||
    originAirportCode === destinationAirportCode ||
    (query.tripType !== "round_trip" && query.tripType !== "one_way") ||
    (query.tripClass !== "economy" && query.tripClass !== "business") ||
    typeof query.directOnly !== "boolean" || query.currency !== "EUR" ||
    query.monitoringMode !== "rolling_route" || query.monitoringWindowDays !== 365
  ) throw new AviasalesProviderError("invalid_query");
  return { ...query, originAirportCode, destinationAirportCode };
}

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getRollingRouteWindow(today: string): { startDate: string; endDate: string; years: number[] } {
  const start = parseCalendarDate(today);
  if (!start) throw new AviasalesProviderError("invalid_query");
  const end = new Date(start.getTime() + 364 * DAY_MS);
  const years = start.getUTCFullYear() === end.getUTCFullYear()
    ? [start.getUTCFullYear()]
    : [start.getUTCFullYear(), end.getUTCFullYear()];
  return { startDate: dateString(start), endDate: dateString(end), years };
}

export function buildAviasalesRollingRouteRequest(
  query: RollingRouteFlightPriceQuery,
  year: number,
  page: number,
): URL {
  const normalized = normalizeRollingQuery(query);
  if (!Number.isInteger(year) || year < 2000 || year > 9999 || !Number.isInteger(page) || page < 1 || page > 3) {
    throw new AviasalesProviderError("invalid_query");
  }
  const url = new URL(ENDPOINT);
  url.search = new URLSearchParams({
    origin: normalized.originAirportCode,
    destination: normalized.destinationAirportCode,
    period_type: "year",
    beginning_of_period: String(year),
    one_way: String(normalized.tripType === "one_way"),
    sorting: "price",
    trip_class: normalized.tripClass === "economy" ? "0" : "1",
    currency: "EUR",
    market: "us",
    show_to_affiliates: "true",
    group_by: "dates",
    limit: "100",
    page: String(page),
  }).toString();
  return url;
}

function compareCachedPrices(a: AviasalesCachedPrice, b: AviasalesCachedPrice): number {
  return a.price - b.price || a.departDate.localeCompare(b.departDate) ||
    (a.returnDate ?? "").localeCompare(b.returnDate ?? "") || a.transfers - b.transfers ||
    (a.airline ?? "").localeCompare(b.airline ?? "") || (a.flightNumber ?? "").localeCompare(b.flightNumber ?? "");
}

export function parseAviasalesRollingRouteResponse(
  body: unknown,
  query: RollingRouteFlightPriceQuery,
  today: string,
): { price: AviasalesCachedPrice | null; rowCount: number } {
  const normalized = normalizeRollingQuery(query);
  const window = getRollingRouteWindow(today);
  if (!isObject(body)) throw new AviasalesProviderError("invalid_response");
  if (body.success !== true) throw new AviasalesProviderError("invalid_response");
  if (!Array.isArray(body.data)) throw new AviasalesProviderError("invalid_response");
  if (body.currency !== undefined && body.currency !== null) {
    if (typeof body.currency !== "string" || (body.currency.trim() && body.currency.trim().toUpperCase() !== "EUR")) {
      throw new AviasalesProviderError("invalid_response");
    }
  }
  const expectedClass = normalized.tripClass === "economy" ? 0 : 1;
  let lowest: AviasalesCachedPrice | null = null;
  for (const item of body.data) {
    if (!isObject(item)) continue;
    const depart = parseCalendarDate(item.depart_date);
    const returning = parseCalendarDate(item.return_date);
    const origin = typeof item.origin === "string" ? item.origin : "";
    const destination = typeof item.destination === "string" ? item.destination : "";
    const returnValid = normalized.tripType === "round_trip"
      ? returning !== null && depart !== null && returning >= depart
      : item.return_date === undefined || item.return_date === null || item.return_date === "";
    if (
      origin !== normalized.originAirportCode || destination !== normalized.destinationAirportCode ||
      !depart || typeof item.depart_date !== "string" || item.depart_date < window.startDate || item.depart_date > window.endDate || !returnValid ||
      item.trip_class !== expectedClass || typeof item.value !== "number" || !Number.isFinite(item.value) || item.value <= 0 ||
      !Number.isInteger(item.number_of_changes) || (item.number_of_changes as number) < 0 ||
      (normalized.directOnly && item.number_of_changes !== 0) || item.actual === false
    ) continue;
    const candidate: AviasalesCachedPrice = {
      price: item.value, currency: "EUR", originAirportCode: normalized.originAirportCode,
      destinationAirportCode: normalized.destinationAirportCode, departDate: item.depart_date as string,
      ...(returning ? { returnDate: item.return_date as string } : {}), tripClass: normalized.tripClass,
      directOnly: normalized.directOnly, transfers: item.number_of_changes as number,
      ...(safeOptionalString(item.airline) ? { airline: safeOptionalString(item.airline) } : {}),
      ...(safeOptionalString(item.flight_number) ? { flightNumber: safeOptionalString(item.flight_number) } : {}),
      ...(safeOptionalString(item.found_at) ? { sourceFoundAt: safeOptionalString(item.found_at) } : {}),
    };
    if (!lowest || compareCachedPrices(candidate, lowest) < 0) lowest = candidate;
  }
  return { price: lowest, rowCount: body.data.length };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAviasalesLatestPricesResponse(
  body: unknown,
  normalizedQuery: ProviderFlightPriceQuery,
): AviasalesCachedPrice | null {
  if (!isObject(body)) throw new AviasalesProviderError("invalid_response");
  if (body.success !== true) throw new AviasalesProviderError("provider_error");
  if (!Array.isArray(body.data)) throw new AviasalesProviderError("invalid_response");
  if (body.currency !== undefined && body.currency !== null) {
    if (typeof body.currency !== "string") throw new AviasalesProviderError("invalid_response");
    const currency = body.currency.trim();
    if (currency && currency.toUpperCase() !== "EUR") throw new AviasalesProviderError("invalid_response");
  }
  const expectedClass = normalizedQuery.tripClass === "economy" ? 0 : 1;
  let lowest: AviasalesCachedPrice | null = null;
  for (const item of body.data) {
    if (!isObject(item)) continue;
    const origin = typeof item.origin === "string" ? item.origin.toUpperCase() : "";
    const destination = typeof item.destination === "string" ? item.destination.toUpperCase() : "";
    const returnDateMatches = normalizedQuery.tripType === "round_trip"
      ? item.return_date === normalizedQuery.returnDate
      : item.return_date === undefined || item.return_date === null || item.return_date === "";
    if (
      origin !== normalizedQuery.originAirportCode || destination !== normalizedQuery.destinationAirportCode ||
      item.depart_date !== normalizedQuery.departDate || !returnDateMatches || item.trip_class !== expectedClass ||
      typeof item.value !== "number" || !Number.isFinite(item.value) || item.value <= 0 ||
      !Number.isInteger(item.number_of_changes) || (item.number_of_changes as number) < 0 ||
      (normalizedQuery.directOnly && item.number_of_changes !== 0) || item.actual === false
    ) continue;
    const candidate: AviasalesCachedPrice = {
      price: item.value,
      currency: "EUR",
      originAirportCode: normalizedQuery.originAirportCode,
      destinationAirportCode: normalizedQuery.destinationAirportCode,
      departDate: normalizedQuery.departDate,
      ...(normalizedQuery.returnDate ? { returnDate: normalizedQuery.returnDate } : {}),
      tripClass: normalizedQuery.tripClass,
      directOnly: normalizedQuery.directOnly,
      transfers: item.number_of_changes as number,
      ...(safeOptionalString(item.airline) ? { airline: safeOptionalString(item.airline) } : {}),
      ...(safeOptionalString(item.flight_number) ? { flightNumber: safeOptionalString(item.flight_number) } : {}),
      ...(safeOptionalString(item.found_at) ? { sourceFoundAt: safeOptionalString(item.found_at) } : {}),
    };
    if (!lowest || candidate.price < lowest.price) lowest = candidate;
  }
  return lowest;
}

export async function fetchAviasalesCachedPrice(
  query: ProviderFlightPriceQuery,
  token: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<AviasalesCachedPrice | null> {
  const normalized = normalizeQuery(query);
  if (typeof token !== "string" || !token.trim()) throw new AviasalesProviderError("missing_token");
  const url = buildAviasalesLatestPricesRequest(normalized);
  if (url.protocol !== "https:" || url.hostname !== "api.travelpayouts.com") {
    throw new AviasalesProviderError("invalid_query");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    let response: Response;
    try {
      response = await fetchImplementation(url, {
        method: "GET",
        headers: { "X-Access-Token": token, Accept: "application/json", "Accept-Encoding": "gzip, deflate" },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        throw new AviasalesProviderError("timeout");
      }
      throw new AviasalesProviderError("network_error");
    }
    if (!response.ok) {
      throw new AviasalesProviderError(response.status >= 500 ? "provider_http_5xx" : "provider_http_4xx", response.status);
    }
    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
        throw new AviasalesProviderError("timeout");
      }
      throw new AviasalesProviderError("invalid_json");
    }
    return parseAviasalesLatestPricesResponse(body, normalized);
  } catch (error) {
    if (error instanceof AviasalesProviderError) throw error;
    throw new AviasalesProviderError(controller.signal.aborted ? "timeout" : "network_error");
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAviasalesRollingRoutePrice(
  query: RollingRouteFlightPriceQuery,
  today: string,
  token: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<AviasalesCachedPrice | null> {
  const normalized = normalizeRollingQuery(query);
  const window = getRollingRouteWindow(today);
  if (typeof token !== "string" || !token.trim()) throw new AviasalesProviderError("missing_token");
  let lowest: AviasalesCachedPrice | null = null;
  for (const year of window.years) {
    for (let page = 1; page <= 3; page += 1) {
      const url = buildAviasalesRollingRouteRequest(normalized, year, page);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      try {
        let response: Response;
        try {
          response = await fetchImplementation(url, {
            method: "GET",
            headers: { "X-Access-Token": token, Accept: "application/json", "Accept-Encoding": "gzip, deflate" },
            signal: controller.signal,
          });
        } catch (error) {
          if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
            throw new AviasalesProviderError("timeout");
          }
          throw new AviasalesProviderError("network_error");
        }
        if (!response.ok) {
          throw new AviasalesProviderError(response.status >= 500 ? "provider_http_5xx" : "provider_http_4xx", response.status);
        }
        let body: unknown;
        try {
          body = await response.json();
        } catch (error) {
          if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
            throw new AviasalesProviderError("timeout");
          }
          throw new AviasalesProviderError("invalid_json");
        }
        const parsed = parseAviasalesRollingRouteResponse(body, normalized, today);
        if (parsed.price && (!lowest || compareCachedPrices(parsed.price, lowest) < 0)) lowest = parsed.price;
        if (parsed.rowCount < 100) break;
      } catch (error) {
        if (error instanceof AviasalesProviderError) throw error;
        throw new AviasalesProviderError(controller.signal.aborted ? "timeout" : "network_error");
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  return lowest;
}

export function compareRollingRoutePrices(a: AviasalesCachedPrice, b: AviasalesCachedPrice): number {
  return compareCachedPrices(a, b);
}
