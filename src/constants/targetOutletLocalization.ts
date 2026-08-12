import type { TransportationGuide } from "./transportationGuides";

/** Player-facing locales configured by src/translations/locale.ts. */
export const targetContentLanguages = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const;
export type TargetContentLanguage = (typeof targetContentLanguages)[number];

type QuickInfo = { openingHours: string; parking: string; services: string[]; storesCountText: string; cityCenterName: string; airportNames: Record<string, string> };
type OutletCopy = Record<TargetContentLanguage, QuickInfo>;

const serviceNames: Record<TargetContentLanguage, Record<string, string>> = {
  en: {},
  tr: { "Customer Service":"Müşteri Hizmetleri", Dining:"Yeme İçme", Parking:"Otopark", "Waterfront Promenade":"Sahil Yürüyüş Yolu", ATM:"ATM", "Free Wi-Fi":"Ücretsiz Wi-Fi", "Prayer Room":"Mescit", Lockers:"Dolaplar", "Information Center":"Danışma", "Tax-Free Shopping":"Tax Free Alışveriş", "Currency Exchange":"Döviz Bürosu", "Free Shuttle Bus":"Ücretsiz Servis", "Nursing Room":"Bebek Bakım Odası", "Wheelchair Rental":"Tekerlekli Sandalye Kiralama", "Stroller Rental":"Bebek Arabası Kiralama" },
  de: { "Customer Service":"Kundenservice", Dining:"Gastronomie", Parking:"Parkplätze", "Waterfront Promenade":"Uferpromenade", ATM:"Geldautomat", "Free Wi-Fi":"Kostenloses WLAN", "Prayer Room":"Gebetsraum", Lockers:"Schließfächer", "Information Center":"Information", "Tax-Free Shopping":"Tax-Free-Einkauf", "Currency Exchange":"Geldwechsel", "Free Shuttle Bus":"Kostenloser Shuttlebus", "Nursing Room":"Stillraum", "Wheelchair Rental":"Rollstuhlverleih", "Stroller Rental":"Kinderwagenverleih" },
  fr: { "Customer Service":"Service clientèle", Dining:"Restauration", Parking:"Parking", "Waterfront Promenade":"Promenade du front de mer", ATM:"Distributeur", "Free Wi-Fi":"Wi-Fi gratuit", "Prayer Room":"Salle de prière", Lockers:"Casiers", "Information Center":"Point d’information", "Tax-Free Shopping":"Achats détaxés", "Currency Exchange":"Bureau de change", "Free Shuttle Bus":"Navette gratuite", "Nursing Room":"Espace allaitement", "Wheelchair Rental":"Prêt de fauteuil roulant", "Stroller Rental":"Prêt de poussette" },
  es: { "Customer Service":"Atención al cliente", Dining:"Restauración", Parking:"Aparcamiento", "Waterfront Promenade":"Paseo marítimo", ATM:"Cajero automático", "Free Wi-Fi":"Wi-Fi gratis", "Prayer Room":"Sala de oración", Lockers:"Taquillas", "Information Center":"Información", "Tax-Free Shopping":"Compras libres de impuestos", "Currency Exchange":"Cambio de divisas", "Free Shuttle Bus":"Lanzadera gratuita", "Nursing Room":"Sala de lactancia", "Wheelchair Rental":"Préstamo de sillas de ruedas", "Stroller Rental":"Préstamo de cochecitos" },
  ar: { "Customer Service":"خدمة العملاء", Dining:"المطاعم", Parking:"مواقف السيارات", "Waterfront Promenade":"ممشى الواجهة البحرية", ATM:"جهاز صراف آلي", "Free Wi-Fi":"واي فاي مجاني", "Prayer Room":"مصلى", Lockers:"خزائن الأمتعة", "Information Center":"مركز المعلومات", "Tax-Free Shopping":"التسوق المعفى من الضرائب", "Currency Exchange":"صرافة العملات", "Free Shuttle Bus":"حافلة نقل مجانية", "Nursing Room":"غرفة الرضاعة", "Wheelchair Rental":"استعارة كرسي متحرك", "Stroller Rental":"استعارة عربة أطفال" },
  ru: { "Customer Service":"Служба поддержки", Dining:"Рестораны и кафе", Parking:"Парковка", "Waterfront Promenade":"Набережная", ATM:"Банкомат", "Free Wi-Fi":"Бесплатный Wi‑Fi", "Prayer Room":"Молитвенная комната", Lockers:"Камеры хранения", "Information Center":"Информационный центр", "Tax-Free Shopping":"Покупки Tax Free", "Currency Exchange":"Обмен валюты", "Free Shuttle Bus":"Бесплатный шаттл", "Nursing Room":"Комната матери и ребёнка", "Wheelchair Rental":"Прокат инвалидных колясок", "Stroller Rental":"Прокат детских колясок" },
  zh: { "Customer Service":"客户服务", Dining:"餐饮", Parking:"停车场", "Waterfront Promenade":"滨水步道", ATM:"自动取款机", "Free Wi-Fi":"免费 Wi-Fi", "Prayer Room":"祈祷室", Lockers:"储物柜", "Information Center":"服务中心", "Tax-Free Shopping":"免税购物", "Currency Exchange":"外币兑换", "Free Shuttle Bus":"免费接驳巴士", "Nursing Room":"母婴室", "Wheelchair Rental":"轮椅租借", "Stroller Rental":"婴儿车租借" },
};
const translateServices = (language: TargetContentLanguage, values: string[]) => values.map((value) => serviceNames[language][value] ?? value);

