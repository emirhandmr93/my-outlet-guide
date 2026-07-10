import { outlets } from "../constants/outlets";
import type { TranslationLanguage } from "../translations/translations";
import { transportationGuides, type TransportationGuide } from "../constants/transportationGuides";
import { getTransportationForOutlet } from "./transportationService";

const UNSAFE_VALUE_PATTERN = /\b(confirm|check|varies|vary|provider|timetable|availability|unknown|not verified)\b/i;
const PROHIBITED_MAIN_LABEL_PATTERN = /private transfer|by car|parking|car \+ town parking|free parking/i;
const PUBLIC_TYPES = new Set(["train", "metro", "bus", "ferry", "walking"]);

export type TransportationV2Option = {
  id: string;
  originGroup: "airport" | "city" | "shuttle";
  originLabel: string;
  mode: string;
  modeLabel: string;
  duration?: string;
  fare?: string;
  durationLabel?: string;
  fareLabel?: string;
  note?: string;
  noteLabel?: string;
  providerNote?: string;
  title: string;
  steps: string[];
  hasOnlyFallbackMeta: boolean;
  hasUsefulEstimate: boolean;
  hasUsefulFare: boolean;
  isUsefulForPrimaryDisplay: boolean;
  isUsefulForSummaryDisplay: boolean;
  guide: TransportationGuide;
};


export type NearbyAirportDisplay = { code: string; name: string; distance?: string };

const NON_ENGLISH_LANGUAGES = new Set<TranslationLanguage>(["tr", "es", "fr", "de", "ru", "ar", "zh"]);
const LONG_SOURCE_PROSE_PATTERN = /;|\bfrom\b.*\bby\b|official .* bus|notes about|listed\s+coach|check official|confirm with provider/i;
const ENGLISH_STEP_PATTERN = /\b(check|travel|book|confirm|take|board|use|follow|return|parking|official|provider|timetable)\b/i;

const FALLBACKS: Record<TranslationLanguage, { time: string; fare: string; note: string; details: string; compactRecommended: string }> = {
  en: { time: "Check duration with provider", fare: "Check fare with provider", note: "Check current times and fares with the official provider.", details: "Check transport details in the guide", compactRecommended: "Check the most practical transport details from official sources." },
  tr: { time: "", fare: "", note: "Güncel saat ve ücret bilgisini resmi sağlayıcıdan kontrol et.", details: "Ulaşım detaylarını rehberde kontrol et", compactRecommended: "En pratik ulaşım bilgisini resmi kaynaklardan kontrol et." },
  es: { time: "Consulta la duración con el proveedor", fare: "Consulta la tarifa con el proveedor", note: "Consulta horarios y tarifas actuales con el proveedor oficial.", details: "Consulta los detalles de transporte en la guía", compactRecommended: "Consulta la información de transporte más práctica en fuentes oficiales." },
  fr: { time: "Vérifiez la durée auprès du fournisseur", fare: "Vérifiez le tarif auprès du fournisseur", note: "Vérifiez les horaires et tarifs actuels auprès du fournisseur officiel.", details: "Consultez les détails de transport dans le guide", compactRecommended: "Vérifiez les informations de transport les plus pratiques auprès des sources officielles." },
  de: { time: "Dauer beim Anbieter prüfen", fare: "Fahrpreis beim Anbieter prüfen", note: "Aktuelle Zeiten und Preise beim offiziellen Anbieter prüfen.", details: "Verkehrsdetails im Guide prüfen", compactRecommended: "Prüfe die praktischsten Verkehrsinformationen bei offiziellen Quellen." },
  ru: { time: "Проверьте время у провайдера", fare: "Проверьте стоимость у провайдера", note: "Проверьте актуальное расписание и цены у официального провайдера.", details: "Смотрите детали транспорта в путеводителе", compactRecommended: "Проверьте самый практичный вариант транспорта в официальных источниках." },
  ar: { time: "تحقق من المدة لدى المزوّد", fare: "تحقق من الأجرة لدى المزوّد", note: "تحقق من الأوقات والأجرة الحالية لدى المزوّد الرسمي.", details: "تحقق من تفاصيل المواصلات في الدليل", compactRecommended: "تحقق من معلومات الوصول الأنسب من المصادر الرسمية." },
  zh: { time: "请向服务商确认时长", fare: "请向服务商确认费用", note: "请向官方服务商确认当前班次和费用。", details: "在指南中查看交通详情", compactRecommended: "请从官方来源确认最实用的交通信息。" },
};

