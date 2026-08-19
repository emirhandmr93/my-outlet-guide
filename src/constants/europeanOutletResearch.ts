import { brands } from "./brands";
import { outletBrands } from "./outletBrands";
import { outlets } from "./outlets";
import { hasWebSeoTransportation } from "./webSeoTransportation";
import type { TranslationLanguage } from "../translations/locale";

export const EUROPEAN_OUTLET_INDEX_EDITION = "2026";

export const EUROPEAN_RESEARCH_UNPUBLISHED_OUTLET_IDS = [
  "viaport-asia-outlet-shopping",
  "212-outlet",
  "olivium-outlet-center",
  "starcity-outlet",
  "venezia-mega-outlet",
  "optimum-premium-outlet-istanbul",
  "izmir-optimum",
  "deepo-outlet-center",
] as const;
const researchUnpublishedOutletIds = new Set<string>(EUROPEAN_RESEARCH_UNPUBLISHED_OUTLET_IDS);
function isResearchPublicOutlet(outlet: (typeof outlets)[number]) {
  return outlet.status === "active" && typeof outlet.outletId === "string" && !researchUnpublishedOutletIds.has(outlet.outletId);
}

const EUROPEAN_COUNTRY_IDS = [
  "austria",
  "belgium",
  "bulgaria",
  "croatia",
  "czech-republic",
  "denmark",
  "estonia",
  "finland",
  "france",
  "germany",
  "greece",
  "hungary",
  "ireland",
  "italy",
  "latvia",
  "lithuania",
  "netherlands",
  "norway",
  "poland",
  "portugal",
  "romania",
  "slovakia",
  "spain",
  "sweden",
  "switzerland",
  "united-kingdom",
] as const;

export type EuropeanOutletCountryMetric = {
  rank: number;
  countryId: string;
  score: number;
  outletCount: number;
  brandCount: number;
  cityCount: number;
  transportGuideCount: number;
  transportCoveragePct: number;
};

export function getEuropeanOutletCountryMetrics(): EuropeanOutletCountryMetric[] {
  const activeBrandIds = new Set(brands.filter((brand) => brand.brandStatus === "active").map((brand) => brand.brandId));
  const publicOutlets = outlets.filter(isResearchPublicOutlet);
  const publicOutletIds = new Set(publicOutlets.map((outlet) => outlet.outletId));
  const metrics = EUROPEAN_COUNTRY_IDS.map((countryId) => {
    const countryOutlets = publicOutlets.filter((outlet) => outlet.countryId === countryId);
    const countryOutletIds = new Set(countryOutlets.map((outlet) => outlet.outletId));
    const brandIds = new Set(
      outletBrands
        .filter(
          (relation) =>
            relation.relationStatus === "active" &&
            publicOutletIds.has(relation.outletId) &&
            countryOutletIds.has(relation.outletId) &&
            activeBrandIds.has(relation.brandId),
        )
        .map((relation) => relation.brandId),
    );
    const cityIds = new Set(countryOutlets.map((outlet) => outlet.cityId));
    const transportGuideCount = countryOutlets.filter((outlet) => hasWebSeoTransportation(outlet.outletId)).length;
    return {
      countryId,
      outletCount: countryOutlets.length,
      brandCount: brandIds.size,
      cityCount: cityIds.size,
      transportGuideCount,
      transportCoveragePct: countryOutlets.length ? Math.round((transportGuideCount / countryOutlets.length) * 100) : 0,
    };
  }).filter((metric) => metric.outletCount > 0);

  const maxBrands = Math.max(...metrics.map((metric) => metric.brandCount), 1);
  const maxOutlets = Math.max(...metrics.map((metric) => metric.outletCount), 1);
  const scored = metrics.map((metric) => ({
    ...metric,
    score: Math.round(
      100 *
        (0.55 * (metric.brandCount / maxBrands) +
          0.3 * (metric.outletCount / maxOutlets) +
          0.15 * (metric.transportCoveragePct / 100)),
    ),
  }));

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.brandCount - a.brandCount ||
        b.outletCount - a.outletCount ||
        a.countryId.localeCompare(b.countryId),
    )
    .map((metric, index) => ({ ...metric, rank: index + 1 }));
}

