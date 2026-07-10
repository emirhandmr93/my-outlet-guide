import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import type { TranslationLanguage } from "../translations/translations";

type LocaleMap = Partial<Record<TranslationLanguage, string>>;

function normalizeDisplayLookup(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const countryDisplayNames: Record<string, LocaleMap> = {
  austria: {
    en: "Austria",
    tr: "Avusturya",
    es: "Austria",
    fr: "Autriche",
    de: "Österreich",
    ru: "Австрия",
    ar: "النمسا",
    zh: "奥地利",
  },
  belgium: {
    en: "Belgium",
    tr: "Belçika",
    es: "Bélgica",
    fr: "Belgique",
    de: "Belgien",
    ru: "Бельгия",
    ar: "بلجيكا",
    zh: "比利时",
  },
  bulgaria: {
    en: "Bulgaria",
    tr: "Bulgaristan",
    es: "Bulgaria",
    fr: "Bulgarie",
    de: "Bulgarien",
    ru: "Болгария",
    ar: "بلغاريا",
    zh: "保加利亚",
  },
  canada: {
    en: "Canada",
    tr: "Kanada",
    es: "Canadá",
    fr: "Canada",
    de: "Kanada",
    ru: "Канада",
    ar: "كندا",
    zh: "加拿大",
  },
  china: {
    en: "China",
    tr: "Çin",
    es: "China",
    fr: "Chine",
    de: "China",
    ru: "Китай",
    ar: "الصين",
    zh: "中国",
  },
  croatia: {
    en: "Croatia",
    tr: "Hırvatistan",
    es: "Croacia",
    fr: "Croatie",
    de: "Kroatien",
    ru: "Хорватия",
    ar: "كرواتيا",
    zh: "克罗地亚",
  },
  "czech-republic": {
    en: "Czech Republic",
    tr: "Çekya",
    es: "Chequia",
    fr: "Tchéquie",
    de: "Tschechien",
    ru: "Чехия",
    ar: "التشيك",
    zh: "捷克",
  },
  denmark: {
    en: "Denmark",
    tr: "Danimarka",
    es: "Dinamarca",
    fr: "Danemark",
    de: "Dänemark",
    ru: "Дания",
    ar: "الدنمارك",
    zh: "丹麦",
  },
  estonia: {
    en: "Estonia",
    tr: "Estonya",
    es: "Estonia",
    fr: "Estonie",
    de: "Estland",
    ru: "Эстония",
    ar: "إستونيا",
    zh: "爱沙尼亚",
  },
  finland: {
    en: "Finland",
    tr: "Finlandiya",
    es: "Finlandia",
    fr: "Finlande",
    de: "Finnland",
    ru: "Финляндия",
    ar: "فنلندا",
    zh: "芬兰",
  },
  france: {
    en: "France",
    tr: "Fransa",
    es: "Francia",
    fr: "France",
    de: "Frankreich",
    ru: "Франция",
    ar: "فرنسا",
    zh: "法国",
  },
  germany: {
    en: "Germany",
    tr: "Almanya",
    es: "Alemania",
    fr: "Allemagne",
    de: "Deutschland",
    ru: "Германия",
    ar: "ألمانيا",
    zh: "德国",
  },
  greece: {
    en: "Greece",
    tr: "Yunanistan",
    es: "Grecia",
    fr: "Grèce",
    de: "Griechenland",
    ru: "Греция",
    ar: "اليونان",
    zh: "希腊",
  },
  hungary: {
    en: "Hungary",
    tr: "Macaristan",
    es: "Hungría",
    fr: "Hongrie",
    de: "Ungarn",
    ru: "Венгрия",
    ar: "المجر",
    zh: "匈牙利",
  },
  ireland: {
    en: "Ireland",
    tr: "İrlanda",
    es: "Irlanda",
    fr: "Irlande",
    de: "Irland",
    ru: "Ирландия",
    ar: "أيرلندا",
    zh: "爱尔兰",
  },
  italy: {
    en: "Italy",
    tr: "İtalya",
    es: "Italia",
    fr: "Italie",
    de: "Italien",
    ru: "Италия",
    ar: "إيطاليا",
    zh: "意大利",
  },
  japan: {
    en: "Japan",
    tr: "Japonya",
    es: "Japón",
    fr: "Japon",
    de: "Japan",
    ru: "Япония",
    ar: "اليابان",
    zh: "日本",
  },
  latvia: {
    en: "Latvia",
    tr: "Letonya",
    es: "Letonia",
    fr: "Lettonie",
    de: "Lettland",
    ru: "Латвия",
    ar: "لاتفيا",
    zh: "拉脱维亚",
  },
  lithuania: {
    en: "Lithuania",
    tr: "Litvanya",
    es: "Lituania",
    fr: "Lituanie",
    de: "Litauen",
    ru: "Литва",
    ar: "ليتوانيا",
    zh: "立陶宛",
  },
  netherlands: {
    en: "Netherlands",
    tr: "Hollanda",
    es: "Países Bajos",
    fr: "Pays-Bas",
    de: "Niederlande",
    ru: "Нидерланды",
    ar: "هولندا",
    zh: "荷兰",
  },
  norway: {
    en: "Norway",
    tr: "Norveç",
    es: "Noruega",
    fr: "Norvège",
    de: "Norwegen",
    ru: "Норвегия",
    ar: "النرويج",
    zh: "挪威",
  },
  poland: {
    en: "Poland",
    tr: "Polonya",
    es: "Polonia",
    fr: "Pologne",
    de: "Polen",
    ru: "Польша",
    ar: "بولندا",
    zh: "波兰",
  },
  portugal: {
    en: "Portugal",
    tr: "Portekiz",
    es: "Portugal",
    fr: "Portugal",
    de: "Portugal",
    ru: "Португалия",
    ar: "البرتغال",
    zh: "葡萄牙",
  },
  romania: {
    en: "Romania",
    tr: "Romanya",
    es: "Rumanía",
    fr: "Roumanie",
    de: "Rumänien",
    ru: "Румыния",
    ar: "رومانيا",
    zh: "罗马尼亚",
  },
  "south-korea": {
    en: "South Korea",
    tr: "Güney Kore",
    es: "Corea del Sur",
    fr: "Corée du Sud",
    de: "Südkorea",
    ru: "Южная Корея",
    ar: "كوريا الجنوبية",
    zh: "韩国",
  },
  spain: {
    en: "Spain",
    tr: "İspanya",
    es: "España",
    fr: "Espagne",
    de: "Spanien",
    ru: "Испания",
    ar: "إسبانيا",
    zh: "西班牙",
  },
  sweden: {
    en: "Sweden",
    tr: "İsveç",
    es: "Suecia",
    fr: "Suède",
    de: "Schweden",
    ru: "Швеция",
    ar: "السويد",
    zh: "瑞典",
  },
  switzerland: {
    en: "Switzerland",
    tr: "İsviçre",
    es: "Suiza",
    fr: "Suisse",
    de: "Schweiz",
    ru: "Швейцария",
    ar: "سويسرا",
    zh: "瑞士",
  },
  thailand: {
    en: "Thailand",
    tr: "Tayland",
    es: "Tailandia",
    fr: "Thaïlande",
    de: "Thailand",
    ru: "Таиланд",
    ar: "تايلاند",
    zh: "泰国",
  },
  "united-arab-emirates": {
    en: "United Arab Emirates",
    tr: "Birleşik Arap Emirlikleri",
    es: "Emiratos Árabes Unidos",
    fr: "Émirats arabes unis",
    de: "Vereinigte Arabische Emirate",
    ru: "Объединённые Арабские Эмираты",
    ar: "الإمارات العربية المتحدة",
    zh: "阿拉伯联合酋长国",
  },
  "united-kingdom": {
    en: "United Kingdom",
    tr: "Birleşik Krallık",
    es: "Reino Unido",
    fr: "Royaume-Uni",
    de: "Vereinigtes Königreich",
    ru: "Великобритания",
    ar: "المملكة المتحدة",
    zh: "英国",
  },
  "united-states": {
    en: "United States",
    tr: "Amerika Birleşik Devletleri",
    es: "Estados Unidos",
    fr: "États-Unis",
    de: "Vereinigte Staaten",
    ru: "США",
    ar: "الولايات المتحدة",
    zh: "美国",
  },
};

const cityDisplayNames: Record<string, LocaleMap> = {
  amsterdam: { tr: "Amsterdam", ar: "أمستردام", zh: "阿姆斯特丹" },
  barcelona: { tr: "Barselona", ar: "برشلونة", zh: "巴塞罗那" },
  cologne: {
    tr: "Köln",
    en: "Cologne",
    es: "Colonia",
    fr: "Cologne",
    de: "Köln",
    ru: "Кёльн",
    ar: "كولونيا",
    zh: "科隆",
  },
  florence: {
    tr: "Floransa",
    es: "Florencia",
    fr: "Florence",
    de: "Florenz",
    ru: "Флоренция",
    ar: "فلورنسا",
    zh: "佛罗伦萨",
  },
  london: {
    tr: "Londra",
    es: "Londres",
    fr: "Londres",
    de: "London",
    ru: "Лондон",
    ar: "لندن",
    zh: "伦敦",
  },
  marseille: {
    tr: "Marsilya",
    es: "Marsella",
    fr: "Marseille",
    de: "Marseille",
    ru: "Марсель",
    ar: "مرسيليا",
    zh: "马赛",
  },
  milan: {
    tr: "Milano",
    es: "Milán",
    fr: "Milan",
    de: "Mailand",
    ru: "Милан",
    ar: "ميلانو",
    zh: "米兰",
  },
  munich: {
    tr: "Münih",
    es: "Múnich",
    fr: "Munich",
    de: "München",
    ru: "Мюнхен",
    ar: "ميونخ",
    zh: "慕尼黑",
  },
  naples: {
    tr: "Napoli",
    es: "Nápoles",
    fr: "Naples",
    de: "Neapel",
    ru: "Неаполь",
    ar: "نابولي",
    zh: "那不勒斯",
  },
  paris: { tr: "Paris", ar: "باريس", zh: "巴黎" },
  rome: {
    tr: "Roma",
    es: "Roma",
    fr: "Rome",
    de: "Rom",
    ru: "Рим",
    ar: "روما",
    zh: "罗马",
  },
  vienna: {
    tr: "Viyana",
    es: "Viena",
    fr: "Vienne",
    de: "Wien",
    ru: "Вена",
    ar: "فيينا",
    zh: "维也纳",
  },
};

function resolveCountryId(countryNameOrCode: string) {
  const normalizedLookup = normalizeDisplayLookup(countryNameOrCode);
  const normalized = normalizedLookup.replace(/\s+/g, "-");
  const byId = countries.find((country) => country.countryId === normalized);
  if (byId) return byId.countryId;

  const byCanonicalName = countries.find(
    (country) =>
      normalizeDisplayLookup(country.countryName) === normalizedLookup,
  );
  if (byCanonicalName) return byCanonicalName.countryId;

  return Object.entries(countryDisplayNames).find(([, localizedNames]) =>
    Object.values(localizedNames).some(
      (localizedName) =>
        localizedName &&
        normalizeDisplayLookup(localizedName) === normalizedLookup,
    ),
  )?.[0];
}

function resolveCityId(cityNameOrId: string) {
  const normalized = normalizeDisplayLookup(cityNameOrId).replace(/\s+/g, "-");
  const byId = cities.find((city) => city.cityId === normalized);
  if (byId) return byId.cityId;
  return cities.find(
    (city) =>
      normalizeDisplayLookup(city.cityName) ===
      normalizeDisplayLookup(cityNameOrId),
  )?.cityId;
}

export function formatCountryDisplayName(
  countryNameOrCode: string,
  language: TranslationLanguage = "en",
) {
  const countryId = resolveCountryId(countryNameOrCode);
  const sourceName = countryId
    ? countries.find((country) => country.countryId === countryId)?.countryName
    : countryNameOrCode;
  return (
    (countryId &&
      (countryDisplayNames[countryId]?.[language] ||
        countryDisplayNames[countryId]?.en)) ||
    sourceName ||
    countryNameOrCode
  );
}

export function formatCityDisplayName(
  cityNameOrId: string,
  language: TranslationLanguage = "en",
) {
  const cityId = resolveCityId(cityNameOrId);
  const sourceName = cityId
    ? cities.find((city) => city.cityId === cityId)?.cityName
    : cityNameOrId;
  return (
    (cityId &&
      (cityDisplayNames[cityId]?.[language] || cityDisplayNames[cityId]?.en)) ||
    sourceName ||
    cityNameOrId
  );
}

export function formatOutletLocationSubtitle(
  cityNameOrId: string,
  countryNameOrCode: string,
  language: TranslationLanguage = "en",
) {
  return `${formatCityDisplayName(cityNameOrId, language)}, ${formatCountryDisplayName(countryNameOrCode, language)}`;
}

export function getLocalizedLocationSearchValues(value: string) {
  const countryId = resolveCountryId(value);
  const cityId = resolveCityId(value);
  return Array.from(
    new Set(
      [
        ...(countryId
          ? Object.values(countryDisplayNames[countryId] ?? {})
          : []),
        ...(cityId ? Object.values(cityDisplayNames[cityId] ?? {}) : []),
      ].filter(Boolean),
    ),
  );
}
