import { outlets } from "../constants/outlets";
import type { TranslationLanguage } from "../translations/translations";
import {
  transportationGuides,
  type TransportationGuide,
  type TransportationType,
} from "../constants/transportationGuides";
import { getTransportationForOutlet } from "./transportationService";
import { getTransportationRouteFact, type TransportationRouteFact } from "../constants/transportationRouteFacts";

const UNSAFE_VALUE_PATTERN =
  /\b(confirm|check|varies|vary|provider|timetable|availability|unknown|not verified|kontrol et|sağlayıcıdan)\b/i;
const PROHIBITED_MAIN_LABEL_PATTERN =
  /private transfer|by car|parking|car \+ town parking|free parking/i;
const PUBLIC_TYPES = new Set(["train", "metro", "bus", "ferry", "walking"]);
const NON_ENGLISH_LANGUAGES = new Set<TranslationLanguage>([
  "tr",
  "es",
  "fr",
  "de",
  "ru",
  "ar",
  "zh",
]);
const LONG_SOURCE_PROSE_PATTERN =
  /;|\bfrom\b.*\bby\b|official .* bus|notes about|listed\s+coach|check official|confirm with provider/i;
const ENGLISH_STEP_PATTERN =
  /\b(check|travel|book|confirm|take|board|use|follow|return|parking|official|provider|timetable|arrive|ride)\b/i;

type SourceConfidence = "source" | "derived" | "fallbackEstimate";
type RouteFactConfidence = "exact" | "partial" | "estimateOnly";

export type TransportationRouteDetailDisplayModel = {
  lineOrProviderLabel?: string;
  operatorLabel?: string;
  boardingPointLabel?: string;
  alightingPointLabel?: string;
  transferLabel?: string;
  destinationLabel?: string;
  routeHintLabel?: string;
  walkNoteLabel?: string;
  officialCheckNoteLabel?: string;
  confidence: RouteFactConfidence;
  hasSourceBackedRouteDetail: boolean;
};

export type TransportationEstimateDisplayModel = {
  id: string;
  title: string;
  modeLabel: string;
  originLabel: string;
  estimatedDurationLabel: string;
  estimatedFareLabel: string;
  noteLabel?: string;
  routeDetails: TransportationRouteDetailDisplayModel;
  steps: string[];
  sourceConfidence: SourceConfidence;
};

export type TransportationV2Option = TransportationEstimateDisplayModel & {
  originGroup: "airport" | "city" | "shuttle";
  mode: TransportationType;
  duration?: string;
  fare?: string;
  durationLabel?: string;
  fareLabel?: string;
  note?: string;
  providerNote?: string;
  hasOnlyFallbackMeta: boolean;
  hasUsefulEstimate: boolean;
  hasUsefulFare: boolean;
  isUsefulForPrimaryDisplay: boolean;
  isUsefulForSummaryDisplay: boolean;
  guide: TransportationGuide;
  routeFact?: TransportationRouteFact;
};

export type NearbyAirportDisplay = {
  code: string;
  name: string;
  distance?: string;
};
type OutletAirport = { code: string; name: string; distanceKm?: number };
type OutletLike = {
  outletId: string;
  airports?: OutletAirport[];
  cityCenterDistanceKm?: number;
  airportDistanceKm?: number;
  cityCenterInfo?: { distanceKm?: number };
};
type Estimate = {
  duration: [number, number];
  fare: [number, number];
  confidence: SourceConfidence;
};

const I18N: Record<
  TranslationLanguage,
  {
    approx: string;
    min: string;
    duration: string;
    fare: string;
    note: string;
    details: string;
    city: string;
    airport: string;
    titles: Record<string, string>;
    modes: Record<string, string>;
    steps: Record<string, string[]>;
    routeLabels: Record<string, string>;
    noteTemplates: Record<string, (fact: TransportationRouteFact) => string | undefined>;
  }
