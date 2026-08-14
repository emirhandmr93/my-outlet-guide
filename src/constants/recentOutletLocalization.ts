import type { TransportationGuide } from "./transportationGuides";

export type RecentOutletLanguage =
| "en"
| "tr"
| "es"
| "fr"
| "de"
| "ar"
| "ru"
| "zh";

type QuickInfoLike = {
openingHours: string;
parking: string;
services: string[];
storesCountText: string;
cityCenterName: string;
airportNames: Record<string, string>;
};

type GuideCopy = {
title: string;
estimatedDuration: string;
estimatedCost: string;
steps: string[];
routeNote?: string;
officialLinkLabel?: string;
};

const L: RecentOutletLanguage[] = [
"en", "tr", "es", "fr", "de", "ar", "ru", "zh"
];

function normalizeLanguage(language: string): RecentOutletLanguage {
return L.includes(language as RecentOutletLanguage)
? (language as RecentOutletLanguage)
: "en";
}

const countWord: Record<RecentOutletLanguage, string> = {
en: "listed brands",
tr: "listelenen marka",
es: "marcas listadas",
fr: "marques répertoriées",
de: "gelistete Marken",
ar: "علامة تجارية مدرجة",
ru: "представленных брендов",
zh: "个已列出品牌",
};

function countText(count: string | number, language: RecentOutletLanguage) {
if (language === "zh") return `${count} ${countWord.zh}`;
return `${count} ${countWord[language]}`;
}

function extractCount(value: string) {
return value.match(/\d+\+?/)?.[0] ?? value;
}

/* =========================================================
YEOJU QUICK INFO
========================================================= */

const yeojuHours: Record<RecentOutletLanguage, string> = {
en: "May-Oct: daily 10:30-21:00; Nov-Apr: Mon-Thu 10:30-20:30, Fri-Sun and public holidays 10:30-21:00. Restaurants daily 11:00-21:00; last orders are taken 30 minutes before closing. Some stores may close 30 minutes early.",
tr: "Mayıs-Ekim: her gün 10:30-21:00; Kasım-Nisan: Pzt-Per 10:30-20:30, Cum-Paz ve resmî tatiller 10:30-21:00. Restoranlar her gün 11:00-21:00; son sipariş kapanıştan 30 dakika önce alınır. Bazı mağazalar 30 dakika erken kapanabilir.",
es: "Mayo-octubre: todos los días 10:30-21:00; noviembre-abril: lun.-jue. 10:30-20:30, vie.-dom. y festivos 10:30-21:00. Restaurantes todos los días 11:00-21:00; los últimos pedidos se toman 30 minutos antes del cierre. Algunas tiendas pueden cerrar 30 minutos antes.",
fr: "Mai-octobre : tous les jours 10:30-21:00 ; novembre-avril : lun.-jeu. 10:30-20:30, ven.-dim. et jours fériés 10:30-21:00. Restaurants tous les jours 11:00-21:00 ; dernières commandes 30 minutes avant la fermeture. Certaines boutiques peuvent fermer 30 minutes plus tôt.",
de: "Mai-Oktober: täglich 10:30-21:00; November-April: Mo-Do 10:30-20:30, Fr-So und Feiertage 10:30-21:00. Restaurants täglich 11:00-21:00; letzte Bestellungen 30 Minuten vor Schließung. Einige Geschäfte können 30 Minuten früher schließen.",
ar: "من مايو إلى أكتوبر: يوميًا 10:30-21:00؛ من نوفمبر إلى أبريل: الاثنين-الخميس 10:30-20:30، والجمعة-الأحد والعطلات الرسمية 10:30-21:00. المطاعم يوميًا 11:00-21:00؛ آخر طلب قبل الإغلاق بـ30 دقيقة. قد تغلق بعض المتاجر قبل 30 دقيقة.",
ru: "Май-октябрь: ежедневно 10:30-21:00; ноябрь-апрель: пн-чт 10:30-20:30, пт-вс и праздники 10:30-21:00. Рестораны ежедневно 11:00-21:00; последний заказ принимается за 30 минут до закрытия. Некоторые магазины могут закрываться на 30 минут раньше.",
zh: "5月至10月：每天10:30-21:00；11月至4月：周一至周四10:30-20:30，周五至周日及法定节假日10:30-21:00。餐厅每天11:00-21:00，最后点餐时间为闭店前30分钟。部分商店可能提前30分钟闭店。",
};

