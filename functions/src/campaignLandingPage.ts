import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

const ORIGIN = "https://myoutletguide.com";
const LANGUAGES = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const;
type Language = typeof LANGUAGES[number];
const CAMPAIGN_ID = /^[a-z0-9][a-z0-9-]{7,179}$/;
const copy: Record<Language, { official: string; plan: string; unavailable: string; weeklyTitle: string; weeklyIntro: string; view: string; empty: string }> = {
  en: { official: "Open official source", plan: "Plan your outlet trip", unavailable: "This campaign is no longer available.", weeklyTitle: "Europe’s outlet campaigns this week", weeklyIntro: "Verified offers and events from official outlet sources, updated automatically.", view: "View campaign", empty: "No currently verified campaigns are available. Please check again soon." },
  tr: { official: "Resmî kaynağı aç", plan: "Outlet seyahatini planla", unavailable: "Bu kampanya artık kullanılamıyor.", weeklyTitle: "Avrupa’da bu haftanın outlet kampanyaları", weeklyIntro: "Resmî outlet kaynaklarından doğrulanan kampanya ve etkinlikler otomatik güncellenir.", view: "Kampanyayı gör", empty: "Şu anda doğrulanmış aktif kampanya bulunmuyor. Lütfen yakında tekrar kontrol et." },
  es: { official: "Abrir fuente oficial", plan: "Planifica tu viaje de outlet", unavailable: "Esta campaña ya no está disponible.", weeklyTitle: "Campañas outlet de Europa esta semana", weeklyIntro: "Ofertas y eventos verificados en fuentes oficiales y actualizados automáticamente.", view: "Ver campaña", empty: "No hay campañas activas verificadas en este momento. Vuelve a comprobarlo pronto." },
  fr: { official: "Ouvrir la source officielle", plan: "Planifier votre voyage outlet", unavailable: "Cette campagne n’est plus disponible.", weeklyTitle: "Les campagnes outlet en Europe cette semaine", weeklyIntro: "Offres et événements vérifiés auprès des sources officielles, mis à jour automatiquement.", view: "Voir la campagne", empty: "Aucune campagne active vérifiée n’est disponible pour le moment. Revenez bientôt." },
  de: { official: "Offizielle Quelle öffnen", plan: "Outlet-Reise planen", unavailable: "Diese Aktion ist nicht mehr verfügbar.", weeklyTitle: "Europas Outlet-Aktionen dieser Woche", weeklyIntro: "Verifizierte Angebote und Events aus offiziellen Outlet-Quellen, automatisch aktualisiert.", view: "Aktion ansehen", empty: "Derzeit sind keine verifizierten aktiven Aktionen verfügbar. Bitte schauen Sie bald wieder vorbei." },
  ar: { official: "فتح المصدر الرسمي", plan: "خطط لرحلة الأوتلت", unavailable: "هذه الحملة لم تعد متاحة.", weeklyTitle: "حملات الأوتلت في أوروبا هذا الأسبوع", weeklyIntro: "عروض وفعاليات موثقة من المصادر الرسمية ويتم تحديثها تلقائياً.", view: "عرض الحملة", empty: "لا توجد حالياً حملات نشطة موثقة. تحقق مرة أخرى قريباً." },
  ru: { official: "Открыть официальный источник", plan: "Спланировать поездку", unavailable: "Эта акция больше недоступна.", weeklyTitle: "Аутлет-акции Европы на этой неделе", weeklyIntro: "Проверенные предложения и события из официальных источников с автоматическим обновлением.", view: "Смотреть акцию", empty: "Сейчас нет проверенных активных акций. Загляните снова в ближайшее время." },
  zh: { official: "打开官方来源", plan: "规划奥莱行程", unavailable: "此活动已不可用。", weeklyTitle: "本周欧洲奥莱活动", weeklyIntro: "来自奥莱官方来源的已验证优惠和活动，自动更新。", view: "查看活动", empty: "当前没有已验证的活动，请稍后再来查看。" },
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function localized(data: Record<string, unknown>, language: Language) {
  const localizedText = object(data.localizedText);
  const selected = object(localizedText[language]);
  const english = object(localizedText.en);
  const field = (key: string) => String(selected[key] || english[key] || data[key] || "").trim();
  return { brandName: field("brandName"), headline: field("headline"), summary: field("summary"),
    conditions: field("conditions"), discountLabel: field("discountLabel") };
}

function unavailable(language: Language) {
  return `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Outlet Guide</title></head><body><main><h1>My Outlet Guide</h1><p>${escapeHtml(copy[language].unavailable)}</p><a href="${ORIGIN}/${language}">My Outlet Guide</a></main></body></html>`;
}

function campaignPath(path: string): { language: Language; campaignId: string } | null {
  const match = path.match(/^\/(?:([a-z]{2})\/)?campaign\/([^/?#]+)\/?$/);
  if (!match) return null;
  const language = LANGUAGES.includes(match[1] as Language) ? match[1] as Language : "en";
  return CAMPAIGN_ID.test(match[2]) ? { language, campaignId: match[2] } : null;
}

function renderCampaign(language: Language, campaignId: string, data: Record<string, unknown>) {
  const text = localized(data, language);
  const canonical = `${ORIGIN}/${language}/campaign/${campaignId}`;
  const sourceUrl = typeof data.sourceUrl === "string" && data.sourceUrl.startsWith("https://") ? data.sourceUrl : ORIGIN;
  const title = `${text.headline} | ${data.outletName || "My Outlet Guide"}`.slice(0, 160);
  const description = text.summary.slice(0, 300);
  const schema = {
    "@context": "https://schema.org", "@type": data.type === "event" ? "Event" : "Offer",
    name: text.headline, description, url: canonical, startDate: data.startsOn, endDate: data.endsOn,
    ...(data.type === "event" ? { location: { "@type": "Place", name: data.outletName } } : {
      seller: { "@type": "Organization", name: text.brandName }, availabilityEnds: data.endsOn,
    }),
  };
  const alternates = LANGUAGES.map(code => `<link rel="alternate" hreflang="${code}" href="${ORIGIN}/${code}/campaign/${campaignId}">`).join("");
  return `<!doctype html><html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}">${alternates}<meta property="og:type" content="website"><meta property="og:site_name" content="My Outlet Guide"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script><style>body{margin:0;background:#f7f8fa;color:#0b1f3a;font-family:system-ui,sans-serif}main{max-width:760px;margin:auto;padding:40px 20px}.card{background:#fff;border:1px solid #dde2ea;border-radius:24px;padding:26px}.badge{color:#856b12;font-weight:800}h1{font-size:clamp(30px,7vw,52px);line-height:1.05}p{font-size:17px;line-height:1.65}.meta{color:#5e6878}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}a{background:#d6ad27;border-radius:14px;color:#0b1f3a;font-weight:800;padding:14px 18px;text-decoration:none}a.secondary{background:#0b1f3a;color:white}</style></head><body><main><article class="card"><div class="badge">${escapeHtml(text.discountLabel)}</div><h1>${escapeHtml(text.headline)}</h1><p class="meta">${escapeHtml(text.brandName)} · ${escapeHtml(data.outletName)} · ${escapeHtml(data.startsOn)} – ${escapeHtml(data.endsOn)}</p><p>${escapeHtml(text.summary)}</p>${text.conditions ? `<p class="meta">${escapeHtml(text.conditions)}</p>` : ""}<div class="actions"><a rel="noopener sponsored" href="${escapeHtml(sourceUrl)}">${escapeHtml(copy[language].official)}</a><a class="secondary" href="myoutletguide://campaign/${campaignId}">${escapeHtml(copy[language].plan)}</a></div></article></main></body></html>`;
}

function languageFromWeeklyPath(path: string): Language {
  const match = path.match(/^\/([a-z]{2})\/campaigns\/weekly\/?$/);
  return LANGUAGES.includes(match?.[1] as Language) ? match?.[1] as Language : "en";
}

function mondayDate(date = new Date()) {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7));
  return value.toISOString().slice(0, 10);
}

function renderWeekly(language: Language, campaigns: Array<{ id: string; data: Record<string, unknown> }>) {
  const canonical = `${ORIGIN}/${language}/campaigns/weekly`;
  const title = copy[language].weeklyTitle;
  const cards = campaigns.map(({ id, data }) => {
    const text = localized(data, language);
    return `<article class="card"><div class="badge">${escapeHtml(text.discountLabel)}</div><h2>${escapeHtml(text.headline)}</h2><p class="meta">${escapeHtml(data.outletName)} · ${escapeHtml(data.endsOn)}</p><p>${escapeHtml(text.summary)}</p><a href="${ORIGIN}/${language}/campaign/${id}">${escapeHtml(copy[language].view)}</a></article>`;
  }).join("") || `<article class="card"><p>${escapeHtml(copy[language].empty)}</p></article>`;
  const schema = {
    "@context": "https://schema.org", "@type": "ItemList", name: title,
    itemListElement: campaigns.map(({ id }, index) => ({ "@type": "ListItem", position: index + 1, url: `${ORIGIN}/${language}/campaign/${id}` })),
  };
  const alternates = LANGUAGES.map(code => `<link rel="alternate" hreflang="${code}" href="${ORIGIN}/${code}/campaigns/weekly">`).join("");
  return `<!doctype html><html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | My Outlet Guide</title><meta name="description" content="${escapeHtml(copy[language].weeklyIntro)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}">${alternates}<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(copy[language].weeklyIntro)}"><meta property="og:url" content="${canonical}"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script><style>body{margin:0;background:#f7f8fa;color:#0b1f3a;font-family:system-ui,sans-serif}main{max-width:980px;margin:auto;padding:40px 20px}.eyebrow{color:#8a6d0b;font-weight:800}h1{font-size:clamp(32px,7vw,58px);line-height:1.04}.intro{font-size:18px;line-height:1.6;color:#5e6878}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin-top:28px}.card{background:#fff;border:1px solid #dde2ea;border-radius:24px;padding:24px}.badge{color:#856b12;font-weight:800}.meta{color:#5e6878}a{display:inline-block;background:#d6ad27;border-radius:13px;color:#0b1f3a;font-weight:800;margin-top:10px;padding:12px 16px;text-decoration:none}</style></head><body><main><div class="eyebrow">MY OUTLET GUIDE · ${mondayDate()}</div><h1>${escapeHtml(title)}</h1><p class="intro">${escapeHtml(copy[language].weeklyIntro)}</p><section class="grid">${cards}</section></main></body></html>`;
}

export const campaignLandingPage = onRequest({ region: "us-central1", memory: "256MiB", timeoutSeconds: 30 }, async (request, response) => {
  const target = campaignPath(request.path);
  if (!target) { response.status(404).set("Cache-Control", "public,max-age=60").send(unavailable("en")); return; }
  const snapshot = await getFirestore().collection("outletCampaigns").doc(target.campaignId).get();
  const data = snapshot.data() ?? {};
  const now = Date.now();
  const verification = object(data.verification);
  const valid = snapshot.exists && data.campaignId === target.campaignId && data.status === "published" && data.active === true &&
    data.autoPublished === true && verification.status === "verified" && data.startsAt instanceof Timestamp &&
    data.endsAt instanceof Timestamp && data.startsAt.toMillis() <= now && data.endsAt.toMillis() > now;
  if (!valid) { response.status(404).set("Cache-Control", "public,max-age=60").send(unavailable(target.language)); return; }
  response.status(200).set("Cache-Control", "public,max-age=300,s-maxage=300,stale-while-revalidate=600")
    .set("Content-Type", "text/html; charset=utf-8").send(renderCampaign(target.language, target.campaignId, data));
});

export const campaignSitemap = onRequest({ region: "us-central1", memory: "256MiB", timeoutSeconds: 30 }, async (_request, response) => {
  const snapshot = await getFirestore().collection("outletCampaigns")
    .where("status", "==", "published").where("active", "==", true)
    .orderBy("featuredPriority", "desc").limit(500).get();
  const urls = LANGUAGES.map(language => `${ORIGIN}/${language}/campaigns/weekly`).concat(snapshot.docs.flatMap(document => {
    const data = document.data();
    return data.campaignId === document.id && data.endsAt instanceof Timestamp && data.endsAt.toMillis() > Date.now()
      ? LANGUAGES.map(language => `${ORIGIN}/${language}/campaign/${document.id}`) : [];
  }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
  response.status(200).set("Cache-Control", "public,max-age=300,s-maxage=300").type("application/xml").send(xml);
});

export const weeklyCampaignDigest = onRequest({ region: "us-central1", memory: "256MiB", timeoutSeconds: 30 }, async (request, response) => {
  const language = languageFromWeeklyPath(request.path);
  const now = Date.now();
  const snapshot = await getFirestore().collection("outletCampaigns")
    .where("status", "==", "published").where("active", "==", true)
    .orderBy("featuredPriority", "desc").limit(24).get();
  const campaigns = snapshot.docs.flatMap(document => {
    const data = document.data();
    const verification = object(data.verification);
    return data.campaignId === document.id && data.autoPublished === true && verification.status === "verified" &&
      data.startsAt instanceof Timestamp && data.endsAt instanceof Timestamp && data.startsAt.toMillis() <= now && data.endsAt.toMillis() > now
      ? [{ id: document.id, data }] : [];
  });
  response.status(200).set("Cache-Control", "public,max-age=300,s-maxage=300,stale-while-revalidate=600")
    .set("Content-Type", "text/html; charset=utf-8").send(renderWeekly(language, campaigns));
});