function fallbackFor(language: TranslationLanguage) {
  return FALLBACKS[language] || FALLBACKS.en;
}

export function sanitizeTransportationDisplayValue(value: string | undefined, language: TranslationLanguage): string | undefined {
  const normalized = String(value || "").trim();
  if (!normalized) return undefined;
  if (NON_ENGLISH_LANGUAGES.has(language) && LONG_SOURCE_PROSE_PATTERN.test(normalized)) return undefined;
  return normalized.replace(/\s+/g, " ");
}

export function formatTransportDurationForDisplay(value: string | undefined, language: TranslationLanguage): string | undefined {
  const normalized = sanitizeTransportationDisplayValue(value, language);
  if (!normalized) return undefined;
  const lessThan = normalized.match(/less than\s*(\d+)\s*hour/i);
  if (lessThan) return language === "tr" ? `${lessThan[1]} saatin altında` : `less than ${lessThan[1]} hour`;
  const range = normalized.match(/[≈~]?\s*(\d+)\s*[–-]\s*(\d+)\s*min/i);
  if (range) return `≈${range[1]}–${range[2]} ${language === "tr" ? "dk" : "min"}`;
  const minutes = normalized.match(/[≈~]?\s*(\d+)\s*min/i);
  if (minutes) return `≈${minutes[1]} ${language === "tr" ? "dk" : "min"}`;
  return normalized.length <= 22 ? normalized : undefined;
}

export function formatTransportFareForDisplay(value: string | undefined, language: TranslationLanguage): string | undefined {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  const outletLink = raw.match(/€\s?(\d+(?:[.,]\d+)?) each way plus rail fare/i);
  if (outletLink) return language === "tr" ? `€${outletLink[1]} / yön + tren ücreti` : `€${outletLink[1]} each way + rail fare`;
  const fromReturn = raw.match(/€\s?(\d+(?:[.,]\d+)?).*return/i);
  if (fromReturn) return language === "tr" ? `€${fromReturn[1]}’ten başlayan dönüş bileti` : `return from €${fromReturn[1]}`;
  const normalized = sanitizeTransportationDisplayValue(raw, language);
  if (!normalized) return undefined;
  return normalized.length <= 28 ? normalized : undefined;
}

export function formatTransportNoteForDisplay(guide: TransportationGuide, language: TranslationLanguage): string | undefined {
  const provider = guide.title.replace(/\s+/g, " ").trim();
  if (!provider || PROHIBITED_MAIN_LABEL_PATTERN.test(provider)) return undefined;
  if (NON_ENGLISH_LANGUAGES.has(language) && ENGLISH_STEP_PATTERN.test(provider)) return undefined;
  return provider.length <= 48 ? provider : undefined;
}

function modeLabel(mode: string, language: TranslationLanguage) {
  const labels: Record<TranslationLanguage, Partial<Record<string, string>>> = {
    en: { train: "Train", bus: "Bus", shuttle: "Shuttle", taxi: "Taxi / Uber", uber: "Uber", metro: "Public transport", ferry: "Ferry", walking: "Walking" },
    tr: { train: "Tren", bus: "Otobüs", shuttle: "Shuttle", taxi: "Taksi / Uber", uber: "Uber", metro: "Toplu ulaşım", ferry: "Feribot", walking: "Yürüyüş" },
    es: { train: "Tren", bus: "Autobús", shuttle: "Shuttle", taxi: "Taxi / Uber", uber: "Uber", metro: "Transporte público", ferry: "Ferry", walking: "A pie" },
    fr: { train: "Train", bus: "Bus", shuttle: "Navette", taxi: "Taxi / Uber", uber: "Uber", metro: "Transport public", ferry: "Ferry", walking: "À pied" },
    de: { train: "Zug", bus: "Bus", shuttle: "Shuttle", taxi: "Taxi / Uber", uber: "Uber", metro: "ÖPNV", ferry: "Fähre", walking: "Zu Fuß" },
    ru: { train: "Поезд", bus: "Автобус", shuttle: "Шаттл", taxi: "Такси / Uber", uber: "Uber", metro: "Общественный транспорт", ferry: "Паром", walking: "Пешком" },
    ar: { train: "قطار", bus: "حافلة", shuttle: "شاتل", taxi: "تاكسي / Uber", uber: "Uber", metro: "مواصلات عامة", ferry: "عبّارة", walking: "سيرًا" },
    zh: { train: "火车", bus: "公交", shuttle: "接驳车", taxi: "出租车 / Uber", uber: "Uber", metro: "公共交通", ferry: "渡轮", walking: "步行" },
  };
  return labels[language]?.[mode] || mode;
}