const yeojuParking: Record<RecentOutletLanguage, string> = {
en: "On-site parking is available.",
tr: "Tesis bünyesinde otopark mevcuttur.",
es: "Hay aparcamiento disponible en el recinto.",
fr: "Un parking est disponible sur place.",
de: "Parkplätze sind vor Ort verfügbar.",
ar: "تتوفر مواقف سيارات داخل الموقع.",
ru: "На территории имеется парковка.",
zh: "园区内设有停车场。",
};

const yeojuServiceBase = [
"Information Center",
"Stroller Rental",
"Wheelchair Rental",
"Tax-Free Shopping",
"Payment Methods",
"Free Circular Bus",
"Shinsegae Gift Certificates",
"ATM",
"Free Wi-Fi",
"Lockers",
"Clothing Alteration Service",
"Mini Train",
"Children’s Playground",
"Merry-go-round",
"Bounce Spin",
"emart24",
"Nursing Room",
"Electric Car Charging Station",
"Tesla Electric Car Charging Station",
"Premium Lounge",
"Premium Parking Zone",
"Art Museum Ryeo",
"Mobile Phone Charging",
"Lost and Found",
"Pet-Friendly Areas",
] as const;

const yeojuServices: Record<RecentOutletLanguage, readonly string[]> = {
en: yeojuServiceBase,
tr: [
"Danışma","Bebek Arabası Kiralama","Tekerlekli Sandalye Kiralama",
"Tax Free Alışveriş","Ödeme Yöntemleri","Ücretsiz Ring Servisi",
"Shinsegae Hediye Çekleri","ATM","Ücretsiz Wi-Fi","Dolaplar",
"Tadilat Hizmeti","Mini Tren","Çocuk Oyun Alanı","Atlıkarınca",
"Bounce Spin","emart24","Bebek Bakım Odası",
"Elektrikli Araç Şarj İstasyonu","Tesla Şarj İstasyonu",
"Premium Lounge","Premium Otopark Alanı","Ryeo Sanat Müzesi",
"Telefon Şarj Noktaları","Kayıp Eşya","Evcil Hayvan Dostu Alanlar"
],
es: [
"Información","Alquiler de cochecitos","Alquiler de sillas de ruedas",
"Compras Tax Free","Métodos de pago","Autobús circular gratuito",
"Cheques regalo Shinsegae","Cajero automático","Wi-Fi gratis","Taquillas",
"Servicio de arreglos de ropa","Mini tren","Zona de juegos infantil","Tiovivo",
"Bounce Spin","emart24","Sala de lactancia",
"Carga para vehículos eléctricos","Carga Tesla",
"Premium Lounge","Zona de aparcamiento Premium","Museo de Arte Ryeo",
"Carga de teléfonos","Objetos perdidos","Zonas para mascotas"
],
fr: [
"Information","Prêt de poussettes","Prêt de fauteuils roulants",
"Achats Tax Free","Moyens de paiement","Navette circulaire gratuite",
"Chèques-cadeaux Shinsegae","Distributeur","Wi-Fi gratuit","Casiers",
"Service de retouche","Petit train","Aire de jeux pour enfants","Carrousel",
"Bounce Spin","emart24","Espace allaitement",
"Recharge pour véhicules électriques","Recharge Tesla",
"Premium Lounge","Zone de stationnement Premium","Musée d'art Ryeo",
"Recharge de téléphone","Objets trouvés","Espaces acceptant les animaux"
],
de: [
"Information","Kinderwagenverleih","Rollstuhlverleih",
"Tax-Free-Einkauf","Zahlungsmethoden","Kostenloser Rundbus",
"Shinsegae-Geschenkgutscheine","Geldautomat","Kostenloses WLAN","Schließfächer",
"Änderungsservice","Mini-Zug","Kinderspielplatz","Karussell",
"Bounce Spin","emart24","Stillraum",
"Ladestation für Elektrofahrzeuge","Tesla-Ladestation",
"Premium Lounge","Premium-Parkbereich","Ryeo Kunstmuseum",
"Handy-Ladestation","Fundbüro","Haustierfreundliche Bereiche"
],
ar: [
"مركز المعلومات","استعارة عربات الأطفال","استعارة الكراسي المتحركة",
"التسوق المعفى من الضرائب","طرق الدفع","حافلة دائرية مجانية",
"قسائم هدايا Shinsegae","جهاز صراف آلي","واي فاي مجاني","خزائن",
"خدمة تعديل الملابس","قطار صغير","ملعب أطفال","دوامة",
"Bounce Spin","emart24","غرفة رضاعة",
"شحن المركبات الكهربائية","شحن Tesla",
"Premium Lounge","منطقة مواقف Premium","متحف Ryeo للفنون",
"شحن الهواتف","المفقودات","مناطق صديقة للحيوانات"
],
ru: [
"Информационный центр","Прокат детских колясок","Прокат инвалидных колясок",
"Покупки Tax Free","Способы оплаты","Бесплатный кольцевой автобус",
"Подарочные сертификаты Shinsegae","Банкомат","Бесплатный Wi-Fi","Камеры хранения",
"Подгонка одежды","Мини-поезд","Детская площадка","Карусель",
"Bounce Spin","emart24","Комната матери и ребёнка",
"Зарядка электромобилей","Зарядка Tesla",
"Premium Lounge","Премиальная парковка","Художественный музей Ryeo",
"Зарядка телефонов","Бюро находок","Зоны для посетителей с животными"
],
zh: [
"服务中心","婴儿车租借","轮椅租借",
"退税购物","支付方式","免费循环巴士",
"Shinsegae礼品券","自动取款机","免费Wi-Fi","储物柜",
"服装修改服务","迷你火车","儿童游乐场","旋转木马",
"Bounce Spin","emart24","母婴室",
"电动汽车充电站","Tesla充电站",
"Premium Lounge","Premium停车区","Ryeo艺术博物馆",
"手机充电","失物招领","宠物友好区域"
],
};

