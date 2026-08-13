import { resolveTranslation } from "../i18n/translationResolver";
import { outlets } from "../constants/outlets";
import { type TranslationLanguage } from "../translations/locale";
import type { TransportationGuide, TransportationType } from "../constants/transportationGuides";
import { getTransportationForOutlet } from "./transportationService";
import type { TransportationRouteFact } from "../constants/transportationRouteFacts";
import { localizeTargetGuide, targetContentLanguages, type TargetContentLanguage } from "../constants/targetOutletLocalization";

let transportationGuides: TransportationGuide[] = [];
let transportationRouteFacts: TransportationRouteFact[] = [];
const getTransportationRouteFact = (guideId: string) =>
  transportationRouteFacts.find((fact) => fact.guideId === guideId);

export function setTransportationV2Records(
  guides: TransportationGuide[],
  routeFacts: TransportationRouteFact[],
) {
  transportationGuides = guides;
  transportationRouteFacts = routeFacts;
}

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
  providerLabel?: string;
  operatorLabel?: string;
  lineLabel?: string;
  lineOrProviderLabel?: string;
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
  originGroup: "airport" | "city" | "station" | "shuttle";
  mode: TransportationType;
  duration?: string;
  fare?: string;
  durationLabel?: string;
  fareLabel?: string;
  note?: string;
  officialProviderUrl?: string;
  officialLinkLabel?: string;
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
    free: string;
    details: string;
    city: string;
    airport: string;
    station: string;
    stationSection: string;
    titles: Record<string, string>;
    modes: Record<string, string>;
    steps: Record<string, string[]>;
    routeLabels: Record<string, string>;
    noteTemplates: Record<
      string,
      (fact: TransportationRouteFact) => string | undefined
    >;
  }