function modeTitle(mode: string, originGroup: TransportationV2Option["originGroup"], originLabel: string, language: TranslationLanguage) {
  if (language === "tr") {
    if (originGroup === "city" && mode === "train") return "Şehir merkezinden trenle";
    if (originGroup === "city" && mode === "bus") return "Şehir merkezinden otobüsle";
    if (originGroup === "airport" && ["train", "bus", "metro"].includes(mode)) return "Havalimanından toplu ulaşım ile";
    if (["taxi", "uber"].includes(mode)) return "Taksi / Uber ile";
    if (originGroup === "shuttle" || mode === "shuttle") return originLabel && originLabel !== "shuttle" ? `${originLabel}’dan shuttle ile` : "Shuttle ile";
  }
  const by: Record<TranslationLanguage, Partial<Record<string, string>>> = {
    en: { train: "by train", bus: "by bus", shuttle: "by shuttle", taxi: "by taxi/Uber", uber: "by Uber", metro: "by public transport", ferry: "by ferry", walking: "on foot" },
    tr: { train: "trenle", bus: "otobüsle", shuttle: "shuttle ile", taxi: "taksi/Uber ile", uber: "Uber ile", metro: "toplu ulaşım ile", ferry: "feribotla", walking: "yürüyerek" },
    es: { train: "en tren", bus: "en autobús", shuttle: "en shuttle", taxi: "en taxi/Uber", uber: "en Uber", metro: "en transporte público", ferry: "en ferry", walking: "a pie" },
    fr: { train: "en train", bus: "en bus", shuttle: "en navette", taxi: "en taxi/Uber", uber: "en Uber", metro: "en transport public", ferry: "en ferry", walking: "à pied" },
    de: { train: "mit dem Zug", bus: "mit dem Bus", shuttle: "mit dem Shuttle", taxi: "mit Taxi/Uber", uber: "mit Uber", metro: "mit ÖPNV", ferry: "mit der Fähre", walking: "zu Fuß" },
    ru: { train: "на поезде", bus: "на автобусе", shuttle: "на шаттле", taxi: "на такси/Uber", uber: "на Uber", metro: "на общественном транспорте", ferry: "на пароме", walking: "пешком" },
    ar: { train: "بالقطار", bus: "بالحافلة", shuttle: "بالشاتل", taxi: "بالتاكسي/Uber", uber: "بـ Uber", metro: "بالمواصلات العامة", ferry: "بالعبّارة", walking: "سيرًا" },
    zh: { train: "乘火车", bus: "乘公交", shuttle: "乘接驳车", taxi: "乘出租车/Uber", uber: "乘 Uber", metro: "乘公共交通", ferry: "乘渡轮", walking: "步行" },
  };
  const origin = originGroup === "airport" ? (language === "tr" ? "Havalimanından" : "From airport") : originGroup === "city" ? (language === "tr" ? "Şehir merkezinden" : "From city center") : (language === "tr" ? "Shuttle" : "Shuttle");
  const title = `${origin} ${by[language]?.[mode] || mode}`.replace(/\b(shuttle)\s+\1\b/ig, "$1").trim();
  return title;
}

function templatedSteps(guide: TransportationGuide, language: TranslationLanguage): string[] {
  if (language === "en") return guide.steps.slice().sort((a, b) => a.order - b.order).map((s) => s.description).slice(0, 4);
  if (language === "tr") {
    if (["train", "bus", "metro", "ferry", "walking"].includes(guide.transportationType)) return ["Resmi saatleri ve dönüş bağlantısını kontrol et.", "Şehir merkezindeki uygun tren/otobüs durağına git.", "Outlet’e en yakın istasyon veya durakta in.", "Dönüş saatini alışverişten önce tekrar kontrol et."];
    if (guide.transportationType === "shuttle") return ["Resmi shuttle sağlayıcısında güncel saat ve ücret bilgisini kontrol et.", "Bilet veya rezervasyon gerekiyorsa seyahatten önce tamamla.", "Belirtilen kalkış noktasına erken git.", "Dönüş saatini outlet’e varmadan önce teyit et."];
    if (guide.originType === "airport") return ["Havalimanından şehir bağlantısını veya doğrudan transfer seçeneğini kontrol et.", "Güncel süre ve ücret bilgisini sağlayıcıdan doğrula.", "Dönüş için son bağlantı saatini alışverişten önce kontrol et."];
    if (["taxi", "uber"].includes(guide.transportationType)) return ["Tahmini süre ve ücreti uygulamada kontrol et.", "Varış adresini outlet adıyla doğrula.", "Dönüş için yoğun saatleri dikkate al."];
  }
  return [fallbackFor(language).note];
}

