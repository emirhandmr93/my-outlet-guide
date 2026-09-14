import type { TargetContentLanguage } from "./targetOutletLocalization";

type L = TargetContentLanguage;
type QuickInfo = { openingHours: string; parking: string; services: string[]; storesCountText: string; cityCenterName: string; airportNames: Record<string, string> };
const langs: L[] = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"];
const d = (v: string[]) => Object.fromEntries(langs.map((l, i) => [l, v[i]])) as Record<L, string>;

const hours = {
  salonica: d(["Mon-Fri 10:00-21:00; Sat 10:00-20:00; Sun closed", "Pzt-Cum 10:00-21:00; Cmt 10:00-20:00; Paz kapalı", "Lun-vie 10:00-21:00; sáb 10:00-20:00; dom cerrado", "Lun-ven 10:00-21:00 ; sam 10:00-20:00 ; dim fermé", "Mo-Fr 10:00-21:00; Sa 10:00-20:00; So geschlossen", "الاثنين-الجمعة 10:00-21:00؛ السبت 10:00-20:00؛ الأحد مغلق", "Пн-пт 10:00-21:00; сб 10:00-20:00; вс закрыто", "周一至周五 10:00-21:00；周六 10:00-20:00；周日休息"]),
  daily1020: d(["Daily 10:00-20:00", "Her gün 10:00-20:00", "Todos los días 10:00-20:00", "Tous les jours 10:00-20:00", "Täglich 10:00-20:00", "يوميًا 10:00-20:00", "Ежедневно 10:00-20:00", "每天 10:00-20:00"]),
  daily112130: d(["Daily 11:00-21:30", "Her gün 11:00-21:30", "Todos los días 11:00-21:30", "Tous les jours 11:00-21:30", "Täglich 11:00-21:30", "يوميًا 11:00-21:30", "Ежедневно 11:00-21:30", "每天 11:00-21:30"]),
  daily1022: d(["Daily 10:00-22:00", "Her gün 10:00-22:00", "Todos los días 10:00-22:00", "Tous les jours 10:00-22:00", "Täglich 10:00-22:00", "يوميًا 10:00-22:00", "Ежедневно 10:00-22:00", "每天 10:00-22:00"]),
  monSat1021: d(["Mon-Sat 10:00-21:00; Sun 11:00-19:00", "Pzt-Cmt 10:00-21:00; Paz 11:00-19:00", "Lun-sáb 10:00-21:00; dom 11:00-19:00", "Lun-sam 10:00-21:00 ; dim 11:00-19:00", "Mo-Sa 10:00-21:00; So 11:00-19:00", "الاثنين-السبت 10:00-21:00؛ الأحد 11:00-19:00", "Пн-сб 10:00-21:00; вс 11:00-19:00", "周一至周六 10:00-21:00；周日 11:00-19:00"]),
  monSat1020Sun1118: d(["Mon-Sat 10:00-20:00; Sun 11:00-18:00", "Pzt-Cmt 10:00-20:00; Paz 11:00-18:00", "Lun-sáb 10:00-20:00; dom 11:00-18:00", "Lun-sam 10:00-20:00 ; dim 11:00-18:00", "Mo-Sa 10:00-20:00; So 11:00-18:00", "الاثنين-السبت 10:00-20:00؛ الأحد 11:00-18:00", "Пн-сб 10:00-20:00; вс 11:00-18:00", "周一至周六 10:00-20:00；周日 11:00-18:00"]),
  monSat1020Sun1019: d(["Mon-Sat 10:00-20:00; Sun 10:00-19:00", "Pzt-Cmt 10:00-20:00; Paz 10:00-19:00", "Lun-sáb 10:00-20:00; dom 10:00-19:00", "Lun-sam 10:00-20:00 ; dim 10:00-19:00", "Mo-Sa 10:00-20:00; So 10:00-19:00", "الاثنين-السبت 10:00-20:00؛ الأحد 10:00-19:00", "Пн-сб 10:00-20:00; вс 10:00-19:00", "周一至周六 10:00-20:00；周日 10:00-19:00"]),
  sanMarcos: d(["Mon-Thu 10:00-20:00; Fri-Sat 10:00-21:00; Sun 11:00-19:00", "Pzt-Per 10:00-20:00; Cum-Cmt 10:00-21:00; Paz 11:00-19:00", "Lun-jue 10:00-20:00; vie-sáb 10:00-21:00; dom 11:00-19:00", "Lun-jeu 10:00-20:00 ; ven-sam 10:00-21:00 ; dim 11:00-19:00", "Mo-Do 10:00-20:00; Fr-Sa 10:00-21:00; So 11:00-19:00", "الاثنين-الخميس 10:00-20:00؛ الجمعة-السبت 10:00-21:00؛ الأحد 11:00-19:00", "Пн-чт 10:00-20:00; пт-сб 10:00-21:00; вс 11:00-19:00", "周一至周四 10:00-20:00；周五至周六 10:00-21:00；周日 11:00-19:00"]),
  wrentham: d(["Mon-Thu 10:00-20:00; Fri-Sat 10:00-21:00; Sun 10:00-18:00", "Pzt-Per 10:00-20:00; Cum-Cmt 10:00-21:00; Paz 10:00-18:00", "Lun-jue 10:00-20:00; vie-sáb 10:00-21:00; dom 10:00-18:00", "Lun-jeu 10:00-20:00 ; ven-sam 10:00-21:00 ; dim 10:00-18:00", "Mo-Do 10:00-20:00; Fr-Sa 10:00-21:00; So 10:00-18:00", "الاثنين-الخميس 10:00-20:00؛ الجمعة-السبت 10:00-21:00؛ الأحد 10:00-18:00", "Пн-чт 10:00-20:00; пт-сб 10:00-21:00; вс 10:00-18:00", "周一至周四 10:00-20:00；周五至周六 10:00-21:00；周日 10:00-18:00"]),
  waikele: d(["Mon-Thu 10:00-19:00; Fri-Sat 10:00-20:00; Sun 11:00-18:00", "Pzt-Per 10:00-19:00; Cum-Cmt 10:00-20:00; Paz 11:00-18:00", "Lun-jue 10:00-19:00; vie-sáb 10:00-20:00; dom 11:00-18:00", "Lun-jeu 10:00-19:00 ; ven-sam 10:00-20:00 ; dim 11:00-18:00", "Mo-Do 10:00-19:00; Fr-Sa 10:00-20:00; So 11:00-18:00", "الاثنين-الخميس 10:00-19:00؛ الجمعة-السبت 10:00-20:00؛ الأحد 11:00-18:00", "Пн-чт 10:00-19:00; пт-сб 10:00-20:00; вс 11:00-18:00", "周一至周四 10:00-19:00；周五至周六 10:00-20:00；周日 11:00-18:00"]),
  daily1021: d(["Daily 10:00-21:00", "Her gün 10:00-21:00", "Todos los días 10:00-21:00", "Tous les jours 10:00-21:00", "Täglich 10:00-21:00", "يوميًا 10:00-21:00", "Ежедневно 10:00-21:00", "每天 10:00-21:00"]),
  factory: d(["Mon-Sat 10:00-21:00; shopping Sundays vary", "Pzt-Cmt 10:00-21:00; alışveriş pazarları değişebilir", "Lun-sáb 10:00-21:00; los domingos comerciales varían", "Lun-sam 10:00-21:00 ; dimanches commerciaux variables", "Mo-Sa 10:00-21:00; verkaufsoffene Sonntage variieren", "الاثنين-السبت 10:00-21:00؛ تختلف أيام الأحد التجارية", "Пн-сб 10:00-21:00; торговые воскресенья меняются", "周一至周六 10:00-21:00；开放营业的周日日期可能变化"]),
  barari: d(["Weekdays 10:00-22:00; weekends 10:00-23:00", "Hafta içi 10:00-22:00; hafta sonu 10:00-23:00", "Laborables 10:00-22:00; fines de semana 10:00-23:00", "Semaine 10:00-22:00 ; week-end 10:00-23:00", "Werktags 10:00-22:00; Wochenende 10:00-23:00", "أيام الأسبوع 10:00-22:00؛ عطلة نهاية الأسبوع 10:00-23:00", "Будни 10:00-22:00; выходные 10:00-23:00", "工作日 10:00-22:00；周末 10:00-23:00"]),
};

