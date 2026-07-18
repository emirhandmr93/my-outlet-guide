import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { categories } from "../src/constants/categories";
import { cities } from "../src/constants/cities";
import { countries } from "../src/constants/countries";
import { outlets } from "../src/constants/outlets";

const web = "web";
const countryNames: Record<string, string> = {
  Austria: "Avusturya",
  Belgium: "Belçika",
  Canada: "Kanada",
  China: "Çin",
  Croatia: "Hırvatistan",
  "Czech Republic": "Çekya",
  Denmark: "Danimarka",
  Finland: "Finlandiya",
  France: "Fransa",
  Germany: "Almanya",
  Greece: "Yunanistan",
  Hungary: "Macaristan",
  Ireland: "İrlanda",
  Italy: "İtalya",
  Japan: "Japonya",
  Netherlands: "Hollanda",
  Norway: "Norveç",
  Poland: "Polonya",
  Portugal: "Portekiz",
  Romania: "Romanya",
  Slovakia: "Slovakya",
  Spain: "İspanya",
  Sweden: "İsveç",
  Switzerland: "İsviçre",
  "United Kingdom": "Birleşik Krallık",
  "United States": "Amerika Birleşik Devletleri",
  "United Arab Emirates": "Birleşik Arap Emirlikleri",
  "South Korea": "Güney Kore",
  Thailand: "Tayland",
  Bulgaria: "Bulgaristan",
  Estonia: "Estonya",
  Latvia: "Letonya",
  Lithuania: "Litvanya",
};
const cityNames: Record<string, string> = {
  Florence: "Floransa",
  Milan: "Milano",
  Rome: "Roma",
  Venice: "Venedik",
  Naples: "Napoli",
  Paris: "Paris",
  London: "Londra",
  Munich: "Münih",
  Vienna: "Viyana",
  Cologne: "Köln",
  Prague: "Prag",
  Seville: "Sevilla",
  Lisbon: "Lizbon",
  Warsaw: "Varşova",
  Bucharest: "Bükreş",
  Athens: "Atina",
};
const serviceNames: Record<string, string> = {
  Parking: "Otopark",
  "Car Parking": "Otopark",
  "Guest Services": "Misafir Hizmetleri",
  "Restaurants & Cafes": "Restoranlar ve Kafeler",
  "Shuttle / Transport Info": "Servis / Ulaşım Bilgisi",
  "Transport Info": "Servis / Ulaşım Bilgisi",
  "Private Transfer": "Özel Transfer",
  "Camper Parking Area": "Karavan Park Alanı",
  "Gift Cards": "Hediye Kartları",
  "Gift cards": "Hediye Kartları",
  Accessibility: "Erişilebilirlik",
  "Wi-Fi": "Wi‑Fi",
  WiFi: "Wi‑Fi",
  "Kids Area": "Çocuk Alanı",
  "Public transport": "Toplu taşıma",
  "Electric car charger": "Elektrikli araç şarjı",
  "EV Charging": "Elektrikli araç şarjı",
  ATMs: "ATM",
  "Storage Lockers": "Emanet dolapları",
  "Bicycle Storage": "Bisiklet park alanı",
  Pets: "Evcil hayvanlar",
  Umbrella: "Şemsiye",
  "Tax Free w/ Immediate Refund": "Tax Free bilgisi",
  "Shopping Assistance": "Alışveriş desteği",
  "Virtual Shopping": "Uzaktan alışveriş bilgisi",
  "Pet Friendly": "Evcil hayvan dostu",
};
const trCountry = (name: string) => countryNames[name] || name;
const trCity = (name: string) => cityNames[name] || name;
const trService = (name: string) =>
  serviceNames[name] || (name === "Wi-Fi" ? "Wi‑Fi" : "Hizmet bilgisi");
const outletCount = (count: number) => `${count} outlet`;
const cityOutletCount = (count: number) => `${count} outlet`;
const trStores = (text: string) => {
  const count = text.match(/(\d+)\+?/);
  const amount = count?.[1];
  if (/Check official website/i.test(text))
    return "Güncel mağaza sayısı için resmi siteyi kontrol edin";
  if (/Official current/i.test(text))
    return "Güncel marka listesi resmi sitede bulunabilir";
  if (/boutique/i.test(text))
    return amount ? `${amount}+ butik` : "Butik bilgisi güncelleniyor";
  if (/brand/i.test(text))
    return amount ? `${amount}’den fazla marka` : "Marka bilgisi güncelleniyor";
  if (/store|shop/i.test(text))
    return amount
      ? `${amount}’dan fazla mağaza`
      : "Mağaza bilgisi güncelleniyor";
  return text;
};
const asset = (path: string) =>
  `/ .generated-assets/${path}`.replace("/ .", "/.");
const availableOutletImages = (slug: string) => {
  const folder = `assets/outlet-images/${slug}`;
  return existsSync(folder)
    ? readdirSync(folder)
        .filter((file) => /^(hero|gallery\d+)\.(png|jpe?g|webp)$/i.test(file))
        .sort()
    : [];
};
const esc = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
const write = (route: string, html: string) => {
  const localized = html
    .replace(/Personal Shopping/g, "Kişisel alışveriş")
    .replace(/Generally 10:00/g, "Genellikle 10:00")
    .replace(/Check official website/g, "Resmi web sitesini kontrol edin")
    .replace(/Official current/g, "Güncel resmi");
  mkdirSync(`${web}/${route}`, { recursive: true });
  writeFileSync(`${web}/${route}/index.html`, localized);
};
const nav = `<a href="/">Ana Sayfa</a><a href="/explore/">Keşfet</a><a href="/outlets/">Outletler</a><a href="/tax-free/">Tax Free</a><a href="/trip-planner/">Seyahat Planı</a><a href="/flight-deals/">Uçuş Uyarıları</a>`;
const footer = `<footer><div class="footer-grid"><div class="footer-brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 12h16l-1 13H9L8 12Z"/><path d="M12 12a4 4 0 0 1 8 0"/><path d="m16 15 1.8 3.5 3.8.5-2.8 2.7.7 3.8-3.5-1.8-3.5 1.8.7-3.8-2.8-2.7 3.8-.5L16 15Z"/></svg></span><strong>MY OUTLET GUIDE</strong><p>Outlet keşfi, seyahat planlama ve alışveriş hazırlığı için uygulama odaklı rehber.</p></div><div><p class="footer-label">KEŞFET</p><a href="/">Ana Sayfa</a><a href="/explore/">Keşfet</a><a href="/outlets/">Outletler</a><a href="/tax-free/">Tax Free</a></div><div><p class="footer-label">PLANLA</p><a href="/trip-planner/">Seyahat Planı</a><a href="/flight-deals/">Uçuş Uyarıları</a><a href="/privacy/">Gizlilik</a><a href="/terms/">Şartlar</a></div><div><p class="footer-label">DESTEK</p><a href="/account-deletion/">Hesap Silme</a><a href="/contact/">İletişim</a><a href="mailto:info@myoutletguide.com">info@myoutletguide.com</a><a href="https://instagram.com/myoutletguide">@myoutletguide</a></div></div></footer>`;
function page(
  title: string,
  eyebrow: string,
  h1: string,
  intro: string,
  body: string,
) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | My Outlet Guide</title><meta name="description" content="${esc(intro)}"><link rel="stylesheet" href="/assets/styles.css"></head><body><header><nav><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 12h16l-1 13H9L8 12Z"/><path d="M12 12a4 4 0 0 1 8 0"/><path d="m16 15 1.8 3.5 3.8.5-2.8 2.7.7 3.8-3.5-1.8-3.5 1.8.7-3.8-2.8-2.7 3.8-.5L16 15Z"/></svg></span><span>MY OUTLET GUIDE</span></a><div class="links">${nav}</div><a class="nav-app" href="/app/" aria-label="Uygulama durumu">⇩ <span>Uygulama</span></a></nav><section class="hero"><p class="pill">${eyebrow}</p><h1>${h1}</h1><p>${intro}</p></section></header><main>${body}</main>${footer}</body></html>`;
}
const cta = `<section class="app-cta"><div><p class="eyebrow">MY OUTLET GUIDE UYGULAMASI</p><h2>Planın, rehberin ve favorilerin yanında.</h2><p>Uygulamada favorilerini sakla, seyahatini düzenle ve outlet notlarına eriş.</p></div><a class="button" href="/app/">Uygulama durumunu incele</a></section>`;
const card = (title: string, text: string, href?: string, icon = "✦") =>
  `<article class="card">${href ? `<a class="card-link" href="${href}">` : ""}<span class="card-icon">${icon}</span><h3>${title}</h3><p>${text}</p>${href ? `<span class="card-arrow">İncele <b>→</b></span></a>` : ""}</article>`;
