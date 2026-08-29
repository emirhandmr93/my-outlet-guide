export const campaignNotificationLocales = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const;
export type CampaignNotificationLocale = (typeof campaignNotificationLocales)[number];

type Copy = {
  eventTitle: string;
  favoriteOfferTitle: string;
  tripOfferTitle: string;
  globalOfferTitle: string;
};

const copy: Record<CampaignNotificationLocale, Copy> = {
  en: { eventTitle: "New outlet event", favoriteOfferTitle: "New offer at a favorite", tripOfferTitle: "Offer for your trip", globalOfferTitle: "Major outlet offer" },
  tr: { eventTitle: "Yeni outlet etkinliği", favoriteOfferTitle: "Favorinde yeni kampanya", tripOfferTitle: "Seyahatin için kampanya", globalOfferTitle: "Büyük outlet kampanyası" },
  es: { eventTitle: "Nuevo evento de outlet", favoriteOfferTitle: "Nueva oferta en un favorito", tripOfferTitle: "Oferta para tu viaje", globalOfferTitle: "Gran oferta de outlet" },
  fr: { eventTitle: "Nouvel événement outlet", favoriteOfferTitle: "Nouvelle offre dans un favori", tripOfferTitle: "Offre pour votre voyage", globalOfferTitle: "Offre outlet majeure" },
  de: { eventTitle: "Neues Outlet-Event", favoriteOfferTitle: "Neues Angebot in einem Favoriten", tripOfferTitle: "Angebot für Ihre Reise", globalOfferTitle: "Große Outlet-Aktion" },
  ar: { eventTitle: "فعالية أوتلت جديدة", favoriteOfferTitle: "عرض جديد في أحد المفضلة", tripOfferTitle: "عرض لرحلتك", globalOfferTitle: "عرض أوتلت مهم" },
  ru: { eventTitle: "Новое событие в аутлете", favoriteOfferTitle: "Новая акция в избранном", tripOfferTitle: "Акция для вашей поездки", globalOfferTitle: "Крупная акция аутлета" },
  zh: { eventTitle: "新的奥莱活动", favoriteOfferTitle: "收藏奥莱有新优惠", tripOfferTitle: "适合行程的优惠", globalOfferTitle: "大型奥莱优惠" },
};

function clean(value: unknown, fallback: string, maxLength: number): string {
  return typeof value === "string" && value.trim() ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : fallback;
}

export function normalizeCampaignNotificationLocale(value: unknown): CampaignNotificationLocale {
  return typeof value === "string" && campaignNotificationLocales.includes(value as CampaignNotificationLocale)
    ? value as CampaignNotificationLocale
    : "en";
}

export function buildLocalizedCampaignNotificationContent(
  campaign: Record<string, unknown>,
  target: "favorite" | "trip" | "global",
  locale: CampaignNotificationLocale,
) {
  const localized = campaign.localizedText && typeof campaign.localizedText === "object"
    ? (campaign.localizedText as Record<string, unknown>)[locale]
    : undefined;
  const text = localized && typeof localized === "object" ? localized as Record<string, unknown> : {};
  const outletName = clean(campaign.outletName, "Outlet", 80);
  const headline = clean(text.headline, clean(campaign.headline, outletName, 130), 130);
  const title = campaign.type === "event"
    ? copy[locale].eventTitle
    : target === "favorite"
      ? copy[locale].favoriteOfferTitle
      : target === "trip"
        ? copy[locale].tripOfferTitle
        : copy[locale].globalOfferTitle;
  return { title, body: `${outletName} · ${headline}`.slice(0, 180) };
}