> = {
  en: {
    approx: "Approx.",
    min: "min",
    duration: "Duration",
    fare: "Fare",
    note: "Check current times and fares before you travel.",
    details: "See transport estimates in the guide",
    city: "From city center",
    airport: "From airport",
    titles: {
      cityTrain: "From city center by train",
      cityBus: "From city center by bus",
      cityPublic: "From city center by public transport",
      airportPublic: "From airport by public transport",
      airportTaxi: "From airport by taxi/Uber",
      shuttle: "By shuttle",
      taxi: "By taxi / Uber",
    },
    modes: {
      train: "Train",
      bus: "Bus",
      shuttle: "Shuttle",
      taxi: "Taxi / Uber",
      uber: "Uber",
      metro: "Public transport",
      ferry: "Ferry",
      walking: "Walking",
    },
    steps: {
      public: [
        "Go to the most convenient city transport stop.",
        "Take the listed public transport connection toward the outlet area.",
        "Get off at the closest outlet stop or station.",
        "Walk to the outlet entrance and check the return time before shopping.",
      ],
      airportPublic: [
        "Follow airport signs to public transport.",
        "Take the city or regional connection toward the outlet area.",
        "Transfer if required and get off near the outlet.",
        "Check the return connection before shopping.",
      ],
      taxi: [
        "Open a taxi or ride-hailing app.",
        "Set the outlet as the destination and compare the estimate.",
        "Confirm the pickup point before departure.",
        "Allow extra time for peak-hour return travel.",
      ],
      shuttle: [
        "Check the shuttle departure point before travel.",
        "Reserve or buy a ticket if required.",
        "Arrive early at the departure point.",
        "Confirm the return departure before shopping.",
      ],
    },
    routeLabels: {
      line: "Line",
      provider: "Provider",
      operator: "Operator",
      boarding: "Board",
      alighting: "Alight",
      transfer: "Transfer",
      destination: "Destination",
      origin: "Origin",
      walking: "Walk",
      checkRoute: "Check line/stop details with the official provider.",
    },
    noteTemplates: {
      officialCheck: (fact) => fact.officialCheckNote || fact.sourceNote,
      walk: (fact) => fact.walkNote,
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `Use the official station bus from ${fact.alightingPoint} to ${fact.destination} when operating.` : undefined,
      returnCheck: (fact) => `Check current ${fact.provider || fact.operator || fact.line || "provider"} times before travel.`,
    },
  },
  tr: {
    approx: "Yaklaşık",
    min: "dk",
    duration: "Süre",
    fare: "Ücret",
    note: "Güncel saat ve ücretleri seyahat öncesi kontrol edin.",
    details: "Ulaşım tahminlerini rehberde gör",
    city: "Şehir merkezinden",
    airport: "Havalimanından",
    titles: {
      cityTrain: "Şehir merkezinden trenle",
      cityBus: "Şehir merkezinden otobüsle",
      cityPublic: "Şehir merkezinden toplu ulaşım ile",
      airportPublic: "Havalimanından toplu ulaşım ile",
      airportTaxi: "Havalimanından taksi/Uber ile",
      shuttle: "Shuttle ile",
      taxi: "Taksi / Uber ile",
    },
    modes: {
      train: "Tren",
      bus: "Otobüs",
      shuttle: "Shuttle",
      taxi: "Taksi / Uber",
      uber: "Uber",
      metro: "Toplu ulaşım",
      ferry: "Feribot",
      walking: "Yürüyüş",
    },
    steps: {
      public: [
        "Şehir merkezindeki uygun tren veya otobüs durağına gidin.",
        "Outlet yönündeki toplu ulaşım bağlantısına binin.",
        "Outlet’e en yakın durak veya istasyonda inin.",
        "Girişe yürüyün ve dönüş saatini alışverişten önce kontrol edin.",
      ],
      airportPublic: [
        "Havalimanında toplu ulaşım yönlendirmelerini izleyin.",
        "Şehir veya bölgesel bağlantıyla outlet yönüne ilerleyin.",
        "Gerekirse aktarma yapıp outlet’e en yakın durakta inin.",
        "Dönüş bağlantısını alışverişten önce kontrol edin.",
      ],
      taxi: [
        "Taksi veya Uber uygulamasını açın.",
        "Varış noktası olarak outlet adını seçip tahmini ücreti karşılaştırın.",
        "Kalkış noktasını sürücüyle doğrulayın.",
        "Dönüşte yoğun saatler için ek süre bırakın.",
      ],
      shuttle: [
        "Shuttle kalkış noktasını seyahatten önce kontrol edin.",
        "Gerekiyorsa bilet veya rezervasyonu tamamlayın.",
        "Belirtilen kalkış noktasına erken gidin.",
        "Dönüş kalkış saatini alışverişten önce doğrulayın.",
      ],
    },
    routeLabels: {
      line: "Hat",
      provider: "Sağlayıcı",
      operator: "Operatör",
      boarding: "Biniş",
      alighting: "İniş",
      transfer: "Aktarma",
      destination: "Varış",
      origin: "Başlangıç",
      walking: "Yürüyüş",
      checkRoute: "Eksik hat veya durak bilgisini resmi sağlayıcıdan kontrol edin.",
    },
    noteTemplates: {
      officialCheck: (fact) => `${fact.provider || fact.operator || fact.line || "Resmi sağlayıcı"} saatlerini seyahatten önce kontrol edin.`,
      walk: (fact) => fact.alightingPoint === "Parndorf Ort" ? "Outlet servisi çalışıyorsa kullanın veya yürüyüş bağlantısını takip edin." : fact.destination ? `${fact.destination} girişine yürüyerek devam edin.` : "Yürüyüş bağlantısını takip edin.",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} ile ${fact.destination} arasındaki resmi outlet servisini çalışıyorsa kullanın.` : undefined,
      returnCheck: (fact) => `${fact.provider || fact.operator || fact.line || "Dönüş"} saatlerini alışverişten önce kontrol edin.`,
    },
  },
  es: {
    approx: "Aprox.",
    min: "min",
    duration: "Duración",
    fare: "Tarifa",
    note: "Consulta horarios y tarifas actuales antes de viajar.",
    details: "Ver estimaciones de transporte en la guía",
    city: "Desde el centro",
    airport: "Desde el aeropuerto",
    titles: {
      cityTrain: "Desde el centro en tren",
      cityBus: "Desde el centro en autobús",
      cityPublic: "Desde el centro en transporte público",
      airportPublic: "Desde el aeropuerto en transporte público",
      airportTaxi: "Desde el aeropuerto en taxi/Uber",
      shuttle: "En shuttle",
      taxi: "En taxi / Uber",
    },
    modes: {
      train: "Tren",
      bus: "Autobús",
      shuttle: "Shuttle",
      taxi: "Taxi / Uber",
      uber: "Uber",
      metro: "Transporte público",
      ferry: "Ferry",
      walking: "A pie",
    },
    steps: {} as any,
    routeLabels: {
      line: "Línea",
      provider: "Proveedor",
      operator: "Operador",
      boarding: "Salida",
      alighting: "Bajada",
      transfer: "Transbordo",
      destination: "Destino",
      origin: "Origen",
      walking: "A pie",
      checkRoute: "Consulta la línea/parada con el proveedor oficial.",
    },
    noteTemplates: {
      officialCheck: () => "Consulta horarios y paradas oficiales antes de viajar.",
      walk: () => "Continúa a pie hasta la entrada del outlet.",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} → ${fact.destination}` : undefined,
      returnCheck: () => "Consulta el regreso antes de comprar.",
    },
  },
  fr: {
    approx: "Env.",
    min: "min",
    duration: "Durée",
    fare: "Tarif",
    note: "Vérifiez les horaires et tarifs actuels avant le départ.",
    details: "Voir les estimations de transport dans le guide",
    city: "Depuis le centre-ville",
    airport: "Depuis l’aéroport",
    titles: {
      cityTrain: "Depuis le centre-ville en train",
      cityBus: "Depuis le centre-ville en bus",
      cityPublic: "Depuis le centre-ville en transport public",
      airportPublic: "Depuis l’aéroport en transport public",
      airportTaxi: "Depuis l’aéroport en taxi/Uber",
      shuttle: "En navette",
      taxi: "En taxi / Uber",
    },
    modes: {
      train: "Train",
      bus: "Bus",
      shuttle: "Navette",
      taxi: "Taxi / Uber",
      uber: "Uber",
      metro: "Transport public",
      ferry: "Ferry",
      walking: "À pied",
    },
    steps: {} as any,
    routeLabels: {
      line: "Ligne",
      provider: "Prestataire",
      operator: "Opérateur",
      boarding: "Départ",
      alighting: "Arrivée",
      transfer: "Correspondance",
      destination: "Destination",
      origin: "Origine",
      walking: "Marche",
      checkRoute: "Vérifiez la ligne/l’arrêt auprès du prestataire officiel.",
    },
    noteTemplates: {
      officialCheck: () => "Vérifiez les horaires et arrêts officiels avant le départ.",
      walk: () => "Continuez à pied jusqu’à l’entrée de l’outlet.",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} → ${fact.destination}` : undefined,
      returnCheck: () => "Vérifiez le retour avant vos achats.",
    },
  },
  de: {
    approx: "Ca.",
    min: "Min.",
    duration: "Dauer",
    fare: "Preis",
    note: "Prüfe aktuelle Zeiten und Preise vor der Fahrt.",
    details: "Verkehrsschätzungen im Guide ansehen",
    city: "Vom Stadtzentrum",
    airport: "Vom Flughafen",
    titles: {
      cityTrain: "Vom Stadtzentrum mit dem Zug",
      cityBus: "Vom Stadtzentrum mit dem Bus",
      cityPublic: "Vom Stadtzentrum mit ÖPNV",
      airportPublic: "Vom Flughafen mit ÖPNV",
      airportTaxi: "Vom Flughafen mit Taxi/Uber",
      shuttle: "Mit Shuttle",
      taxi: "Mit Taxi / Uber",
    },
    modes: {
      train: "Zug",
      bus: "Bus",
      shuttle: "Shuttle",
      taxi: "Taxi / Uber",
      uber: "Uber",
      metro: "ÖPNV",
      ferry: "Fähre",
      walking: "Zu Fuß",
    },
    steps: {} as any,
    routeLabels: {
      line: "Linie",
      provider: "Anbieter",
      operator: "Betreiber",
      boarding: "Einstieg",
      alighting: "Ausstieg",
      transfer: "Umstieg",
      destination: "Ziel",
      origin: "Start",
      walking: "Fußweg",
      checkRoute: "Prüfe Linie/Haltestelle beim offiziellen Anbieter.",
    },
    noteTemplates: {
      officialCheck: () => "Prüfe offizielle Zeiten und Haltestellen vor der Fahrt.",
      walk: () => "Gehe weiter zum Outlet-Eingang.",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} → ${fact.destination}` : undefined,
      returnCheck: () => "Prüfe die Rückfahrt vor dem Einkauf.",
    },
  },
  ru: {
    approx: "Примерно",
    min: "мин",
    duration: "Время",
    fare: "Стоимость",
    note: "Проверьте актуальное расписание и цены перед поездкой.",
    details: "Смотрите оценки транспорта в путеводителе",
    city: "Из центра города",
    airport: "Из аэропорта",
    titles: {
      cityTrain: "Из центра города на поезде",
      cityBus: "Из центра города на автобусе",
      cityPublic: "Из центра города на общественном транспорте",
      airportPublic: "Из аэропорта на общественном транспорте",
      airportTaxi: "Из аэропорта на такси/Uber",
      shuttle: "На шаттле",
      taxi: "На такси / Uber",
    },
    modes: {
      train: "Поезд",
      bus: "Автобус",
      shuttle: "Шаттл",
      taxi: "Такси / Uber",
      uber: "Uber",
      metro: "Общественный транспорт",
      ferry: "Паром",
      walking: "Пешком",
    },
    steps: {} as any,
    routeLabels: {
      line: "Линия",
      provider: "Провайдер",
      operator: "Оператор",
      boarding: "Посадка",
      alighting: "Выход",
      transfer: "Пересадка",
      destination: "Пункт назначения",
      origin: "Начало",
      walking: "Пешком",
      checkRoute: "Уточните линию/остановку у официального поставщика.",
    },
    noteTemplates: {
      officialCheck: () => "Проверьте официальное расписание и остановки перед поездкой.",
      walk: () => "Дойдите пешком до входа в аутлет.",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} → ${fact.destination}` : undefined,
      returnCheck: () => "Проверьте обратный рейс перед покупками.",
    },
  },
  ar: {
    approx: "تقريبًا",
    min: "دقيقة",
    duration: "المدة",
    fare: "الأجرة",
    note: "تحقق من الأوقات والأجرة الحالية قبل السفر.",
    details: "اعرض تقديرات المواصلات في الدليل",
    city: "من وسط المدينة",
    airport: "من المطار",
    titles: {
      cityTrain: "من وسط المدينة بالقطار",
      cityBus: "من وسط المدينة بالحافلة",
      cityPublic: "من وسط المدينة بالمواصلات العامة",
      airportPublic: "من المطار بالمواصلات العامة",
      airportTaxi: "من المطار بتاكسي/Uber",
      shuttle: "بالشاتل",
      taxi: "بتاكسي / Uber",
    },
    modes: {
      train: "قطار",
      bus: "حافلة",
      shuttle: "شاتل",
      taxi: "تاكسي / Uber",
      uber: "Uber",
      metro: "مواصلات عامة",
      ferry: "عبّارة",
      walking: "سيرًا",
    },
    steps: {} as any,
    routeLabels: {
      line: "الخط",
      provider: "المزوّد",
      operator: "المشغّل",
      boarding: "نقطة الصعود",
      alighting: "نقطة النزول",
      transfer: "تبديل",
      destination: "الوجهة",
      origin: "نقطة البداية",
      walking: "سيرًا",
      checkRoute: "تحقق من تفاصيل الخط/المحطة لدى المزوّد الرسمي.",
    },
    noteTemplates: {
      officialCheck: () => "تحقق من المواعيد والمحطات الرسمية قبل السفر.",
      walk: () => "تابع سيرًا إلى مدخل الأوتلت.",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} → ${fact.destination}` : undefined,
      returnCheck: () => "تحقق من رحلة العودة قبل التسوق.",
    },
  },
  zh: {
    approx: "约",
    min: "分钟",
    duration: "时长",
    fare: "费用",
    note: "出行前请确认最新班次和费用。",
    details: "在指南中查看交通估算",
    city: "从市中心",
    airport: "从机场",
    titles: {
      cityTrain: "从市中心乘火车",
      cityBus: "从市中心乘公交",
      cityPublic: "从市中心乘公共交通",
      airportPublic: "从机场乘公共交通",
      airportTaxi: "从机场乘出租车/Uber",
      shuttle: "乘接驳车",
      taxi: "乘出租车 / Uber",
    },
    modes: {
      train: "火车",
      bus: "公交",
      shuttle: "接驳车",
      taxi: "出租车 / Uber",
      uber: "Uber",
      metro: "公共交通",
      ferry: "渡轮",
      walking: "步行",
    },
    steps: {} as any,
    routeLabels: {
      line: "线路",
      provider: "服务商",
      operator: "运营方",
      boarding: "上车点",
      alighting: "下车点",
      transfer: "换乘",
      destination: "目的地",
      origin: "起点",
      walking: "步行",
      checkRoute: "请向官方服务商确认线路/站点信息。",
    },
    noteTemplates: {
      officialCheck: () => "出行前请确认官方班次和站点。",
      walk: () => "步行前往奥特莱斯入口。",
      stationBus: (fact) => fact.alightingPoint && fact.destination ? `${fact.alightingPoint} → ${fact.destination}` : undefined,
      returnCheck: () => "购物前请确认返程班次。",
    },
  },
};
for (const lang of [
  "es",
  "fr",
  "de",
  "ru",
  "ar",
  "zh",
] as TranslationLanguage[])
  I18N[lang].steps = I18N.en.steps;