const cards = (items: string[], extra = "") =>
  `<section class="grid cards ${extra}">${items.join("")}</section>`;
const outletCard = (o: any) => {
  const city = cities.find((item) => item.cityId === o.cityId);
  const country = countries.find((item) => item.countryId === o.countryId);
  const slug = o.slug || o.outletId;
  const hero = availableOutletImages(slug).find((file) =>
    file.startsWith("hero"),
  );
  const image = hero
    ? `<img class="card-image" src="${asset(`outlet-images/${slug}/${hero}`)}" alt="${esc(o.name)}">`
    : `<span class="card-icon">⌖</span>`;
  return `<article class="card outlet-card"><a class="card-link" href="/outlets/${slug}/">${image}<div class="card-copy"><span class="premium-label">PREMİUM OUTLET</span><h3>${esc(o.name)}</h3><p>${esc(trCity(city?.cityName || o.cityId))} · ${esc(trCountry(country?.countryName || o.countryId))}</p><p>${esc(trStores(o.storesCountText || "Mağaza bilgisi güncelleniyor"))}</p><span class="card-arrow">İncele <b>→</b></span></div></a></article>`;
};
const heroVisual = `<div class="hero-art" aria-label="My Outlet Guide uygulama kartları"><span class="art-glow"></span><span class="art-route"></span><span class="art-card art-card-one">OUTLET<br><b>ROTAM</b></span><span class="art-card art-card-two">TAX FREE<br><b>NOTLAR</b></span><span class="art-pin">⌖</span></div>`;

write(
  "",
  page(
    "Outlet keşfi ve seyahat planlama",
    "PREMİUM ALIŞVERİŞ VE SEYAHAT ASİSTANI",
    "My Outlet Guide’a hoş geldin",
    "Premium alışveriş ve seyahat asistanın; outlet, rota ve tasarruf notların tek yerde.",
    `<section class="hero-card home-hero"><div><p class="eyebrow">AVRUPA VE ÖTESİ</p><h2>Premium alışveriş ve seyahat asistanı</h2><p>Şehirler, outletler, Tax Free rehberi ve yolculuk hazırlığı; uygulamadaki gibi sade kartlarda.</p><div class="home-search">⌕ <span>Şehir, outlet ve marka ara</span></div><p class="cta"><a class="button" href="/explore/">Outletleri keşfet</a><span class="button muted">App Store incelemesi bekleniyor</span><span class="button muted">Google Play hazırlıkta</span></p></div><img class="home-visual" src="${asset("home/home-hero-premium.png")}" alt="Outlet keşfi"> </section><section class="section-heading"><p class="eyebrow">ÖNE ÇIKANLAR</p><h2>Bugünkü keşfini planla.</h2></section>${cards(outlets.slice(0, 3).map(outletCard), "outlet-grid featured-outlets")}<section class="section-heading"><p class="eyebrow">YOLCULUK ARAÇLARI</p><h2>Uygulama ekranlarındaki gibi, tek bakışta.</h2></section>${cards([card("Tasarruf rehberi", "Tax Free ve maliyet notlarını planına ekle.", "/savings/", "₺"), card("Çevrimdışı rehber", "Temel outlet notlarını yolculukta yanında tut.", "/offline-guide/", "✓"), card("Outlet keşfi", "Ülke, şehir ve outlet kartlarıyla rotana başla.", "/explore/", "⌕"), card("Seyahat planı", "Duraklarını ve hazırlık notlarını uygulamada düzenle.", "/trip-planner/", "◫")], "feature-grid")}<nav class="mobile-tabbar" aria-label="Uygulama bölümleri"><a href="/">⌂<span>Ana Sayfa</span></a><a href="/explore/">⌕<span>Keşfet</span></a><a href="/trip-planner/">◫<span>Plan</span></a><a href="/app/">◎<span>Uygulama</span></a></nav>${cta}`,
  ),
);

write(
  "explore",
  page(
    "Keşfet",
    "KEŞFET",
    "Nereye gitmek istersin?",
    "Ülke, şehir veya outlet adına göre uygulama tarzı bir başlangıç yap.",
    `<section class="explore-panel"><img class="explore-visual" src="${asset("explore/explore-hero-premium.png")}" alt="Keşfet"> <div class="search"><label for="discover">⌕ &nbsp; Ülke, şehir, outlet, marka ara…</label><input id="discover" type="search" readonly><div class="chips"><span>Ülkeler</span><span>Şehirler</span><span>Outletler</span></div><p>Arama ve kişiselleştirilmiş listeler uygulamada kullanılabilir.</p></div></section><section class="section-heading"><p class="eyebrow">POPÜLER ARAMALAR</p><h2>Keşfe buradan başla</h2><div class="chips popular-chips"><span>Paris</span><span>Burberry</span><span>Fransa</span><span>İtalya</span><span>Nike</span></div></section>${cards([card("Outlet ara", "İsme veya markaya göre outlet kartlarına git.", "/outlets/", "⌕"), card("Ülkeye göre keşfet", "Para birimi ve outlet sayısına göre ilerle.", "/countries/", "◎"), card("Şehre göre keşfet", "Şehir rotanı seç ve outletlerini gör.", "/cities/", "⌖")], "feature-grid")}<section class="section-heading"><p class="eyebrow">NASIL KEŞFETMEK İSTERSİN?</p><h2>Ülke ve şehir kartları</h2></section>${cards(outlets.slice(0, 6).map(outletCard), "outlet-grid")}<section class="section-heading"><p class="eyebrow">DESTİNASYONLAR</p><h2>Ülke ve şehir kartları</h2></section>${cards(countries.slice(0, 12).map((country: any) => card(`${country.countryFlag} ${trCountry(country.countryName)}`, `${outletCount(outlets.filter((outlet: any) => outlet.countryId === country.countryId).length)} · ${country.currency}`, `/countries/${country.countryId}/`, "◎")))}${cta}`,
  ),
);

write(
  "countries",
  page(
    "Ülkeler",
    "DESTİNASYONLAR",
    "Ülkelere göre keşfet",
    "Para birimi, Tax Free notları ve ilgili outletlerle rotanı şekillendir.",
    `<section class="section-heading compact"><p class="eyebrow">ÜLKE REHBERİ</p><h2>Keşif kartların hazır</h2></section>${cards(countries.map((country: any) => card(`${country.countryFlag} ${trCountry(country.countryName)}`, `${outletCount(outlets.filter((outlet: any) => outlet.countryId === country.countryId).length)} · ${country.currency} · Tax Free bilgisi`, `/countries/${country.countryId}/`, "◎")))}${cta}`,
  ),
);
for (const country of countries as any[]) {
  const related = outlets.filter(
    (outlet: any) => outlet.countryId === country.countryId,
  );
  const cityList = cities.filter(
    (city: any) => city.countryId === country.countryId,
  );
  write(
    `countries/${country.countryId}`,
    page(
      `${country.countryName} outlet rehberi`,
      "ÜLKE REHBERİ",
      `${country.countryFlag} ${trCountry(country.countryName)}`,
      `${outletCount(related.length)}, ${cityList.length} şehir ve ${country.currency} bilgisi.`,
      `<section class="facts"><div><b>${related.length}</b><span>outlet</span></div><div><b>${cityList.length}</b><span>şehir</span></div><div><b>${country.currency}</b><span>para birimi</span></div></section><section><h2>Şehirler</h2>${cards(cityList.map((city: any) => card(trCity(city.cityName), cityOutletCount(related.filter((outlet: any) => outlet.cityId === city.cityId).length), `/cities/${city.cityId}/`, "⌖")))}</section><section><h2>İlgili outletler</h2>${cards(related.map(outletCard), "outlet-grid")}</section><section class="notice"><h3>Tax Free notu</h3><p>Uygunluk ve iade süreci ülke, mağaza ve sağlayıcı kurallarına göre değişir. Satın alma öncesinde güncel koşulları doğrulayın.</p></section>${cta}`,
    ),
  );
}