const schedules: Record<TargetContentLanguage, [string,string,string]> = {
 en:["Sun–Wed 10:00–22:00; Thu–Sat 10:00–23:00.","Sun–Thu 10:00–22:00; Fri–Sat 10:00–00:00.","Mon–Thu 10:00–22:00; Fri–Sun 10:00–23:00."],
 tr:["Paz–Çar 10:00–22:00; Per–Cmt 10:00–23:00.","Paz–Per 10:00–22:00; Cum–Cmt 10:00–00:00.","Pzt–Per 10:00–22:00; Cum–Paz 10:00–23:00."],
 es:["Dom–mié 10:00–22:00; jue–sáb 10:00–23:00.","Dom–jue 10:00–22:00; vie–sáb 10:00–00:00.","Lun–jue 10:00–22:00; vie–dom 10:00–23:00."],
 fr:["Dim–mer 10:00–22:00 ; jeu–sam 10:00–23:00.","Dim–jeu 10:00–22:00 ; ven–sam 10:00–00:00.","Lun–jeu 10:00–22:00 ; ven–dim 10:00–23:00."],
 de:["So–Mi 10:00–22:00; Do–Sa 10:00–23:00.","So–Do 10:00–22:00; Fr–Sa 10:00–00:00.","Mo–Do 10:00–22:00; Fr–So 10:00–23:00."],
 ar:["الأحد–الأربعاء 10:00–22:00؛ الخميس–السبت 10:00–23:00.","الأحد–الخميس 10:00–22:00؛ الجمعة–السبت 10:00–00:00.","الاثنين–الخميس 10:00–22:00؛ الجمعة–الأحد 10:00–23:00."],
 ru:["Вс–ср 10:00–22:00; чт–сб 10:00–23:00.","Вс–чт 10:00–22:00; пт–сб 10:00–00:00.","Пн–чт 10:00–22:00; пт–вс 10:00–23:00."],
 zh:["周日至周三 10:00–22:00；周四至周六 10:00–23:00。","周日至周四 10:00–22:00；周五至周六 10:00–00:00。","周一至周四 10:00–22:00；周五至周日 10:00–23:00。"],
};

