import type { TranslationLanguage } from "./locale";

type TravelBasketEsimCopy = {
  body: string;
  turkeyNotice: string;
};

const travelBasketEsimCopy: Record<TranslationLanguage, TravelBasketEsimCopy> = {
  en: { body: "Browse mobile data packages for your destination with Yesim.", turkeyNotice: "Access from Turkish networks is blocked. It is accessible with a VPN." },
  tr: { body: "Gideceğin ülkeye uygun mobil internet paketlerini Yesim ile incele.", turkeyNotice: "Türkiye sunucularından erişim kapalıdır. VPN ile erişilebilir." },
  es: { body: "Explora paquetes de datos móviles para tu destino con Yesim.", turkeyNotice: "El acceso desde redes de Turquía está bloqueado. Se puede acceder mediante una VPN." },
  fr: { body: "Parcourez les forfaits de données mobiles pour votre destination avec Yesim.", turkeyNotice: "L’accès depuis les réseaux turcs est bloqué. Le service est accessible avec un VPN." },
  de: { body: "Entdecken Sie mobile Datenpakete für Ihr Reiseziel mit Yesim.", turkeyNotice: "Der Zugriff aus türkischen Netzen ist gesperrt. Der Dienst ist über ein VPN erreichbar." },
  ar: { body: "استعرض باقات بيانات الهاتف لوجهتك عبر Yesim.", turkeyNotice: "الوصول من الشبكات التركية محظور. يمكن الوصول إلى الخدمة باستخدام VPN." },
  ru: { body: "Выберите пакет мобильного интернета для страны назначения с Yesim.", turkeyNotice: "Доступ из турецких сетей заблокирован. Сервис доступен через VPN." },
  zh: { body: "通过 Yesim 查看目的地适用的移动数据套餐。", turkeyNotice: "土耳其网络已屏蔽访问，可通过 VPN 访问该服务。" },
};

export function getTravelBasketEsimCopy(language: TranslationLanguage): TravelBasketEsimCopy {
  return travelBasketEsimCopy[language] ?? travelBasketEsimCopy.en;
}