write(
  "cities",
  page(
    "Şehirler",
    "ŞEHİRLER",
    "Şehir rotanı seç",
    "Outletlerin bulunduğu şehirleri ve yakın alışveriş duraklarını incele.",
    cards(
      cities.map((city: any) => {
        const country = (countries as any[]).find(
          (item) => item.countryId === city.countryId,
        );
        return card(
          trCity(city.cityName),
          `${trCountry(country?.countryName || city.countryId)} · ${cityOutletCount(outlets.filter((outlet: any) => outlet.cityId === city.cityId).length)}`,
          `/cities/${city.cityId}/`,
          "⌖",
        );
      }),
    ) + cta,
  ),
);
for (const city of cities as any[]) {
  const country = (countries as any[]).find(
    (item) => item.countryId === city.countryId,
  );
  const related = outlets.filter(
    (outlet: any) => outlet.cityId === city.cityId,
  );
  write(
    `cities/${city.cityId}`,
    page(
      `${trCity(city.cityName)} outlet rehberi`,
      "ŞEHİR REHBERİ",
      trCity(city.cityName),
      `${trCountry(country?.countryName || city.countryId)} · ${cityOutletCount(related.length)}.`,
      `<section class="facts"><div><b>${related.length}</b><span>outlet</span></div><div><b>${esc(trCountry(country?.countryName || city.countryId))}</b><span>ülke</span></div></section><section><h2>Outletler</h2>${related.length ? cards(related.map(outletCard), "outlet-grid") : '<div class="notice"><p>Bu şehir için uygulamadaki outlet rehberi güncellendikçe burada listelenir.</p></div>'}</section><section class="notice"><h3>Ulaşım notu</h3><p>Havaalanı ve şehir merkezi mesafeleri outlet detayında mevcut olduğunda gösterilir. Yolculuk öncesi güncel ulaşım bilgisini kontrol edin.</p></section>${cta}`,
    ),
  );
}

write(
  "outlets",
  page(
    "Outletler",
    "OUTLET REHBERİ",
    "Outletleri keşfet",
    "Yer, çalışma saatleri, hizmetler ve seyahat notlarını aynı kart ritminde incele.",
    `<section class="search list-search"><label>⌕ &nbsp; Ülke, şehir, outlet, marka ara…</label><p>Uygulamada arayarak kendi listenizi oluşturabilirsiniz.</p></section><section><h2>Tüm outletler</h2>${cards(outlets.map(outletCard), "outlet-grid")}</section>${cta}`,
  ),
);
for (const outlet of outlets as any[]) {
  const city = (cities as any[]).find((item) => item.cityId === outlet.cityId);
  const country = (countries as any[]).find(
    (item) => item.countryId === outlet.countryId,
  );
  const slug = outlet.slug || outlet.outletId;
  const images = availableOutletImages(slug);
  const hero = images.find((file) => file.startsWith("hero"));
  const visual = hero
    ? `<div class="gallery"><img src="${asset(`outlet-images/${slug}/${hero}`)}" alt="${esc(outlet.name)}"><div class="gallery-strip">${images
        .filter((file) => file !== hero)
        .map(
          (file) =>
            `<img src="${asset(`outlet-images/${slug}/${file}`)}" alt="${esc(outlet.name)} galeri görseli">`,
        )
        .join("")}</div></div>`
    : `<div class="image-fallback"><span>⌖</span><b>OUTLET REHBERİ</b></div>`;
  write(
    `outlets/${slug}`,
    page(
      `${outlet.name} outlet rehberi`,
      "PREMİUM OUTLET REHBERİ",
      esc(outlet.name),
      `${trCity(city?.cityName || outlet.cityId)}, ${trCountry(country?.countryName || outlet.countryId)}`,
      `<section class="detail-hero">${visual}<div><p class="eyebrow">${esc(trCountry(country?.countryName || outlet.countryId))} · ${esc(trCity(city?.cityName || outlet.cityId))}</p><h2>${esc(trStores(outlet.storesCountText || "Outlet bilgileri"))}</h2><p>${esc(outlet.address || "Adres bilgisi uygulamadaki rehberde yer alır.")}</p><div class="action-row"><span>♡ Favori</span><span>◫ Seyahat Oluştur</span><span>⌖ Yol Tarifi</span></div></div></section><div class="detail-tabs"><span>Özet</span><span>Markalar</span><span>Ulaşım</span><span>Yemek</span><span>Yorumlar</span></div><section class="facts"><div><b>${esc(outlet.openingHours || "Kontrol edin")}</b><span>çalışma saatleri</span></div><div><b>${outlet.taxFreeAvailable ? "Var" : "Mağazaya göre"}</b><span>Tax Free</span></div><div><b>${outlet.cityCenterDistanceKm ?? "—"} km</b><span>şehir merkezi</span></div>${outlet.airports?.length ? `<div><b>${esc(outlet.airports[0].code)}</b><span>en yakın havalimanı</span></div>` : ""}</section><section><h2>Hizmetler</h2><div class="chips service-chips">${
        (outlet.services || [])
          .slice(0, 12)
          .map((service: string) => `<span>✓ ${esc(trService(service))}</span>`)
          .join("") || "<span>Hizmet bilgisi güncellendikçe eklenir.</span>"
      }</div></section>${outlet.restaurants?.length ? `<section><h2>Restoranlar ve kafeler</h2>${cards(outlet.restaurants.slice(0, 8).map((restaurant: string) => card(esc(restaurant), "Outlet içindeki mekan bilgisi.", undefined, "☕")))}</section>` : ""}<section class="notice"><h3>Ulaşım ve ziyaret notu</h3><p>${outlet.airports?.length ? esc(outlet.airports.map((airport: any) => `${airport.code} · ${airport.distanceKm} km`).join(" · ")) : "Havaalanı ve ulaşım bilgisi uygulamada mevcut olduğunda gösterilir."}</p>${outlet.websiteUrl ? `<p><a class="button secondary" href="${esc(outlet.websiteUrl)}">Resmî web sitesi</a>${outlet.googleMapsUrl ? ` <a class="button secondary" href="${esc(outlet.googleMapsUrl)}">Haritada aç</a>` : ""}</p>` : ""}</section>${cta}`,
    ),
  );
}