/* =========================================================
CITYGATE
========================================================= */

const citygateHours: Record<RecentOutletLanguage, string> = {
en: "Daily 10:00-22:00. Individual store and restaurant hours may vary.",
tr: "Her gün 10:00-22:00. Mağaza ve restoran saatleri değişebilir.",
es: "Todos los días 10:00-22:00. Los horarios de tiendas y restaurantes pueden variar.",
fr: "Tous les jours 10:00-22:00. Les horaires des boutiques et restaurants peuvent varier.",
de: "Täglich 10:00-22:00. Die Öffnungszeiten einzelner Geschäfte und Restaurants können abweichen.",
ar: "يوميًا 10:00-22:00. قد تختلف ساعات المتاجر والمطاعم.",
ru: "Ежедневно 10:00-22:00. Часы работы отдельных магазинов и ресторанов могут отличаться.",
zh: "每天10:00-22:00。各商店及餐厅营业时间可能有所不同。",
};

const citygateParking: Record<RecentOutletLanguage, string> = {
en: "More than 1,100 parking spaces are available across three car parks; EV charging facilities are available.",
tr: "Üç otoparkta toplam 1.100'den fazla park yeri bulunur; elektrikli araç şarj noktaları mevcuttur.",
es: "Hay más de 1.100 plazas repartidas en tres aparcamientos y puntos de carga para vehículos eléctricos.",
fr: "Plus de 1 100 places sont disponibles dans trois parkings, avec des bornes de recharge pour véhicules électriques.",
de: "In drei Parkhäusern stehen mehr als 1.100 Stellplätze sowie Ladestationen für Elektrofahrzeuge zur Verfügung.",
ar: "يتوفر أكثر من 1,100 موقف ضمن ثلاثة مواقف سيارات، مع مرافق لشحن المركبات الكهربائية.",
ru: "В трёх паркингах доступно более 1 100 мест, а также зарядные станции для электромобилей.",
zh: "三个停车场共提供1,100多个车位，并设有电动汽车充电设施。",
};

