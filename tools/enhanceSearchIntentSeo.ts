import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
} from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const PRIORITY_COUNTRIES = [
  "france",
  "italy",
  "united-kingdom",
  "spain",
  "germany",
  "netherlands",
] as const;

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const publicCountryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId)));

type PageKey = "home" | "explore" | "savings" | "smart" | "price" | "help";
type PageCopy = { title: string; description: string; heading: string; summary: string };
type Copy = Record<PageKey, PageCopy> & {
  planningHeading: string;
  exploreLabel: string;
  savingsLabel: string;
  taxFreeLabel: string;
  smartLabel: string;
  priceLabel: string;
  helpLabel: string;
  priorityCountryTitle: string;
  priorityCountryDescription: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    home: {
      title: "Outlet Shopping Guide: {outletCount} Outlets, Brands & Tax Free | My Outlet Guide",
      description: "Explore {outletCount} public outlet destinations across {countryCount} countries. Compare outlet names, brands, transportation, Tax Free and shopping-planning tools.",
      heading: "Outlet shopping guide for destinations, brands and Tax Free",
      summary: "Discover outlet destinations by country and city, compare brand locations and use transportation, Tax Free and shopping calculators to plan each trip.",
    },
    explore: {
      title: "Outlet Directory: {outletCount} Destinations in {countryCount} Countries | My Outlet Guide",
      description: "Browse {outletCount} public outlet destinations in {countryCount} countries. Find outlets by country, city and brand and continue to transport and Tax Free planning.",
      heading: "Explore outlet destinations by country, city and brand",
      summary: "Start with a country, city or outlet name, then open detailed pages for brands, location information, transportation and Tax Free planning.",
    },
    savings: {
      title: "Outlet Shopping Savings: Tax Free, Price & Budget Tools | My Outlet Guide",
      description: "Plan outlet-shopping savings with Tax Free, price-advantage and smart-shopping calculators, then connect your budget with outlet and travel guides.",
      heading: "Outlet shopping savings and calculator guide",
      summary: "Use the Tax Free, price and budget tools together instead of viewing a discount in isolation, then compare destinations before your shopping trip.",
    },
    smart: {
      title: "Outlet Shopping Budget Calculator | My Outlet Guide",
      description: "Use the smart-shopping calculator to organize an outlet-shopping budget and compare your plan with price, Tax Free and destination information.",
      heading: "Outlet shopping budget calculator",
      summary: "Build a clearer shopping budget, then use the price-advantage and Tax Free tools to evaluate the rest of your outlet-shopping plan.",
    },
    price: {
      title: "Outlet Price Comparison & Advantage Calculator | My Outlet Guide",
      description: "Compare outlet-shopping prices and estimate price advantage, then review Tax Free and destination information before making your shopping plan.",
      heading: "Outlet price comparison and advantage calculator",
      summary: "Compare price scenarios for your shopping trip and combine the result with Tax Free and outlet-destination information before you travel.",
    },
    help: {
      title: "Outlet Shopping Help & FAQ: Brands, Tax Free and Travel | My Outlet Guide",
      description: "Find help for outlet discovery, brand locations, transportation, Tax Free, shopping calculators and trip-planning features in My Outlet Guide.",
      heading: "Outlet shopping help and frequently asked questions",
      summary: "Use the help center for questions about finding outlets and brands, planning transportation, using Tax Free tools and preparing an outlet-shopping trip.",
    },
    planningHeading: "Continue planning",
    exploreLabel: "Explore outlet destinations",
    savingsLabel: "Outlet savings guide",
    taxFreeLabel: "Tax Free calculator",
    smartLabel: "Smart shopping calculator",
    priceLabel: "Price advantage calculator",
    helpLabel: "Help and FAQ",
    priorityCountryTitle: "{country} Outlets & Tax Free: Shopping Guide | My Outlet Guide",
    priorityCountryDescription: "Explore {outletCount} public outlets across {cityCount} shopping cities in {country}. Compare outlet names, brands, transportation and Tax Free shopping information.",
  },
  tr: {
    home: {
      title: "Outlet Alışveriş Rehberi: {outletCount} Outlet, Markalar ve Tax Free | My Outlet Guide",
      description: "{countryCount} ülkedeki {outletCount} halka açık outlet destinasyonunu keşfedin. Outlet isimlerini, markaları, ulaşımı, Tax Free ve alışveriş planlama araçlarını karşılaştırın.",
      heading: "Outlet destinasyonları, markalar ve Tax Free alışveriş rehberi",
      summary: "Ülke ve şehre göre outletleri keşfedin, marka konumlarını karşılaştırın; ulaşım, Tax Free ve alışveriş hesaplayıcılarıyla seyahatinizi planlayın.",
    },
    explore: {
      title: "Outlet Rehberi: {countryCount} Ülkede {outletCount} Destinasyon | My Outlet Guide",
      description: "{countryCount} ülkedeki {outletCount} halka açık outlet destinasyonuna göz atın. Ülke, şehir ve markaya göre outlet bulun; ulaşım ve Tax Free planlamasına geçin.",
      heading: "Ülke, şehir ve markaya göre outletleri keşfedin",
      summary: "Ülke, şehir veya outlet adıyla başlayın; marka, konum, ulaşım ve Tax Free bilgileri için detay sayfalarını açın.",
    },
    savings: {
      title: "Outlet Alışverişinde Tasarruf: Tax Free, Fiyat ve Bütçe Araçları | My Outlet Guide",
      description: "Tax Free, fiyat avantajı ve akıllı alışveriş hesaplayıcılarıyla outlet alışverişi tasarrufunuzu planlayın; bütçenizi outlet ve seyahat rehberleriyle birleştirin.",
      heading: "Outlet alışverişi tasarruf ve hesaplama rehberi",
      summary: "Tax Free, fiyat ve bütçe araçlarını birlikte kullanın; ardından alışveriş seyahatinizden önce destinasyonları karşılaştırın.",
    },
    smart: {
      title: "Outlet Alışveriş Bütçesi Hesaplayıcısı | My Outlet Guide",
      description: "Akıllı alışveriş hesaplayıcısıyla outlet alışveriş bütçenizi düzenleyin; planınızı fiyat, Tax Free ve destinasyon bilgileriyle karşılaştırın.",
      heading: "Outlet alışveriş bütçesi hesaplayıcısı",
      summary: "Alışveriş bütçenizi netleştirin; ardından fiyat avantajı ve Tax Free araçlarıyla outlet planınızın diğer parçalarını değerlendirin.",
    },
    price: {
      title: "Outlet Fiyat Karşılaştırma ve Avantaj Hesaplayıcısı | My Outlet Guide",
      description: "Outlet alışveriş fiyatlarını karşılaştırın ve fiyat avantajını tahmin edin; planlama öncesinde Tax Free ve destinasyon bilgilerini inceleyin.",
      heading: "Outlet fiyat karşılaştırma ve avantaj hesaplayıcısı",
      summary: "Alışveriş seyahatiniz için fiyat senaryolarını karşılaştırın ve sonucu Tax Free ile outlet destinasyonu bilgileriyle birlikte değerlendirin.",
    },
    help: {
      title: "Outlet Alışveriş Yardım ve SSS: Markalar, Tax Free ve Seyahat | My Outlet Guide",
      description: "Outlet keşfi, marka konumları, ulaşım, Tax Free, alışveriş hesaplayıcıları ve seyahat planlama özellikleri için yardım bulun.",
      heading: "Outlet alışveriş yardım ve sık sorulan sorular",
      summary: "Outlet ve marka bulma, ulaşım planlama, Tax Free araçlarını kullanma ve outlet alışveriş seyahati hazırlığıyla ilgili sorular için yardım merkezini kullanın.",
    },
    planningHeading: "Planlamaya devam edin",
    exploreLabel: "Outlet destinasyonlarını keşfet",
    savingsLabel: "Outlet tasarruf rehberi",
    taxFreeLabel: "Tax Free hesaplayıcısı",
    smartLabel: "Akıllı alışveriş hesaplayıcısı",
    priceLabel: "Fiyat avantajı hesaplayıcısı",
    helpLabel: "Yardım ve SSS",
    priorityCountryTitle: "{country} Outletleri ve Tax Free: Alışveriş Rehberi | My Outlet Guide",
    priorityCountryDescription: "{country} içindeki {cityCount} alışveriş şehrinde yer alan {outletCount} halka açık outlet destinasyonunu keşfedin. Outlet isimlerini, markaları, ulaşımı ve Tax Free bilgilerini karşılaştırın.",
  },
  es: {
    home: {
      title: "Guía de Outlets: {outletCount} Outlets, Marcas y Tax Free | My Outlet Guide",
      description: "Explora {outletCount} destinos outlet públicos en {countryCount} países. Compara outlets, marcas, transporte, Tax Free y herramientas de planificación.",
      heading: "Guía de outlets, marcas y compras Tax Free",
      summary: "Descubre outlets por país y ciudad, compara ubicaciones de marcas y utiliza transporte, Tax Free y calculadoras para planificar cada viaje.",
    },
    explore: {
      title: "Directorio de Outlets: {outletCount} Destinos en {countryCount} Países | My Outlet Guide",
      description: "Consulta {outletCount} destinos outlet públicos en {countryCount} países. Busca por país, ciudad y marca y continúa con transporte y Tax Free.",
      heading: "Explora outlets por país, ciudad y marca",
      summary: "Empieza por un país, ciudad o nombre de outlet y abre las páginas detalladas para marcas, ubicación, transporte e información Tax Free.",
    },
    savings: {
      title: "Ahorro en Outlets: Tax Free, Precios y Presupuesto | My Outlet Guide",
      description: "Planifica el ahorro en outlets con calculadoras Tax Free, ventaja de precio y compras inteligentes, y conecta el presupuesto con guías de outlets y viaje.",
      heading: "Guía de ahorro y calculadoras para outlets",
      summary: "Utiliza juntas las herramientas Tax Free, de precios y presupuesto y compara destinos antes de tu viaje de compras.",
    },
    smart: {
      title: "Calculadora de Presupuesto para Compras Outlet | My Outlet Guide",
      description: "Organiza tu presupuesto de compras outlet y compara el plan con información de precios, Tax Free y destinos.",
      heading: "Calculadora de presupuesto para compras outlet",
      summary: "Organiza mejor el presupuesto y utiliza después las herramientas de precio y Tax Free para evaluar el resto del plan de compras.",
    },
    price: {
      title: "Calculadora de Comparación y Ventaja de Precios Outlet | My Outlet Guide",
      description: "Compara precios de compras outlet y estima la ventaja, luego revisa Tax Free y destinos antes de planificar el viaje.",
      heading: "Comparación y ventaja de precios outlet",
      summary: "Compara escenarios de precios y combina el resultado con información Tax Free y de destinos outlet antes del viaje.",
    },
    help: {
      title: "Ayuda de Outlets y FAQ: Marcas, Tax Free y Viajes | My Outlet Guide",
      description: "Encuentra ayuda sobre outlets, ubicaciones de marcas, transporte, Tax Free, calculadoras de compras y planificación de viajes.",
      heading: "Ayuda y preguntas frecuentes sobre compras outlet",
      summary: "Consulta ayuda para encontrar outlets y marcas, planificar transporte, utilizar Tax Free y preparar un viaje de compras outlet.",
    },
    planningHeading: "Continúa planificando",
    exploreLabel: "Explorar outlets",
    savingsLabel: "Guía de ahorro en outlets",
    taxFreeLabel: "Calculadora Tax Free",
    smartLabel: "Calculadora de compras inteligentes",
    priceLabel: "Calculadora de ventaja de precio",
    helpLabel: "Ayuda y FAQ",
    priorityCountryTitle: "Outlets y Tax Free en {country}: Guía de Compras | My Outlet Guide",
    priorityCountryDescription: "Explora {outletCount} outlets públicos en {cityCount} ciudades de compras de {country}. Compara outlets, marcas, transporte e información Tax Free.",
  },
  fr: {
    home: {
      title: "Guide des Outlets : {outletCount} Outlets, Marques et Tax Free | My Outlet Guide",
      description: "Découvrez {outletCount} destinations outlet publiques dans {countryCount} pays. Comparez outlets, marques, transports, Tax Free et outils de préparation.",
      heading: "Guide des outlets, marques et achats Tax Free",
      summary: "Découvrez les outlets par pays et ville, comparez les marques et utilisez les transports, le Tax Free et les calculateurs pour préparer chaque voyage.",
    },
    explore: {
      title: "Annuaire Outlets : {outletCount} Destinations dans {countryCount} Pays | My Outlet Guide",
      description: "Parcourez {outletCount} destinations outlet publiques dans {countryCount} pays. Recherchez par pays, ville et marque, puis préparez transport et Tax Free.",
      heading: "Explorer les outlets par pays, ville et marque",
      summary: "Commencez par un pays, une ville ou un nom d'outlet, puis ouvrez les pages détaillées pour les marques, la localisation, le transport et le Tax Free.",
    },
    savings: {
      title: "Économies Outlet : Tax Free, Prix et Budget | My Outlet Guide",
      description: "Préparez vos économies outlet avec les calculateurs Tax Free, avantage prix et budget, puis associez votre budget aux guides outlet et voyage.",
      heading: "Guide économies et calculateurs outlet",
      summary: "Utilisez ensemble les outils Tax Free, prix et budget, puis comparez les destinations avant votre voyage shopping.",
    },
    smart: {
      title: "Calculateur de Budget pour Shopping Outlet | My Outlet Guide",
      description: "Organisez votre budget shopping outlet et comparez votre projet avec les informations de prix, Tax Free et destinations.",
      heading: "Calculateur de budget shopping outlet",
      summary: "Clarifiez votre budget puis utilisez les outils d'avantage prix et Tax Free pour évaluer le reste de votre projet shopping.",
    },
    price: {
      title: "Calculateur de Comparaison et Avantage Prix Outlet | My Outlet Guide",
      description: "Comparez les prix outlet et estimez l'avantage, puis consultez Tax Free et destinations avant de préparer votre voyage shopping.",
      heading: "Comparaison et avantage des prix outlet",
      summary: "Comparez des scénarios de prix et combinez le résultat avec les informations Tax Free et les destinations outlet avant votre voyage.",
    },
    help: {
      title: "Aide Outlet et FAQ : Marques, Tax Free et Voyages | My Outlet Guide",
      description: "Trouvez de l'aide sur les outlets, les marques, le transport, le Tax Free, les calculateurs shopping et la préparation des voyages.",
      heading: "Aide et questions fréquentes sur le shopping outlet",
      summary: "Consultez l'aide pour trouver outlets et marques, préparer le transport, utiliser les outils Tax Free et organiser un voyage shopping outlet.",
    },
    planningHeading: "Continuer la préparation",
    exploreLabel: "Explorer les outlets",
    savingsLabel: "Guide des économies outlet",
    taxFreeLabel: "Calculateur Tax Free",
    smartLabel: "Calculateur shopping intelligent",
    priceLabel: "Calculateur avantage prix",
    helpLabel: "Aide et FAQ",
    priorityCountryTitle: "Outlets et Tax Free en {country} : Guide Shopping | My Outlet Guide",
    priorityCountryDescription: "Découvrez {outletCount} outlets publics dans {cityCount} villes shopping en {country}. Comparez outlets, marques, transports et informations Tax Free.",
  },
  de: {
    home: {
      title: "Outlet-Shopping-Guide: {outletCount} Outlets, Marken & Tax Free | My Outlet Guide",
      description: "Entdecken Sie {outletCount} öffentliche Outlet-Ziele in {countryCount} Ländern. Vergleichen Sie Outlets, Marken, Anreise, Tax Free und Planungstools.",
      heading: "Outlet-Shopping-Guide für Ziele, Marken und Tax Free",
      summary: "Entdecken Sie Outlets nach Land und Stadt, vergleichen Sie Markenstandorte und nutzen Sie Anreise-, Tax-Free- und Shoppingrechner für Ihre Reise.",
    },
    explore: {
      title: "Outlet-Verzeichnis: {outletCount} Ziele in {countryCount} Ländern | My Outlet Guide",
      description: "Durchsuchen Sie {outletCount} öffentliche Outlet-Ziele in {countryCount} Ländern nach Land, Stadt und Marke und planen Sie Anreise und Tax Free.",
      heading: "Outlets nach Land, Stadt und Marke entdecken",
      summary: "Starten Sie mit Land, Stadt oder Outlet-Name und öffnen Sie Detailseiten für Marken, Standort, Anreise und Tax-Free-Informationen.",
    },
    savings: {
      title: "Outlet-Sparen: Tax Free, Preis- und Budgetrechner | My Outlet Guide",
      description: "Planen Sie Outlet-Ersparnisse mit Tax-Free-, Preisvorteil- und Budgetrechnern und verbinden Sie Ihr Budget mit Outlet- und Reise-Guides.",
      heading: "Outlet-Sparguide und Shoppingrechner",
      summary: "Nutzen Sie Tax-Free-, Preis- und Budgettools gemeinsam und vergleichen Sie danach die Ziele vor Ihrer Shoppingreise.",
    },
    smart: {
      title: "Budgetrechner für Outlet-Shopping | My Outlet Guide",
      description: "Organisieren Sie Ihr Outlet-Shopping-Budget und vergleichen Sie den Plan mit Preis-, Tax-Free- und Zielinformationen.",
      heading: "Budgetrechner für Outlet-Shopping",
      summary: "Strukturieren Sie Ihr Einkaufsbudget und nutzen Sie danach Preisvorteil- und Tax-Free-Tools für den restlichen Shoppingplan.",
    },
    price: {
      title: "Outlet-Preisvergleich und Preisvorteil-Rechner | My Outlet Guide",
      description: "Vergleichen Sie Outlet-Preise und schätzen Sie den Preisvorteil; prüfen Sie danach Tax Free und Zielinformationen vor Ihrer Shoppingreise.",
      heading: "Outlet-Preisvergleich und Preisvorteil-Rechner",
      summary: "Vergleichen Sie Preisszenarien und verbinden Sie das Ergebnis vor der Reise mit Tax-Free- und Outlet-Zielinformationen.",
    },
    help: {
      title: "Outlet-Hilfe und FAQ: Marken, Tax Free und Reisen | My Outlet Guide",
      description: "Finden Sie Hilfe zu Outlets, Markenstandorten, Anreise, Tax Free, Shoppingrechnern und Reiseplanung.",
      heading: "Hilfe und häufige Fragen zum Outlet-Shopping",
      summary: "Nutzen Sie die Hilfe für Fragen zu Outlets und Marken, Anreise, Tax-Free-Tools und der Vorbereitung Ihrer Outlet-Shoppingreise.",
    },
    planningHeading: "Weiter planen",
    exploreLabel: "Outlet-Ziele entdecken",
    savingsLabel: "Outlet-Sparguide",
    taxFreeLabel: "Tax-Free-Rechner",
    smartLabel: "Smart-Shopping-Rechner",
    priceLabel: "Preisvorteil-Rechner",
    helpLabel: "Hilfe und FAQ",
    priorityCountryTitle: "Outlets & Tax Free in {country}: Shopping-Guide | My Outlet Guide",
    priorityCountryDescription: "Entdecken Sie {outletCount} öffentliche Outlets in {cityCount} Shopping-Städten in {country}. Vergleichen Sie Outlets, Marken, Anreise und Tax-Free-Informationen.",
  },
  ar: {
    home: {
      title: "دليل تسوق الأوت لت: {outletCount} أوت لت والعلامات وTax Free | My Outlet Guide",
      description: "اكتشف {outletCount} وجهة أوت لت عامة في {countryCount} دول. قارن الأوت لت والعلامات والنقل وTax Free وأدوات تخطيط التسوق.",
      heading: "دليل تسوق الأوت لت والعلامات وTax Free",
      summary: "اكتشف الأوت لت حسب الدولة والمدينة، وقارن مواقع العلامات واستخدم النقل وTax Free وحاسبات التسوق لتخطيط الرحلة.",
    },
    explore: {
      title: "دليل الأوت لت: {outletCount} وجهة في {countryCount} دول | My Outlet Guide",
      description: "تصفح {outletCount} وجهة أوت لت عامة في {countryCount} دول حسب البلد والمدينة والعلامة، ثم خطط للنقل وTax Free.",
      heading: "استكشف الأوت لت حسب الدولة والمدينة والعلامة",
      summary: "ابدأ باسم دولة أو مدينة أو أوت لت ثم افتح الصفحات التفصيلية للعلامات والموقع والنقل ومعلومات Tax Free.",
    },
    savings: {
      title: "التوفير في الأوت لت: Tax Free والسعر والميزانية | My Outlet Guide",
      description: "خطط للتوفير في الأوت لت باستخدام حاسبات Tax Free وفرق السعر والميزانية، واربط ميزانيتك بأدلة الأوت لت والسفر.",
      heading: "دليل التوفير وحاسبات تسوق الأوت لت",
      summary: "استخدم أدوات Tax Free والسعر والميزانية معاً ثم قارن الوجهات قبل رحلة التسوق.",
    },
    smart: {
      title: "حاسبة ميزانية تسوق الأوت لت | My Outlet Guide",
      description: "نظم ميزانية تسوق الأوت لت وقارن الخطة بمعلومات السعر وTax Free والوجهات.",
      heading: "حاسبة ميزانية تسوق الأوت لت",
      summary: "نظم ميزانية التسوق ثم استخدم أدوات فرق السعر وTax Free لتقييم بقية خطة التسوق.",
    },
    price: {
      title: "حاسبة مقارنة أسعار الأوت لت وفرق السعر | My Outlet Guide",
      description: "قارن أسعار الأوت لت وقدّر فرق السعر ثم راجع Tax Free ومعلومات الوجهة قبل تخطيط رحلة التسوق.",
      heading: "مقارنة أسعار الأوت لت وحاسبة فرق السعر",
      summary: "قارن سيناريوهات الأسعار واربط النتيجة بمعلومات Tax Free ووجهات الأوت لت قبل السفر.",
    },
    help: {
      title: "مساعدة الأوت لت والأسئلة الشائعة: العلامات وTax Free والسفر | My Outlet Guide",
      description: "اعثر على مساعدة حول الأوت لت ومواقع العلامات والنقل وTax Free وحاسبات التسوق وتخطيط الرحلات.",
      heading: "مساعدة وأسئلة شائعة حول تسوق الأوت لت",
      summary: "استخدم مركز المساعدة للأسئلة حول العثور على الأوت لت والعلامات والنقل وأدوات Tax Free والاستعداد لرحلة التسوق.",
    },
    planningHeading: "تابع التخطيط",
    exploreLabel: "استكشف وجهات الأوت لت",
    savingsLabel: "دليل التوفير في الأوت لت",
    taxFreeLabel: "حاسبة Tax Free",
    smartLabel: "حاسبة التسوق الذكي",
    priceLabel: "حاسبة فرق السعر",
    helpLabel: "المساعدة والأسئلة الشائعة",
    priorityCountryTitle: "أوت لت {country} وTax Free: دليل التسوق | My Outlet Guide",
    priorityCountryDescription: "اكتشف {outletCount} أوت لت عاماً في {cityCount} مدن تسوق في {country}. قارن الأوت لت والعلامات والنقل ومعلومات Tax Free.",
  },
  ru: {
    home: {
      title: "Гид по Аутлетам: {outletCount} Аутлетов, Бренды и Tax Free | My Outlet Guide",
      description: "Изучите {outletCount} публичных аутлетов в {countryCount} странах. Сравните аутлеты, бренды, транспорт, Tax Free и инструменты планирования.",
      heading: "Гид по аутлетам, брендам и Tax Free",
      summary: "Ищите аутлеты по стране и городу, сравнивайте расположение брендов и используйте транспортные, Tax Free и shopping-инструменты для поездки.",
    },
    explore: {
      title: "Каталог Аутлетов: {outletCount} Направлений в {countryCount} Странах | My Outlet Guide",
      description: "Просматривайте {outletCount} публичных аутлетов в {countryCount} странах по стране, городу и бренду, затем планируйте транспорт и Tax Free.",
      heading: "Аутлеты по стране, городу и бренду",
      summary: "Начните со страны, города или названия аутлета и откройте детальные страницы с брендами, расположением, транспортом и Tax Free.",
    },
    savings: {
      title: "Экономия в Аутлетах: Tax Free, Цены и Бюджет | My Outlet Guide",
      description: "Планируйте экономию с калькуляторами Tax Free, ценового преимущества и бюджета, связывая бюджет с гидами по аутлетам и поездкам.",
      heading: "Гид по экономии и калькуляторам для аутлетов",
      summary: "Используйте Tax Free, ценовые и бюджетные инструменты вместе, затем сравните направления перед поездкой.",
    },
    smart: {
      title: "Калькулятор Бюджета для Покупок в Аутлетах | My Outlet Guide",
      description: "Организуйте бюджет покупок в аутлетах и сравните план с информацией о ценах, Tax Free и направлениях.",
      heading: "Калькулятор бюджета для покупок в аутлетах",
      summary: "Сформируйте понятный бюджет, затем используйте инструменты ценового преимущества и Tax Free для оценки плана покупок.",
    },
    price: {
      title: "Сравнение Цен и Калькулятор Выгоды в Аутлетах | My Outlet Guide",
      description: "Сравните цены в аутлетах и оцените выгоду, затем проверьте Tax Free и информацию о направлениях перед поездкой.",
      heading: "Сравнение цен и выгоды в аутлетах",
      summary: "Сравните ценовые сценарии и объедините результат с информацией Tax Free и об аутлетах до поездки.",
    },
    help: {
      title: "Помощь по Аутлетам и FAQ: Бренды, Tax Free и Поездки | My Outlet Guide",
      description: "Найдите помощь по аутлетам, расположению брендов, транспорту, Tax Free, калькуляторам покупок и планированию поездок.",
      heading: "Помощь и частые вопросы о покупках в аутлетах",
      summary: "Используйте справку для вопросов об аутлетах и брендах, транспорте, Tax Free и подготовке шопинг-поездки.",
    },
    planningHeading: "Продолжить планирование",
    exploreLabel: "Найти аутлеты",
    savingsLabel: "Гид по экономии",
    taxFreeLabel: "Калькулятор Tax Free",
    smartLabel: "Калькулятор умных покупок",
    priceLabel: "Калькулятор выгоды",
    helpLabel: "Помощь и FAQ",
    priorityCountryTitle: "Аутлеты и Tax Free в {country}: Гид по Шопингу | My Outlet Guide",
    priorityCountryDescription: "Изучите {outletCount} публичных аутлетов в {cityCount} торговых городах страны {country}. Сравните аутлеты, бренды, транспорт и Tax Free.",
  },
  zh: {
    home: {
      title: "奥特莱斯购物指南：{outletCount} 个奥特莱斯、品牌与 Tax Free | My Outlet Guide",
      description: "探索 {countryCount} 个国家的 {outletCount} 个公开奥特莱斯目的地，对比奥特莱斯、品牌、交通、Tax Free 退税和购物规划工具。",
      heading: "奥特莱斯目的地、品牌与 Tax Free 购物指南",
      summary: "按国家和城市探索奥特莱斯，对比品牌地点，并结合交通、Tax Free 退税和购物计算器规划行程。",
    },
    explore: {
      title: "奥特莱斯目录：{countryCount} 个国家的 {outletCount} 个目的地 | My Outlet Guide",
      description: "浏览 {countryCount} 个国家的 {outletCount} 个公开奥特莱斯目的地，按国家、城市和品牌查找，并继续规划交通与 Tax Free。",
      heading: "按国家、城市和品牌探索奥特莱斯",
      summary: "从国家、城市或奥特莱斯名称开始，打开详细页面查看品牌、地点、交通和 Tax Free 退税信息。",
    },
    savings: {
      title: "奥特莱斯省钱指南：Tax Free、价格与预算工具 | My Outlet Guide",
      description: "使用 Tax Free、价格优势和智能购物计算器规划奥特莱斯购物节省，并结合奥特莱斯与旅行指南安排预算。",
      heading: "奥特莱斯购物省钱与计算器指南",
      summary: "结合使用 Tax Free、价格和预算工具，并在购物旅行前对比不同目的地。",
    },
    smart: {
      title: "奥特莱斯购物预算计算器 | My Outlet Guide",
      description: "使用智能购物计算器整理奥特莱斯购物预算，并结合价格、Tax Free 和目的地信息比较计划。",
      heading: "奥特莱斯购物预算计算器",
      summary: "明确购物预算，再结合价格优势和 Tax Free 工具评估完整的奥特莱斯购物计划。",
    },
    price: {
      title: "奥特莱斯价格比较与优势计算器 | My Outlet Guide",
      description: "比较奥特莱斯购物价格并估算价格优势，然后在规划行程前查看 Tax Free 和目的地信息。",
      heading: "奥特莱斯价格比较与优势计算器",
      summary: "比较购物行程的价格方案，并在出发前结合 Tax Free 和奥特莱斯目的地信息评估结果。",
    },
    help: {
      title: "奥特莱斯购物帮助与常见问题：品牌、Tax Free 与旅行 | My Outlet Guide",
      description: "查找奥特莱斯、品牌地点、交通、Tax Free、购物计算器和旅行规划功能的帮助信息。",
      heading: "奥特莱斯购物帮助与常见问题",
      summary: "通过帮助中心了解如何查找奥特莱斯和品牌、规划交通、使用 Tax Free 工具并准备奥特莱斯购物行程。",
    },
    planningHeading: "继续规划",
    exploreLabel: "探索奥特莱斯目的地",
    savingsLabel: "奥特莱斯省钱指南",
    taxFreeLabel: "Tax Free 退税计算器",
    smartLabel: "智能购物计算器",
    priceLabel: "价格优势计算器",
    helpLabel: "帮助与常见问题",
    priorityCountryTitle: "{country}奥特莱斯与 Tax Free：购物指南 | My Outlet Guide",
    priorityCountryDescription: "探索{country} {cityCount} 个购物城市中的 {outletCount} 个公开奥特莱斯，对比奥特莱斯、品牌、交通和 Tax Free 退税信息。",
  },
};