write(
  "brands",
  page(
    "Markalar ve kategoriler",
    "MARKA KEŞFİ",
    "Alışveriş tarzını seç",
    "Kategori bazında aramaya uygulamada devam et.",
    `<section class="category-grid">${(categories as any[])
      .filter((item) =>
        [
          "luxury",
          "fashion",
          "sportswear",
          "shoes-bags",
          "beauty",
          "jewelry-watches",
          "eyewear",
        ].includes(item.categoryId),
      )
      .map((item) =>
        card(
          `${item.icon} ${item.categoryName}`,
          "Bu kategorideki markaları ve outletleri uygulamada keşfet.",
          "/app/",
          item.icon,
        ),
      )
      .join("")}</section>${cta}`,
  ),
);
const prose: Record<string, [string, string, string, string]> = {
  "tax-free": [
    "Tax Free rehberi",
    "TAX FREE",
    "Tax Free nedir?",
    `<section class="tool-hero"><div><p class="eyebrow">BİLGİYLE PLANLA</p><h2>İade sürecini adım adım anla.</h2><p>Uygunluk; ikamet, ülke, mağaza katılımı, harcama tutarı, form ve gümrük doğrulamasına bağlıdır.</p></div><span>₺</span></section><section class="how-it-works"><h2>Nasıl çalışır?</h2><div><span>1</span><b>Ülkeyi seç</b></div><div><span>2</span><b>Ürün fiyatını gir</b></div><div><span>3</span><b>Tahmini iadeyi gör</b></div><div><span>4</span><b>Resmi sağlayıcıyla doğrula</b></div></section><section class="result-preview"><p class="eyebrow">ÖRNEK ÖNİZLEME</p><div><span>Ürün fiyatı</span><b>€250</b></div><div><span>Tahmini Tax Free iadesi</span><b>€30</b></div><div><span>İade sonrası tahmini maliyet</span><b>€220</b></div></section><section class="notice disclaimer"><h3>Önemli açıklama</h3><p>Tahminler bilgilendirme amaçlıdır; nihai iade mağaza, sağlayıcı, ülke kuralları, işlem ücretleri ve uygunluğa göre değişebilir.</p></section>`,
  ],
  savings: [
    "Tasarruf araçları",
    "TASARRUF",
    "Bütçeni şeffaf biçimde değerlendir",
    `<section class="tool-hero"><div><p class="eyebrow">AKILLI ALIŞVERİŞ</p><h2>Hesaplarını yanında taşı.</h2><p>Karşılaştırmalar kişisel planlama içindir; tasarruf garanti edilmez.</p></div><span>₺</span></section><section class="shopping-settings"><p class="eyebrow">ALIŞVERİŞ AYARLARI</p><div><b>Ülke</b><span>İtalya</span><i>›</i></div><div><b>Para birimi</b><span>EUR</span><i>›</i></div><div><b>Ürün fiyatı</b><span>€250</span><i>›</i></div></section>${cards([card("Akıllı Alışveriş Hesaplayıcısı", "Liste fiyatı, indirim ve olası maliyetleri kendi girdilerinle değerlendir.", "/app/", "⌘"), card("Tax Free Hesaplayıcı", "Uygunluk koşullarını dikkate alarak tahminleri incele.", "/tax-free/", "₺"), card("Fiyat Avantajı", "Fiyatları planlama bağlamında karşılaştır.", "/app/", "↗"), card("Canlı kur referansı", "Güncel kur bilgisi uygulamada doğrulanır.", "/app/", "⇄")], "tool-grid")}<section class="result-preview"><p class="eyebrow">ÖRNEK SONUÇ</p><div><span>Tahmini iade</span><b>€30</b></div><div><span>İade sonrası maliyet</span><b>€220</b></div><div><span>Para biriminde tahmini iade</span><b>₺1.320</b></div></section>`,
  ],
  "trip-planner": [
    "Seyahat planı",
    "SEYAHATLERİM",
    "Alışveriş rotanı uygulamada oluştur",
    `<section class="trip-card"><div class="route-line"><span>P</span><i></i><span>M</span></div><div><p class="eyebrow">ROTA ÖNİZLEMESİ</p><h2>Paris &amp; Milano Alışveriş Rotası</h2><p>Duraklarını, tarihlerini ve hazırlık notlarını uygulamada düzenle.</p></div></section><section class="trip-status"><div><small>DURUM</small><b>Planlanıyor</b></div><div><small>ZİYARET TARİHLERİ</small><b>12–16 Eylül</b></div></section><section class="route-list"><p class="eyebrow">ROTA DURAKLARI</p><div><span>1</span><b>Paris · La Vallée Village</b><i>›</i></div><div><span>2</span><b>Milano · Serravalle Designer Outlet</b><i>›</i></div></section><section class="reminder-plan"><p class="eyebrow">HATIRLATMA PLANI</p><b>Belgeler ve ziyaret notları</b><span>Uygulamada kişisel listene ekle</span></section><section class="notice"><p>Web üzerinden seyahat oluşturma sunulmaz; bu özellik uygulama odaklıdır.</p></section>`,
  ],
  "flight-deals": [
    "Uçuş uyarıları",
    "UÇUŞ UYARILARI",
    "Rotanı şimdiden seç",
    `<section class="tool-hero flight-hero"><div><p class="eyebrow">ROTA TERCİHİ</p><h2>Uyarıların için hazırlık yap.</h2><p>Uçuş fırsatı tercihleri, desteklenen sağlayıcı ve rotalar hazır olduğunda uygulamada kullanılacaktır.</p></div><span>✈</span></section><section class="preference-card"><p class="eyebrow">UYARI TERCİHLERİ</p><div><span>Çıkış havalimanı · İstanbul</span><span>Varış havalimanı · Paris</span><span>İndirim eşiği · %30 altında</span><span>Uyarı aktif · Uygulamada</span></div><div class="chips"><span>%15 altında</span><span>%30 altında</span><span>%45 altında</span></div><p>Uçuş fiyat sağlayıcısı bağlandığında desteklenen rotalar için uyarılar hazırlanacaktır.</p><small>Bu sayfada canlı fiyat, bilet satışı veya rezervasyon sunulmaz.</small></section>`,
  ],
  "offline-guide": [
    "Çevrimdışı rehber",
    "ÇEVRİMDIŞI REHBER",
    "Temel rehber bilgisi yanında",
    `<section class="tool-hero"><div><p class="eyebrow">YOLCULUKTA</p><h2>Temel bilgileri yanında tut.</h2><p>Yüklenen rehber kapsamına göre outlet detayları, ülkeler ve mevcut notlar uygulamada incelenebilir.</p></div><span>↓</span></section><section class="offline-stats"><div><b>${outlets.length}</b><span>Uygulamadaki outletler</span></div><div><b>${countries.length}</b><span>Ülkeler</span></div><div><b>Marka</b><span>Marka kayıtları</span></div><div><b>Yerel</b><span>Yerel görsel dosyaları</span></div></section>${cards([card("Outlet rehberi", "Kaydedilmiş rehber bilgilerinin kapsamını uygulamada gör.", "/app/", "✓"), card("Marka listeleri", "Yolculuk için temel marka bilgilerini yanında bulundur.", "/app/", "✓"), card("Restoran ve ulaşım notları", "Outlet detaylarındaki mevcut notları incele.", "/app/", "✓")], "check-grid")}<section class="notice"><p>Canlı fiyatlar, uçuş sağlayıcı verileri ve dinamik bilgiler çevrimdışı sunulmaz.</p></section>`,
  ],
  app: [
    "Uygulama",
    "UYGULAMA DURUMU",
    "My Outlet Guide uygulaması",
    `<section class="tool-hero"><div><p class="eyebrow">MOBİL DENEYİM</p><h2>Keşfet, planla, yanında taşı.</h2><p>Outlet keşfi, seyahat planlama ve tasarruf araçları uygulama odaklı olarak geliştirilir.</p></div><span>✦</span></section>${cards([card("iOS", "App Store incelemesi bekleniyor. TestFlight test edildi.", undefined, "●"), card("Android", "Google Play hazırlıkta. Doğrulama süreci devam ediyor.", undefined, "●")], "status-grid")}<section class="section-heading compact"><p class="eyebrow">UYGULAMA ÖZELLİKLERİ</p><h2>Yanında taşıyabileceğin araçlar</h2></section>${cards([card("Outlet keşfi", "Outlet kartları ve konum notları.", "/explore/", "⌕"), card("Seyahat planı", "Rota ve ziyaret hatırlatmaları.", "/trip-planner/", "◫"), card("Tasarruf araçları", "Tax Free ve maliyet notları.", "/savings/", "₺"), card("Çevrimdışı rehber", "Temel rehber içeriği.", "/offline-guide/", "✓"), card("Uçuş uyarı tercihleri", "Desteklenen rotalar için hazırlık.", "/flight-deals/", "✈")], "feature-grid")}<section class="notice"><h3>Destek</h3><p>info@myoutletguide.com</p></section>`,
  ],
};
for (const [slug, [title, eyebrow, heading, body]] of Object.entries(prose))
  write(
    slug,
    page(
      title,
      eyebrow,
      heading,
      "Outlet keşfi, seyahat planlama ve tasarruf araçları için uygulama durumu.",
      body + cta,
    ),
  );

// Phase 1 public-web visual parity overrides. These blocks are deliberately static:
// all controls are visual elements, and no client script is emitted.
const visualField = (label: string, value: string) =>
  `<div class="app-list-card visual-field"><span>${label}</span><b>${value}</b><i>⌄</i></div>`;
const appTabs = `<nav class="app-bottom-tabs" aria-label="Uygulama bölümleri"><a href="/"><b>⌂</b>Ana Sayfa</a><a href="/explore/"><b>⌕</b>Keşfet</a><a href="/trip-planner/"><b>◫</b>Seyahat</a><a href="/savings/"><b>₺</b>Tasarruf</a><a href="/app/"><b>◎</b>Profil</a></nav>`;
const shell = (
  title: string,
  label: string,
  heading: string,
  intro: string,
  body: string,
) =>
  page(
    title,
    label,
    heading,
    intro,
    `<div class="app-shell app-page">${body}</div>${appTabs}`,
  );
const feature = (
  label: string,
  title: string,
  copy: string,
  href: string,
  image: string,
) =>
  `<a class="app-feature-card" href="${href}" style="background-image:linear-gradient(0deg,rgba(8,29,56,.88),rgba(8,29,56,.15)),url('${asset(image)}')"><span>${label}</span><strong>${title}</strong><em>${copy}</em><b>Keşfet →</b></a>`;