const japanHours:Record<TargetContentLanguage,[string,string,string]>={
 en:["Shops 10:00–20:00; restaurants 11:00–21:00; café 09:30–20:00.","Mar–Nov 10:00–20:00; Dec–Feb 10:00–19:00.","Shops 10:00–20:00; restaurants 11:00–21:00; food court 10:30–21:00; café 09:30–21:00."],
 tr:["Mağazalar 10:00–20:00; restoranlar 11:00–21:00; kafe 09:30–20:00.","Mart–Kasım 10:00–20:00; Aralık–Şubat 10:00–19:00.","Mağazalar 10:00–20:00; restoranlar 11:00–21:00; yemek alanı 10:30–21:00; kafe 09:30–21:00."],
 de:["Geschäfte 10:00–20:00; Restaurants 11:00–21:00; Café 09:30–20:00.","März–Nov. 10:00–20:00; Dez.–Feb. 10:00–19:00.","Geschäfte 10:00–20:00; Restaurants 11:00–21:00; Foodcourt 10:30–21:00; Café 09:30–21:00."],
 fr:["Boutiques 10:00–20:00 ; restaurants 11:00–21:00 ; café 09:30–20:00.","Mars–nov. 10:00–20:00 ; déc.–fév. 10:00–19:00.","Boutiques 10:00–20:00 ; restaurants 11:00–21:00 ; aire de restauration 10:30–21:00 ; café 09:30–21:00."],
 es:["Tiendas 10:00–20:00; restaurantes 11:00–21:00; cafetería 09:30–20:00.","Marzo–nov. 10:00–20:00; dic.–feb. 10:00–19:00.","Tiendas 10:00–20:00; restaurantes 11:00–21:00; zona de comidas 10:30–21:00; cafetería 09:30–21:00."],
 ar:["المتاجر 10:00–20:00؛ المطاعم 11:00–21:00؛ المقهى 09:30–20:00.","مارس–نوفمبر 10:00–20:00؛ ديسمبر–فبراير 10:00–19:00.","المتاجر 10:00–20:00؛ المطاعم 11:00–21:00؛ ردهة الطعام 10:30–21:00؛ المقهى 09:30–21:00."],
 ru:["Магазины 10:00–20:00; рестораны 11:00–21:00; кафе 09:30–20:00.","Март–ноябрь 10:00–20:00; декабрь–февраль 10:00–19:00.","Магазины 10:00–20:00; рестораны 11:00–21:00; фуд-корт 10:30–21:00; кафе 09:30–21:00."],
 zh:["商店 10:00–20:00；餐厅 11:00–21:00；咖啡店 09:30–20:00。","3月至11月 10:00–20:00；12月至2月 10:00–19:00。","商店 10:00–20:00；餐厅 11:00–21:00；美食广场 10:30–21:00；咖啡店 09:30–21:00。"]
};
const targetServices: Record<string,string[]> = {
 "al-khiran-hybrid-outlet-mall":["Customer Service","Dining","Parking","Waterfront Promenade"],
 "dubai-outlet-mall":["ATM","Customer Service","Free Wi-Fi","Prayer Room","Parking"], "the-outlet-village":["ATM","Customer Service","Free Wi-Fi","Prayer Room","Parking"],
 "rinku-premium-outlets":["Information Center","Tax-Free Shopping","Free Wi-Fi","ATM","Lockers","Prayer Room","Nursing Room","Stroller Rental","Wheelchair Rental","Parking"],
 "gotemba-premium-outlets":["Information Center","Tax-Free Shopping","Free Wi-Fi","ATM","Currency Exchange","Lockers","Prayer Room","Free Shuttle Bus","Nursing Room","Stroller Rental","Wheelchair Rental","Parking"],
 "mitsui-outlet-park-kisarazu":["Information Center","Tax-Free Shopping","Free Wi-Fi","ATM","Currency Exchange","Lockers","Prayer Room","Nursing Room","Stroller Rental","Wheelchair Rental","Parking"]
};
const quickText: Record<TargetContentLanguage,{parking:string; stores:string}> = {
 en:{parking:"On-site parking is available.",stores:"stores"},tr:{parking:"Tesis bünyesinde otopark mevcuttur.",stores:"mağaza"},de:{parking:"Parkplätze sind vor Ort verfügbar.",stores:"Geschäfte"},fr:{parking:"Un parking est disponible sur place.",stores:"boutiques"},es:{parking:"Hay aparcamiento en el recinto.",stores:"tiendas"},ar:{parking:"تتوفر مواقف للسيارات في الموقع.",stores:"متجرًا"},ru:{parking:"На территории есть парковка.",stores:"магазинов"},zh:{parking:"设有场内停车场。",stores:"家门店"}
};
const counts:Record<string,number>={"al-khiran-hybrid-outlet-mall":284,"dubai-outlet-mall":340,"the-outlet-village":100,"rinku-premium-outlets":213,"gotemba-premium-outlets":290,"mitsui-outlet-park-kisarazu":330};
const airportNames: Record<TargetContentLanguage, Record<string, string>> = {
 en:{KWI:"Kuwait International Airport",DXB:"Dubai International Airport",DWC:"Al Maktoum International Airport",KIX:"Kansai International Airport",HND:"Haneda Airport",NRT:"Narita International Airport"},
 tr:{KWI:"Kuveyt Uluslararası Havalimanı",DXB:"Dubai Uluslararası Havalimanı",DWC:"Al Maktoum Uluslararası Havalimanı",KIX:"Kansai Uluslararası Havalimanı",HND:"Haneda Havalimanı",NRT:"Narita Uluslararası Havalimanı"},
 es:{KWI:"Aeropuerto Internacional de Kuwait",DXB:"Aeropuerto Internacional de Dubái",DWC:"Aeropuerto Internacional Al Maktoum",KIX:"Aeropuerto Internacional de Kansai",HND:"Aeropuerto de Haneda",NRT:"Aeropuerto Internacional de Narita"},
 fr:{KWI:"Aéroport international de Koweït",DXB:"Aéroport international de Dubaï",DWC:"Aéroport international Al Maktoum",KIX:"Aéroport international du Kansai",HND:"Aéroport de Haneda",NRT:"Aéroport international de Narita"},
 de:{KWI:"Internationaler Flughafen Kuwait",DXB:"Internationaler Flughafen Dubai",DWC:"Internationaler Flughafen Al Maktoum",KIX:"Internationaler Flughafen Kansai",HND:"Flughafen Haneda",NRT:"Internationaler Flughafen Narita"},
 ar:{KWI:"مطار الكويت الدولي",DXB:"مطار دبي الدولي",DWC:"مطار آل مكتوم الدولي",KIX:"مطار كانساي الدولي",HND:"مطار هانيدا",NRT:"مطار ناريتا الدولي"},
 ru:{KWI:"Международный аэропорт Кувейт",DXB:"Международный аэропорт Дубай",DWC:"Международный аэропорт Аль-Мактум",KIX:"Международный аэропорт Кансай",HND:"Аэропорт Ханэда",NRT:"Международный аэропорт Нарита"},
 zh:{KWI:"科威特国际机场",DXB:"迪拜国际机场",DWC:"阿勒马克图姆国际机场",KIX:"关西国际机场",HND:"羽田机场",NRT:"成田国际机场"},
};
const outletOrder=Object.keys(targetServices);
export const targetOutletQuickInfo: Record<string, OutletCopy> = Object.fromEntries(outletOrder.map((id,index)=>[id,Object.fromEntries(targetContentLanguages.map(language=>[language,{openingHours:index<3?schedules[language][index]:japanHours[language][index-3],parking:quickText[language].parking,services:translateServices(language,targetServices[id]),storesCountText:`${counts[id]} ${quickText[language].stores}`,cityCenterName:id==="al-khiran-hybrid-outlet-mall"?"Kuwait City / Kuwait Towers":id.includes("dubai")||id==="the-outlet-village"?"Downtown Dubai / Burj Khalifa":id.startsWith("rinku")?"Rinku Town Station":id.startsWith("gotemba")?"JR Gotemba Station":"JR Kisarazu Station",airportNames:airportNames[language]}]))])) as unknown as Record<string,OutletCopy>;