const parking = d(["On-site parking; check current conditions and charges.", "Tesis bünyesinde otopark; güncel koşul ve ücretleri kontrol et.", "Aparcamiento en el recinto; consulta condiciones y tarifas.", "Parking sur place ; vérifiez les conditions et tarifs.", "Parkplätze vor Ort; aktuelle Bedingungen und Gebühren prüfen.", "مواقف داخل الموقع؛ تحقق من الشروط والرسوم الحالية.", "Парковка на территории; уточняйте условия и стоимость.", "设有停车场，请确认当前规定与收费。"]);
const serviceNames: Record<string, Record<L, string>> = {
  "Customer Service": d(["Customer Service", "Müşteri Hizmetleri", "Atención al cliente", "Service clientèle", "Kundenservice", "خدمة العملاء", "Служба поддержки", "客户服务"]),
  "Dining": d(["Dining", "Yeme İçme", "Restauración", "Restauration", "Gastronomie", "المطاعم", "Рестораны и кафе", "餐饮"]),
  "Parking": d(["Parking", "Otopark", "Aparcamiento", "Parking", "Parkplätze", "مواقف السيارات", "Парковка", "停车场"]),
  "Tax-Free Shopping": d(["Tax-Free Shopping", "Tax Free Alışveriş", "Compras Tax Free", "Achats détaxés", "Tax-Free-Einkauf", "التسوق المعفى من الضرائب", "Покупки Tax Free", "免税购物"]),
  "Free Shuttle Bus": d(["Free Shuttle Bus", "Ücretsiz Servis", "Lanzadera gratuita", "Navette gratuite", "Kostenloser Shuttlebus", "حافلة نقل مجانية", "Бесплатный шаттл", "免费接驳巴士"]),
};