const homePage = (body: string) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Outlet keşfi | My Outlet Guide</title><meta name="description" content="Premium outletleri keşfet, daha çok tasarruf et ve sonraki alışveriş seyahatini planla."><link rel="stylesheet" href="/assets/styles.css"></head><body class="home-page"><header class="home-header" style="background-image:linear-gradient(90deg,rgba(4,19,39,.96) 0%,rgba(8,29,56,.82) 47%,rgba(8,29,56,.45) 100%),url('${asset("home/home-hero-premium.png")}')"><nav class="home-nav"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 12h16l-1 13H9L8 12Z"/><path d="M12 12a4 4 0 0 1 8 0"/><path d="m16 15 1.8 3.5 3.8.5-2.8 2.7.7 3.8-3.5-1.8-3.5 1.8.7-3.8-2.8-2.7 3.8-.5L16 15Z"/></svg></span><span>MY OUTLET GUIDE</span></a><div class="links home-links"><a class="is-active" href="/" aria-current="page">Ana Sayfa</a><a href="/explore/">Keşfet</a><a href="/outlets/">Outletler</a><a href="/tax-free/">Tax Free</a><a href="/trip-planner/">Seyahat Planı</a><a href="/flight-deals/">Uçuş Uyarıları</a></div><a class="nav-app" href="/app/" aria-label="Uygulama durumu">⇩ <span>Uygulama</span></a></nav><section class="hero home-main-hero"><p class="pill">PREMIUM ALIŞVERİŞ VE SEYAHAT ASİSTANI</p><h1>My Outlet Guide’a hoş geldin</h1><p>Premium outletleri keşfet, daha çok tasarruf et ve sonraki alışveriş seyahatini planla.</p><div class="home-search app-search-pill">⌕ <span>Şehir, outlet ve marka ara</span></div><div class="home-hero-actions"><a class="home-primary-cta" href="/explore/">Outletleri keşfet <b>→</b></a><span>App Store incelemesi bekleniyor</span><span>Google Play hazırlıkta</span></div></section></header><main class="home-main"><div class="home-content home-wide-container app-page">${body}</div>${appTabs}</main>${footer}</body></html>`;

const homeCities = [
  ["Paris", "Fransa", "Paris.webp", "paris"],
  ["Milano", "İtalya", "Milano.webp", "milan"],
  ["Londra", "Birleşik Krallık", "London.webp", "london"],
  ["Münih", "Almanya", "Munich.webp", "munich"],
] as const;

write(
  "",
  homePage(`<section class="app-section home-feature-section"><h2>Öne çıkanlar</h2><p>Outlet keşfi, seyahat planı, tasarruf ve çevrimdışı erişim için temel araçlar.</p><div class="app-feature-grid">${feature("KEŞFET", "Outletleri keşfet", "Premium markalar ve destinasyonlar.", "/explore/", "explore/explore-hero-premium.png")}${feature("SEYAHAT", "Outlet seyahatini planla", "Rotanı kartlarla düzenle.", "/trip-planner/", "home/home-hero-premium.png")}${feature("TASARRUF", "Tasarruf araçları", "Tax Free ve fiyat notların.", "/savings/", "explore/explore-hero-premium.png")}${feature("REHBER", "Çevrimdışı rehber", "Temel bilgileri yanında tut.", "/offline-guide/", "home/home-hero-premium.png")}</div></section><section class="app-section home-recommended-section"><h2>Önerilen outletler</h2><p>Bir sonraki alışveriş günün için seçilmiş premium duraklar.</p><div class="app-outlet-grid">${outlets.slice(0, 4).map(outletCard).join("")}</div></section><section class="app-section"><h2>Aktiviteniz</h2><p>Kayıtlı alışveriş planlarınıza hızlı erişim.</p><div class="app-card activity-card"><div><i>🧳</i><span>Alışveriş Seyahati</span><b>Henüz seyahat yok</b><small>Hatırlatıcılar için bir seyahat oluşturun.</small></div><div><i>♡</i><span>Favoriler</span><b>Henüz favori outlet yok</b><small>Takip etmek istediğiniz outletleri kaydedin.</small></div></div></section><section class="app-section"><h2>Alışveriş araçları</h2><p>Alışverişten önce tasarrufunu planlayın.</p><div class="app-quick-grid home-tool-grid">${[["Tax Free Hesaplayıcı", "₺", "İadeni tahmin et ve minimum harcamayı kontrol et.", "/tax-free/"], ["Döviz Çevirici", "⇄", "Alışveriş para birimini ayarla.", "/savings/"], ["Uçuş Alarmı", "✈", "Uçuş fiyat izleme durumunu gör.", "/flight-deals/"], ["Çevrimdışı", "↓", "İnternetsiz çalışan rehber özelliklerini gör.", "/offline-guide/"]].map(([title, icon, copy, href]) => `<a class="app-quick-card" href="${href}"><b>${icon}</b><span>${title}</span><small>${copy}</small><i>→</i></a>`).join("")}</div></section><section class="app-section"><h2>Popüler şehirler</h2><p>Şehir rehberleriyle outlet rotanı şekillendir.</p><div class="app-city-list home-city-grid">${homeCities.map(([city, country, image, cityId], index) => { const counts = [2, 2, 3, 1]; return `<a class="app-list-card home-city-card" href="/cities/${cityId}/" style="background-image:linear-gradient(90deg,rgba(8,29,56,.86),rgba(8,29,56,.25)),url('${asset(`city-images/${image}`)}')"><span>${city}<small>${country} · ${cityOutletCount(counts[index])}</small></span><i>→</i></a>`; }).join("")}</div></section><section class="app-cta home-final-cta"><div><p class="eyebrow">MY OUTLET GUIDE UYGULAMASI</p><h2>Planın, rehberin ve favorilerin yanında.</h2><p>Uygulamada favorilerini sakla, seyahatini düzenle ve outlet notlarına eriş.</p></div><a class="button" href="/app/">Uygulama durumunu incele</a></section>`),
);

write(
  "explore",
  shell(
    "Keşfet",
    "KEŞFET",
    "Aklındakini bul",
    "Ülkeleri, şehirleri, outletleri ve markaları tek premium keşif merkezinde ara.",
    `<section class="app-image-hero explore-hero" style="background-image:linear-gradient(0deg,rgba(8,29,56,.88),rgba(8,29,56,.12)),url('${asset("explore/explore-hero-premium.png")}')"><p>KEŞFET</p><h2>Aklındakini bul</h2><span>Ülkeleri, şehirleri, outletleri ve markaları tek premium keşif merkezinde ara.</span></section><div class="app-search-pill">⌕ <span>Ülke, şehir, outlet, marka ara...</span></div><div class="app-chip-row"><span class="app-chip">🌍 Ülkeler</span><span class="app-chip">📍 Şehirler</span><span class="app-chip">🛍️ Outletler</span></div><section class="app-section"><h2>Popüler aramalar</h2><div class="app-chip-row">${["Paris", "Burberry", "Fransa", "İtalya", "Nike"].map((x) => `<span class="app-chip">${x}</span>`).join("")}</div></section><section class="app-section"><h2>Nasıl keşfetmek istersin?</h2><div class="app-quick-grid">${[
      "Outlet ara|⌕|/outlets/",
      "Ülkeye göre keşfet|🌍|/countries/",
      "Şehre göre keşfet|📍|/cities/",
    ]
      .map((x) => {
        const [a, b, c] = x.split("|");
        return `<a class="app-quick-card" href="${c}"><b>${b}</b><span>${a}</span></a>`;
      })
      .join(
        "",
      )}</div></section><section class="app-section"><h2>Popüler şehirler</h2>${[
      "Paris|Fransa|4 outlet",
      "Milano|İtalya|6 outlet",
      "Londra|Birleşik Krallık|5 outlet",
    ]
      .map((x) => {
        const [a, b, c] = x.split("|");
        return `<a class="app-result-card" href="/cities/"><b>⌖</b><span>${a}<small>${b} · ${c}</small></span><i>→</i></a>`;
      })
      .join(
        "",
      )}<a class="app-result-card" href="/outlets/barberino/"><b>OUTLET</b><span>Barberino Designer Outlet<small>Floransa, İtalya</small></span><i>→</i></a><a class="app-result-card" href="/brands/"><b>MARKA</b><span>Saint Laurent<small>Marka</small></span><i>→</i></a></section>`,
  ),
);