const citygateServices: Record<RecentOutletLanguage, string[]> = {
en:["Customer Care","Information","Free Wi-Fi","Lockers","Foreign Exchange","ATM","Baby Care Rooms","Mobile Charger Rental","Stroller and Wheelchair Lending","Delivery Service"],
tr:["Müşteri Hizmetleri","Danışma","Ücretsiz Wi-Fi","Dolaplar","Döviz Bürosu","ATM","Bebek Bakım Odaları","Telefon Şarj Cihazı Kiralama","Bebek Arabası ve Tekerlekli Sandalye","Teslimat Hizmeti"],
es:["Atención al cliente","Información","Wi-Fi gratis","Taquillas","Cambio de divisas","Cajero automático","Salas de cuidado del bebé","Alquiler de cargadores","Préstamo de cochecitos y sillas de ruedas","Servicio de entrega"],
fr:["Service clientèle","Information","Wi-Fi gratuit","Casiers","Bureau de change","Distributeur","Espaces bébé","Location de chargeurs","Prêt de poussettes et fauteuils roulants","Service de livraison"],
de:["Kundenservice","Information","Kostenloses WLAN","Schließfächer","Geldwechsel","Geldautomat","Babybereiche","Ladegerätverleih","Kinderwagen- und Rollstuhlverleih","Lieferservice"],
ar:["خدمة العملاء","معلومات","واي فاي مجاني","خزائن","صرافة العملات","جهاز صراف آلي","غرف رعاية الأطفال","استعارة شاحن هاتف","استعارة عربات الأطفال والكراسي المتحركة","خدمة التوصيل"],
ru:["Служба поддержки","Информация","Бесплатный Wi-Fi","Камеры хранения","Обмен валюты","Банкомат","Комнаты ухода за ребёнком","Прокат зарядных устройств","Прокат колясок и инвалидных кресел","Доставка"],
zh:["客户服务","信息中心","免费Wi-Fi","储物柜","外币兑换","自动取款机","婴儿护理室","手机充电器租借","婴儿车及轮椅租借","送货服务"],
};

/* =========================================================
LINKOU
========================================================= */

const linkouHours: Record<RecentOutletLanguage, string> = {
en:"Mon-Thu 11:00-21:30; Fri and days before holidays 11:00-22:00; Sat-Sun and holidays 10:30-22:00. Special operating hours may vary.",
tr:"Pzt-Per 11:00-21:30; Cuma ve tatil arifeleri 11:00-22:00; Cmt-Paz ve resmî tatiller 10:30-22:00. Özel çalışma saatleri değişebilir.",
es:"Lun.-jue. 11:00-21:30; viernes y vísperas de festivo 11:00-22:00; sáb.-dom. y festivos 10:30-22:00. Los horarios especiales pueden variar.",
fr:"Lun.-jeu. 11:00-21:30 ; vendredi et veilles de jours fériés 11:00-22:00 ; sam.-dim. et jours fériés 10:30-22:00. Les horaires spéciaux peuvent varier.",
de:"Mo-Do 11:00-21:30; Freitag und vor Feiertagen 11:00-22:00; Sa-So und Feiertage 10:30-22:00. Sonderöffnungszeiten können abweichen.",
ar:"الاثنين-الخميس 11:00-21:30؛ الجمعة وعشية العطلات 11:00-22:00؛ السبت-الأحد والعطلات 10:30-22:00. قد تختلف ساعات التشغيل الخاصة.",
ru:"Пн-чт 11:00-21:30; пятница и дни перед праздниками 11:00-22:00; сб-вс и праздники 10:30-22:00. Специальные часы работы могут отличаться.",
zh:"周一至周四11:00-21:30；周五及节假日前一天11:00-22:00；周六、周日及节假日10:30-22:00。特殊营业时间可能调整。",
};

const linkouParking: Record<RecentOutletLanguage, string> = {
en:"On-site parking is available; current parking and discount rules may vary.",
tr:"Tesis bünyesinde otopark mevcuttur; güncel park ve indirim kuralları değişebilir.",
es:"Hay aparcamiento en el recinto; las normas y descuentos vigentes pueden variar.",
fr:"Un parking est disponible sur place ; les règles et réductions peuvent varier.",
de:"Parkplätze sind vor Ort verfügbar; aktuelle Regeln und Vergünstigungen können variieren.",
ar:"تتوفر مواقف داخل الموقع؛ وقد تختلف القواعد والخصومات الحالية.",
ru:"На территории имеется парковка; действующие правила и скидки могут меняться.",
zh:"园区内设有停车场；停车规定及优惠可能调整。",
};

