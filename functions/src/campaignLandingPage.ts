import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";

const ORIGIN = "https://myoutletguide.com";
const LANGUAGES = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const;
type Language = typeof LANGUAGES[number];
const CAMPAIGN_ID = /^[a-z0-9][a-z0-9-]{7,179}$/;
const copy: Record<Language, { official: string; plan: string; unavailable: string }> = {
  en: { official: "Open official source", plan: "Plan your outlet trip", unavailable: "This campaign is no longer available." },
  tr: { official: "Resmî kaynağı aç", plan: "Outlet seyahatini planla", unavailable: "Bu kampanya artık kullanılamıyor." },
  es: { official: "Abrir fuente oficial", plan: "Planifica tu viaje de outlet", unavailable: "Esta campaña ya no está disponible." },
  fr: { official: "Ouvrir la source officielle", plan: "Planifier votre voyage outlet", unavailable: "Cette campagne n’est plus disponible." },
  de: { official: "Offizielle Quelle öffnen", plan: "Outlet-Reise planen", unavailable: "Diese Aktion ist nicht mehr verfügbar." },
  ar: { official: "فتح المصدر الرسمي", plan: "خطط لرحلة الأوتلت", unavailable: "هذه الحملة لم تعد متاحة." },
  ru: { official: "Открыть официальный источник", plan: "Спланировать поездку", unavailable: "Эта акция больше недоступна." },
  zh: { official: "打开官方来源", plan: "规划奥莱行程", unavailable: "此活动已不可用。" },
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
  const urls = snapshot.docs.flatMap(document => {
    const data = document.data();
    return data.campaignId === document.id && data.endsAt instanceof Timestamp && data.endsAt.toMillis() > Date.now()
      ? LANGUAGES.map(language => `${ORIGIN}/${language}/campaign/${document.id}`) : [];
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
  response.status(200).set("Cache-Control", "public,max-age=300,s-maxage=300").type("application/xml").send(xml);
});