const ROUTE_TERMS = [
  "RER A",
  "S23/RB23",
  "RB24",
  "RB23",
  "S23",
  "TGV",
  "SNCF",
  "ÖBB",
  "S-Bahn",
  "U-Bahn",
  "Outlet Link",
  "Shopping Express",
  "Zani Viaggi",
  "Frigerio Viaggi",
  "FlixBus",
  "BLAGUSS",
  "Vienna Sightseeing",
  "Obus",
  "Trenitalia",
];
const STOP_TERMS = [
  "Hotel Pullman Paris Bercy",
  "Val d'Europe/Serris-Montévrain",
  "Val d'Europe / Serris-Montévrain",
  "Marne-la-Vallée Chessy",
  "Parndorf Ort",
  "Bad Münstereifel",
  "Euskirchen",
  "Milano Centrale",
  "Milan Centrale",
  "Largo Cairoli",
  "Piazza della Repubblica 5",
  "Venezia Mestre",
  "Roma Termini",
  "Firenze Santa Maria Novella",
  "Estació del Nord",
];
function compactJoin(values: (string | undefined)[]) {
  return [...new Set(values.filter(Boolean) as string[])]
    .slice(0, 3)
    .join(" / ");
}
function sourceText(guide: TransportationGuide) {
  return [
    guide.title,
    guide.estimatedDuration,
    guide.estimatedCost,
    ...guide.steps.map((step) => step.description),
  ].join(" ");
}
function findTerms(text: string, terms: string[]) {
  return terms.filter((term) =>
    text.toLowerCase().includes(term.toLowerCase()),
  );
}
function normalizeRouteTerm(term: string) {
  return term
    .replace("Milan Centrale", "Milano Centrale")
    .replace(
      "Val d'Europe/Serris-Montévrain",
      "Val d'Europe / Serris-Montévrain",
    )
    .replace("Shopping Express®", "Shopping Express");
}
function outletNameFor(outletId: string) {
  return outletId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function airportCodeFor(guide: TransportationGuide) {
  const outlet = outletFor(guide.outletId);
  return guide.originType === "airport"
    ? outlet?.airports?.find((airport) => airport.code === guide.originId)?.code
    : undefined;
}
function factOriginGroup(fact: TransportationRouteFact | undefined): TransportationV2Option["originGroup"] | undefined {
  if (!fact) return undefined;
  if (fact.originType === "airport") return "airport";
  if (fact.originType === "shuttle") return "shuttle";
  return "city";
}
function extractRouteDetails(
  guide: TransportationGuide,
  originGroup: TransportationV2Option["originGroup"],
  mode: TransportationType,
): TransportationRouteDetailDisplayModel {
  const fact = getTransportationRouteFact(guide.guideId);
  const isTaxi = ["taxi", "uber"].includes(mode);
  if (fact) {
    const isExactOrPartial = fact.confidence !== "estimateOnly";
    return {
      lineOrProviderLabel: fact.mode === "shuttle" ? fact.provider : fact.line,
      operatorLabel: fact.operator || (fact.mode === "shuttle" ? undefined : fact.provider),
      boardingPointLabel: fact.boardingPoint,
      transferLabel: fact.transferPoints?.join(" / "),
      alightingPointLabel: fact.alightingPoint,
      destinationLabel: fact.destination,
      walkNoteLabel: fact.walkNote,
      officialCheckNoteLabel: fact.officialCheckNote || fact.sourceNote,
      routeHintLabel: compactJoin([
        fact.provider || fact.operator || fact.line,
        fact.line && fact.provider ? fact.line : undefined,
        fact.alightingPoint || fact.boardingPoint || fact.destination,
      ]),
      confidence: fact.confidence,
      hasSourceBackedRouteDetail: isExactOrPartial,
    };
  }
  if (isTaxi) {
    return {
      destinationLabel: outletNameFor(guide.outletId),
      routeHintLabel: originGroup === "airport" ? "Airport → outlet" : "City center → outlet",
      confidence: "estimateOnly",
      hasSourceBackedRouteDetail: false,
    };
  }
  return {
    routeHintLabel: undefined,
    confidence: "estimateOnly",
    hasSourceBackedRouteDetail: false,
  };
}
function localizePoint(value: string | undefined, language: TranslationLanguage = "en") {
  if (!value) return value;
  if (language === "tr" && value === "Central Paris RER A station")
    return "Merkezi Paris RER A istasyonu";
  return value;
}
function originPointFor(option: TransportationV2Option, language: TranslationLanguage) {
  if (option.routeDetails.boardingPointLabel) return option.routeDetails.boardingPointLabel;
  if (!["taxi", "uber"].includes(option.mode)) return undefined;
  return option.originGroup === "airport" ? I18N[language].airport.replace(/^From |^Depuis |^Vom |^Из |^من |^从 /, "") : I18N[language].city.replace(/^From |^Desde |^Depuis |^Vom |^Из |^من |^从 /, "");
}
export function getTransportationRouteDetailRows(
  option: TransportationV2Option,
  language: TranslationLanguage,
) {
  const labels = I18N[language].routeLabels;
  const detail = option.routeDetails;
  const isShuttle =
    option.originGroup === "shuttle" || option.mode === "shuttle";
  const isTaxi = ["taxi", "uber"].includes(option.mode);
  return [
    detail.lineOrProviderLabel
      ? {
          label: isShuttle ? labels.provider : labels.line,
          value: detail.lineOrProviderLabel,
        }
      : undefined,
    detail.operatorLabel
      ? { label: labels.operator, value: detail.operatorLabel }
      : undefined,
    originPointFor(option, language)
      ? {
          label: isTaxi ? labels.origin : labels.boarding,
          value: localizePoint(originPointFor(option, language), language) as string,
        }
      : undefined,
    detail.alightingPointLabel
      ? { label: labels.alighting, value: detail.alightingPointLabel }
      : undefined,
    detail.transferLabel
      ? { label: labels.transfer, value: detail.transferLabel }
      : undefined,
    detail.walkNoteLabel && option.routeFact
      ? { label: labels.walking, value: localizedWalkNote(option.routeFact, language) || detail.walkNoteLabel }
      : undefined,
    detail.destinationLabel
      ? {
          label: labels.destination,
          value:
            localizePoint(detail.destinationLabel) || detail.destinationLabel,
        }
      : undefined,
  ].filter(Boolean) as { label: string; value: string }[];
}
export function getRouteDetailWarning(language: TranslationLanguage) {
  return I18N[language].routeLabels.checkRoute;
}

function rangeByKm(km: number, rows: [number, Estimate][]): Estimate {
  return rows.find(([max]) => km <= max)?.[1] || rows[rows.length - 1][1];
}
function estimateFor(
  origin: "city" | "airport" | "shuttle",
  mode: TransportationType,
  km?: number,
): Estimate | undefined {
  if (origin === "shuttle")
    return {
      duration: origin === "shuttle" ? [45, 90] : [60, 150],
      fare: [10, 30],
      confidence: "fallbackEstimate",
    };
  if (typeof km !== "number") return undefined;
  if (origin === "airport" && ["taxi", "uber"].includes(mode))
    return rangeByKm(km, [
      [20, { duration: [20, 35], fare: [25, 50], confidence: "derived" }],
      [50, { duration: [35, 70], fare: [45, 100], confidence: "derived" }],
      [100, { duration: [60, 120], fare: [90, 180], confidence: "derived" }],
      [
        Infinity,
        { duration: [120, 180], fare: [150, 300], confidence: "derived" },
      ],
    ]);
  if (origin === "airport")
    return rangeByKm(km, [
      [20, { duration: [30, 50], fare: [3, 12], confidence: "derived" }],
      [50, { duration: [45, 90], fare: [5, 20], confidence: "derived" }],
      [100, { duration: [75, 150], fare: [10, 35], confidence: "derived" }],
      [
        Infinity,
        { duration: [120, 210], fare: [20, 60], confidence: "derived" },
      ],
    ]);
  if (["taxi", "uber"].includes(mode))
    return rangeByKm(km, [
      [15, { duration: [10, 25], fare: [15, 35], confidence: "derived" }],
      [40, { duration: [25, 50], fare: [35, 75], confidence: "derived" }],
      [80, { duration: [50, 90], fare: [70, 140], confidence: "derived" }],
      [
        Infinity,
        { duration: [90, 150], fare: [120, 250], confidence: "derived" },
      ],
    ]);
  return rangeByKm(km, [
    [15, { duration: [15, 30], fare: [2, 5], confidence: "derived" }],
    [40, { duration: [30, 60], fare: [3, 10], confidence: "derived" }],
    [80, { duration: [60, 90], fare: [5, 20], confidence: "derived" }],
    [Infinity, { duration: [90, 150], fare: [10, 30], confidence: "derived" }],
  ]);
}
function formatRange(min: number, max: number) {
  return min === max ? `${min}` : `${min}–${max}`;
}
function formatDuration(e: Estimate, l: TranslationLanguage) {
  const x = I18N[l];
  return `${x.approx} ${formatRange(e.duration[0], e.duration[1])} ${x.min}`;
}
function formatFare(e: Estimate, l: TranslationLanguage) {
  const x = I18N[l];
  return `${x.approx} €${formatRange(e.fare[0], e.fare[1])}`;
}
function withoutApprox(value: string | undefined, language: TranslationLanguage) {
  return String(value || "")
    .replace(new RegExp(`^${I18N[language].approx}\\s+`, "i"), "")
    .trim();
}
function localizedWalkNote(fact: TransportationRouteFact, language: TranslationLanguage) {
  if (language === "en") return I18N.en.noteTemplates.walk(fact);
  if (/station bus|official station bus/i.test(fact.walkNote || ""))
    return I18N[language].noteTemplates.stationBus(fact) || I18N[language].noteTemplates.walk(fact);
  return I18N[language].noteTemplates.walk(fact);
}
function localizedOfficialCheckNote(fact: TransportationRouteFact, language: TranslationLanguage) {
  if (language === "en") return I18N.en.noteTemplates.officialCheck(fact);
  return I18N[language].noteTemplates.officialCheck(fact);
}
export function sanitizeTransportationDisplayValue(
  value: string | undefined,
  language: TranslationLanguage,
): string | undefined {
  const n = String(value || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!n) return undefined;
  if (NON_ENGLISH_LANGUAGES.has(language) && LONG_SOURCE_PROSE_PATTERN.test(n))
    return undefined;
  if (UNSAFE_VALUE_PATTERN.test(n)) return undefined;
  return n;
}
export function formatTransportDurationForDisplay(
  value: string | undefined,
  language: TranslationLanguage,
): string | undefined {
  const n = sanitizeTransportationDisplayValue(value, language);
  if (!n) return undefined;
  if (/less than 1 hour/i.test(n))
    return `${I18N[language].approx} 60 ${I18N[language].min}`;
  const r = n.match(/[≈~]?\s*(\d+)\s*[–-]\s*(\d+)\s*(?:min|minutes|dk)/i);
  if (r)
    return `${I18N[language].approx} ${r[1]}–${r[2]} ${I18N[language].min}`;
  const m = n.match(/[≈~]?\s*(\d+)\s*(?:min|minutes|dk)/i);
  if (m) return `${I18N[language].approx} ${m[1]} ${I18N[language].min}`;
  return n.length <= 22 ? `${I18N[language].approx} ${n}` : undefined;
}
export function formatTransportFareForDisplay(
  value: string | undefined,
  language: TranslationLanguage,
): string | undefined {
  const raw = String(value || "")
    .trim()
    .replace(/\s*\(estimated\)/i, "")
    .replace(/^≈\s*/, "");
  if (!raw) return undefined;
  const plus = raw.match(/€\s?(\d+(?:[.,]\d+)?) each way plus rail fare/i);
  if (plus) return `${I18N[language].approx} €${plus[1]} / yön + tren ücreti`;
  const ret = raw.match(/€\s?(\d+(?:[.,]\d+)?).*return/i);
  if (ret)
    return language === "tr"
      ? `${I18N[language].approx} €${ret[1]} dönüş bileti`
      : `${I18N[language].approx} €${ret[1]} return`;
  const n = sanitizeTransportationDisplayValue(raw, language);
  if (!n) return undefined;
  return n.length <= 28 ? `${I18N[language].approx} ${n}` : undefined;
}
export function getTransportationCompactSummaryLabel(
  option: TransportationV2Option,
  language: TranslationLanguage,
) {
  const hint =
    option.routeDetails.lineOrProviderLabel ||
    option.routeDetails.routeHintLabel ||
    option.routeFact?.provider ||
    I18N[language].modes[option.mode] ||
    option.modeLabel;
  const shortHint = String(hint).split(" / ").slice(0, 2).join(" / ");
  return [
    shortHint,
    withoutApprox(option.estimatedDurationLabel, language),
    withoutApprox(option.estimatedFareLabel, language),
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 72);
}

export function getTransportationDisplayFallbacks(
  language: TranslationLanguage,
) {
  return {
    time: "",
    fare: "",
    note: I18N[language].note,
    details: I18N[language].details,
    compactRecommended: I18N[language].details,
  };
}
function outletFor(id: string) {
  return outlets.find((o) => o.outletId === id) as OutletLike | undefined;
}
function distanceFor(guide: TransportationGuide): number | undefined {
  const outlet = outletFor(guide.outletId);
  if (guide.originType === "airport")
    return (
      outlet?.airports?.find((a) => a.code === guide.originId)?.distanceKm ??
      outlet?.airportDistanceKm
    );
  return outlet?.cityCenterInfo?.distanceKm ?? outlet?.cityCenterDistanceKm;
}
function titleFor(
  mode: TransportationType,
  origin: TransportationV2Option["originGroup"],
  l: TranslationLanguage,
) {
  const t = I18N[l].titles;
  if (origin === "shuttle" || mode === "shuttle") return t.shuttle;
  if (["taxi", "uber"].includes(mode))
    return origin === "airport" ? t.airportTaxi : t.taxi;
  if (origin === "airport") return t.airportPublic;
  if (mode === "train") return t.cityTrain;
  if (mode === "bus") return t.cityBus;
  return t.cityPublic;
}
function originLabelFor(
  origin: TransportationV2Option["originGroup"],
  l: TranslationLanguage,
) {
  return origin === "airport"
    ? I18N[l].airport
    : origin === "city"
      ? I18N[l].city
      : I18N[l].titles.shuttle;
}
function stepsFor(
  mode: TransportationType,
  origin: TransportationV2Option["originGroup"],
  l: TranslationLanguage,
  details?: TransportationRouteDetailDisplayModel,
): string[] {
  if (l !== "tr") {
    if (origin === "shuttle" || mode === "shuttle")
      return I18N[l].steps.shuttle;
    if (["taxi", "uber"].includes(mode)) return I18N[l].steps.taxi;
    if (origin === "airport") return I18N[l].steps.airportPublic;
    return I18N[l].steps.public;
  }
  const route = details?.lineOrProviderLabel;
  const board = localizePoint(details?.boardingPointLabel, l);
  const alight = details?.alightingPointLabel;
  const transfer = details?.transferLabel;
  const dest = localizePoint(details?.destinationLabel, l);
  if (["taxi", "uber"].includes(mode))
    return [
      "Başlangıç: şehir merkezi veya havalimanı noktasını seç.",
      "Varış: outlet adını veya konumunu ayarla.",
      "Yaklaşık ücreti yolculuk başlamadan önce uygulamada kontrol et.",
      "Trafik ve dönüş saatini alışverişten önce tekrar kontrol et.",
    ];
  if (origin === "shuttle" || mode === "shuttle") {
    const earlyPoint = route?.includes("Zani Viaggi") ? "Milano Centrale kalkış noktasına" : (board || "Belirtilen kalkış noktasına");
    return [
      `${route || "Shuttle sağlayıcısı"} kalkış noktasını ve saatini kontrol et.`,
      "Gerekiyorsa bileti veya rezervasyonu seyahatten önce tamamla.",
      `${earlyPoint} erken git.`,
      `Shuttle ile ${dest || "outlet"}’e git.`,
      "Dönüş kalkış saatini alışverişten önce doğrula.",
    ];
  }
  if (route === "RER A" && alight?.includes("Val d'Europe"))
    return [
      "Merkezi Paris’teki bir RER A istasyonundan başla.",
      "RER A ile Val d'Europe / Serris-Montévrain yönüne git.",
      "Val d'Europe / Serris-Montévrain durağında in.",
      "Val d'Europe alışveriş merkezi üzerinden La Vallée Village’a yürü.",
      "Dönüş saatlerini seyahatten önce kontrol et.",
    ];
  if (route === "ÖBB" && alight === "Parndorf Ort")
    return [
      "Viyana şehir merkezinden ÖBB tren bağlantısını kontrol et.",
      "ÖBB ile Parndorf Ort yönüne git.",
      "Parndorf Ort durağında in.",
      "Outlet servisi çalışıyorsa kullan veya yürüyüş bağlantısını takip et.",
      "Dönüş saatlerini alışverişten önce kontrol et.",
    ];
  const steps = [
    `${origin === "airport" ? "Havalimanındaki toplu ulaşım noktasından" : "Şehir merkezindeki uygun toplu ulaşım noktasından"} başla.`,
  ];
  if (route) steps.push(`${route} ile ${alight || dest || "outlet yönüne"} git.`);
  if (transfer) steps.push(`${transfer} aktarmasını takip et.`);
  if (alight) steps.push(`${alight} durağında in.`);
  steps.push(`${dest || "Outlet girişine"} yürüyerek veya yerel servisle devam et.`);
  steps.push("Dönüş saatlerini alışverişten önce kontrol et.");
  return steps.slice(0, 5);
}
function optionFromGuide(
  guide: TransportationGuide,
): TransportationV2Option | undefined {
  if (PROHIBITED_MAIN_LABEL_PATTERN.test(guide.title)) return undefined;
  const originGroup =
    guide.transportationType === "shuttle"
      ? "shuttle"
      : guide.originType === "airport"
        ? "airport"
        : "city";
  const km = distanceFor(guide);
  const routeFact = getTransportationRouteFact(guide.guideId);
  const factOrigin = factOriginGroup(routeFact);
  const effectiveOriginGroup = factOrigin || originGroup;
  const estimate = estimateFor(effectiveOriginGroup, guide.transportationType, km);
  if (!estimate) return undefined;
  const hasSourceDuration = Boolean(
    sanitizeTransportationDisplayValue(guide.estimatedDuration, "en"),
  );
  const hasSourceFare = Boolean(
    sanitizeTransportationDisplayValue(guide.estimatedCost, "en"),
  );
  return {
    id: guide.guideId,
    originGroup: effectiveOriginGroup,
    originLabel: effectiveOriginGroup,
    mode: guide.transportationType,
    modeLabel: guide.transportationType,
    estimatedDurationLabel: "",
    estimatedFareLabel: "",
    title: guide.title,
    routeDetails: extractRouteDetails(
      guide,
      effectiveOriginGroup,
      guide.transportationType,
    ),
    steps: [],
    sourceConfidence:
      routeFact?.confidence === "exact" || (hasSourceDuration && hasSourceFare) ? "source" : estimate.confidence,
    hasOnlyFallbackMeta: false,
    hasUsefulEstimate: true,
    hasUsefulFare: true,
    isUsefulForPrimaryDisplay: true,
    isUsefulForSummaryDisplay: true,
    guide,
    routeFact,
  };
}
function syntheticGuide(
  outletId: string,
  originType: TransportationGuide["originType"],
  originId: string,
  mode: TransportationType,
): TransportationGuide {
  return {
    guideId: `${outletId}-${originId}-${mode}-estimate`,
    outletId,
    originType,
    originId,
    transportationType: mode,
    title: "Derived transportation estimate",
    estimatedDuration: "",
    estimatedCost: "",
    recommended: false,
    steps: [],
    updatedAt: "2026-07-10",
  };
}
function syntheticOptions(outletId: string): TransportationV2Option[] {
  const outlet = outletFor(outletId);
  if (!outlet) return [];
  const airport = outlet.airports?.[0];
  return [
    syntheticGuide(outletId, "city_center", "city", "train"),
    syntheticGuide(outletId, "city_center", "city", "taxi"),
    ...(airport
      ? [
          syntheticGuide(outletId, "airport", airport.code, "metro"),
          syntheticGuide(outletId, "airport", airport.code, "taxi"),
        ]
      : []),
  ]
    .map(optionFromGuide)
    .filter(Boolean) as TransportationV2Option[];
}
export function getTransportationOptionDisplayModel(
  option: TransportationV2Option,
  language: TranslationLanguage,
): TransportationV2Option {
  const guide = option.guide;
  const originGroup = option.originGroup;
  const estimate = estimateFor(originGroup, option.mode, distanceFor(guide));
  if (!estimate) return option;
  const fact = option.routeFact || getTransportationRouteFact(guide.guideId);
  const factEstimate = fact?.estimatedDurationMin && fact?.estimatedDurationMax ? { duration: [fact.estimatedDurationMin, fact.estimatedDurationMax] as [number, number], fare: [fact.estimatedFareMin || estimate.fare[0], fact.estimatedFareMax || estimate.fare[1]] as [number, number], confidence: option.sourceConfidence } : undefined;
  const durationLabel =
    (fact?.displayDuration ? `${I18N[language].approx} ${fact.displayDuration}` : undefined) ||
    (factEstimate ? formatDuration(factEstimate, language) : undefined) ||
    formatTransportDurationForDisplay(guide.estimatedDuration, language) ||
    formatDuration(estimate, language);
  const fareLabel =
    (fact?.displayFare ? `${I18N[language].approx} ${fact.displayFare}` : undefined) ||
    (factEstimate && fact?.estimatedFareMin ? formatFare(factEstimate, language) : undefined) ||
    formatTransportFareForDisplay(guide.estimatedCost, language) ||
    formatFare(
      originGroup === "shuttle" && guide.originType === "airport"
        ? { ...estimate, duration: [60, 150], fare: [15, 45] }
        : estimate,
      language,
    );
  const sourceConfidence: SourceConfidence =
    formatTransportDurationForDisplay(guide.estimatedDuration, language) &&
    formatTransportFareForDisplay(guide.estimatedCost, language)
      ? "source"
      : option.sourceConfidence;
  const displayDetails = extractRouteDetails(guide, originGroup, option.mode);
  if (fact) {
    displayDetails.boardingPointLabel = localizePoint(displayDetails.boardingPointLabel, language);
    displayDetails.walkNoteLabel = localizedWalkNote(fact, language);
    displayDetails.officialCheckNoteLabel = localizedOfficialCheckNote(fact, language);
    displayDetails.routeHintLabel = compactJoin([
      displayDetails.lineOrProviderLabel || fact.provider || fact.operator,
      fact.alightingPoint || fact.boardingPoint || fact.destination,
    ]);
  }
  if (!displayDetails.routeHintLabel) {
    displayDetails.routeHintLabel = ["taxi", "uber"].includes(option.mode)
      ? I18N[language].modes.taxi
      : I18N[language].modes[option.mode] || I18N[language].modes.metro;
  }
  return {
    ...option,
    originLabel: originLabelFor(originGroup, language),
    modeLabel: I18N[language].modes[option.mode] || option.mode,
    title: titleFor(option.mode, originGroup, language).replace(
      /\b(shuttle)\s+\1\b/gi,
      "$1",
    ),
    duration: durationLabel,
    fare: fareLabel,
    durationLabel,
    fareLabel,
    estimatedDurationLabel: durationLabel,
    estimatedFareLabel: fareLabel,
    note: undefined,
    noteLabel:
      (fact ? localizedOfficialCheckNote(fact, language) : undefined) ||
      (["taxi", "uber"].includes(option.mode)
        ? I18N[language].note
        : displayDetails.hasSourceBackedRouteDetail
          ? undefined
          : I18N[language].routeLabels.checkRoute),
    providerNote: undefined,
    routeDetails: displayDetails,
    steps: stepsFor(
      option.mode,
      originGroup,
      language,
      displayDetails,
    ),
    sourceConfidence: fact?.confidence === "exact" ? "source" : sourceConfidence,
    hasOnlyFallbackMeta: false,
    hasUsefulEstimate: true,
    hasUsefulFare: true,
    isUsefulForPrimaryDisplay: true,
    isUsefulForSummaryDisplay: true,
  };
}
export function isSourceBackedValue(value: string | undefined): boolean {
  return Boolean(sanitizeTransportationDisplayValue(value, "en"));
}
export function isSourceBackedGuide(guide: TransportationGuide): boolean {
  return Boolean(optionFromGuide(guide));
}
export function getTransportationV2Options(
  outletId: string,
): TransportationV2Option[] {
  const fromGuides = transportationGuides
    .filter((g) => g.outletId === outletId)
    .map(optionFromGuide)
    .filter(Boolean) as TransportationV2Option[];
  return dedupeOptions([...fromGuides, ...syntheticOptions(outletId)]);
}
function routePriority(option: TransportationV2Option) {
  const detail = option.routeDetails;
  if ((option.originGroup === "shuttle" || option.mode === "shuttle") && detail.confidence === "exact" && detail.boardingPointLabel && option.estimatedFareLabel) return 100;
  if (option.originGroup === "city" && PUBLIC_TYPES.has(option.mode) && detail.confidence === "exact") return 90;
  if (option.originGroup === "airport" && PUBLIC_TYPES.has(option.mode) && detail.confidence === "exact") return 80;
  if (
    (option.originGroup === "shuttle" || option.mode === "shuttle") &&
    (detail.lineOrProviderLabel || detail.boardingPointLabel)
  )
    return 90;
  if (
    option.originGroup === "city" &&
    PUBLIC_TYPES.has(option.mode) &&
    detail.hasSourceBackedRouteDetail
  )
    return 80;
  if (
    option.originGroup === "airport" &&
    PUBLIC_TYPES.has(option.mode) &&
    detail.hasSourceBackedRouteDetail
  )
    return 70;
  if (["taxi", "uber"].includes(option.mode)) return 60;
  return 10;
}
export function getRecommendedTransportationV2Option(
  outletId: string,
): TransportationV2Option | undefined {
  const options = getTransportationV2Options(outletId);
  return [...options].sort((a, b) => routePriority(b) - routePriority(a))[0];
}
export function getOutletTransportationV2Summary(
  outletId: string,
): TransportationV2Option[] {
  const display = getTransportationV2Options(outletId).map((o) =>
    getTransportationOptionDisplayModel(o, "tr"),
  );
  const city = display.find(
    (o) =>
      o.originGroup === "city" &&
      PUBLIC_TYPES.has(o.mode) &&
      o.routeDetails.routeHintLabel,
  );
  const shuttle = display.find(
    (o) => o.originGroup === "shuttle" && o.routeDetails.routeHintLabel,
  );
  const airport = display.find((o) => o.originGroup === "airport");
  return [city, shuttle, airport]
    .filter(Boolean)
    .slice(0, 2) as TransportationV2Option[];
}
function dedupeOptions(
  options: TransportationV2Option[],
): TransportationV2Option[] {
  const seen = new Set<string>();
  return options.filter((o) => {
    const key = `${o.originGroup}|${o.mode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function getUsefulTransportationV2DisplayOptions(
  outletId: string,
  language: TranslationLanguage,
): TransportationV2Option[] {
  return getTransportationV2Options(outletId).map((o) =>
    getTransportationOptionDisplayModel(o, language),
  );
}
export function getNearbyAirportDisplay(
  outletId: string,
): NearbyAirportDisplay[] {
  const outlet = outletFor(outletId);
  return (outlet?.airports || []).slice(0, 3).map((a) => ({
    code: a.code,
    name: a.name,
    distance:
      typeof a.distanceKm === "number" ? `${a.distanceKm} km` : undefined,
  }));
}
export function getSectionProviderNote(language: TranslationLanguage): string {
  return I18N[language].note;
}
export function getCompactRecommendedFallback(
  language: TranslationLanguage,
): string {
  return I18N[language].details;
}
export function hasLegacyTransportationClutter(outletId: string): boolean {
  return getTransportationForOutlet(outletId).some((item) =>
    PROHIBITED_MAIN_LABEL_PATTERN.test(`${item.title} ${item.cost}`),
  );
}
export function getOutletMapLinks(outletId: string) {
  const outlet = outletFor(outletId) as any;
  return outlet
    ? {
        googleMapsUrl: outlet.googleMapsUrl,
        appleMapsUrl: outlet.appleMapsUrl,
        yandexMapsUrl: outlet.yandexMapsUrl,
      }
    : undefined;
}