const linkouServices: Record<RecentOutletLanguage, string[]> = {
en:["Service Counter","Floor and Event Guide","Paging","First Aid","Lost Property","Receipt and Invoice Service","Tax Refund Invoice Stamp","Parking Discount","Customer Feedback","Free Shuttle from A9 Linkou"],
tr:["Danışma","Kat ve Etkinlik Rehberi","Anons Hizmeti","İlk Yardım","Kayıp Eşya","Fiş ve Fatura Hizmeti","Tax Free Fatura Onayı","Otopark İndirimi","Müşteri Geri Bildirimi","A9 Linkou Ücretsiz Servisi"],
es:["Información","Guía de plantas y eventos","Servicio de avisos","Primeros auxilios","Objetos perdidos","Servicio de recibos y facturas","Validación de factura Tax Free","Descuento de aparcamiento","Atención de comentarios","Lanzadera gratuita desde A9 Linkou"],
fr:["Information","Guide des étages et événements","Service d'annonce","Premiers secours","Objets trouvés","Service de reçus et factures","Validation de facture Tax Free","Réduction de parking","Commentaires clients","Navette gratuite depuis A9 Linkou"],
de:["Information","Etagen- und Veranstaltungsinformationen","Durchsagen","Erste Hilfe","Fundbüro","Beleg- und Rechnungsservice","Tax-Free-Rechnungsbestätigung","Parkrabatt","Kundenfeedback","Kostenloser Shuttle ab A9 Linkou"],
ar:["مركز الخدمة","دليل الطوابق والفعاليات","خدمة النداء","إسعافات أولية","المفقودات","خدمة الإيصالات والفواتير","اعتماد فاتورة الاسترداد الضريبي","خصم مواقف السيارات","ملاحظات العملاء","حافلة مجانية من A9 Linkou"],
ru:["Стойка обслуживания","Информация по этажам и мероприятиям","Объявления","Первая помощь","Бюро находок","Чеки и счета","Подтверждение счёта Tax Free","Скидка на парковку","Обратная связь","Бесплатный шаттл от A9 Linkou"],
zh:["服务台","楼层及活动指南","广播服务","急救","失物招领","收据及发票服务","退税发票盖章","停车优惠","顾客意见","A9林口站免费接驳车"],
};

/* =========================================================
QUICK INFO FINALIZER
========================================================= */

export function finalizeRecentQuickInfo(
outletId: string,
languageInput: string,
base: QuickInfoLike | undefined
): QuickInfoLike | undefined {
const language = normalizeLanguage(languageInput);

if (outletId === "yeoju-premium-outlets") {
return {
openingHours: yeojuHours[language],
parking: yeojuParking[language],
services: [...yeojuServices[language]],
storesCountText: countText(249, language),
cityCenterName: "Yeoju Station",
airportNames: {},
};
}

if (outletId === "citygate-outlets") {
return {
openingHours: citygateHours[language],
parking: citygateParking[language],
services: citygateServices[language],
storesCountText: countText(100, language),
cityCenterName: "Central Hong Kong",
airportNames: {
HKG:
language === "tr" ? "Hong Kong Uluslararası Havalimanı" :
language === "es" ? "Aeropuerto Internacional de Hong Kong" :
language === "fr" ? "Aéroport international de Hong Kong" :
language === "de" ? "Internationaler Flughafen Hongkong" :
language === "ar" ? "مطار هونغ كونغ الدولي" :
language === "ru" ? "Международный аэропорт Гонконга" :
language === "zh" ? "香港国际机场" :
"Hong Kong International Airport",
},
};
}

if (outletId === "mitsui-outlet-park-linkou") {
return {
openingHours: linkouHours[language],
parking: linkouParking[language],
services: linkouServices[language],
storesCountText: countText(100, language),
cityCenterName: "Taipei Main Station",
airportNames: {
TPE:
language === "tr" ? "Taiwan Taoyuan Uluslararası Havalimanı" :
language === "es" ? "Aeropuerto Internacional de Taiwan Taoyuan" :
language === "fr" ? "Aéroport international Taiwan Taoyuan" :
language === "de" ? "Internationaler Flughafen Taiwan Taoyuan" :
language === "ar" ? "مطار تايوان تاويوان الدولي" :
language === "ru" ? "Международный аэропорт Тайвань-Таоюань" :
language === "zh" ? "台湾桃园国际机场" :
"Taiwan Taoyuan International Airport",
},
};
}

const countOnly = new Set([
"al-khiran-hybrid-outlet-mall",
"the-outlet-village",
"rinku-premium-outlets",
"gotemba-premium-outlets",
"mitsui-outlet-park-kisarazu",
]);

if (base && countOnly.has(outletId)) {
return {
...base,
storesCountText: countText(
extractCount(base.storesCountText),
language
),
};
}

return base;
}

