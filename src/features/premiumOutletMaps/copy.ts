import type { TranslationLanguage } from "../../translations/locale";
import type { PremiumMapPoiKind } from "./types";

export type PremiumMapCopy = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  noResult: string;
  noResultHint: string;
  premium: string;
  simple: string;
  rotate: string;
  reset: string;
  saveOffline: string;
  removeOffline: string;
  offlineReady: string;
  offlineError: string;
  floor: string;
  activeCampaign: string;
  ends: string;
  openingHours: string;
  category: string;
  source: string;
  sourceNote: string;
  lastUpdated: string;
  webNote: string;
  points: string;
  mapUnavailable: string;
  openMap: string;
};

const copy: Record<TranslationLanguage, PremiumMapCopy> = {
  en: { title: "3D Outlet Map", subtitle: "Find brands, floors and visitor services.", searchPlaceholder: "Search a brand in this outlet", noResult: "Brand not found", noResultHint: "No false location is shown. Try another spelling.", premium: "Premium 3D", simple: "Simple view", rotate: "Rotate", reset: "Reset", saveOffline: "Save offline", removeOffline: "Remove download", offlineReady: "Available offline", offlineError: "The offline map could not be updated. Try again.", floor: "Floor", activeCampaign: "Active campaign", ends: "Ends", openingHours: "Opening hours", category: "Category", source: "Official directory source", sourceNote: "Original schematic reference map; not a surveyed or licensed turn-by-turn plan.", lastUpdated: "Last updated", webNote: "Interactive 3D is available in the iOS and Android app.", points: "Visitor services", mapUnavailable: "This outlet does not have a 3D map yet.", openMap: "Open 3D Outlet Map" },
  tr: { title: "3D Outlet Haritası", subtitle: "Markaları, katları ve ziyaretçi hizmetlerini bul.", searchPlaceholder: "Bu outlette marka ara", noResult: "Marka bulunamadı", noResultHint: "Yanlış konum gösterilmez. Farklı bir yazım deneyin.", premium: "Premium 3D", simple: "Sade görünüm", rotate: "Döndür", reset: "Sıfırla", saveOffline: "Çevrimdışı kaydet", removeOffline: "İndirmeyi kaldır", offlineReady: "Çevrimdışı hazır", offlineError: "Çevrimdışı harita güncellenemedi. Tekrar deneyin.", floor: "Kat", activeCampaign: "Aktif kampanya", ends: "Bitiş", openingHours: "Çalışma saati", category: "Kategori", source: "Resmî dizin kaynağı", sourceNote: "Özgün şematik referans haritasıdır; ölçülmüş veya lisanslı adım adım yönlendirme planı değildir.", lastUpdated: "Son güncelleme", webNote: "Etkileşimli 3D görünüm iOS ve Android uygulamasında kullanılabilir.", points: "Ziyaretçi hizmetleri", mapUnavailable: "Bu outlet için henüz 3D harita yok.", openMap: "3D Outlet Haritasını Aç" },
  es: { title: "Mapa 3D del outlet", subtitle: "Encuentra marcas, plantas y servicios.", searchPlaceholder: "Buscar una marca en este outlet", noResult: "Marca no encontrada", noResultHint: "No se muestra una ubicación falsa. Prueba otra escritura.", premium: "3D premium", simple: "Vista sencilla", rotate: "Girar", reset: "Restablecer", saveOffline: "Guardar sin conexión", removeOffline: "Eliminar descarga", offlineReady: "Disponible sin conexión", offlineError: "No se pudo actualizar el mapa sin conexión. Inténtalo de nuevo.", floor: "Planta", activeCampaign: "Campaña activa", ends: "Finaliza", openingHours: "Horario", category: "Categoría", source: "Fuente oficial del directorio", sourceNote: "Mapa esquemático original; no es un plano topográfico ni una guía paso a paso licenciada.", lastUpdated: "Última actualización", webNote: "La vista 3D interactiva está disponible en iOS y Android.", points: "Servicios para visitantes", mapUnavailable: "Este outlet aún no tiene mapa 3D.", openMap: "Abrir mapa 3D" },
  fr: { title: "Plan 3D de l’outlet", subtitle: "Trouvez les marques, étages et services.", searchPlaceholder: "Rechercher une marque dans cet outlet", noResult: "Marque introuvable", noResultHint: "Aucun faux emplacement n’est affiché. Essayez une autre orthographe.", premium: "3D premium", simple: "Vue simple", rotate: "Tourner", reset: "Réinitialiser", saveOffline: "Enregistrer hors ligne", removeOffline: "Supprimer le téléchargement", offlineReady: "Disponible hors ligne", offlineError: "Impossible de mettre à jour le plan hors ligne. Réessayez.", floor: "Étage", activeCampaign: "Campagne active", ends: "Fin", openingHours: "Horaires", category: "Catégorie", source: "Source officielle de l’annuaire", sourceNote: "Plan schématique original ; ce n’est pas un relevé ni un guidage licencié pas à pas.", lastUpdated: "Dernière mise à jour", webNote: "La vue 3D interactive est disponible sur iOS et Android.", points: "Services visiteurs", mapUnavailable: "Cet outlet n’a pas encore de plan 3D.", openMap: "Ouvrir le plan 3D" },
  de: { title: "3D-Outlet-Karte", subtitle: "Marken, Etagen und Besucherservices finden.", searchPlaceholder: "Marke in diesem Outlet suchen", noResult: "Marke nicht gefunden", noResultHint: "Es wird kein falscher Standort angezeigt. Andere Schreibweise versuchen.", premium: "Premium 3D", simple: "Einfache Ansicht", rotate: "Drehen", reset: "Zurücksetzen", saveOffline: "Offline speichern", removeOffline: "Download entfernen", offlineReady: "Offline verfügbar", offlineError: "Die Offline-Karte konnte nicht aktualisiert werden. Bitte erneut versuchen.", floor: "Etage", activeCampaign: "Aktive Kampagne", ends: "Endet", openingHours: "Öffnungszeiten", category: "Kategorie", source: "Offizielle Verzeichnisquelle", sourceNote: "Eigene schematische Referenzkarte; kein vermessener oder lizenzierter Routenplan.", lastUpdated: "Zuletzt aktualisiert", webNote: "Die interaktive 3D-Ansicht ist in der iOS- und Android-App verfügbar.", points: "Besucherservices", mapUnavailable: "Für dieses Outlet gibt es noch keine 3D-Karte.", openMap: "3D-Karte öffnen" },
  ar: { title: "خريطة الأوتلت ثلاثية الأبعاد", subtitle: "اعثر على العلامات والطوابق وخدمات الزوار.", searchPlaceholder: "ابحث عن علامة داخل الأوتلت", noResult: "لم يتم العثور على العلامة", noResultHint: "لن نعرض موقعاً غير صحيح. جرّب تهجئة أخرى.", premium: "عرض ثلاثي مميز", simple: "عرض مبسط", rotate: "تدوير", reset: "إعادة ضبط", saveOffline: "حفظ دون اتصال", removeOffline: "حذف التنزيل", offlineReady: "متاح دون اتصال", offlineError: "تعذر تحديث الخريطة دون اتصال. حاول مرة أخرى.", floor: "الطابق", activeCampaign: "حملة نشطة", ends: "تنتهي", openingHours: "ساعات العمل", category: "الفئة", source: "مصدر الدليل الرسمي", sourceNote: "خريطة مرجعية تخطيطية أصلية وليست مخططاً ممسوحاً أو مرخصاً للتوجيه خطوة بخطوة.", lastUpdated: "آخر تحديث", webNote: "العرض التفاعلي ثلاثي الأبعاد متاح في تطبيق iOS وAndroid.", points: "خدمات الزوار", mapUnavailable: "لا تتوفر خريطة ثلاثية الأبعاد لهذا الأوتلت بعد.", openMap: "فتح خريطة الأوتلت" },
  ru: { title: "3D-карта аутлета", subtitle: "Найдите бренды, этажи и сервисы.", searchPlaceholder: "Найти бренд в аутлете", noResult: "Бренд не найден", noResultHint: "Ложная точка не показывается. Попробуйте другое написание.", premium: "Премиум 3D", simple: "Простой вид", rotate: "Повернуть", reset: "Сбросить", saveOffline: "Сохранить офлайн", removeOffline: "Удалить загрузку", offlineReady: "Доступно офлайн", offlineError: "Не удалось обновить офлайн-карту. Повторите попытку.", floor: "Этаж", activeCampaign: "Активная акция", ends: "До", openingHours: "Часы работы", category: "Категория", source: "Официальный источник каталога", sourceNote: "Оригинальная схематическая карта, не геодезический и не лицензированный пошаговый план.", lastUpdated: "Обновлено", webNote: "Интерактивный 3D-вид доступен в приложении iOS и Android.", points: "Сервисы для посетителей", mapUnavailable: "Для этого аутлета 3D-карта пока недоступна.", openMap: "Открыть 3D-карту" },
  zh: { title: "3D 奥莱地图", subtitle: "查找品牌、楼层与访客服务。", searchPlaceholder: "搜索此奥莱内的品牌", noResult: "未找到品牌", noResultHint: "不会显示错误位置，请尝试其他拼写。", premium: "高品质 3D", simple: "简洁视图", rotate: "旋转", reset: "重置", saveOffline: "离线保存", removeOffline: "删除下载", offlineReady: "可离线使用", offlineError: "离线地图更新失败，请重试。", floor: "楼层", activeCampaign: "进行中的活动", ends: "结束", openingHours: "营业时间", category: "类别", source: "官方目录来源", sourceNote: "原创示意参考地图，并非实测或授权的逐步导航平面图。", lastUpdated: "最后更新", webNote: "iOS 与 Android 应用提供互动 3D 视图。", points: "访客服务", mapUnavailable: "此奥莱暂未提供 3D 地图。", openMap: "打开 3D 奥莱地图" },
};