export type LocalizedGuideCopy={title:string;estimatedDuration:string;estimatedCost:string;steps:string[]};
type Route={title:string;start:string;service:string;end:string;walk:string};
const routes:Record<string,Route>={
 "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66":{title:"Dubai Outlet Mall",start:"Al Ghubaiba Bus Station",service:"RTA Bus 66 toward Faqa, Terminus",end:"Dubai Outlet Mall 01",walk:"Dubai Outlet Mall entrance"},
 "downtown-dubai-to-dubai-outlet-mall-taxi":{title:"Dubai Outlet Mall",start:"Downtown Dubai",service:"licensed taxi",end:"Dubai Outlet Mall taxi drop-off",walk:"Dubai Outlet Mall entrance"},
 "dxb-to-dubai-outlet-mall-taxi":{title:"Dubai Outlet Mall",start:"DXB official taxi rank",service:"metered airport taxi",end:"Dubai Outlet Mall taxi drop-off",walk:"Dubai Outlet Mall entrance"},
 "downtown-dubai-to-the-outlet-village-taxi":{title:"The Outlet Village",start:"Downtown Dubai",service:"licensed taxi",end:"The Outlet Village drop-off",walk:"The Outlet Village entrance"}, "dxb-to-the-outlet-village-taxi":{title:"The Outlet Village",start:"DXB official taxi rank",service:"metered airport taxi",end:"The Outlet Village drop-off",walk:"The Outlet Village entrance"}, "dwc-to-the-outlet-village-taxi":{title:"The Outlet Village",start:"DWC official taxi rank",service:"metered airport taxi",end:"The Outlet Village drop-off",walk:"The Outlet Village entrance"},
 "kuwait-city-to-al-khiran-hybrid-outlet-mall-taxi":{title:"Al Khiran Hybrid Outlet Mall",start:"Kuwait City",service:"licensed taxi or ride-hailing car",end:"Al Khiran Hybrid Outlet Mall taxi point",walk:"main entrance"}, "kwi-to-al-khiran-hybrid-outlet-mall-taxi":{title:"Al Khiran Hybrid Outlet Mall",start:"KWI official taxi rank",service:"official airport taxi",end:"Al Khiran Hybrid Outlet Mall taxi point",walk:"main entrance"},
 "rinku-town-station-to-rinku-premium-outlets-walk":{title:"Rinku Premium Outlets",start:"Rinku Town Station",service:"signed pedestrian route",end:"Rinku Premium Outlets",walk:"outlet entrance"}, "kansai-airport-to-rinku-premium-outlets-train":{title:"Rinku Premium Outlets",start:"Kansai International Airport Station",service:"JR Kansai Airport Rapid or Nankai Airport train",end:"Rinku Town Station",walk:"Rinku Premium Outlets"},
 "tokyo-station-to-gotemba-premium-outlets-bus":{title:"Gotemba Premium Outlets",start:"Tokyo Station Yaesu South Exit",service:"direct highway bus",end:"Gotemba Premium Outlets",walk:"outlet entrance"}, "shinjuku-highway-bus-terminal-to-gotemba-premium-outlets-bus":{title:"Gotemba Premium Outlets",start:"Busta Shinjuku",service:"direct JR Bus or Odakyu Bus",end:"Gotemba Premium Outlets",walk:"outlet entrance"}, "jr-gotemba-station-to-gotemba-premium-outlets-shuttle":{title:"Gotemba Premium Outlets",start:"JR Gotemba Station Otomeguchi Exit",service:"official free shuttle",end:"Gotemba Premium Outlets",walk:"outlet entrance"},
 "tokyo-station-to-mitsui-outlet-park-kisarazu-bus":{title:"Mitsui Outlet Park Kisarazu",start:"Bus Terminal Tokyo Yaesu",service:"direct express bus",end:"Mitsui Outlet Park Kisarazu",walk:"outlet entrance"}, "shinjuku-highway-bus-terminal-to-mitsui-outlet-park-kisarazu-bus":{title:"Mitsui Outlet Park Kisarazu",start:"Busta Shinjuku",service:"direct express bus",end:"Mitsui Outlet Park Kisarazu",walk:"outlet entrance"}, "haneda-airport-to-mitsui-outlet-park-kisarazu-bus":{title:"Mitsui Outlet Park Kisarazu",start:"Haneda Airport bus stop",service:"direct Keikyu/Kominato airport bus",end:"Mitsui Outlet Park Kisarazu",walk:"outlet entrance"}, "jr-sodegaura-station-to-mitsui-outlet-park-kisarazu-bus":{title:"Mitsui Outlet Park Kisarazu",start:"JR Sodegaura Station North Exit",service:"local bus",end:"Mitsui Outlet Park Kisarazu",walk:"outlet entrance"}, "jr-kisarazu-station-to-mitsui-outlet-park-kisarazu-bus":{title:"Mitsui Outlet Park Kisarazu",start:"JR Kisarazu Station West Exit",service:"local bus",end:"Mitsui Outlet Park Kisarazu",walk:"outlet entrance"}
};
const sentenceTemplates:Record<TargetContentLanguage,(r:Route)=>string[]>={
 en:r=>[`Start at ${r.start}.`,`Take the ${r.service} toward ${r.end}.`,`Alight at ${r.end}.`,`Follow signs to the ${r.walk}.`],
 tr:r=>[`${r.start} noktasından başlayın.`,`${r.end} yönüne giden ${r.service} aracına binin.`,`${r.end} noktasında inin.`,`${r.walk} yönlendirmelerini takip edin.`],
 es:r=>[`Comience en ${r.start}.`,`Tome ${r.service} hacia ${r.end}.`,`Baje en ${r.end}.`,`Siga las señales hasta ${r.walk}.`],
 fr:r=>[`Partez de ${r.start}.`,`Prenez ${r.service} en direction de ${r.end}.`,`Descendez à ${r.end}.`,`Suivez les panneaux vers ${r.walk}.`],
 de:r=>[`Starten Sie an ${r.start}.`,`Nehmen Sie ${r.service} in Richtung ${r.end}.`,`Steigen Sie an ${r.end} aus.`,`Folgen Sie der Beschilderung zu ${r.walk}.`],
 ar:r=>[`ابدأ من ${r.start}.`,`استقل ${r.service} باتجاه ${r.end}.`,`انزل عند ${r.end}.`,`اتبع اللوحات الإرشادية إلى ${r.walk}.`],
 ru:r=>[`Начните маршрут у ${r.start}.`,`Сядьте на ${r.service} в направлении ${r.end}.`,`Выйдите на остановке ${r.end}.`,`Следуйте указателям к ${r.walk}.`],
 zh:r=>[`从${r.start}出发。`,`乘坐开往${r.end}的${r.service}。`,`在${r.end}下车。`,`按照指示牌前往${r.walk}。`],
};
const titleTemplates:Record<TargetContentLanguage,(r:Route)=>string>={en:r=>`From ${r.start} to ${r.title}`,tr:r=>`${r.start} noktasından ${r.title}’a`,de:r=>`Von ${r.start} nach ${r.title}`,fr:r=>`De ${r.start} à ${r.title}`,es:r=>`De ${r.start} a ${r.title}`,ar:r=>`من ${r.start} إلى ${r.title}`,ru:r=>`От ${r.start} до ${r.title}`,zh:r=>`从${r.start}前往${r.title}`};
const localizeEstimate=(value:string,l:TargetContentLanguage)=>{
  if(l==="en") return value;
  const words={tr:{approx:"Yaklaşık",free:"Ücretsiz",min:"dk",hour:"sa"},de:{approx:"Ca.",free:"Kostenlos",min:"Min.",hour:"Std."},fr:{approx:"Environ",free:"Gratuit",min:"min",hour:"h"},es:{approx:"Aprox.",free:"Gratis",min:"min",hour:"h"},ar:{approx:"حوالي",free:"مجانًا",min:"دقيقة",hour:"ساعة"},ru:{approx:"Около",free:"Бесплатно",min:"мин",hour:"ч"},zh:{approx:"约",free:"免费",min:"分钟",hour:"小时"}}[l];
  if(/^Free$/i.test(value)) return words.free;
  const currency=value.match(/\b(AED|KWD|JPY)\b/);
  const nums=[...value.matchAll(/\d[\d,.]*(?:\.\d+)?(?:[–-]\d[\d,.]*(?:\.\d+)?)?/g)].map(m=>m[0]);
  if(currency) return `${words.approx} ${currency[1]} ${nums[0]??""}`.trim();
  const hours=value.match(/(\d+(?:[–-]\d+)?)\s*hr/); const mins=value.match(/(\d+(?:[–-]\d+)?)\s*min/);
  return `${words.approx} ${hours?`${hours[1]} ${words.hour} `:""}${mins?`${mins[1]} ${words.min}`:nums[0]??""}`.trim();
};
export function localizeTargetGuide(guide:TransportationGuide,language:TargetContentLanguage):LocalizedGuideCopy|undefined{const route=routes[guide.guideId];if(!route)return;return{title:titleTemplates[language](route),estimatedDuration:localizeEstimate(guide.estimatedDuration,language),estimatedCost:localizeEstimate(guide.estimatedCost,language),steps:sentenceTemplates[language](route)}}
export function getTargetQuickInfo(outletId:string,language:string){const copy=targetOutletQuickInfo[outletId];if(!copy)return;return copy[language as TargetContentLanguage] ?? copy.en;}