/* =========================================================
GUIDE LOCALIZATION
========================================================= */

const P: Record<RecentOutletLanguage, {
start:string;
direct:string;
alternative:string;
arrive:string;
confirm:string;
approx:string;
free:string;
checkFare:string;
checkDuration:string;
weekday:string;
weekend:string;
express:string;
subwayBus:string;
oneWay:string;
}> = {
en:{start:"Start",direct:"Direct route",alternative:"Alternative route",arrive:"Arrival",confirm:"Confirm the current timetable and route with the official provider before travel.",approx:"Approx.",free:"Free",checkFare:"Check current fare",checkDuration:"Check current timetable",weekday:"Weekday timetable",weekend:"Weekend / public-holiday timetable",express:"Express bus",subwayBus:"Subway + bus",oneWay:"one way"},
tr:{start:"Başlangıç",direct:"Doğrudan rota",alternative:"Alternatif rota",arrive:"Varış",confirm:"Yola çıkmadan önce güncel sefer ve rotayı resmî sağlayıcıdan doğrulayın.",approx:"Yaklaşık",free:"Ücretsiz",checkFare:"Güncel ücreti kontrol edin",checkDuration:"Güncel sefer süresini kontrol edin",weekday:"Hafta içi seferleri",weekend:"Hafta sonu / resmî tatil seferleri",express:"Ekspres otobüs",subwayBus:"Metro + otobüs",oneWay:"tek yön"},
es:{start:"Inicio",direct:"Ruta directa",alternative:"Ruta alternativa",arrive:"Llegada",confirm:"Confirme el horario y la ruta actuales con el proveedor oficial antes del viaje.",approx:"Aprox.",free:"Gratis",checkFare:"Consulte la tarifa actual",checkDuration:"Consulte el horario actual",weekday:"Horario entre semana",weekend:"Horario de fin de semana / festivos",express:"Autobús exprés",subwayBus:"Metro + autobús",oneWay:"solo ida"},
fr:{start:"Départ",direct:"Itinéraire direct",alternative:"Itinéraire alternatif",arrive:"Arrivée",confirm:"Vérifiez l'itinéraire et les horaires actuels auprès du fournisseur officiel avant le départ.",approx:"Environ",free:"Gratuit",checkFare:"Vérifiez le tarif actuel",checkDuration:"Vérifiez les horaires actuels",weekday:"Horaires en semaine",weekend:"Horaires week-end / jours fériés",express:"Bus express",subwayBus:"Métro + bus",oneWay:"aller simple"},
de:{start:"Start",direct:"Direkte Route",alternative:"Alternative Route",arrive:"Ankunft",confirm:"Prüfen Sie vor der Fahrt den aktuellen Fahrplan und die Route beim offiziellen Anbieter.",approx:"Ca.",free:"Kostenlos",checkFare:"Aktuellen Fahrpreis prüfen",checkDuration:"Aktuellen Fahrplan prüfen",weekday:"Fahrplan werktags",weekend:"Fahrplan Wochenende / Feiertage",express:"Expressbus",subwayBus:"U-Bahn + Bus",oneWay:"einfache Fahrt"},
ar:{start:"البداية",direct:"المسار المباشر",alternative:"المسار البديل",arrive:"الوصول",confirm:"تحقق من المسار والجدول الحاليين لدى الجهة الرسمية قبل السفر.",approx:"حوالي",free:"مجاني",checkFare:"تحقق من التعرفة الحالية",checkDuration:"تحقق من الجدول الحالي",weekday:"جدول أيام الأسبوع",weekend:"جدول عطلة نهاية الأسبوع / العطلات الرسمية",express:"حافلة سريعة",subwayBus:"مترو + حافلة",oneWay:"اتجاه واحد"},
ru:{start:"Начало",direct:"Прямой маршрут",alternative:"Альтернативный маршрут",arrive:"Прибытие",confirm:"Перед поездкой проверьте актуальный маршрут и расписание у официального перевозчика.",approx:"Около",free:"Бесплатно",checkFare:"Проверьте актуальный тариф",checkDuration:"Проверьте актуальное расписание",weekday:"Расписание по будням",weekend:"Расписание на выходные / праздники",express:"Экспресс-автобус",subwayBus:"Метро + автобус",oneWay:"в одну сторону"},
zh:{start:"起点",direct:"直达路线",alternative:"备选路线",arrive:"到达",confirm:"出发前请通过官方运营方确认最新路线和时刻表。",approx:"约",free:"免费",checkFare:"请查询最新票价",checkDuration:"请查询最新班次",weekday:"工作日班次",weekend:"周末 / 法定节假日班次",express:"直达巴士",subwayBus:"地铁 + 巴士",oneWay:"单程"},
};

