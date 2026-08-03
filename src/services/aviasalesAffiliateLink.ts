import {
  AVIASALES_AFFILIATE_MARKER,
  AVIASALES_PROGRAM_ID,
  AVIASALES_SEARCH_TARGET_URL,
  TRAVELPAYOUTS_PROJECT_ID,
  TRAVELPAYOUTS_REDIRECT_BASE_URL,
} from "../constants/travelAffiliate";

export type AviasalesTripClass = "economy" | "business";

export type AviasalesAffiliateSearchInput = {
  originIata: string;
  destinationIata: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  tripClass?: AviasalesTripClass;
  locale?: string;
  currency?: "USD" | "EUR";
  subId?: string;
};

const IATA_PATTERN = /^[A-Za-z]{3}$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function validateIata(value: string, fieldName: "originIata" | "destinationIata") {
  if (!IATA_PATTERN.test(value)) {
    throw new Error(`${fieldName} must be exactly three ASCII letters`);
  }

  return value.toUpperCase();
}

function validateDate(value: string, fieldName: "departDate" | "returnDate") {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    throw new Error(`${fieldName} must be a valid date in YYYY-MM-DD format`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${fieldName} must be a valid calendar date`);
  }

  return value;
}

function toPathDate(value: string) {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new Error("validated date must be in YYYY-MM-DD format");
  return `${match[3]}${match[2]}`;
}

function validateIntegerInRange(value: number, fieldName: string, minimum: number, maximum: number) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${fieldName} must be an integer between ${minimum} and ${maximum}`);
  }
}

function normalizeSubId(value: string | undefined) {
  if (value === undefined) return "";

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

const AVIASALES_LOCALES = new Set(["en", "es", "fr", "de", "ru"]);

export function normalizeAviasalesLocale(value: string | undefined): string {
  const locale = value?.trim().toLowerCase() ?? "";
  return AVIASALES_LOCALES.has(locale) ? locale : "en";
}

export function buildAviasalesAffiliateSearchUrl(
  input: AviasalesAffiliateSearchInput,
): string {
  const originIata = validateIata(input.originIata, "originIata");
  const destinationIata = validateIata(input.destinationIata, "destinationIata");
  if (originIata === destinationIata) {
    throw new Error("originIata and destinationIata must be different");
  }

  const departDate = validateDate(input.departDate, "departDate");
  const returnDate = input.returnDate === undefined
    ? undefined
    : validateDate(input.returnDate, "returnDate");
  if (returnDate !== undefined && returnDate < departDate) {
    throw new Error("returnDate must not be earlier than departDate");
  }

  const children = input.children ?? 0;
  const infants = input.infants ?? 0;
  validateIntegerInRange(input.adults, "adults", 1, 9);
  validateIntegerInRange(children, "children", 0, 8);
  validateIntegerInRange(infants, "infants", 0, 9);
  if (input.adults + children > 9) {
    throw new Error("adults and children combined must not exceed 9");
  }
  if (infants > input.adults) {
    throw new Error("infants must not exceed adults");
  }

  const tripClass = input.tripClass ?? "economy";
  if (tripClass !== "economy" && tripClass !== "business") {
    throw new Error("tripClass must be economy or business");
  }

  const currency = input.currency ?? "USD";
  if (currency !== "USD" && currency !== "EUR") {
    throw new Error("currency must be USD or EUR");
  }

  const passengerCode = infants > 0
    ? `${input.adults}${children}${infants}`
    : children > 0
      ? `${input.adults}${children}`
      : String(input.adults);
  const searchCode = [
    originIata,
    toPathDate(departDate),
    destinationIata,
    returnDate === undefined ? "" : toPathDate(returnDate),
    tripClass === "business" ? "c" : "",
    passengerCode,
  ].join("");
  const targetParameters = new URLSearchParams({
    currency,
    locale: normalizeAviasalesLocale(input.locale),
  });

  const targetUrl = new URL(searchCode, AVIASALES_SEARCH_TARGET_URL);
  targetUrl.search = targetParameters.toString();

  const subId = normalizeSubId(input.subId);
  const marker = subId ? `${AVIASALES_AFFILIATE_MARKER}.${subId}` : AVIASALES_AFFILIATE_MARKER;
  const redirectUrl = new URL(TRAVELPAYOUTS_REDIRECT_BASE_URL);
  redirectUrl.search = new URLSearchParams({
    marker,
    trs: TRAVELPAYOUTS_PROJECT_ID,
    p: AVIASALES_PROGRAM_ID,
    u: targetUrl.toString(),
  }).toString();
  return redirectUrl.toString();
}