const PAGES: Record<PageKey, { path: string; links: (keyof Pick<Copy, "exploreLabel" | "savingsLabel" | "taxFreeLabel" | "smartLabel" | "priceLabel" | "helpLabel">)[] }> = {
  home: { path: "", links: ["exploreLabel", "savingsLabel", "taxFreeLabel", "helpLabel"] },
  explore: { path: "explore", links: ["savingsLabel", "taxFreeLabel", "helpLabel"] },
  savings: { path: "savings", links: ["smartLabel", "priceLabel", "taxFreeLabel"] },
  smart: { path: "calculator/smart-shopping", links: ["savingsLabel", "priceLabel", "taxFreeLabel"] },
  price: { path: "calculator/price-advantage", links: ["savingsLabel", "smartLabel", "taxFreeLabel"] },
  help: { path: "help", links: ["exploreLabel", "savingsLabel", "taxFreeLabel"] },
};

const LINK_PATHS: Record<string, string> = {
  exploreLabel: "explore",
  savingsLabel: "savings",
  taxFreeLabel: "calculator/tax-free",
  smartLabel: "calculator/smart-shopping",
  priceLabel: "calculator/price-advantage",
  helpLabel: "help",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

function replaceMeta(html: string, title: string, description: string) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${d}">`)
    .replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${t}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${d}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${t}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${d}">`);
}