function isShortUsefulNote(note: string | undefined, language: TranslationLanguage): boolean {
  const normalized = sanitizeTransportationDisplayValue(note, language);
  return Boolean(normalized) && normalized!.length <= 48 && !UNSAFE_VALUE_PATTERN.test(normalized!);
}

export function getTransportationOptionDisplayModel(option: TransportationV2Option, language: TranslationLanguage): TransportationV2Option {
  const durationLabel = formatTransportDurationForDisplay(option.guide.estimatedDuration, language);
  const fareLabel = formatTransportFareForDisplay(option.guide.estimatedCost, language);
  const noteLabel = formatTransportNoteForDisplay(option.guide, language);
  const rawSteps = option.guide.steps.slice().sort((a, b) => a.order - b.order).map((s) => s.description).filter(Boolean);
  const hasEnglishOnlySteps = rawSteps.some((step) => ENGLISH_STEP_PATTERN.test(step)) || rawSteps.some((step) => /\b(Check|Travel|Book|Confirm|Take|Board|Use|Ride|Arrive|Keep|Before shopping|From )\b/.test(step));
  const steps = NON_ENGLISH_LANGUAGES.has(language) && hasEnglishOnlySteps ? templatedSteps(option.guide, language) : rawSteps.slice(0, 4);
  const hasUsefulEstimate = Boolean(durationLabel);
  const hasUsefulFare = Boolean(fareLabel);
  const hasUsefulNote = isShortUsefulNote(noteLabel, language);
  const hasSafeSteps = steps.length > 0 && !steps.some((step) => NON_ENGLISH_LANGUAGES.has(language) && ENGLISH_STEP_PATTERN.test(step));
  const isUsefulForPrimaryDisplay = hasUsefulEstimate || hasUsefulFare || hasUsefulNote || hasSafeSteps;
  const isUsefulForSummaryDisplay = hasUsefulEstimate || hasUsefulFare || hasUsefulNote;
  return {
    ...option,
    modeLabel: modeLabel(option.mode, language),
    duration: durationLabel,
    fare: fareLabel,
    durationLabel,
    fareLabel,
    note: hasUsefulNote ? noteLabel : undefined,
    noteLabel: hasUsefulNote ? noteLabel : undefined,
    providerNote: undefined,
    title: modeTitle(option.mode, option.originGroup, option.originLabel, language),
    steps,
    hasOnlyFallbackMeta: !durationLabel && !fareLabel,
    hasUsefulEstimate,
    hasUsefulFare,
    isUsefulForPrimaryDisplay,
    isUsefulForSummaryDisplay,
  };
}

export function getTransportationDisplayFallbacks(language: TranslationLanguage) {
  return fallbackFor(language);
}

export function getNearbyAirportDisplay(outletId: string): NearbyAirportDisplay[] {
  const outlet = outlets.find((item) => item.outletId === outletId);
  return ((outlet?.airports || []) as { code: string; name: string; distanceKm?: number }[]).slice(0, 3).map((airport) => ({ code: airport.code, name: airport.name, distance: typeof airport.distanceKm === "number" ? `${airport.distanceKm} km` : undefined }));
}

export function isSourceBackedValue(value: string | undefined): boolean {
  const normalized = String(value || "").trim();
  return Boolean(normalized) && !UNSAFE_VALUE_PATTERN.test(normalized);
}

export function isSourceBackedGuide(guide: TransportationGuide): boolean {
  return isSourceBackedValue(guide.estimatedDuration) || isSourceBackedValue(guide.estimatedCost) || guide.steps.length > 0;
}

function isPublicTransport(guide: TransportationGuide): boolean {
  return PUBLIC_TYPES.has(guide.transportationType);
}