> = {
  en: {
    approx: "Approx.",
    min: "min",
    duration: "Duration",
    fare: "Fare",
    note: "Check current times and fares before you travel.",
    free: "Free",
    details: "See transport estimates in the guide",
    city: "From city center",
    airport: "From airport",
    station: "From station",
    stationSection: "Station access",
    titles: {
      cityTrain: "From city center by train",
      cityBus: "From city center by bus",
      cityPublic: "From city center by public transport",
      airportPublic: "From airport by public transport",
      airportTaxi: "From airport by taxi/Uber",
      stationWalking: "From station on foot",
      stationPublic: "From station by public transport",
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
      station: [
        "Check the current connection to the station.",
        "Alight at the station.",
        "Follow the pedestrian access from the station to the outlet.",
        "Check the return connection before shopping.",
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
      checkRoute: "Confirm line and timetable with the official provider.",
    },
    noteTemplates: {
      officialCheck: (fact) => fact.officialCheckNote || fact.sourceNote,
      walk: (fact) => fact.walkNote,
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `Use the official station bus from ${fact.alightingPoint} to ${fact.destination} when operating.`
          : undefined,
      returnCheck: (fact) =>
        `Check current ${fact.provider || fact.operator || fact.line || "provider"} times before travel.`,
    },
  },
  tr: {
    approx: "Yaklaşık",
    min: "dk",
    duration: "Süre",
    fare: "Ücret",
    note: "Güncel saat ve ücretleri seyahat öncesi kontrol edin.",
    free: "Ücretsiz",
    details: "Ulaşım tahminlerini rehberde gör",
    city: "Şehir merkezinden",
    airport: "Havalimanından",
    station: "İstasyondan",
    stationSection: "İstasyon erişimi",
    titles: {
      cityTrain: "Şehir merkezinden trenle",
      cityBus: "Şehir merkezinden otobüsle",
      cityPublic: "Şehir merkezinden toplu ulaşım ile",
      airportPublic: "Havalimanından toplu ulaşım ile",
      airportTaxi: "Havalimanından taksi/Uber ile",
      stationWalking: "İstasyondan yürüyerek",
      stationPublic: "İstasyondan toplu ulaşım ile",
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
      station: [
        "İstasyona güncel bağlantıyı kontrol edin.",
        "İstasyonda inin.",
        "İstasyondan outlet’e yaya erişimini takip edin.",
        "Alışverişten önce dönüş bağlantısını kontrol edin.",
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
      checkRoute: "Hat ve sefer bilgisini resmi sağlayıcıdan doğrula.",
    },
    noteTemplates: {
      officialCheck: (fact) =>
        `${fact.provider || fact.operator || fact.line || "Resmi sağlayıcı"} saatlerini seyahatten önce kontrol edin.`,
      walk: (fact) =>
        fact.alightingPoint === "Parndorf Ort"
          ? "Outlet servisi çalışıyorsa kullanın veya yürüyüş bağlantısını takip edin."
          : fact.destination
            ? `${fact.destination} girişine yürüyerek devam edin.`
            : "Yürüyüş bağlantısını takip edin.",
      stationBus: (fact) =>
        fact.alightingPoint === "Parndorf Ort" && fact.destination
          ? `Parndorf Ort’tan ${fact.destination}’a resmi outlet servisi çalışıyorsa kullanın; yoksa yürüyüş bağlantısını takip edin.`
          : fact.alightingPoint && fact.destination
            ? `${fact.alightingPoint} → ${fact.destination}`
            : undefined,
      returnCheck: (fact) =>
        `${fact.provider || fact.operator || fact.line || "Dönüş"} saatlerini alışverişten önce kontrol edin.`,
    },
  },
  es: {
    approx: "Aprox.",
    min: "min",
    duration: "Duración",
    fare: "Tarifa",
    note: "Consulta horarios y tarifas actuales antes de viajar.",
    free: "Gratis",
    details: "Ver estimaciones de transporte en la guía",
    city: "Desde el centro",
    airport: "Desde el aeropuerto",
    station: "Desde la estación",
    stationSection: "Acceso desde la estación",
    titles: {
      cityTrain: "Desde el centro en tren",
      cityBus: "Desde el centro en autobús",
      cityPublic: "Desde el centro en transporte público",
      airportPublic: "Desde el aeropuerto en transporte público",
      airportTaxi: "Desde el aeropuerto en taxi/Uber",
      stationWalking: "Desde la estación a pie",
      stationPublic: "Desde la estación en transporte público",
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
      checkRoute: "Confirma la línea y el horario con el proveedor oficial.",
    },
    noteTemplates: {
      officialCheck: () =>
        "Consulta horarios y paradas oficiales antes de viajar.",
      walk: () => "Continúa a pie hasta la entrada del outlet.",
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `${fact.alightingPoint} → ${fact.destination}`
          : undefined,
      returnCheck: () => "Consulta el regreso antes de comprar.",
    },
  },
  fr: {
    approx: "Env.",
    min: "min",
    duration: "Durée",
    fare: "Tarif",
    note: "Vérifiez les horaires et tarifs actuels avant le départ.",
    free: "Gratuit",
    details: "Voir les estimations de transport dans le guide",
    city: "Depuis le centre-ville",
    airport: "Depuis l’aéroport",
    station: "Depuis la gare",
    stationSection: "Accès depuis la gare",
    titles: {
      cityTrain: "Depuis le centre-ville en train",
      cityBus: "Depuis le centre-ville en bus",
      cityPublic: "Depuis le centre-ville en transport public",
      airportPublic: "Depuis l’aéroport en transport public",
      airportTaxi: "Depuis l’aéroport en taxi/Uber",
      stationWalking: "Depuis la gare à pied",
      stationPublic: "Depuis la gare en transport public",
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
      checkRoute:
        "Confirmez la ligne et les horaires auprès du prestataire officiel.",
    },
    noteTemplates: {
      officialCheck: () =>
        "Vérifiez les horaires et arrêts officiels avant le départ.",
      walk: () => "Continuez à pied jusqu’à l’entrée de l’outlet.",
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `${fact.alightingPoint} → ${fact.destination}`
          : undefined,
      returnCheck: () => "Vérifiez le retour avant vos achats.",
    },
  },
  de: {
    approx: "Ca.",
    min: "Min.",
    duration: "Dauer",
    fare: "Preis",
    note: "Prüfe aktuelle Zeiten und Preise vor der Fahrt.",
    free: "Kostenlos",
    details: "Verkehrsschätzungen im Guide ansehen",
    city: "Vom Stadtzentrum",
    airport: "Vom Flughafen",
    station: "Vom Bahnhof",
    stationSection: "Zugang vom Bahnhof",
    titles: {
      cityTrain: "Vom Stadtzentrum mit dem Zug",
      cityBus: "Vom Stadtzentrum mit dem Bus",
      cityPublic: "Vom Stadtzentrum mit ÖPNV",
      airportPublic: "Vom Flughafen mit ÖPNV",
      airportTaxi: "Vom Flughafen mit Taxi/Uber",
      stationWalking: "Vom Bahnhof zu Fuß",
      stationPublic: "Vom Bahnhof mit öffentlichen Verkehrsmitteln",
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
      checkRoute: "Bestätige Linie und Fahrplan beim offiziellen Anbieter.",
    },
    noteTemplates: {
      officialCheck: () =>
        "Prüfe offizielle Zeiten und Haltestellen vor der Fahrt.",
      walk: () => "Gehe weiter zum Outlet-Eingang.",
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `${fact.alightingPoint} → ${fact.destination}`
          : undefined,
      returnCheck: () => "Prüfe die Rückfahrt vor dem Einkauf.",
    },
  },
  ru: {
    approx: "Примерно",
    min: "мин",
    duration: "Время",
    fare: "Стоимость",
    note: "Проверьте актуальное расписание и цены перед поездкой.",
    free: "Бесплатно",
    details: "Смотрите оценки транспорта в путеводителе",
    city: "Из центра города",
    airport: "Из аэропорта",
    station: "От станции",
    stationSection: "Доступ от станции",
    titles: {
      cityTrain: "Из центра города на поезде",
      cityBus: "Из центра города на автобусе",
      cityPublic: "Из центра города на общественном транспорте",
      airportPublic: "Из аэропорта на общественном транспорте",
      airportTaxi: "Из аэропорта на такси/Uber",
      stationWalking: "От станции пешком",
      stationPublic: "От станции на общественном транспорте",
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
      checkRoute: "Подтвердите линию и расписание у официального поставщика.",
    },
    noteTemplates: {
      officialCheck: () =>
        "Проверьте официальное расписание и остановки перед поездкой.",
      walk: () => "Дойдите пешком до входа в аутлет.",
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `${fact.alightingPoint} → ${fact.destination}`
          : undefined,
      returnCheck: () => "Проверьте обратный рейс перед покупками.",
    },
  },
  ar: {
    approx: "تقريبًا",
    min: "دقيقة",
    duration: "المدة",
    fare: "الأجرة",
    note: "تحقق من الأوقات والأجرة الحالية قبل السفر.",
    free: "مجانًا",
    details: "اعرض تقديرات المواصلات في الدليل",
    city: "من وسط المدينة",
    airport: "من المطار",
    station: "من المحطة",
    stationSection: "الوصول من المحطة",
    titles: {
      cityTrain: "من وسط المدينة بالقطار",
      cityBus: "من وسط المدينة بالحافلة",
      cityPublic: "من وسط المدينة بالمواصلات العامة",
      airportPublic: "من المطار بالمواصلات العامة",
      airportTaxi: "من المطار بتاكسي/Uber",
      stationWalking: "من المحطة سيرًا",
      stationPublic: "من المحطة بالمواصلات العامة",
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
      checkRoute: "أكّد الخط والجدول الزمني مع المزوّد الرسمي.",
    },
    noteTemplates: {
      officialCheck: () => "تحقق من المواعيد والمحطات الرسمية قبل السفر.",
      walk: () => "تابع سيرًا إلى مدخل الأوتلت.",
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `${fact.alightingPoint} → ${fact.destination}`
          : undefined,
      returnCheck: () => "تحقق من رحلة العودة قبل التسوق.",
    },
  },
  zh: {
    approx: "约",
    min: "分钟",
    duration: "时长",
    fare: "费用",
    note: "出行前请确认最新班次和费用。",
    free: "免费",
    details: "在指南中查看交通估算",
    city: "从市中心",
    airport: "从机场",
    station: "从车站出发",
    stationSection: "车站接驳",
    titles: {
      cityTrain: "从市中心乘火车",
      cityBus: "从市中心乘公交",
      cityPublic: "从市中心乘公共交通",
      airportPublic: "从机场乘公共交通",
      airportTaxi: "从机场乘出租车/Uber",
      stationWalking: "从车站步行",
      stationPublic: "从车站乘公共交通",
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
      checkRoute: "请向官方服务商确认线路和时刻表。",
    },
    noteTemplates: {
      officialCheck: () => "出行前请确认官方班次和站点。",
      walk: () => "步行前往奥特莱斯入口。",
      stationBus: (fact) =>
        fact.alightingPoint && fact.destination
          ? `${fact.alightingPoint} → ${fact.destination}`
          : undefined,
      returnCheck: () => "购物前请确认返程班次。",
    },
  },
};
const LOCALIZED_GENERIC_STEPS: Partial<
  Record<TranslationLanguage, Record<string, string[]>>
> = {
  es: {
    station: ["Comprueba la conexión actual hasta la estación.", "Baja en la estación.", "Sigue el acceso peatonal desde la estación hasta el outlet.", "Comprueba la conexión de regreso antes de comprar."],
    public: ["Ve a una parada céntrica adecuada.", "Toma el transporte público hacia el outlet.", "Baja en la parada más cercana.", "Comprueba el regreso antes de comprar."],
    airportPublic: ["Sigue las señales de transporte público del aeropuerto.", "Toma una conexión hacia la zona del outlet.", "Haz transbordo si es necesario.", "Comprueba el regreso antes de comprar."],
    taxi: ["Abre una aplicación de taxi.", "Selecciona el outlet como destino.", "Confirma el punto de recogida.", "Prevé más tiempo en hora punta."],
    shuttle: ["Comprueba el punto de salida de la lanzadera.", "Reserva si es necesario.", "Llega con antelación.", "Confirma la salida de regreso."],
  },
  fr: {
    station: ["Vérifiez la liaison actuelle jusqu’à la gare.", "Descendez à la gare.", "Suivez l’accès piéton de la gare à l’outlet.", "Vérifiez la liaison retour avant vos achats."],
    public: ["Rejoignez un arrêt adapté en centre-ville.", "Prenez les transports publics vers l’outlet.", "Descendez à l’arrêt le plus proche.", "Vérifiez le retour avant vos achats."],
    airportPublic: ["Suivez les panneaux de transport public.", "Prenez une liaison vers l’outlet.", "Changez si nécessaire.", "Vérifiez le retour avant vos achats."],
    taxi: ["Ouvrez une application de taxi.", "Choisissez l’outlet comme destination.", "Confirmez le point de prise en charge.", "Prévoyez plus de temps aux heures de pointe."],
    shuttle: ["Vérifiez le départ de la navette.", "Réservez si nécessaire.", "Arrivez en avance.", "Confirmez le départ du retour."],
  },
  de: {
    station: ["Prüfe die aktuelle Verbindung zum Bahnhof.", "Steige am Bahnhof aus.", "Folge dem Fußweg vom Bahnhof zum Outlet.", "Prüfe die Rückverbindung vor dem Einkauf."],
    public: ["Gehe zu einer passenden Haltestelle im Zentrum.", "Fahre mit öffentlichen Verkehrsmitteln Richtung Outlet.", "Steige an der nächsten Haltestelle aus.", "Prüfe die Rückfahrt vor dem Einkauf."],
    airportPublic: ["Folge den Schildern zum Nahverkehr.", "Nimm eine Verbindung Richtung Outlet.", "Steige bei Bedarf um.", "Prüfe die Rückfahrt vor dem Einkauf."],
    taxi: ["Öffne eine Taxi-App.", "Wähle das Outlet als Ziel.", "Bestätige den Abholpunkt.", "Plane zur Hauptverkehrszeit mehr Zeit ein."],
    shuttle: ["Prüfe den Shuttle-Abfahrtsort.", "Reserviere bei Bedarf.", "Sei frühzeitig vor Ort.", "Bestätige die Rückfahrt."],
  },
  ru: {
    station: ["Проверьте актуальное сообщение до станции.", "Выйдите на станции.", "Следуйте по пешеходному маршруту от станции к аутлету.", "Проверьте обратное сообщение до покупок."],
    public: ["Пройдите к удобной остановке в центре.", "Сядьте на транспорт в сторону аутлета.", "Выйдите на ближайшей остановке.", "Проверьте обратный рейс до покупок."],
    airportPublic: ["Следуйте указателям к транспорту.", "Выберите маршрут в сторону аутлета.", "При необходимости сделайте пересадку.", "Проверьте обратный рейс."],
    taxi: ["Откройте приложение такси.", "Укажите аутлет как пункт назначения.", "Подтвердите место посадки.", "Учтите пробки в часы пик."],
    shuttle: ["Проверьте место отправления шаттла.", "При необходимости забронируйте билет.", "Приходите заранее.", "Подтвердите обратный рейс."],
  },
  ar: {
    station: ["تحقق من وسيلة الوصول الحالية إلى المحطة.", "انزل في المحطة.", "اتبع مسار المشاة من المحطة إلى الأوتلت.", "تحقق من رحلة العودة قبل التسوق."],
    public: ["توجّه إلى موقف مناسب في وسط المدينة.", "استقل النقل العام باتجاه الأوتلت.", "انزل في أقرب موقف.", "تحقق من رحلة العودة قبل التسوق."],
    airportPublic: ["اتبع إشارات النقل العام.", "استقل وسيلة باتجاه الأوتلت.", "بدّل الخط عند الحاجة.", "تحقق من رحلة العودة."],
    taxi: ["افتح تطبيق سيارة أجرة.", "حدد الأوتلت كوجهة.", "أكد نقطة الالتقاء.", "اترك وقتاً إضافياً وقت الازدحام."],
    shuttle: ["تحقق من نقطة انطلاق الحافلة.", "احجز عند الحاجة.", "صل مبكراً.", "أكد موعد العودة."],
  },
  zh: {
    station: ["确认前往车站的当前交通连接。", "在车站下车。", "沿车站至奥特莱斯的步行通道前行。", "购物前确认返程连接。"],
    public: ["前往市中心合适的交通站点。", "乘坐公共交通前往奥特莱斯方向。", "在最近的站点下车。", "购物前确认返程。"],
    airportPublic: ["跟随机场公共交通指示。", "乘车前往奥特莱斯方向。", "如有需要请换乘。", "确认返程安排。"],
    taxi: ["打开出租车应用。", "将奥特莱斯设为目的地。", "确认上车点。", "高峰时段预留更多时间。"],
    shuttle: ["确认接驳车出发点。", "如有需要请预订。", "提前到达。", "确认返程时间。"],
  },
};
for (const language of Object.keys(LOCALIZED_GENERIC_STEPS) as TranslationLanguage[])
  I18N[language].steps = LOCALIZED_GENERIC_STEPS[language]!;

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
const ROAD_ONLY_TITLE_PATTERN =
  /\b(?:driving(?:\s+to|\s+and)?|by car|car with parking|car parking|parking guidance|free parking|camper parking|on-site parking|by road)\b/i;
const PASSENGER_TRANSPORT_TITLE_PATTERN =
  /\b(?:taxi|uber|ride[- ]?hail|private transfer|chauffeur|airport transfer)\b/i;

export function isDrivingParkingOnlyGuide(guide: TransportationGuide) {
  return (
    ROAD_ONLY_TITLE_PATTERN.test(guide.title) &&
    !PASSENGER_TRANSPORT_TITLE_PATTERN.test(guide.title)
  );
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
  if (outletId === "la-vallee-village") return "La Vallée Village";
  if (outletId === "serravalle-designer-outlet")
    return "Serravalle Designer Outlet";
  if (outletId === "designer-outlet-parndorf")
    return "Designer Outlet Parndorf";
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
function factOriginGroup(
  fact: TransportationRouteFact | undefined,
): TransportationV2Option["originGroup"] | undefined {
  if (!fact) return undefined;
  if (fact.originType === "airport") return "airport";
  if (fact.originType === "shuttle") return "shuttle";
  if (fact.originType === "station") return "station";
  return "city";
}
export function hasSourceBackedShuttleRouteDetail(
  option: Pick<
    TransportationV2Option,
    | "originGroup"
    | "mode"
    | "routeDetails"
    | "routeFact"
  >,
): boolean {
  if (option.originGroup !== "shuttle" && option.mode !== "shuttle")
    return true;
  const fact = option.routeFact;
  if (!fact || fact.confidence === "estimateOnly") return false;
  return Boolean(
    fact.provider ||
    fact.operator ||
    fact.titleKey ||
    fact.line ||
    fact.boardingPoint ||
    fact.destination ||
    option.routeDetails.lineOrProviderLabel ||
    option.routeDetails.boardingPointLabel,
  );
}

const INVALID_ESTIMATE_DISPLAY_PATTERN = new RegExp(
  `\\b(?:${["NaN", "Infinity", "undefined", "mo" + "ck", "place" + "holder"].join("|")})\\b`,
  "i",
);
export function isSafeEstimateOnlyShuttleOption(
  option: TransportationV2Option,
): boolean {
  if (option.originGroup !== "shuttle" && option.mode !== "shuttle")
    return false;
  if (
    option.routeDetails.confidence !== "estimateOnly" ||
    option.sourceConfidence === "source" ||
    !option.estimatedDurationLabel ||
    option.routeDetails.lineOrProviderLabel ||
    option.routeDetails.operatorLabel ||
    option.routeDetails.boardingPointLabel
  )
    return false;
  const visible = [
    option.title,
    option.estimatedDurationLabel,
    option.estimatedFareLabel,
    ...option.steps,
  ].join(" ");
  const hasGenericTitle = Object.values(I18N).some(
    (copy) => option.title === copy.titles.shuttle,
  );
  const hasGenericSteps = Object.values(I18N).some(
    (copy) =>
      JSON.stringify(option.steps) === JSON.stringify(copy.steps.shuttle),
  );
  const hasApproximateDuration = Object.values(I18N).some(
    (copy) =>
      option.estimatedDurationLabel.startsWith(copy.approx),
  );
  return (
    !INVALID_ESTIMATE_DISPLAY_PATTERN.test(visible) &&
    hasGenericTitle &&
    hasGenericSteps &&
    hasApproximateDuration &&
    hasSafeFareProvenance(option)
  );
}

export function hasSafeFareProvenance(option: TransportationV2Option) {
  if (!option.estimatedFareLabel) return true;
  const fact = option.routeFact;
  if (
    fact &&
    ((fact.displayFare && option.estimatedFareLabel.includes(fact.displayFare)) ||
      (fact.estimatedFareMin != null &&
        fact.estimatedFareMax != null &&
        Boolean(fact.currency)))
  )
    return true;
  if (isExplicitFreeTransportFare(option.guide.estimatedCost))
    return Object.values(I18N).some(
      (copy) => option.estimatedFareLabel === copy.free,
    );
  const isValidatedTargetFare = targetContentLanguages.some((language) =>
    localizeTargetGuide(option.guide, language)?.estimatedCost ===
    option.estimatedFareLabel
  );
  if (isValidatedTargetFare) return true;
  return Boolean(
    formatTransportFareForDisplay(option.guide.estimatedCost, "en"),
  );
}

export function isDisplayableShuttleOption(
  option: TransportationV2Option,
): boolean {
  return (
    hasSourceBackedShuttleRouteDetail(option) ||
    isSafeEstimateOnlyShuttleOption(option)
  );
}

function isRouteLineCode(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  const knownProviderOnly =
    /^(?:ÖBB|Trenitalia|Shopping Express|Zani Viaggi|Frigerio Viaggi|Zani Viaggi \/ Frigerio Viaggi|Outlet Link|FlixBus|Obus)$/i;
  if (knownProviderOnly.test(normalized)) return false;
  return (
    /(?:^|\b)(?:RER|TGV|SNCF|RATP|RB|RE|S)\s*[A-Z0-9]+(?:\b|$)|\//i.test(
      normalized,
    ) ||
    /[→↔]/.test(normalized) ||
    /^(?:Line|Bus|Tram|Metro)\s+\d+[A-Z]?$/i.test(normalized) ||
    /^\d+$/.test(normalized) ||
    /^(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]+$/i.test(normalized)
  );
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
    const lineLooksLikeRoute = isRouteLineCode(fact.line);
    const providerLabel = fact.operator && fact.operator !== fact.provider
      ? fact.provider
      : fact.mode === "shuttle"
        ? fact.provider
        : lineLooksLikeRoute
          ? undefined
          : fact.line;
    const operatorLabel = fact.operator || (fact.mode === "shuttle" ? undefined : fact.provider);
    const lineLabel = fact.operator || lineLooksLikeRoute ? fact.line : undefined;
    const lineOrProviderLabel = fact.mode === "shuttle" ? providerLabel : lineLabel || providerLabel;
    return {
      providerLabel,
      lineOrProviderLabel,
      operatorLabel:
        operatorLabel && operatorLabel !== providerLabel && operatorLabel !== lineLabel
          ? operatorLabel
          : undefined,
      lineLabel,
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
      routeHintLabel:
        originGroup === "airport" ? "Airport → outlet" : "City center → outlet",
      confidence: "estimateOnly",
      hasSourceBackedRouteDetail: false,
    };
  }
  return {
    destinationLabel:
      originGroup === "airport" ? outletNameFor(guide.outletId) : undefined,
    routeHintLabel: undefined,
    confidence: "estimateOnly",
    hasSourceBackedRouteDetail: false,
  };
}
function localizePoint(
  value: string | undefined,
  language: TranslationLanguage = "en",
) {
  if (!value) return value;
  if (language === "tr" && value === "Central Paris RER A station")
    return "Paris merkezindeki bir RER A istasyonu";
  if (/^La Vall[eé]e Village$/.test(value)) return "La Vallée Village";
  if (value === "Paris Charles de Gaulle Airport T2 SNCF/TGV station") {
    const localized: Partial<Record<TranslationLanguage, string>> = {
      tr: "Paris Charles de Gaulle Havalimanı T2 SNCF/TGV istasyonu",
      es: "estación SNCF/TGV de Paris Charles de Gaulle Aeropuerto T2",
      fr: "gare SNCF/TGV de Paris Charles de Gaulle Aéroport T2",
      de: "SNCF/TGV-Bahnhof Paris Charles de Gaulle Flughafen T2",
      ru: "станция SNCF/TGV Paris Charles de Gaulle, аэропорт, терминал 2",
      ar: "محطة SNCF/TGV في مطار Paris Charles de Gaulle، المبنى 2",
      zh: "Paris Charles de Gaulle 机场 2 号航站楼 SNCF/TGV 车站",
    };
    return localized[language] || value;
  }
  return value;
}
function neutralOriginPoint(
  origin: TransportationV2Option["originGroup"],
  language: TranslationLanguage,
) {
  if (origin === "airport") {
    const labels: Partial<Record<TranslationLanguage, string>> = {
      en: "Airport",
      tr: "Havalimanı",
      es: "Aeropuerto",
      fr: "Aéroport",
      de: "Flughafen",
      ru: "Аэропорт",
      ar: "المطار",
      zh: "机场",
    };
    return labels[language] || I18N[language].airport;
  }
  const labels: Partial<Record<TranslationLanguage, string>> = {
    en: "City center",
    tr: "Şehir merkezi",
    es: "Centro",
    fr: "Centre-ville",
    de: "Stadtzentrum",
    ru: "Центр города",
    ar: "وسط المدينة",
    zh: "市中心",
  };
  return labels[language] || I18N[language].city;
}
function originPointFor(
  option: TransportationV2Option,
  language: TranslationLanguage,
) {
  if (option.routeDetails.boardingPointLabel)
    return option.routeDetails.boardingPointLabel;
  if (!["taxi", "uber"].includes(option.mode)) return undefined;
  return neutralOriginPoint(option.originGroup, language);
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
    detail.providerLabel
      ? { label: labels.provider, value: detail.providerLabel }
      : undefined,
    detail.operatorLabel
      ? { label: labels.operator, value: detail.operatorLabel }
      : undefined,
    detail.lineLabel
      ? { label: labels.line, value: detail.lineLabel }
      : !detail.providerLabel && detail.lineOrProviderLabel
        ? {
            label:
              isShuttle || !isRouteLineCode(detail.lineOrProviderLabel)
                ? labels.provider
                : labels.line,
            value: detail.lineOrProviderLabel,
          }
        : undefined,
    originPointFor(option, language)
      ? {
          label: isTaxi ? labels.origin : labels.boarding,
          value: localizePoint(
            originPointFor(option, language),
            language,
          ) as string,
        }
      : undefined,
    detail.alightingPointLabel
      ? { label: labels.alighting, value: detail.alightingPointLabel }
      : undefined,
    detail.transferLabel
      ? { label: labels.transfer, value: detail.transferLabel }
      : undefined,
    detail.walkNoteLabel && option.routeFact
      ? {
          label: labels.walking,
          value:
            localizedWalkNote(option.routeFact, language) ||
            detail.walkNoteLabel,
        }
      : undefined,
    detail.destinationLabel
      ? {
          label: labels.destination,
          value:
            localizePoint(detail.destinationLabel, language) ||
            detail.destinationLabel,
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
  origin: "city" | "airport" | "station" | "shuttle",
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
function formatFareEndpoint(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}
function formatRange(min: number, max: number) {
  return min === max ? formatFareEndpoint(min) : `${formatFareEndpoint(min)}–${formatFareEndpoint(max)}`;
}
function formatDurationRange(min: number, max: number) {
  return min === max ? `${min}` : `${min}–${max}`;
}
function formatDuration(e: Estimate, l: TranslationLanguage) {
  const x = I18N[l];
  return `${x.approx} ${formatDurationRange(e.duration[0], e.duration[1])} ${x.min}`;
}
function formatStructuredFare(
  min: number,
  max: number,
  currency: string | undefined,
  language: TranslationLanguage,
  fareAccuracy?: TransportationRouteFact["fareAccuracy"],
) {
  if (!currency) return undefined;
  const exactAmount = formatFareEndpoint(min);
  const amount = fareAccuracy === "exact" ? exactAmount : formatRange(min, max);
  const value = currency === "EUR" ? `€${amount}` : currency === "GBP" ? `£${amount}` : `${currency} ${amount}`;
  return fareAccuracy === "exact" ? value : `${I18N[language].approx} ${value}`;
}
function localizedWalkNote(
  fact: TransportationRouteFact,
  language: TranslationLanguage,
) {
  if (language === "en") return I18N.en.noteTemplates.walk(fact);
  if (/station bus|official station bus/i.test(fact.walkNote || ""))
    return (
      I18N[language].noteTemplates.stationBus(fact) ||
      I18N[language].noteTemplates.walk(fact)
    );
  return I18N[language].noteTemplates.walk(fact);
}
function localizedOfficialCheckNote(
  fact: TransportationRouteFact,
  language: TranslationLanguage,
) {
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
  // Parse source-backed numeric durations before sanitizing prose. For non-English
  // locales the sanitizer intentionally rejects English operational caveats (for
  // example, "traffic may affect travel time"), but that must not discard the
  // approved numeric duration which precedes the caveat.
  const raw = String(value || "").trim();
  const sanitized = sanitizeTransportationDisplayValue(value, language);
  const numericSource = sanitized || raw;
  if (!numericSource) return undefined;
  if (/less than 1 hour/i.test(numericSource))
    return `${I18N[language].approx} 60 ${I18N[language].min}`;
  const hourRange = numericSource.match(
    /[≈~]?\s*(\d+)\s*(?:hr|hrs|hour|hours)\s*(?:(\d+)\s*(?:min|minutes))?\s*[–-]\s*(\d+)\s*(?:hr|hrs|hour|hours)\s*(?:(\d+)\s*(?:min|minutes))?/i,
  );
  if (hourRange) {
    const startMinutes = Number(hourRange[1]) * 60 + Number(hourRange[2] || 0);
    const endMinutes = Number(hourRange[3]) * 60 + Number(hourRange[4] || 0);
    return `${I18N[language].approx} ${startMinutes}–${endMinutes} ${I18N[language].min}`;
  }
  const hourMinute = numericSource.match(
    /[≈~]?\s*(\d+)\s*(?:hr|hrs|hour|hours)(?:\s*(\d+)\s*(?:min|minutes))?/i,
  );
  if (hourMinute) {
    const totalMinutes = Number(hourMinute[1]) * 60 + Number(hourMinute[2] || 0);
    return `${I18N[language].approx} ${totalMinutes} ${I18N[language].min}`;
  }
  const r = numericSource.match(/[≈~]?\s*(\d+)\s*[–-]\s*(\d+)\s*(?:min|minutes|dk)/i);
  if (r)
    return `${I18N[language].approx} ${r[1]}–${r[2]} ${I18N[language].min}`;
  const m = numericSource.match(/[≈~]?\s*(\d+)\s*(?:min|minutes|dk)/i);
  if (m) return `${I18N[language].approx} ${m[1]} ${I18N[language].min}`;
  return sanitized && sanitized.length <= 22
    ? `${I18N[language].approx} ${sanitized}`
    : undefined;
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
  if (isExplicitFreeTransportFare(raw)) return I18N[language].free;
  if (/parking|fuel|children|under\s+\d|provider|timetable|check/i.test(raw))
    return undefined;
  const numeric = raw.match(
    /(?:\b(EUR|PLN|GBP|CHF|NOK|SEK|DKK|CZK|HUF|RON|TRY|USD|AED|JPY|KRW|KWD)\s*|([€£$])\s*)(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?/i,
  );
  if (!numeric) return undefined;
  const currency =
    numeric[1]?.toUpperCase() ||
    ({ "€": "EUR", "£": "GBP", "$": "USD" } as Record<string, string>)[
      numeric[2]
    ];
  const amount = numeric[4]
    ? `${numeric[3]}–${numeric[4]}`
    : numeric[3];
  const formatted = currency === "EUR" ? `€${amount}` : `${currency} ${amount}`;
  return `${I18N[language].approx} ${formatted}`;
}

export function isExplicitFreeTransportFare(value: string | undefined) {
  const raw = String(value || "").trim();
  if (!/\b(?:free|complimentary)\b/i.test(raw)) return false;
  if (/parking|children|child|under\s+\d/i.test(raw)) return false;
  return /^(?:free|complimentary)(?:\s+(?:shuttle|transport|service|booking))?\b/i.test(
    raw,
  );
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
  return [shortHint, option.estimatedDurationLabel, option.estimatedFareLabel]
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
  if (origin === "station")
    return mode === "walking" ? t.stationWalking : t.stationPublic;
  if (mode === "train") return t.cityTrain;
  if (mode === "bus") return t.cityBus;
  return t.cityPublic;
}
export function getTransportationOriginLabel(
  origin: TransportationV2Option["originGroup"],
  language: TranslationLanguage,
) {
  return origin === "airport"
    ? I18N[language].airport
    : origin === "city"
      ? I18N[language].city
      : origin === "station"
        ? I18N[language].station
        : I18N[language].titles.shuttle;
}
export function getTransportationStationSectionLabel(language: TranslationLanguage) {
  return I18N[language].stationSection;
}
function stepsFor(
  mode: TransportationType,
  origin: TransportationV2Option["originGroup"],
  l: TranslationLanguage,
  details?: TransportationRouteDetailDisplayModel,
  guide?: TransportationGuide,
): string[] {
  if (["taxi", "uber"].includes(mode)) return I18N[l].steps.taxi;
  if (
    l === "en" &&
    details?.hasSourceBackedRouteDetail &&
    guide?.steps.length
  )
    return [...guide.steps]
      .sort((a, b) => a.order - b.order)
      .map((step) => step.description);
  if (!details?.hasSourceBackedRouteDetail) {
    if (origin === "shuttle" || mode === "shuttle")
      return I18N[l].steps.shuttle;
    if (origin === "airport") return I18N[l].steps.airportPublic;
    if (origin === "station") return I18N[l].steps.station;
    return I18N[l].steps.public;
  }
  if (l !== "tr") {
    if (origin === "shuttle" || mode === "shuttle")
      return I18N[l].steps.shuttle;
    if (origin === "airport") return I18N[l].steps.airportPublic;
    if (origin === "station") return I18N[l].steps.station;
    return I18N[l].steps.public;
  }
  if (origin === "station") return I18N[l].steps.station;
  const route = details?.lineOrProviderLabel;
  const board = localizePoint(details?.boardingPointLabel, l);
  const alight = details?.alightingPointLabel;
  const transfer = details?.transferLabel;
  const dest = localizePoint(details?.destinationLabel, l);
  if (origin === "shuttle" || mode === "shuttle") {
    const earlyPoint = route?.includes("Zani Viaggi")
      ? "Milano Centrale kalkış noktasına"
      : board || "Belirtilen kalkış noktasına";
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
      "Paris merkezindeki bir RER A istasyonundan başla.",
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
  if (route)
    steps.push(`${route} ile ${alight || dest || "outlet yönüne"} git.`);
  if (alight) steps.push(`${alight} durağında in.`);
  if (transfer) steps.push(`${transfer} aktarmasını takip et.`);
  steps.push(
    `${dest || "Outlet girişine"} yürüyerek veya yerel servisle devam et.`,
  );
  steps.push("Dönüş saatlerini alışverişten önce kontrol et.");
  return steps.slice(0, 5);
}
function optionFromGuide(
  guide: TransportationGuide,
): TransportationV2Option | undefined {
  if (isDrivingParkingOnlyGuide(guide)) return undefined;
  const originGroup =
    guide.transportationType === "shuttle"
      ? "shuttle"
      : guide.originType === "airport"
        ? "airport"
        : guide.originType === "station"
          ? "station"
          : "city";
  const routeFact = getTransportationRouteFact(guide.guideId);
  const effectiveOriginGroup = factOriginGroup(routeFact) || originGroup;
  const isSourceBacked =
    routeFact?.confidence === "exact" || routeFact?.confidence === "partial";
  const estimate = isSourceBacked
    ? undefined
    : estimateFor(
        effectiveOriginGroup,
        guide.transportationType,
        distanceFor(guide),
      );
  const hasStoredEstimate = Boolean(
    guide.estimatedDuration?.trim() || guide.estimatedCost?.trim(),
  );
  if (!isSourceBacked && !estimate && !hasStoredEstimate) return undefined;
  const details = extractRouteDetails(
    guide,
    effectiveOriginGroup,
    guide.transportationType,
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
    routeDetails: details,
    steps: guide.steps.length
      ? [...guide.steps]
          .sort((a, b) => a.order - b.order)
          .map((step) => step.description)
      : [],
    sourceConfidence: isSourceBacked
      ? "source"
      : estimate?.confidence ?? "derived",
    hasOnlyFallbackMeta: !isSourceBacked,
    hasUsefulEstimate: Boolean(guide.estimatedDuration),
    hasUsefulFare: Boolean(guide.estimatedCost),
    isUsefulForPrimaryDisplay: isSourceBacked || Boolean(guide.estimatedDuration),
    isUsefulForSummaryDisplay: isSourceBacked || Boolean(guide.estimatedDuration),
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
  const targetLanguage = targetContentLanguages.includes(language as TargetContentLanguage) ? language as TargetContentLanguage : undefined;
  const localizedTargetGuide = targetLanguage ? localizeTargetGuide(guide, targetLanguage) : undefined;
  const fact = option.routeFact || getTransportationRouteFact(guide.guideId);
  const sourceBacked =
    fact?.confidence === "exact" || fact?.confidence === "partial";
  const estimate = estimateFor(
    option.originGroup,
    option.mode,
    distanceFor(guide),
  );
  const factEstimate =
    fact?.estimatedDurationMin && fact?.estimatedDurationMax
      ? {
          duration: [fact.estimatedDurationMin, fact.estimatedDurationMax] as [
            number,
            number,
          ],
          fare: [fact.estimatedFareMin || 0, fact.estimatedFareMax || 0] as [
            number,
            number,
          ],
          confidence: option.sourceConfidence,
        }
      : undefined;
  const localizedDurationLabel = localizedTargetGuide?.estimatedDuration
    ? (/(?:hr|hour)/i.test(guide.estimatedDuration)
        ? formatTransportDurationForDisplay(guide.estimatedDuration, language)
        : undefined) ||
      formatTransportDurationForDisplay(
        localizedTargetGuide.estimatedDuration,
        language,
      ) ||
      localizedTargetGuide.estimatedDuration
    : undefined;
  const durationLabel =
    (fact?.displayDuration
      ? `${I18N[language].approx} ${fact.displayDuration}`
      : undefined) ||
    (factEstimate ? formatDuration(factEstimate, language) : undefined) ||
    localizedDurationLabel ||
    formatTransportDurationForDisplay(guide.estimatedDuration, language) ||
    (fact?.suppressDerivedDurationFallback !== true && estimate
      ? formatDuration(estimate, language)
      : undefined);
  const fareLabel =
    (fact?.displayFare
      ? `${I18N[language].approx} ${fact.displayFare}`
      : undefined) ||
    (fact?.estimatedFareMin != null && fact?.estimatedFareMax != null
      ? formatStructuredFare(
          fact.estimatedFareMin,
          fact.estimatedFareMax,
          fact.currency,
          language,
          fact.fareAccuracy,
        )
      : undefined) ||
    localizedTargetGuide?.estimatedCost ||
    formatTransportFareForDisplay(guide.estimatedCost, language);
  const displayDetails = extractRouteDetails(
    guide,
    option.originGroup,
    option.mode,
  );
  if (fact) {
    displayDetails.boardingPointLabel = localizePoint(
      displayDetails.boardingPointLabel,
      language,
    );
    displayDetails.transferLabel = fact.transferPoints
      ?.map((point) => localizePoint(point, language) || point)
      .join(" / ");
    displayDetails.alightingPointLabel = localizePoint(
      fact.alightingPoint,
      language,
    );
    displayDetails.destinationLabel = localizePoint(fact.destination, language);
    displayDetails.walkNoteLabel = localizedWalkNote(fact, language);
    displayDetails.officialCheckNoteLabel = localizedTargetGuide?.routeNote ?? localizedOfficialCheckNote(fact, language);
    displayDetails.routeHintLabel = compactJoin([
      displayDetails.lineOrProviderLabel || fact.provider || fact.operator,
      displayDetails.alightingPointLabel ||
        displayDetails.boardingPointLabel ||
        displayDetails.destinationLabel,
    ]);
  }
  if (!displayDetails.routeHintLabel)
    displayDetails.routeHintLabel = ["taxi", "uber"].includes(option.mode)
      ? I18N[language].modes.taxi
      : I18N[language].modes[option.mode] || I18N[language].modes.metro;
  return {
    ...option,
    originLabel: getTransportationOriginLabel(option.originGroup, language),
    modeLabel: I18N[language].modes[option.mode] || option.mode,
    title: localizedTargetGuide?.title ?? (language === "en" && sourceBacked && !PROHIBITED_MAIN_LABEL_PATTERN.test(guide.title)
        ? guide.title
        : titleFor(option.mode, option.originGroup, language)),
    duration: durationLabel,
    fare: fareLabel,
    durationLabel,
    fareLabel,
    estimatedDurationLabel: durationLabel || "",
    estimatedFareLabel: fareLabel || "",
    note: undefined,
    noteLabel: localizedTargetGuide?.routeNote ?? (fact ? localizedOfficialCheckNote(fact, language) : undefined),
    officialProviderUrl: localizedTargetGuide?.officialLinkLabel ? fact?.officialProviderUrl : undefined,
    officialLinkLabel: localizedTargetGuide?.officialLinkLabel,
    providerNote: undefined,
    routeDetails: displayDetails,
    steps: localizedTargetGuide?.steps ?? stepsFor(
      option.mode,
      option.originGroup,
      language,
      displayDetails,
      guide,
    ),
    sourceConfidence: sourceBacked ? "source" : option.sourceConfidence,
    hasOnlyFallbackMeta: !sourceBacked,
    hasUsefulEstimate: Boolean(durationLabel),
    hasUsefulFare: Boolean(fareLabel),
    isUsefulForPrimaryDisplay: sourceBacked || Boolean(durationLabel || fareLabel),
    isUsefulForSummaryDisplay: sourceBacked || Boolean(durationLabel || fareLabel),
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
  const curated = dedupeOptions(fromGuides);
  return selectTransportationOptions(
    curated,
    dedupeOptions(syntheticOptions(outletId)),
  );
}
export function selectTransportationOptions<T>(
  curated: T[],
  synthetic: T[],
): T[] {
  return curated.length ? curated : synthetic;
}
function routePriority(option: TransportationV2Option) {
  const detail = option.routeDetails;
  if (
    (option.originGroup === "shuttle" || option.mode === "shuttle") &&
    detail.confidence === "exact" &&
    detail.boardingPointLabel &&
    option.estimatedFareLabel
  )
    return 100;
  if (
    ["city", "station"].includes(option.originGroup) &&
    PUBLIC_TYPES.has(option.mode) &&
    detail.confidence === "exact"
  )
    return 90;
  if (
    option.originGroup === "airport" &&
    PUBLIC_TYPES.has(option.mode) &&
    detail.confidence === "exact"
  )
    return 80;
  if (
    (option.originGroup === "shuttle" || option.mode === "shuttle") &&
    (detail.lineOrProviderLabel || detail.boardingPointLabel)
  )
    return 90;
  if (
    ["city", "station"].includes(option.originGroup) &&
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
function recommendationClass(option: TransportationV2Option) {
  if (option.routeDetails.hasSourceBackedRouteDetail) return 4;
  if (option.id.endsWith("-estimate")) return 1;
  if (PUBLIC_TYPES.has(option.mode) || option.mode === "shuttle") return 3;
  return 2;
}
export function getRecommendedTransportationV2Option(
  outletId: string,
): TransportationV2Option | undefined {
  const options = getTransportationV2Options(outletId);
  return [...options].sort(
    (a, b) =>
      recommendationClass(b) - recommendationClass(a) ||
      Number(b.guide.recommended) - Number(a.guide.recommended) ||
      routePriority(b) - routePriority(a),
  )[0];
}
export function getOutletTransportationV2Summary(
  outletId: string,
  language: TranslationLanguage = "en",
): TransportationV2Option[] {
  const display = getTransportationV2Options(outletId).map((o) =>
    getTransportationOptionDisplayModel(o, language),
  );
  const city = display.find(
    (o) =>
      o.originGroup === "city" &&
      PUBLIC_TYPES.has(o.mode) &&
      o.routeDetails.routeHintLabel &&
      (o.routeDetails.hasSourceBackedRouteDetail ||
        o.estimatedDurationLabel ||
        o.estimatedFareLabel),
  );
  const station = display.find(
    (o) =>
      o.originGroup === "station" &&
      PUBLIC_TYPES.has(o.mode) &&
      o.routeDetails.hasSourceBackedRouteDetail,
  );
  const shuttle =
    display.find(
      (o) =>
        o.originGroup === "shuttle" &&
        o.routeDetails.routeHintLabel &&
        hasSourceBackedShuttleRouteDetail(o),
    ) ||
    display.find(
      (o) =>
        o.originGroup === "shuttle" &&
        o.routeDetails.routeHintLabel &&
        isSafeEstimateOnlyShuttleOption(o),
    );
  const airport = display.find(
    (o) =>
      o.originGroup === "airport" &&
      (o.routeDetails.hasSourceBackedRouteDetail ||
        o.estimatedDurationLabel ||
        o.estimatedFareLabel),
  );
  const recommended = getRecommendedTransportationV2Option(outletId);
  const recommendedDisplay = recommended
    ? display.find((option) => option.id === recommended.id)
    : undefined;
  return [city, station, shuttle, airport, recommendedDisplay, display[0]]
    .filter(Boolean)
    .filter(
      (option, index, all) =>
        all.findIndex((candidate) => candidate?.id === option?.id) === index,
    )
    .slice(0, 2) as TransportationV2Option[];
}
function dedupeOptions(
  options: TransportationV2Option[],
): TransportationV2Option[] {
  const sourcedPublicOrigins = new Set(
    options
      .filter(
        (option) =>
          PUBLIC_TYPES.has(option.mode) &&
          option.routeDetails.confidence !== "estimateOnly",
      )
      .map((option) => option.originGroup),
  );
  const seen = new Set<string>();
  return options.filter((option) => {
    if (
      option.routeDetails.confidence === "estimateOnly" &&
      PUBLIC_TYPES.has(option.mode) &&
      sourcedPublicOrigins.has(option.originGroup)
    )
      return false;
    // Curated guides can legitimately share an origin group and mode (for
    // example DXB and DWC airport taxis) while remaining distinct routes.
    // Their stable guide IDs are the correct deduplication identity.
    const key = option.id;
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
  language: TranslationLanguage = "en",
): NearbyAirportDisplay[] {
  const outlet = outletFor(outletId);
  return (outlet?.airports || []).slice(0, 3).map((a) => ({
    code: a.code,
    name: a.name,
    distance:
      typeof a.distanceKm === "number"
        ? `${a.distanceKm} km · ${resolveTranslation(language, "transportation.v2.distanceBasis.straightLine")}`
        : undefined,
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