function updateStructuredData(html: string, pageId: string, title: string, description: string) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, (match, raw: string) => {
    try {
      const data = JSON.parse(raw) as { "@graph"?: Record<string, unknown>[] };
      const webpage = (data["@graph"] ?? []).find((item) => item["@id"] === pageId);
      if (!webpage) return match;
      webpage.name = title;
      webpage.description = description;
      return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
    } catch {
      return match;
    }
  });
}

function fileFor(language: TranslationLanguage, path: string) {
  return path ? join(DIST, language, `${path}.html`) : join(DIST, `${language}.html`);
}

function canonicalFor(language: TranslationLanguage, path: string) {
  return `${WEB_SEO_ORIGIN}/${language}${path ? `/${path}` : ""}`;
}

async function enhanceFixedPage(language: TranslationLanguage, key: PageKey) {
  const copy = COPY[language];
  const page = PAGES[key];
  const values = { outletCount: publicOutlets.length, countryCount: publicCountryIds.length };
  const title = fill(copy[key].title, values);
  const description = fill(copy[key].description, values);
  const heading = fill(copy[key].heading, values);
  const summary = fill(copy[key].summary, values);
  const file = fileFor(language, page.path);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, title, description);
  html = updateStructuredData(html, `${canonicalFor(language, page.path)}#webpage`, title, description);

  const links = page.links
    .map((labelKey) => `<li><a href="${WEB_SEO_ORIGIN}/${language}/${LINK_PATHS[labelKey]}">${escapeHtml(copy[labelKey])}</a></li>`)
    .join("");
  const section = `<section data-search-intent-seo="${key}"><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(summary)}</p><ul>${links}</ul></section>`;
  html = html.replace(new RegExp(`<section data-search-intent-seo="${key}">[\\s\\S]*?<\\/section>`, "i"), "");
  html = html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p>${section}`,
  );
  await writeFile(file, html);
}

async function enhancePriorityCountry(language: TranslationLanguage, countryId: (typeof PRIORITY_COUNTRIES)[number]) {
  const countryOutlets = publicOutlets.filter((outlet) => outlet.countryId === countryId);
  const cityCount = new Set(countryOutlets.map((outlet) => outlet.cityId)).size;
  const country = formatCountryDisplayName(countryId, language);
  const copy = COPY[language];
  const values = { country, outletCount: countryOutlets.length, cityCount };
  const title = fill(copy.priorityCountryTitle, values);
  const description = fill(copy.priorityCountryDescription, values);
  const file = join(DIST, language, "country", `${countryId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, title, description);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/country/${countryId}#webpage`,
    title,
    description,
  );
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await Promise.all((Object.keys(PAGES) as PageKey[]).map((key) => enhanceFixedPage(language, key)));
    await Promise.all(PRIORITY_COUNTRIES.map((countryId) => enhancePriorityCountry(language, countryId)));
    console.log(`enhanceSearchIntentSeo: completed ${language}.`);
  }
  console.log(`enhanceSearchIntentSeo: enhanced 6 high-intent utility pages and 6 priority country Tax Free titles in ${WEB_SEO_LANGUAGES.length} languages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