function getOriginLabel(guide: TransportationGuide): string {
  if (guide.originType === "city_center") return "city";
  if (guide.originType === "airport") return guide.originId;
  return guide.originId || guide.originType;
}

function toOption(guide: TransportationGuide): TransportationV2Option {
  const isShuttle = guide.transportationType === "shuttle";
  return {
    id: guide.guideId,
    originGroup: isShuttle ? "shuttle" : guide.originType === "airport" ? "airport" : "city",
    originLabel: getOriginLabel(guide),
    mode: guide.transportationType,
    modeLabel: guide.transportationType,
    duration: isSourceBackedValue(guide.estimatedDuration) ? guide.estimatedDuration : undefined,
    fare: isSourceBackedValue(guide.estimatedCost) ? guide.estimatedCost : undefined,
    title: guide.title,
    steps: guide.steps.slice().sort((a, b) => a.order - b.order).map((step) => step.description),
    hasOnlyFallbackMeta: !isSourceBackedValue(guide.estimatedDuration) && !isSourceBackedValue(guide.estimatedCost),
    hasUsefulEstimate: isSourceBackedValue(guide.estimatedDuration),
    hasUsefulFare: isSourceBackedValue(guide.estimatedCost),
    isUsefulForPrimaryDisplay: isSourceBackedGuide(guide),
    isUsefulForSummaryDisplay: isSourceBackedValue(guide.estimatedDuration) || isSourceBackedValue(guide.estimatedCost),
    guide,
  };
}

export function getTransportationV2Options(outletId: string): TransportationV2Option[] {
  return transportationGuides
    .filter((guide) => guide.outletId === outletId)
    .filter((guide) => !PROHIBITED_MAIN_LABEL_PATTERN.test(guide.title))
    .filter(isSourceBackedGuide)
    .map(toOption);
}

export function getRecommendedTransportationV2Option(outletId: string): TransportationV2Option | undefined {
  const options = getTransportationV2Options(outletId);
  return (
    options.find((option) => option.mode === "shuttle" && (option.duration || option.fare)) ||
    options.find((option) => option.originGroup === "city" && isPublicTransport(option.guide)) ||
    options.find((option) => option.originGroup === "airport" && isPublicTransport(option.guide)) ||
    options.find((option) => ["taxi", "uber"].includes(option.mode)) ||
    options[0]
  );
}

export function getOutletTransportationV2Summary(outletId: string): TransportationV2Option[] {
  const options = getTransportationV2Options(outletId);
  const displayOptions = options.map((option) => getTransportationOptionDisplayModel(option, "tr"));
  const airport = displayOptions.find((option) => option.originGroup === "airport" && option.isUsefulForSummaryDisplay);
  const city = displayOptions.find((option) => option.originGroup === "city" && isPublicTransport(option.guide) && option.isUsefulForSummaryDisplay) || displayOptions.find((option) => option.originGroup === "city" && option.isUsefulForSummaryDisplay);
  const shuttle = displayOptions.find((option) => option.originGroup === "shuttle" && option.isUsefulForSummaryDisplay);
  return [airport, city, shuttle].filter(Boolean).slice(0, 2) as TransportationV2Option[];
}

function dedupeOptions(options: TransportationV2Option[]): TransportationV2Option[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = [option.originGroup, option.mode, option.duration || "", option.fare || "", option.note || ""].join("|").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getUsefulTransportationV2DisplayOptions(outletId: string, language: TranslationLanguage): TransportationV2Option[] {
  return dedupeOptions(getTransportationV2Options(outletId).map((option) => getTransportationOptionDisplayModel(option, language)).filter((option) => option.isUsefulForPrimaryDisplay));
}

export function getSectionProviderNote(language: TranslationLanguage): string {
  return fallbackFor(language).note;
}

export function getCompactRecommendedFallback(language: TranslationLanguage): string {
  return fallbackFor(language).compactRecommended;
}

export function hasLegacyTransportationClutter(outletId: string): boolean {
  return getTransportationForOutlet(outletId).some((item) => PROHIBITED_MAIN_LABEL_PATTERN.test(`${item.title} ${item.cost}`));
}

export function getOutletMapLinks(outletId: string) {
  const outlet = outlets.find((item) => item.outletId === outletId);
  return outlet ? { googleMapsUrl: outlet.googleMapsUrl, appleMapsUrl: outlet.appleMapsUrl, yandexMapsUrl: outlet.yandexMapsUrl } : undefined;
}