const rows: Record<string, { hours: keyof typeof hours; city: string; count: string; services: string[] }> = {
  "one-salonica-outlet-mall": { hours: "salonica", city: "Thessaloniki", count: "100+ brands", services: ["Customer Service", "Dining", "Parking", "Tax-Free Shopping"] },
  "m3-outlet-polgar": { hours: "daily1020", city: "Polgár", count: "100+ brands", services: ["Customer Service", "Dining", "Parking"] },
  "mitsui-outlet-park-tainan": { hours: "daily112130", city: "Tainan", count: "200+ shops and restaurants", services: ["Customer Service", "Dining", "Parking", "Tax-Free Shopping"] },
  "changi-city-point": { hours: "daily1022", city: "Singapore", count: "Outlet and value retail centre", services: ["Customer Service", "Dining", "Parking"] },
  "central-village-bangkok": { hours: "daily1022", city: "Bangkok", count: "170 stores", services: ["Customer Service", "Dining", "Parking", "Tax-Free Shopping"] },
  "orlando-international-premium-outlets": { hours: "monSat1021", city: "Orlando", count: "180+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "the-mills-at-jersey-gardens": { hours: "monSat1021", city: "New York / Elizabeth", count: "170+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "chicago-premium-outlets": { hours: "monSat1020Sun1118", city: "Chicago / Aurora", count: "160+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "seattle-premium-outlets": { hours: "monSat1020Sun1019", city: "Seattle / Tulalip", count: "130+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "wrentham-village-premium-outlets": { hours: "wrentham", city: "Boston / Wrentham", count: "170+ brands", services: ["Customer Service", "Dining", "Parking"] },
  "san-marcos-premium-outlets": { hours: "sanMarcos", city: "Austin / San Marcos", count: "145 stores", services: ["Customer Service", "Dining", "Parking", "Tax-Free Shopping"] },
  "waikele-premium-outlets": { hours: "waikele", city: "Honolulu / Waipahu", count: "50+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "las-vegas-south-premium-outlets": { hours: "monSat1020Sun1019", city: "Las Vegas", count: "140+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "las-americas-premium-outlets": { hours: "daily1020", city: "San Diego", count: "155+ stores", services: ["Customer Service", "Dining", "Parking"] },
  "factory-krakow": { hours: "factory", city: "Kraków", count: "100+ outlet stores", services: ["Customer Service", "Dining", "Parking", "Tax-Free Shopping", "Free Shuttle Bus"] },
  "mega-outlet-thessaloniki": { hours: "salonica", city: "Thessaloniki", count: "80+ stores / 400+ brands", services: ["Customer Service", "Dining", "Parking"] },
  "barari-outlet-mall": { hours: "barari", city: "Al Ain", count: "60+ shops", services: ["Customer Service", "Dining", "Parking"] },
};

export function finalExpansionQuickInfo(outletId: string, language: L): QuickInfo | undefined {
  const row = rows[outletId];
  if (!row) return undefined;
  return {
    openingHours: hours[row.hours][language],
    parking: parking[language],
    services: row.services.map((s) => serviceNames[s]?.[language] ?? s),
    storesCountText: row.count,
    cityCenterName: row.city,
    airportNames: {},
  };
}