for (const outlet of outlets as any[]) {
  const city = (cities as any[]).find((item) => item.cityId === outlet.cityId);
  const country = (countries as any[]).find(
    (item) => item.countryId === outlet.countryId,
  );
  const slug = outlet.slug || outlet.outletId;
  const images = availableOutletImages(slug);
  const hero = images.find((file) => file.startsWith("hero"));
  const gallery = hero
    ? `<img src="${asset(`outlet-images/${slug}/${hero}`)}" alt="${esc(outlet.name)}">`
    : "";
  const route = `<article class="app-route-card"><span>Şehir merkezinden</span><b>Taksi / Uber ile</b><div class="app-chip-row"><em>Taksi / Uber</em><em>Yaklaşık 25–50 dk</em><em>Yaklaşık €35–75</em></div><small>Güncel saat ve ücretleri seyahat öncesi kontrol edin.</small></article>`;
  write(
    `outlets/${slug}`,
    shell(
      `${outlet.name} outlet rehberi`,
      "PREMİUM OUTLET",
      outlet.name,
      `${trCity(city?.cityName || outlet.cityId)}, ${trCountry(country?.countryName || outlet.countryId)}`,
      `<section class="app-detail-hero">${gallery}<div><p>PREMİUM OUTLET</p><h2>${esc(outlet.name)}</h2><span>${esc(trCity(city?.cityName || outlet.cityId))}, ${esc(trCountry(country?.countryName || outlet.countryId))}</span></div></section><div class="app-gallery-strip">${
        images
          .slice(1, 5)
          .map(
            (file) =>
              `<span>${file.startsWith("gallery") ? "Görsel" : "Outlet"}</span>`,
          )
          .join("") ||
        "<span>Galeri</span><span>Outlet</span><span>Rehber</span>"
      }</div><span class="app-status">● Aktif</span><div class="app-action-grid"><span class="app-action-card">♡<b>Favori</b></span><span class="app-action-card">◫<b>Seyahat Oluştur</b></span><span class="app-action-card">⌖<b>Yol Tarifi</b></span></div><div class="app-chip-row">${["Özet", "Markalar", "Ulaşım", "Yemek", "Yorumlar"].map((x, i) => `<span class="app-tab-chip ${i === 0 ? "selected" : ""}">${x}</span>`).join("")}</div><section class="app-card app-info-card"><h2>Hızlı Bilgiler</h2><div class="app-quick-grid">${[
        ["Saatler", esc(outlet.openingHours || "Güncel bilgiyi kontrol edin")],
        [
          "Mağazalar",
          esc(trStores(outlet.storesCountText || "Bilgi güncelleniyor")),
        ],
        [
          "Tax Free",
          outlet.taxFreeAvailable ? "Mevcut olabilir" : "Mağazaya göre",
        ],
        ["Havalimanları", outlet.airports?.[0]?.code || "—"],
        ["Şehir merkezi", `${outlet.cityCenterDistanceKm ?? "—"} km`],
        ["Puan", "0.0"],
      ]
        .map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`)
        .join(
          "",
        )}</div></section><section class="app-warning-card"><p>TAX FREE</p><h2>Tahmini iade bilgisi</h2><span>KDV oranı ve minimum harcama mağaza ile ülke kurallarına göre değişebilir.</span><small>Tahmini iade garanti edilen iade değildir; gerçek iade mağaza, sağlayıcı, işlem ücretleri, ülke kuralları ve uygunluğa göre değişebilir.</small></section><section class="app-card app-brands-card"><h2>Markalar</h2><p>Marka listesi outlet tarafından güncellenebilir.</p><div class="app-search-pill">⌕ <span>Marka ara...</span></div>${["Moda", "Spor giyim", "Ayakkabı & Çanta", "Güzellik", "Aksesuar", "Gözlük", "Kitap & Oyuncak", "Ev & Yaşam"].map((x) => `<div class="app-list-card"><span>${x}<small>Marka bilgisi</small></span><i>→</i></div>`).join("")}</section><section class="app-card"><h2>Ulaşım</h2><p>Bu outlet'e ulaşmanın pratik yolları.</p>${route}${route.replace("Şehir merkezinden", "Havaalanından")}<a class="button" href="#">Ulaşım Rehberini Gör</a></section><section class="app-card"><h2>Haritalar</h2>${["Google Maps’te Aç", "Apple Maps’te Aç", "Yandex Maps’te Aç"].map((x) => `<span class="app-list-card"><span>${x}</span><i>→</i></span>`).join("")}</section><section class="app-card"><h2>Resmi Web Sitesi</h2><p>Güncel çalışma saatleri, etkinlikler, kampanyalar, marka güncellemeleri ve geçici duyurular için her zaman resmi web sitesini kontrol edin.</p>${outlet.websiteUrl ? `<a class="button" href="${esc(outlet.websiteUrl)}">Resmi Web Sitesini Ziyaret Et</a>` : ""}</section><section class="app-card"><h2>Restoranlar & Kafeler</h2>${(
        outlet.restaurants || ["Restoran bilgisi güncelleniyor"]
      )
        .slice(0, 4)
        .map(
          (x: string) =>
            `<div class="app-list-card"><b>☕</b><span>${esc(x)}<small>Yeme içme</small></span></div>`,
        )
        .join(
          "",
        )}</section><section class="app-card"><h2>Hizmetler</h2><div class="app-chip-row">${(
        outlet.services || [
          "Parking",
          "Tax Free",
          "Guest Services",
          "Restaurants & Cafes",
          "Shuttle / Transport Info",
          "Private Transfer",
          "Camper Parking Area",
          "Wi-Fi",
          "Gift Cards",
          "Accessibility",
          "ATMs",
          "Kids Area",
          "Shopping Assistance",
        ]
      )
        .slice(0, 13)
        .map(
          (x: string) =>
            `<span class="app-service-chip">✓ ${esc(trService(x))}</span>`,
        )
        .join(
          "",
        )}</div></section><section class="app-card reviews-card"><h2>Yorumlar</h2><p>Outlet alışveriş deneyimini paylaş</p><span class="button muted">Yorum yaz</span><div class="app-dark-card"><small>Genel puan</small><b>0.0 <em>(0 yorum)</em></b></div><div class="app-quick-grid">${["Ulaşım", "Markalar", "Restoranlar", "Hizmetler"].map((x) => `<div class="app-quick-card"><span>${x}</span><b>—</b></div>`).join("")}</div><div class="app-chip-row"><span class="app-tab-chip selected">En faydalı</span><span class="app-tab-chip">En yeni</span></div><p>Henüz yorum yok.</p></section>`,
    ),
  );
}

write(
  "tax-free",
  shell(
    "Tax Free Hesaplayıcı",
    "TAX FREE",
    "Tax Free Hesaplayıcı",
    "Ülkeye göre tahmini Tax Free iadesini hesapla.",
    `<section class="app-dark-card"><small>TAX FREE</small><h2>Tax Free Hesaplayıcı</h2><p>Ülkeye göre tahmini Tax Free iadesini hesapla.</p></section><section class="app-card app-info-card"><p>ALIŞVERİŞ AYARLARI</p><h2>Ülke ve para birimi tüm tasarruf araçlarında ortaktır.</h2>${visualField("Ülke", "🇫🇷 Fransa")}${visualField("Para birimi", "₺ TRY")}${visualField("Ürün fiyatı (EUR)", "2500")}</section><section class="app-quick-grid">${[
      ["Tahmini Tax Free iadesi", "€416,67"],
      ["İade sonrası tahmini maliyet", "€2.083,33"],
      ["Para biriminde tahmini iade", "₺22.482,08"],
      ["Para biriminde iade sonrası maliyet", "₺112.410,42"],
    ]
      .map(
        ([a, b]) =>
          `<div class="app-quick-card"><small>${a}</small><span>${b}</span></div>`,
      )
      .join(
        "",
      )}</section><section class="app-warning-card"><h2>Gerçek iade mağaza, sağlayıcı ve işlem ücretlerine göre değişebilir.</h2><small>Garanti edilen iade değildir.</small></section><section class="app-card app-info-card"><h2>Kaynak ve tahmin temelli</h2><p>KDV oranı · Minimum harcama</p><p>Standard KDV oranı esas alınır. Tahmini iade garanti edilen iade değildir; gerçek iade mağaza, sağlayıcı, işlem ücretleri, ülke kuralları ve uygunluğa göre değişebilir.</p></section>`,
  ),
);
write(
  "savings",
  shell(
    "Tasarruf Merkezi",
    "TASARRUF MERKEZİ",
    "Daha akıllı planla. Daha çok tasarruf et.",
    "Tasarruf araçlarında ülke, para birimi ve Tax Free tahminlerini birlikte kullan.",
    `<section class="app-dark-card"><small>TASARRUF MERKEZİ</small><h2>Daha akıllı planla. Daha çok tasarruf et.</h2><p>Tasarruf araçlarında ülke, para birimi ve Tax Free tahminlerini birlikte kullan.</p></section><section class="app-card app-info-card"><p>ALIŞVERİŞ AYARLARI</p><h2>Tasarruf araçlarında tek ülke ve para birimi kullan.</h2><span class="button muted">Değiştir</span>${visualField("Ülke", "🇫🇷 Fransa")}${visualField("Para birimi", "🇹🇷 TRY Türk Lirası")}</section><div class="app-chip-row"><span class="app-tab-chip selected">İade / Tax Free tahmini</span><span class="app-tab-chip">Karşılaştır / Outlet avantajı</span><span class="app-tab-chip">Uyarılar / Uçuş düşüşleri</span></div><section class="app-section"><h2>Para araçları</h2><div class="app-quick-grid">${["Akıllı Alışveriş Hesaplayıcısı", "Fiyat Avantajı", "Tax Free Hesaplayıcı"].map((x) => `<a href="/tax-free/" class="app-quick-card"><b>₺</b><span>${x}</span><small>Aracı aç →</small></a>`).join("")}</div></section><section class="app-dark-card"><small>ALIŞVERİŞTEN ÖNCE</small><h2>Raf fiyatını değil, final fiyatı kullan.</h2><p>İndirim, para birimi, Tax Free ve uçuşlar gerçek değeri değiştirebilir. Karar vermeden önce Savings Center’ı kontrol et.</p></section>`,
  ),
);
write(
  "trip-planner",
  shell(
    "Seyahat Planı",
    "ALIŞVERİŞ SEYAHATLERİ",
    "Alışveriş Seyahatleri",
    "Outlet günlerini akıllıca planla.",
    `<section class="app-image-hero" style="background-image:linear-gradient(0deg,rgba(8,29,56,.9),rgba(8,29,56,.1)),url('${asset("home/home-hero-premium.png")}')"><p>ALIŞVERİŞ SEYAHATLERİ</p><h2>Alışveriş Seyahatleri</h2><span>Outlet günlerini akıllıca planla.</span></section><div class="app-quick-grid">${["Seyahatler", "Aktif", "Tarihli"].map((x) => `<div class="app-quick-card"><small>${x}</small><span>1</span></div>`).join("")}</div><span class="button">Seyahat oluştur</span><section class="app-card app-info-card"><span class="app-status">Aktif</span><h2>Paris & Milano Alışveriş Rotası</h2><p>2026-07-15 – 2026-07-25 · La Vallée Village</p><div class="app-quick-grid"><div class="app-quick-card">Paris / Şehir</div><div class="app-quick-card">Fransa / Ülke</div></div></section><section class="app-dark-card"><small>ALIŞVERİŞ SEYAHATİ</small><h2>Paris & Milano Alışveriş Rotası</h2><p>2026-07-15 – 2026-07-25</p></section><section class="app-card app-info-card"><h2>Seyahat rotası</h2><div class="app-list-card"><span>2026-07-15 – 2026-07-20 · Paris · La Vallée Village<small>Fransa</small></span></div><div class="app-list-card"><span>2026-07-20 – 2026-07-25 · Milano · Serravalle Designer Outlet<small>İtalya</small></span></div><h2>Hatırlatma planı</h2><p>Uçuş bilgileri · Statik seyahat önizlemesi</p></section>`,
  ),
);
write(
  "flight-deals",
  shell(
    "Uçuş Fırsatları",
    "UÇUŞ FIRSATLARI",
    "Uçuş Fırsatları",
    "90 günlük ortalamaya göre alışveriş rotaların için uçuş fırsatı uyarıları.",
    `<section class="app-dark-card"><h2>Uçuş Fırsatları</h2><p>90 günlük ortalamaya göre alışveriş rotaların için uçuş fırsatı uyarıları.</p></section><section class="app-card app-info-card"><h2>Fırsat uyarısını kaydet</h2><p>Uçuş fiyat sağlayıcısı bağlandığında seçtiğin rotalar için fırsat uyarıları hazırlanır.</p>${visualField("Çıkış havalimanı seç", "İstanbul (SAW)")}${visualField("Varış havalimanı seç", "Paris (CDG)")}<div class="app-chip-row"><span class="app-chip">%15 altında</span><span class="app-chip">%30 altında</span><span class="app-chip">%45 altında</span></div><div class="app-list-card"><span>Uyarı aktif</span><i>●</i></div><span class="button">Fırsat uyarısını kaydet</span></section><section class="app-card app-info-card"><h2>Kaydedilen uyarılar</h2><p>İstanbul (SAW) → Paris (CDG)</p><span class="app-status">Sağlayıcı bekleniyor</span></section><section class="app-card app-info-card"><h2>Seyahat uçuş hatırlatmaları</h2><p>Paris & Milano Alışveriş Rotası · Dönüş uçuşu<br>2026-07-25 · 12:05 · Hatırlatma hazır</p></section><section class="app-warning-card"><p>Uçuş fiyat sağlayıcısı bağlandığında desteklenen rotalar için uyarılar hazırlanacaktır.</p><small>Bu sayfada canlı fiyat, bilet satışı veya rezervasyon sunulmaz.</small></section>`,
  ),
);

// Follow-up: bring the supporting public routes into the same static app shell.
const supportCard = (title: string, text: string, icon = "✦") =>
  `<article class="app-list-card app-support-card"><b>${icon}</b><span>${title}<small>${text}</small></span><i>→</i></article>`;

write(
  "app",
  shell(
    "Uygulama",
    "MY OUTLET GUIDE",
    "Profil",
    "Gezileriniz, favorileriniz ve tercihleriniz senkronize ediliyor.",
    `<section class="app-image-hero app-profile-hero" style="background-image:linear-gradient(0deg,rgba(8,29,56,.9),rgba(8,29,56,.25)),url('${asset("home/home-hero-premium.png")}')"><div class="profile-avatar">M</div><p>PROFİL</p><h2>Profil</h2><span>Gezileriniz, favorileriniz ve tercihleriniz senkronize ediliyor.</span></section><section class="app-quick-grid">${[
      "Seyahatler|0",
      "Favoriler|0",
      "Durum|Hazır",
    ]
      .map((x) => {
        const [title, value] = x.split("|");
        return `<div class="app-quick-card"><small>${title}</small><span>${value}</span></div>`;
      })
      .join(
        "",
      )}</section><section class="app-card app-info-card"><p>UYGULAMA DURUMU</p><h2>Planın her zaman yanında</h2><p>Uygulama indirme ve mağaza durumu resmi kanallarda duyurulduğunda güncellenir.</p><span class="button muted">Uygulama durumu</span></section><section class="app-section"><h2>Hesap ve tercihler</h2>${[
      "Seyahatlerim|Alışveriş rotaların ve notların",
      "Favorilerim|Kaydettiğin outlet destinasyonları",
      "Yorumlarım|Mevcut outlet yorumların",
      "Bildirimler|Cihaz bildirim durumu ve tercihler",
      "Dil|Türkçe · TR",
      "Para Birimi|TRY · Türk Lirası",
    ]
      .map((x) => {
        const [title, copy] = x.split("|");
        return supportCard(title, copy, "◎");
      })
      .join("")}</section>`,
  ),
);

write(
  "offline-guide",
  shell(
    "Çevrimdışı Rehber",
    "ÇEVRİMDIŞI REHBER",
    "Temel rehber bilgisi yanında",
    "Yolculuk öncesinde rehber kapsamını kontrol et.",
    `<section class="app-image-hero" style="background-image:linear-gradient(0deg,rgba(8,29,56,.9),rgba(8,29,56,.2)),url('${asset("explore/explore-hero-premium.png")}')"><p>ÇEVRİMDIŞI REHBER</p><h2>Temel rehber bilgisi yanında</h2><span>Yolculuk öncesinde rehber kapsamını kontrol et.</span></section><section class="app-quick-grid">${[
      ["Outlet rehberi", String(outlets.length)],
      ["Ülkeler", String(countries.length)],
      ["Yerel görseller", "Hazır"],
      ["Tax Free", "Desteklenen"],
    ]
      .map(
        ([title, value]) =>
          `<div class="app-quick-card"><small>${title}</small><span>${value}</span></div>`,
      )
      .join(
        "",
      )}</section><section class="app-card app-info-card"><p>ÇEVRİMDIŞI KAPSAM</p><h2>Yanında taşıyabileceğin bilgiler</h2>${["Outlet rehberi", "Yerel görseller", "Markalar", "Restoranlar", "Ulaşım notları", "Desteklenen Tax Free rehber bilgileri"].map((x) => supportCard(x, "Rehber kapsamına göre kullanılabilir.", "✓")).join("")}</section><section class="app-warning-card"><p>İNTERNET GEREKTİRİR</p><h2>Hesap tabanlı ve canlı bilgiler çevrimdışı değildir.</h2><small>Yorumlar, favoriler, seyahatler, bildirimler ve canlı kurlar internet gerektirir.</small></section>`,
  ),
);

write(
  "brands",
  shell(
    "Markalar",
    "MARKA REHBERİ",
    "Markanı keşfet",
    "Marka kategorilerini ve outlet rehberlerini tek app görünümünde incele.",
    `<section class="app-dark-card"><small>MARKA REHBERİ</small><h2>Markanı keşfet</h2><p>Marka kategorilerini ve outlet rehberlerini tek app görünümünde incele.</p></section><section class="app-section"><h2>Kategoriler</h2><div class="app-quick-grid">${(
      categories as any[]
    )
      .slice(0, 8)
      .map(
        (category) =>
          `<a class="app-quick-card" href="/outlets/"><b>${esc(category.icon)}</b><span>${esc(category.categoryName)}</span></a>`,
      )
      .join(
        "",
      )}</div></section><section class="app-section"><h2>Öne çıkan markalar</h2>${[
      "Saint Laurent|Marka rehberi",
      "Burberry|Ülkeye göre outletler",
      "Nike|Spor giyim",
      "Gucci|Moda",
    ]
      .map((x) => {
        const [title, copy] = x.split("|");
        return `<a class="app-result-card" href="/outlets/"><b>MARKA</b><span>${title}<small>${copy}</small></span><i>→</i></a>`;
      })
      .join(
        "",
      )}</section><section class="app-card app-info-card"><p>MARKA REHBERİ</p><h2>Ülke seç</h2><p>Bu markayı taşıyan outletleri görmek için ülke seç.</p>${countries
      .slice(0, 5)
      .map((country: any) =>
        supportCard(
          `${country.countryFlag} ${trCountry(country.countryName)}`,
          `${outletCount(outlets.filter((outlet: any) => outlet.countryId === country.countryId).length)}`,
          "⌖",
        ),
      )
      .join("")}</section>`,
  ),
);

write(
  "countries",
  shell(
    "Ülkeler",
    "DESTİNASYONLAR",
    "Ülkelere göre keşfet",
    "Outletleri, para birimlerini ve seyahat notlarını ülke kartlarından incele.",
    `<section class="app-dark-card"><small>DESTİNASYONLAR</small><h2>Ülkelere göre keşfet</h2><p>Outletleri, para birimlerini ve seyahat notlarını ülke kartlarından incele.</p></section><section class="app-section app-discovery-list"><h2>Ülkeler</h2>${countries.map((country: any) => `<a class="app-result-card" href="/countries/${country.countryId}/"><b>${country.countryFlag}</b><span>${trCountry(country.countryName)}<small>${outletCount(outlets.filter((outlet: any) => outlet.countryId === country.countryId).length)} · ${country.currency}</small></span><i>→</i></a>`).join("")}</section>`,
  ),
);

write(
  "cities",
  shell(
    "Şehirler",
    "ŞEHİR REHBERİ",
    "Şehir rotanı seç",
    "Alışveriş yolculuğuna şehir kartlarıyla başla.",
    `<section class="app-image-hero" style="background-image:linear-gradient(0deg,rgba(8,29,56,.9),rgba(8,29,56,.2)),url('${asset("explore/explore-hero-premium.png")}')"><p>ŞEHİR REHBERİ</p><h2>Şehir rotanı seç</h2><span>Alışveriş yolculuğuna şehir kartlarıyla başla.</span></section><section class="app-section app-discovery-list"><h2>Şehirler</h2>${cities
      .map((city: any) => {
        const country = (countries as any[]).find(
          (item) => item.countryId === city.countryId,
        );
        return `<a class="app-result-card" href="/cities/${city.cityId}/"><b>⌖</b><span>${trCity(city.cityName)}<small>${trCountry(country?.countryName || city.countryId)} · ${cityOutletCount(outlets.filter((outlet: any) => outlet.cityId === city.cityId).length)}</small></span><i>→</i></a>`;
      })
      .join("")}</section>`,
  ),
);

const legalPage = (
  route: string,
  title: string,
  subtitle: string,
  cards: string,
  extra = "",
) =>
  write(
    route,
    shell(
      title,
      "MY OUTLET GUIDE",
      title,
      subtitle,
      `<section class="app-dark-card"><small>MY OUTLET GUIDE</small><h2>${title}</h2><p>${subtitle}</p></section><section class="app-section legal-card-stack">${cards}</section>${extra}`,
    ),
  );

legalPage(
  "contact",
  "Bize Ulaşın",
  "Yardıma mı ihtiyacın var veya geri bildirim mi paylaşmak istiyorsun?",
  [
    supportCard("E-posta desteği", "info@myoutletguide.com", "✉"),
    supportCard("Instagram", "@myoutletguide", "◎"),
    supportCard("Web sitesi", "myoutletguide.com", "⌖"),
    supportCard("Özellik öner", "Fikrinizi destek ekibiyle paylaşın.", "✦"),
    supportCard("Sorun bildir", "Karşılaştığınız sorunu bize iletin.", "!"),
  ].join(""),
);
legalPage(
  "privacy",
  "Gizlilik Politikası",
  "My Outlet Guide verilerinizi nasıl işler?",
  [
    supportCard(
      "Topladığımız Bilgiler",
      "Hesap, seyahat, favori ve destek bilgileri.",
      "◎",
    ),
    supportCard(
      "Bilgileri Nasıl Kullanırız",
      "Rehberi, hesabı ve destek deneyimini sunmak için.",
      "✦",
    ),
    supportCard(
      "Yorumlar",
      "Yayınlanan yorumlarda yazar kimliği hesap silme sonrası anonimleştirilir.",
      "★",
    ),
    supportCard(
      "Veri Güvenliği",
      "Bilgiler uygun güvenlik önlemleriyle işlenir.",
      "✓",
    ),
    supportCard("İletişim", "info@myoutletguide.com", "✉"),
  ].join(""),
  `<section class="app-card app-info-card"><p>Firebase, Frankfurter ve Open-Meteo hizmetleri, desteklenen uygulama özellikleri için kullanılabilir. reviews ve account deletion kayıtları gerekli olduğunda işlenir; yazar kimliği anonymized olur.</p></section>`,
);
legalPage(
  "terms",
  "Kullanım Şartları",
  "My Outlet Guide kullanım kuralları.",
  [
    supportCard(
      "Uygulamanın Kullanımı",
      "Rehberi sorumlu ve yasal biçimde kullanın.",
      "✓",
    ),
    supportCard(
      "Bilgi Doğruluğu",
      "Bilgileri ziyaret öncesinde resmi kaynaklardan kontrol edin.",
      "⌖",
    ),
    supportCard(
      "Kullanıcı Yorumları",
      "Uygunsuz veya yanıltıcı içerikler moderate or remove inappropriate or misleading content kapsamında kaldırılabilir.",
      "★",
    ),
    supportCard(
      "Üçüncü Taraf Hizmetler",
      "Third-party links and providers kendi koşullarına tabidir.",
      "↗",
    ),
    supportCard("Hesap", "Hesap ve destek için info@myoutletguide.com.", "◎"),
  ].join(""),
  `<section class="app-warning-card"><p>Tax Free estimates are not guaranteed refunds. source-backed information may be unavailable.</p></section>`,
);
legalPage(
  "account-deletion",
  "Hesabı Sil",
  "Hesap ve ilişkili veriler için silme talebi hakkında bilgi.",
  `<section class="app-image-hero" style="background-image:linear-gradient(0deg,rgba(8,29,56,.9),rgba(8,29,56,.25)),url('${asset("home/home-hero-premium.png")}')"><p>HESAP YÖNETİMİ</p><h2>Hesabı Sil</h2><span>Bu sayfa yalnızca silme sürecini açıklar.</span></section>${supportCard("Neler silinecek?", "Uygulama hesabı, Favoriler, Kaydedilen seyahatler, Uçuş fırsatı uyarı tercihleri, Bildirim ayarları ve push tokenları.", "!")}${supportCard("Yorumlar", "Yorumlarda author identity is anonymized ve yeni hesapla yeniden ilişkilendirilmez.", "★")}<span class="app-destructive-button">Hesabımı Sil</span><section class="app-card app-info-card"><p>Profil → Hesap yönetimi → Hesabı Sil yolunu kullanın veya info@myoutletguide.com ile iletişime geçin. Firebase auth account silme işlemi uygulama içinde doğrulanır. Profile → Account management → Delete Account · Favorites · Saved trips · Flight deal alert preferences · Notification settings and push tokens · author identity is anonymized and not relinked to a new account.</p></section>`,
);