type ResearchCopy = {
  indexTitle: string;
  indexSubtitle: string;
  indexIntro: string;
  scoreLabel: string;
  outletsLabel: string;
  brandsLabel: string;
  citiesLabel: string;
  transportLabel: string;
  openCountryLabel: string;
  indexCaveat: string;
  methodologyCta: string;
  taxFreeCta: string;
  methodologyTitle: string;
  methodologySubtitle: string;
  scopeTitle: string;
  scopeText: string;
  sourcesTitle: string;
  sourcesText: string;
  scoreTitle: string;
  scoreText: string;
  freshnessTitle: string;
  freshnessText: string;
  taxTitle: string;
  taxText: string;
  limitationsTitle: string;
  limitationsText: string;
  contactTitle: string;
  contactText: string;
};

export const EUROPEAN_OUTLET_RESEARCH_COPY: Record<TranslationLanguage, ResearchCopy> = {
  en: {
    indexTitle: "European Outlet Shopping Index 2026",
    indexSubtitle: "A data-backed comparison of outlet-shopping coverage across Europe",
    indexIntro: "Compare European outlet destinations using the current My Outlet Guide directory: public outlet coverage, distinct listed brands, shopping cities and transportation-guide coverage.",
    scoreLabel: "Coverage score",
    outletsLabel: "Outlets",
    brandsLabel: "Listed brands",
    citiesLabel: "Cities",
    transportLabel: "Transport coverage",
    openCountryLabel: "Open country guide",
    indexCaveat: "The score measures My Outlet Guide directory coverage only. It is not a rating of prices, discounts, luxury level, service quality or the overall shopping experience.",
    methodologyCta: "Read the methodology",
    taxFreeCta: "Plan Tax Free shopping",
    methodologyTitle: "My Outlet Guide Editorial Methodology",
    methodologySubtitle: "How outlet, brand, transportation and Tax Free information is structured and verified",
    scopeTitle: "Coverage and scope",
    scopeText: "The directory is built from outlet-level records, brand relationships, city and country metadata, transportation guides and Tax Free rules. Public web pages exclude unpublished outlet records.",
    sourcesTitle: "Source hierarchy",
    sourcesText: "Official outlet websites, official brand directories, government and customs sources, transport operators and other primary sources are preferred. When a fact cannot be verified, it is kept conservative or marked as not verified rather than inferred.",
    scoreTitle: "How the European index is calculated",
    scoreText: "The coverage score weights distinct listed brands at 55%, public outlet count at 30% and transportation-guide coverage at 15%. Each component is normalized against the strongest country in the current European directory. The metric measures directory coverage, not shopping quality.",
    freshnessTitle: "Freshness and updates",
    freshnessText: "Outlet tenants, opening hours, transport services and tax rules can change. My Outlet Guide separates stable directory structure from facts that require periodic re-verification and preserves source-backed caveats where needed.",
    taxTitle: "Tax Free information",
    taxText: "Tax Free guidance is country-specific. Eligibility depends on residence, retailer participation, purchase conditions, customs validation and operator fees. Estimates are planning aids and do not replace official customs or tax authority rules.",
    limitationsTitle: "What we do not claim",
    limitationsText: "Brand counts describe active relationships in the My Outlet Guide directory and are not a real-time guarantee that every shop is open on the day of travel. Ratings, discounts and prices are not invented when a reliable source is unavailable.",
    contactTitle: "Corrections and source updates",
    contactText: "If an outlet, brand, transport route or official rule has changed, contact My Outlet Guide with the relevant primary source so the record can be reviewed.",
  },
  tr: {
    indexTitle: "Avrupa Outlet Alışveriş Endeksi 2026",
    indexSubtitle: "Avrupa'daki outlet alışveriş kapsamının veriye dayalı karşılaştırması",
    indexIntro: "Güncel My Outlet Guide veritabanını kullanarak Avrupa outlet destinasyonlarını karşılaştırın: yayındaki outlet sayısı, listelenen farklı markalar, alışveriş şehirleri ve ulaşım rehberi kapsamı.",
    scoreLabel: "Kapsam puanı",
    outletsLabel: "Outlet",
    brandsLabel: "Listelenen marka",
    citiesLabel: "Şehir",
    transportLabel: "Ulaşım kapsamı",
    openCountryLabel: "Ülke rehberini aç",
    indexCaveat: "Puan yalnızca My Outlet Guide veritabanı kapsamını ölçer. Fiyat, indirim, lüks seviyesi, hizmet kalitesi veya genel alışveriş deneyimi puanı değildir.",
    methodologyCta: "Metodolojiyi incele",
    taxFreeCta: "Tax Free alışverişi planla",
    methodologyTitle: "My Outlet Guide Editoryal Metodolojisi",
    methodologySubtitle: "Outlet, marka, ulaşım ve Tax Free bilgilerinin nasıl yapılandırıldığı ve doğrulandığı",
    scopeTitle: "Kapsam",
    scopeText: "Veritabanı outlet kayıtları, marka ilişkileri, şehir ve ülke metadata'ları, ulaşım rehberleri ve Tax Free kurallarından oluşur. Yayınlanmamış outlet kayıtları web sayfalarına dahil edilmez.",
    sourcesTitle: "Kaynak önceliği",
    sourcesText: "Resmi outlet siteleri, resmi marka dizinleri, kamu ve gümrük kaynakları, ulaşım işletmecileri ve diğer birincil kaynaklar önceliklidir. Bir bilgi doğrulanamıyorsa tahmin edilmek yerine ihtiyatlı tutulur veya doğrulanmadı olarak işaretlenir.",
    scoreTitle: "Avrupa endeksi nasıl hesaplanıyor?",
    scoreText: "Kapsam puanında farklı listelenen markalar %55, yayındaki outlet sayısı %30 ve ulaşım rehberi kapsamı %15 ağırlığa sahiptir. Bileşenler güncel Avrupa dizinindeki en güçlü ülkeye göre normalize edilir. Puan alışveriş kalitesini değil, veri kapsamını ölçer.",
    freshnessTitle: "Güncellik",
    freshnessText: "Mağazalar, çalışma saatleri, ulaşım hizmetleri ve vergi kuralları değişebilir. My Outlet Guide kalıcı dizin yapısını düzenli doğrulama gerektiren bilgilerden ayırır ve gerekli yerlerde kaynaklı uyarıları korur.",
    taxTitle: "Tax Free bilgileri",
    taxText: "Tax Free kuralları ülkeye özeldir. Uygunluk; ikamet, mağaza katılımı, alışveriş koşulları, gümrük onayı ve operatör kesintılarına bağlıdır. Hesaplamalar planlama amaçlıdır ve resmi gümrük/vergi kurallarının yerine geçmez.",
    limitationsTitle: "Neleri iddia etmiyoruz?",
    limitationsText: "Marka sayıları My Outlet Guide içindeki aktif ilişkileri gösterir; seyahat gününde her mağazanın açık olduğuna dair anlık garanti değildir. Güvenilir kaynak yoksa puan, indirim ve fiyat uydurulmaz.",
    contactTitle: "Düzeltme ve kaynak güncellemesi",
    contactText: "Bir outlet, marka, ulaşım rotası veya resmi kural değiştiyse ilgili birincil kaynakla My Outlet Guide'a bildirin; kayıt yeniden incelensin.",
  },
  es: {
    indexTitle: "Índice Europeo de Compras Outlet 2026",
    indexSubtitle: "Comparación basada en datos de la cobertura outlet en Europa",
    indexIntro: "Compara destinos outlet europeos con el directorio actual de My Outlet Guide: outlets públicos, marcas distintas listadas, ciudades de compras y cobertura de guías de transporte.",
    scoreLabel: "Puntuación de cobertura",
    outletsLabel: "Outlets",
    brandsLabel: "Marcas listadas",
    citiesLabel: "Ciudades",
    transportLabel: "Cobertura de transporte",
    openCountryLabel: "Abrir guía del país",
    indexCaveat: "La puntuación mide únicamente la cobertura del directorio de My Outlet Guide. No califica precios, descuentos, nivel de lujo, calidad del servicio ni la experiencia general de compra.",
    methodologyCta: "Leer la metodología",
    taxFreeCta: "Planificar compras Tax Free",
    methodologyTitle: "Metodología Editorial de My Outlet Guide",
    methodologySubtitle: "Cómo se estructuran y verifican los datos de outlets, marcas, transporte y Tax Free",
    scopeTitle: "Cobertura y alcance",
    scopeText: "El directorio combina registros de outlets, relaciones de marcas, metadatos de ciudades y países, guías de transporte y reglas Tax Free. Las páginas públicas excluyen outlets no publicados.",
    sourcesTitle: "Jerarquía de fuentes",
    sourcesText: "Se priorizan webs oficiales de outlets, directorios oficiales de marcas, autoridades públicas y aduaneras, operadores de transporte y otras fuentes primarias. Los datos no verificables se mantienen conservadores o se marcan como no verificados.",
    scoreTitle: "Cómo se calcula el índice europeo",
    scoreText: "La puntuación pondera las marcas distintas listadas un 55%, el número de outlets públicos un 30% y la cobertura de guías de transporte un 15%. Cada componente se normaliza frente al país más fuerte del directorio europeo actual. No es una nota de calidad de compra.",
    freshnessTitle: "Actualización de datos",
    freshnessText: "Las tiendas, horarios, transportes y normas fiscales pueden cambiar. My Outlet Guide separa la estructura estable del directorio de los datos que requieren revisión periódica y conserva advertencias respaldadas por fuentes.",
    taxTitle: "Información Tax Free",
    taxText: "Las reglas Tax Free dependen del país. La elegibilidad varía según residencia, participación del comercio, condiciones de compra, validación aduanera y comisiones. Las estimaciones son orientativas y no sustituyen las normas oficiales.",
    limitationsTitle: "Lo que no afirmamos",
    limitationsText: "Los recuentos de marcas representan relaciones activas del directorio y no garantizan en tiempo real que cada tienda esté abierta el día del viaje. No se inventan valoraciones, descuentos ni precios sin una fuente fiable.",
    contactTitle: "Correcciones y nuevas fuentes",
    contactText: "Si cambia un outlet, una marca, una ruta de transporte o una norma oficial, contacta con My Outlet Guide aportando la fuente primaria correspondiente.",
  },
  fr: {
    indexTitle: "Indice Européen du Shopping Outlet 2026",
    indexSubtitle: "Une comparaison fondée sur les données de la couverture outlet en Europe",
    indexIntro: "Comparez les destinations outlet européennes à partir du répertoire actuel de My Outlet Guide : outlets publics, marques distinctes répertoriées, villes shopping et couverture des guides de transport.",
    scoreLabel: "Score de couverture",
    outletsLabel: "Outlets",
    brandsLabel: "Marques répertoriées",
    citiesLabel: "Villes",
    transportLabel: "Couverture transport",
    openCountryLabel: "Ouvrir le guide du pays",
    indexCaveat: "Le score mesure uniquement la couverture du répertoire My Outlet Guide. Il ne note ni les prix, ni les remises, ni le niveau de luxe, ni la qualité de service ou l'expérience globale.",
    methodologyCta: "Lire la méthodologie",
    taxFreeCta: "Planifier le Tax Free",
    methodologyTitle: "Méthodologie Éditoriale de My Outlet Guide",
    methodologySubtitle: "Comment les informations sur les outlets, marques, transports et Tax Free sont structurées et vérifiées",
    scopeTitle: "Couverture et périmètre",
    scopeText: "Le répertoire repose sur des fiches outlet, des relations de marques, des métadonnées ville/pays, des guides de transport et des règles Tax Free. Les fiches non publiées sont exclues des pages web publiques.",
    sourcesTitle: "Hiérarchie des sources",
    sourcesText: "Les sites officiels des outlets, annuaires officiels de marques, administrations et douanes, opérateurs de transport et autres sources primaires sont privilégiés. Une information non vérifiable reste prudente ou est indiquée comme non vérifiée.",
    scoreTitle: "Calcul de l'indice européen",
    scoreText: "Le score pondère les marques distinctes à 55 %, le nombre d'outlets publics à 30 % et la couverture des guides de transport à 15 %. Chaque composante est normalisée par rapport au pays le plus fort du répertoire européen actuel. Ce n'est pas une note de qualité du shopping.",
    freshnessTitle: "Actualisation",
    freshnessText: "Les enseignes, horaires, transports et règles fiscales évoluent. My Outlet Guide distingue la structure stable du répertoire des informations à revérifier périodiquement et conserve les avertissements sourcés nécessaires.",
    taxTitle: "Informations Tax Free",
    taxText: "Le Tax Free dépend du pays. L'éligibilité varie selon la résidence, la participation du commerçant, les conditions d'achat, la validation douanière et les frais opérateur. Les estimations servent à planifier et ne remplacent pas les règles officielles.",
    limitationsTitle: "Ce que nous n'affirmons pas",
    limitationsText: "Les nombres de marques décrivent les relations actives du répertoire et ne garantissent pas en temps réel l'ouverture de chaque boutique le jour du voyage. Les notes, remises et prix ne sont pas inventés sans source fiable.",
    contactTitle: "Corrections et mises à jour",
    contactText: "Si un outlet, une marque, un trajet ou une règle officielle change, contactez My Outlet Guide avec la source primaire correspondante pour révision.",
  },
  de: {
    indexTitle: "Europäischer Outlet-Shopping-Index 2026",
    indexSubtitle: "Datenbasierter Vergleich der Outlet-Abdeckung in Europa",
    indexIntro: "Vergleichen Sie europäische Outlet-Ziele anhand des aktuellen My Outlet Guide-Verzeichnisses: öffentliche Outlets, unterschiedliche gelistete Marken, Shopping-Städte und Abdeckung durch Anreise-Guides.",
    scoreLabel: "Abdeckungswert",
    outletsLabel: "Outlets",
    brandsLabel: "Gelistete Marken",
    citiesLabel: "Städte",
    transportLabel: "Anreise-Abdeckung",
    openCountryLabel: "Länderguide öffnen",
    indexCaveat: "Der Wert misst ausschließlich die Abdeckung im My Outlet Guide-Verzeichnis. Er bewertet weder Preise noch Rabatte, Luxusniveau, Servicequalität oder das gesamte Einkaufserlebnis.",
    methodologyCta: "Methodik lesen",
    taxFreeCta: "Tax-Free-Shopping planen",
    methodologyTitle: "Redaktionelle Methodik von My Outlet Guide",
    methodologySubtitle: "Wie Outlet-, Marken-, Anreise- und Tax-Free-Informationen strukturiert und geprüft werden",
    scopeTitle: "Abdeckung und Umfang",
    scopeText: "Das Verzeichnis verbindet Outlet-Datensätze, Markenbeziehungen, Stadt- und Ländermetadaten, Anreise-Guides und Tax-Free-Regeln. Nicht veröffentlichte Outlets erscheinen nicht auf öffentlichen Webseiten.",
    sourcesTitle: "Quellenhierarchie",
    sourcesText: "Bevorzugt werden offizielle Outlet-Websites, offizielle Markenverzeichnisse, Behörden- und Zollquellen, Verkehrsunternehmen und andere Primärquellen. Nicht verifizierbare Angaben werden vorsichtig formuliert oder als nicht verifiziert markiert.",
    scoreTitle: "Berechnung des Europa-Index",
    scoreText: "Der Abdeckungswert gewichtet unterschiedliche gelistete Marken mit 55 %, öffentliche Outlets mit 30 % und die Abdeckung der Anreise-Guides mit 15 %. Jede Komponente wird gegenüber dem stärksten Land im aktuellen Europa-Verzeichnis normalisiert. Der Wert misst nicht die Shopping-Qualität.",
    freshnessTitle: "Aktualität",
    freshnessText: "Mieter, Öffnungszeiten, Verkehrsangebote und Steuerregeln können sich ändern. My Outlet Guide trennt die stabile Verzeichnisstruktur von Angaben, die regelmäßig neu geprüft werden müssen, und behält notwendige Quellenhinweise bei.",
    taxTitle: "Tax-Free-Informationen",
    taxText: "Tax-Free-Regeln sind länderspezifisch. Die Berechtigung hängt unter anderem von Wohnsitz, Händlerteilnahme, Einkaufsbedingungen, Zollvalidierung und Gebühren ab. Schätzungen dienen der Planung und ersetzen keine offiziellen Regeln.",
    limitationsTitle: "Was wir nicht behaupten",
    limitationsText: "Markenzahlen zeigen aktive Beziehungen im Verzeichnis und garantieren nicht in Echtzeit, dass jedes Geschäft am Reisetag geöffnet ist. Bewertungen, Rabatte und Preise werden ohne verlässliche Quelle nicht erfunden.",
    contactTitle: "Korrekturen und Quellenupdates",
    contactText: "Wenn sich ein Outlet, eine Marke, eine Anreise oder eine offizielle Regel ändert, senden Sie My Outlet Guide die entsprechende Primärquelle zur Prüfung.",
  },
  ar: {
    indexTitle: "مؤشر التسوق في الأوت لت الأوروبي 2026",
    indexSubtitle: "مقارنة مبنية على البيانات لتغطية الأوت لت في أوروبا",
    indexIntro: "قارن وجهات الأوت لت الأوروبية باستخدام دليل My Outlet Guide الحالي: عدد الأوت لت المنشورة، والعلامات المختلفة المدرجة، ومدن التسوق، وتغطية أدلة النقل.",
    scoreLabel: "درجة التغطية",
    outletsLabel: "أوت لت",
    brandsLabel: "علامات مدرجة",
    citiesLabel: "مدن",
    transportLabel: "تغطية النقل",
    openCountryLabel: "فتح دليل الدولة",
    indexCaveat: "تقيس الدرجة تغطية دليل My Outlet Guide فقط، ولا تقيّم الأسعار أو الخصومات أو مستوى الفخامة أو جودة الخدمة أو تجربة التسوق العامة.",
    methodologyCta: "قراءة المنهجية",
    taxFreeCta: "تخطيط التسوق Tax Free",
    methodologyTitle: "المنهجية التحريرية لـ My Outlet Guide",
    methodologySubtitle: "كيفية تنظيم والتحقق من معلومات الأوت لت والعلامات والنقل وTax Free",
    scopeTitle: "النطاق والتغطية",
    scopeText: "يعتمد الدليل على سجلات الأوت لت وعلاقات العلامات وبيانات المدن والدول وأدلة النقل وقواعد Tax Free. سجلات الأوت لت غير المنشورة لا تظهر في صفحات الويب العامة.",
    sourcesTitle: "أولوية المصادر",
    sourcesText: "تُفضّل المواقع الرسمية للأوت لت وأدلة العلامات الرسمية ومصادر الحكومات والجمارك ومشغلو النقل وغيرها من المصادر الأولية. وعند تعذر التحقق من معلومة، تُعرض بحذر أو تُوسم بأنها غير موثقة بدلاً من افتراضها.",
    scoreTitle: "طريقة حساب المؤشر الأوروبي",
    scoreText: "تعتمد الدرجة بنسبة 55٪ على عدد العلامات المختلفة المدرجة، و30٪ على عدد الأوت لت العامة، و15٪ على تغطية أدلة النقل. تتم معايرة كل عنصر مقابل أقوى دولة في الدليل الأوروبي الحالي. المؤشر يقيس تغطية البيانات وليس جودة التسوق.",
    freshnessTitle: "حداثة المعلومات",
    freshnessText: "قد تتغير المتاجر وساعات العمل وخدمات النقل والقواعد الضريبية. يفصل My Outlet Guide بين بنية الدليل المستقرة والمعلومات التي تحتاج إلى إعادة تحقق دورية، مع الحفاظ على التنبيهات المدعومة بالمصادر.",
    taxTitle: "معلومات Tax Free",
    taxText: "قواعد Tax Free تختلف حسب الدولة. تعتمد الأهلية على الإقامة ومشاركة المتجر وشروط الشراء وتصديق الجمارك ورسوم المشغل. التقديرات لأغراض التخطيط ولا تحل محل القواعد الرسمية.",
    limitationsTitle: "ما لا ندعيه",
    limitationsText: "أعداد العلامات تعكس العلاقات النشطة في دليل My Outlet Guide ولا تضمن لحظياً أن كل متجر مفتوح يوم السفر. لا يتم اختلاق التقييمات أو الخصومات أو الأسعار عند غياب مصدر موثوق.",
    contactTitle: "التصحيحات وتحديث المصادر",
    contactText: "إذا تغير أوت لت أو علامة أو مسار نقل أو قاعدة رسمية، تواصل مع My Outlet Guide وأرفق المصدر الأولي المناسب لمراجعة السجل.",
  },
  ru: {
    indexTitle: "Европейский индекс аутлет-шопинга 2026",
    indexSubtitle: "Сравнение покрытия аутлетов в Европе на основе данных",
    indexIntro: "Сравнивайте европейские направления по текущему каталогу My Outlet Guide: опубликованные аутлеты, уникальные бренды, торговые города и покрытие транспортными гидами.",
    scoreLabel: "Оценка покрытия",
    outletsLabel: "Аутлеты",
    brandsLabel: "Бренды",
    citiesLabel: "Города",
    transportLabel: "Транспортное покрытие",
    openCountryLabel: "Открыть гид по стране",
    indexCaveat: "Оценка отражает только покрытие каталога My Outlet Guide. Это не рейтинг цен, скидок, уровня люкса, качества сервиса или общего впечатления от шопинга.",
    methodologyCta: "Читать методологию",
    taxFreeCta: "Спланировать Tax Free",
    methodologyTitle: "Редакционная методология My Outlet Guide",
    methodologySubtitle: "Как структурируются и проверяются данные об аутлетах, брендах, транспорте и Tax Free",
    scopeTitle: "Охват и границы",
    scopeText: "Каталог объединяет записи об аутлетах, связи с брендами, метаданные городов и стран, транспортные гиды и правила Tax Free. Неопубликованные аутлеты исключены из публичных веб-страниц.",
    sourcesTitle: "Иерархия источников",
    sourcesText: "Приоритет имеют официальные сайты аутлетов, официальные каталоги брендов, государственные и таможенные источники, транспортные операторы и другие первичные источники. Непроверяемые факты формулируются осторожно или отмечаются как непроверенные.",
    scoreTitle: "Как рассчитывается европейский индекс",
    scoreText: "Вес уникальных брендов составляет 55%, количества публичных аутлетов — 30%, покрытия транспортными гидами — 15%. Компоненты нормализуются относительно самой сильной страны в текущем европейском каталоге. Это метрика покрытия данных, а не качества шопинга.",
    freshnessTitle: "Актуальность",
    freshnessText: "Состав магазинов, часы работы, транспорт и налоговые правила могут меняться. My Outlet Guide отделяет стабильную структуру каталога от данных, требующих регулярной перепроверки, и сохраняет необходимые оговорки со ссылками на источники.",
    taxTitle: "Информация Tax Free",
    taxText: "Правила Tax Free зависят от страны. Право на возврат определяется резидентством, участием магазина, условиями покупки, таможенным подтверждением и комиссиями. Расчёты служат для планирования и не заменяют официальные правила.",
    limitationsTitle: "Чего мы не утверждаем",
    limitationsText: "Количество брендов отражает активные связи в каталоге и не гарантирует в реальном времени, что каждый магазин открыт в день поездки. Рейтинги, скидки и цены не выдумываются без надёжного источника.",
    contactTitle: "Исправления и обновления источников",
    contactText: "Если изменился аутлет, бренд, маршрут или официальное правило, сообщите My Outlet Guide и приложите соответствующий первичный источник для проверки.",
  },
  zh: {
    indexTitle: "2026 欧洲奥特莱斯购物指数",
    indexSubtitle: "基于数据的欧洲奥特莱斯覆盖度比较",
    indexIntro: "使用 My Outlet Guide 当前目录比较欧洲奥特莱斯目的地：公开奥特莱斯数量、不同品牌数量、购物城市以及交通指南覆盖度。",
    scoreLabel: "覆盖度评分",
    outletsLabel: "奥特莱斯",
    brandsLabel: "已列品牌",
    citiesLabel: "城市",
    transportLabel: "交通覆盖",
    openCountryLabel: "查看国家指南",
    indexCaveat: "该评分只衡量 My Outlet Guide 目录覆盖度，并非对价格、折扣、奢侈程度、服务质量或整体购物体验的评价。",
    methodologyCta: "查看方法说明",
    taxFreeCta: "规划 Tax Free 购物",
    methodologyTitle: "My Outlet Guide 编辑方法",
    methodologySubtitle: "奥特莱斯、品牌、交通和 Tax Free 信息的结构与验证方式",
    scopeTitle: "覆盖范围",
    scopeText: "目录由奥特莱斯记录、品牌关系、城市和国家元数据、交通指南以及 Tax Free 规则组成。未发布的奥特莱斯记录不会出现在公开网页中。",
    sourcesTitle: "来源优先级",
    sourcesText: "优先使用奥特莱斯官网、品牌官方目录、政府及海关来源、交通运营商和其他第一方来源。无法核实的信息会保守处理或标记为未验证，而不是进行推断。",
    scoreTitle: "欧洲指数如何计算",
    scoreText: "覆盖度评分中，不同品牌数量占 55%，公开奥特莱斯数量占 30%，交通指南覆盖度占 15%。各项以当前欧洲目录中表现最强的国家为基准进行标准化。该指标衡量数据覆盖度，而非购物质量。",
    freshnessTitle: "信息更新",
    freshnessText: "门店、营业时间、交通服务和税务规则都可能变化。My Outlet Guide 将稳定的目录结构与需要定期重新核实的信息分开，并在必要时保留有来源依据的提示。",
    taxTitle: "Tax Free 信息",
    taxText: "Tax Free 规则因国家而异。资格取决于居住地、商家参与情况、购物条件、海关验证及服务商费用。估算仅用于规划，不能替代官方海关或税务规则。",
    limitationsTitle: "我们不做的承诺",
    limitationsText: "品牌数量表示 My Outlet Guide 目录中的有效关系，并不实时保证旅行当天每家门店都营业。在缺少可靠来源时，不会编造评分、折扣或价格。",
    contactTitle: "纠错与来源更新",
    contactText: "如果奥特莱斯、品牌、交通路线或官方规则发生变化，请向 My Outlet Guide 提供相关第一方来源，以便重新审核。",
  },
};