export const poiLabels: Record<PremiumMapPoiKind, Record<TranslationLanguage, string>> = {
  parking: { en: "Parking", tr: "Otopark", es: "Aparcamiento", fr: "Parking", de: "Parkplatz", ar: "موقف سيارات", ru: "Парковка", zh: "停车场" },
  entrance: { en: "Entrance", tr: "Giriş", es: "Entrada", fr: "Entrée", de: "Eingang", ar: "مدخل", ru: "Вход", zh: "入口" },
  exit: { en: "Exit", tr: "Çıkış", es: "Salida", fr: "Sortie", de: "Ausgang", ar: "مخرج", ru: "Выход", zh: "出口" },
  wc: { en: "WC", tr: "WC", es: "WC", fr: "WC", de: "WC", ar: "دورات مياه", ru: "Туалет", zh: "洗手间" },
  "accessible-wc": { en: "Accessible WC", tr: "Engelli WC", es: "WC accesible", fr: "WC accessible", de: "Barrierefreies WC", ar: "دورة مياه مهيأة", ru: "Доступный туалет", zh: "无障碍洗手间" },
  "tax-free": { en: "Tax Free", tr: "Tax Free", es: "Tax Free", fr: "Détaxe", de: "Tax Free", ar: "استرداد الضريبة", ru: "Tax Free", zh: "退税" },
  information: { en: "Information", tr: "Danışma", es: "Información", fr: "Information", de: "Information", ar: "استعلامات", ru: "Информация", zh: "服务台" },
  restaurant: { en: "Food & cafés", tr: "Restoran ve kafeler", es: "Restaurantes y cafés", fr: "Restaurants et cafés", de: "Restaurants & Cafés", ar: "مطاعم ومقاهٍ", ru: "Рестораны и кафе", zh: "餐饮" },
  atm: { en: "ATM", tr: "ATM", es: "Cajero", fr: "Distributeur", de: "Geldautomat", ar: "صراف آلي", ru: "Банкомат", zh: "ATM" },
  "prayer-room": { en: "Prayer room", tr: "Mescit", es: "Sala de oración", fr: "Salle de prière", de: "Gebetsraum", ar: "مصلى", ru: "Молитвенная комната", zh: "祈祷室" },
  "baby-care": { en: "Baby care", tr: "Bebek bakım odası", es: "Cuidado del bebé", fr: "Espace bébé", de: "Babyraum", ar: "غرفة العناية بالطفل", ru: "Комната матери и ребёнка", zh: "母婴室" },
  "ev-charging": { en: "EV charging", tr: "Elektrikli araç şarjı", es: "Carga eléctrica", fr: "Recharge électrique", de: "E-Ladestation", ar: "شحن المركبات الكهربائية", ru: "Зарядка электромобилей", zh: "电动车充电" },
  stairs: { en: "Floor access", tr: "Kat geçişi", es: "Acceso a plantas", fr: "Accès aux étages", de: "Etagenzugang", ar: "الوصول للطوابق", ru: "Переход между этажами", zh: "楼层通道" },
};

export function getPremiumMapCopy(language: TranslationLanguage): PremiumMapCopy {
  return copy[language] ?? copy.en;
}