function titleFor(
language: RecentOutletLanguage,
start: string,
end: string
) {
switch (language) {
case "tr": return `${start} noktasından ${end}'a`;
case "es": return `De ${start} a ${end}`;
case "fr": return `De ${start} à ${end}`;
case "de": return `Von ${start} nach ${end}`;
case "ar": return `من ${start} إلى ${end}`;
case "ru": return `Из ${start} в ${end}`;
case "zh": return `从${start}前往${end}`;
default: return `${start} to ${end}`;
}
}

const unitMinute: Record<RecentOutletLanguage,string> = {
en:"min",tr:"dk",es:"min",fr:"min",de:"Min.",ar:"دقيقة",ru:"мин",zh:"分钟"
};

function durationFromRaw(raw:string, language:RecentOutletLanguage) {
if (language === "en") return raw;

const m = raw.match(/(\d+(?:\s*[-–]\s*\d+)?)\s*(?:min|mins|minutes)/i);
if (m) return `${P[language].approx} ${m[1]} ${unitMinute[language]}`;

return P[language].checkDuration;
}

function costFromRaw(raw:string, language:RecentOutletLanguage) {
if (language === "en") return raw;

if (/free/i.test(raw)) return P[language].free;

const m = raw.match(/(AED|JPY|HKD|TWD|KRW)\s*[\d,.]+(?:\s*[-–]\s*[\d,.]+)?/i);
if (m) return `${P[language].approx} ${m[0]}`;

return P[language].checkFare;
}

function simpleGuide(
guide:TransportationGuide,
language:RecentOutletLanguage,
start:string,
service:string,
end:string,
extra?:string
):GuideCopy {
const p=P[language];

return {
title:titleFor(language,start,end),
estimatedDuration:durationFromRaw(guide.estimatedDuration,language),
estimatedCost:costFromRaw(guide.estimatedCost,language),
steps:[
`${p.start}: ${start}.`,
`${p.direct}: ${start} → ${service} → ${end}.`,
...(extra ? [`${p.arrive}: ${extra}.`] : []),
p.confirm,
],
};
}

const weekdayTimes =
"Gangnam 09:00, 10:00, 11:00, 13:00, 14:00, 15:00, 17:00, 19:00; Yeoju 11:00, 12:00, 13:00, 15:00, 16:00, 17:00, 19:00, 21:00";

const weekendTimes =
"Gangnam 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 17:00, 18:00, 19:00; Yeoju 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 19:00, 20:00, 21:00";

