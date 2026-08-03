export type FlightPriceNotificationLocale = "en" | "tr" | "es" | "fr" | "de" | "ar" | "ru" | "zh";

const supportedLocales: readonly FlightPriceNotificationLocale[] = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"];

export function normalizeFlightPriceNotificationLocale(value: unknown): FlightPriceNotificationLocale {
  if (typeof value !== "string") return "en";
  const normalized = value.trim().toLowerCase();
  return supportedLocales.includes(normalized as FlightPriceNotificationLocale)
    ? normalized as FlightPriceNotificationLocale
    : "en";
}

type CommonInput = {
  originAirportCode: string;
  destinationAirportCode: string;
  currentPrice: number;
  averagePrice: number;
  matchedThreshold: number;
  historyWindowDays: number;
};

export type FlightPriceNotificationLocalizationInput = CommonInput & (
  | { kind: "exact_date" }
  | { kind: "rolling_route"; offerDepartDate: string; offerReturnDate?: string }
);

const money = (value: number) => Number(value.toFixed(2)).toString();

function formatDate(value: string, locale: FlightPriceNotificationLocale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`Invalid date-only value: ${value}`);
  const [, year, month, day] = match;
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const leapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1];
  if (!daysInMonth || numericDay < 1 || numericDay > daysInMonth) {
    throw new RangeError(`Invalid date-only value: ${value}`);
  }
  if (locale === "en") return value;
  if (locale === "tr" || locale === "de" || locale === "ru") return `${day}.${month}.${year}`;
  if (locale === "zh") return `${year}/${month}/${day}`;
  return `${day}/${month}/${year}`;
}

export function buildLocalizedFlightPriceNotificationContent(
  input: FlightPriceNotificationLocalizationInput,
  localeValue: unknown = "en",
): { title: string; body: string } {
  const locale = normalizeFlightPriceNotificationLocale(localeValue);
  const current = `€${money(input.currentPrice)}`;
  const average = `€${money(input.averagePrice)}`;
  const threshold = locale === "tr" ? `%${input.matchedThreshold}` : `${input.matchedThreshold}%`;
  const title = `${input.originAirportCode} → ${input.destinationAirportCode} · ${threshold}`;
  const days = input.historyWindowDays;

  if (input.kind === "exact_date") {
    const bodies: Record<FlightPriceNotificationLocale, string> = {
      en: `Tracked fare: ${current}. Recent ${days}-day average: ${average}.`,
      tr: `Takip edilen fiyat: ${current}. Son ${days} günlük ortalama: ${average}.`,
      es: `Tarifa registrada: ${current}. Promedio de los últimos ${days} días: ${average}.`,
      fr: `Tarif suivi : ${current}. Moyenne des ${days} derniers jours : ${average}.`,
      de: `Beobachteter Preis: ${current}. Durchschnitt der letzten ${days} Tage: ${average}.`,
      ar: `السعر المتتبع: ${current}. متوسط آخر ${days} يومًا: ${average}.`,
      ru: `Отслеживаемая цена: ${current}. Средняя цена за последние ${days} дней: ${average}.`,
      zh: `追踪票价：${current}。近${days}天平均价：${average}。`,
    };
    return { title, body: bodies[locale] };
  }

  const depart = formatDate(input.offerDepartDate, locale);
  const travelDates = input.offerReturnDate ? `${depart} → ${formatDate(input.offerReturnDate, locale)}` : depart;
  const bodies: Record<FlightPriceNotificationLocale, string> = {
    en: `Lowest tracked fare: ${current}. Recent ${days}-day average: ${average}. Travel: ${travelDates}.`,
    tr: `Takip edilen en düşük fiyat: ${current}. Son ${days} günlük ortalama: ${average}. Seyahat: ${travelDates}.`,
    es: `Tarifa más baja registrada: ${current}. Promedio de los últimos ${days} días: ${average}. Viaje: ${travelDates}.`,
    fr: `Tarif suivi le plus bas : ${current}. Moyenne des ${days} derniers jours : ${average}. Voyage : ${travelDates}.`,
    de: `Niedrigster beobachteter Preis: ${current}. Durchschnitt der letzten ${days} Tage: ${average}. Reise: ${travelDates}.`,
    ar: `أقل سعر تم تتبعه: ${current}. متوسط آخر ${days} يومًا: ${average}. السفر: ${travelDates}.`,
    ru: `Минимальная отслеживаемая цена: ${current}. Средняя цена за последние ${days} дней: ${average}. Поездка: ${travelDates}.`,
    zh: `追踪到的最低票价：${current}。近${days}天平均价：${average}。出行日期：${travelDates}。`,
  };
  return { title, body: bodies[locale] };
}