const yeojuProfiles:Record<string,{
start:string;
direct:string;
alternative:string;
expressDuration:string;
alternativeDuration:string;
}> = {
"myeongdong-to-yeoju-premium-outlets":{
start:"Myeongdong Station",
direct:"Myeongdong Station → Line 4 → Chungmuro Station → Line 3 → Express Bus Terminal Station → Platform 29 → Yeoju Premium Outlets",
alternative:"Myeongdong Station → Gangnam Station → Shinbundang Line → Pangyo Station → Gyeonggang Line → Yeoju Station Exit 4 → Bus 912 / 912-2 / 912-5 → Yeoju Premium Outlets",
expressDuration:"2 h",
alternativeDuration:"2 h 30 min"
},
"hongik-university-to-yeoju-premium-outlets":{
start:"Hongik University Station",
direct:"Hongik University Station → Line 2 → Dangsan Station → Line 9 → Express Bus Terminal Station → Platform 29 → Yeoju Premium Outlets",
alternative:"Hongik University Station → Line 2 → Wangsimni Station → Suin-Bundang Line → Imae Station → Gyeonggang Line → Yeoju Station Exit 4 → Bus 912 / 912-2 / 912-5 → Yeoju Premium Outlets",
expressDuration:"1 h 30 min",
alternativeDuration:"2 h 30 min"
},
"gangnam-to-yeoju-premium-outlets":{
start:"Gangnam Station",
direct:"Gangnam Station → Line 2 → Kyodae Station → Line 3 → Express Bus Terminal Station → Platform 29 → Yeoju Premium Outlets",
alternative:"Gangnam Station → Shinbundang Line → Pangyo Station → Gyeonggang Line → Yeoju Station Exit 4 → Bus 912 / 912-2 / 912-5 → Yeoju Premium Outlets",
expressDuration:"1 h 50 min",
alternativeDuration:"2 h"
},
};

function yeojuGuide(
guide:TransportationGuide,
language:RecentOutletLanguage
):GuideCopy|undefined {
const profile=yeojuProfiles[guide.guideId];
if(!profile)return;

const p=P[language];

return {
title:titleFor(language,profile.start,"Yeoju Premium Outlets"),
estimatedDuration:
`${p.express}: ${profile.expressDuration}; ${p.subwayBus}: ${profile.alternativeDuration}`,
estimatedCost:`KRW 6,400 ${p.oneWay}`,
steps:[
`${p.start}: ${profile.start}.`,
`${p.direct}: ${profile.direct}.`,
`${p.alternative}: ${profile.alternative}.`,
`${p.weekday}: ${weekdayTimes}.`,
`${p.weekend}: ${weekendTimes}.`,
p.confirm,
],
};
}

export function localizeRecentOutletGuide(
guide:TransportationGuide,
languageInput:string
):GuideCopy|undefined {
const language=normalizeLanguage(languageInput);

if(guide.outletId==="yeoju-premium-outlets"){
return yeojuGuide(guide,language);
}

if(guide.guideId==="kansai-airport-to-rinku-premium-outlets-sky-shuttle"){
return simpleGuide(
guide,
language,
"Kansai International Airport",
"Sky Shuttle",
"Rinku Premium Outlets"
);
}

if(guide.guideId==="ibn-battuta-to-the-outlet-village-dpr1-bus"){
return simpleGuide(
guide,
language,
"Ibn Battuta Bus Station",
"RTA DPR1",
"The Outlet Village"
);
}

if(guide.guideId==="hkg-to-citygate-outlets-bus"){
const result=simpleGuide(
guide,
language,
"Hong Kong International Airport",
"S1 / S64 bus",
"Citygate Outlets"
);

result.estimatedDuration =
language==="en" ? "Approx. 10 min" :
`${P[language].approx} 10 ${unitMinute[language]}`;

return result;
}

if(guide.guideId==="central-hong-kong-to-citygate-outlets-mtr"){
return simpleGuide(
guide,
language,
"Hong Kong Station",
"Tung Chung Line → Tung Chung Station → Exit C",
"Citygate Outlets"
);
}

if(guide.guideId==="tpe-to-mitsui-outlet-park-linkou-airport-mrt"){
const result=simpleGuide(
guide,
language,
"Taiwan Taoyuan International Airport",
"Taoyuan Airport MRT → A9 Linkou Station",
"MITSUI OUTLET PARK Linkou"
);

result.estimatedDuration =
language==="en"
? "Approx. 15 min by Airport MRT + approx. 5 min walk"
: `${P[language].approx} 15 ${unitMinute[language]} + ${P[language].approx} 5 ${unitMinute[language]}`;

return result;
}

if(guide.guideId==="taipei-main-station-to-mitsui-outlet-park-linkou"){
const result=simpleGuide(
guide,
language,
"A1 Taipei Main Station",
"Taoyuan Airport MRT → A9 Linkou Station",
"MITSUI OUTLET PARK Linkou"
);

result.estimatedDuration =
language==="en"
? "Approx. 20 min by Airport MRT + approx. 5 min walk"
: `${P[language].approx} 20 ${unitMinute[language]} + ${P[language].approx} 5 ${unitMinute[language]}`;

return result;
}

return undefined;
}
