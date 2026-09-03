import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CAMPAIGN_TRANSLATION_VERSION,
  buildCampaignLocalization,
  type CampaignTranslationProvider,
} from "../functions/src/outletCampaignLocalization";
import { sanitizeOfficialCampaignPresentationText } from "../functions/src/outletCampaignDisplayIntegrity";
import type { ParsedOfficialCampaign } from "../functions/src/outletCampaignParser";
import { officialCampaignSources } from "../functions/src/outletCampaignSources";
import { officialCampaignHostsByOutlet } from "../src/constants/officialCampaignHosts";
import { outlets } from "../src/constants/outlets";
import {
  getCanonicalCampaignOutletName,
  sanitizeCampaignPresentationText,
} from "../src/services/outletCampaignDisplayIntegrity";
import { resolveCampaignDisplayText } from "../src/services/outletCampaignLocalization";

async function main() {
  assert.equal(officialCampaignSources.length, 22, "Campaign integrity audit requires all 22 approved outlets.");
  assert.equal(CAMPAIGN_TRANSLATION_VERSION, 4,
    "Campaign translation cache version must be bumped after localized-currency integrity changes.");

  for (const source of officialCampaignSources) {
    const outlet = outlets.find(candidate => candidate.outletId === source.outletId);
    assert(outlet, `${source.outletId}: tracked campaign source has no canonical app outlet.`);
    assert.equal(source.outletName, outlet.name,
      `${source.outletId}: campaign source outlet name must exactly match canonical app outlet name.`);
    assert.equal(getCanonicalCampaignOutletName(source.outletId), outlet.name,
      `${source.outletId}: client canonical campaign outlet identity drifted.`);
    assert.deepEqual(
      [...(officialCampaignHostsByOutlet[source.outletId] ?? [])].sort(),
      [...source.allowedHosts].sort(),
      `${source.outletId}: client/server official campaign host allowlists must remain identical.`,
    );
  }

  const noventa = officialCampaignSources.find(source => source.outletId === "noventa");
  assert(noventa, "Noventa campaign source is required for cross-outlet integrity regression.");
  const wrongNoventaSummary = "Find ASICS at McArthurGlen Designer Outlet Castel Romano and discover current outlet savings.";
  const repairedNoventaSummary = sanitizeOfficialCampaignPresentationText(
    wrongNoventaSummary,
    noventa.outletId,
    noventa.outletName,
    700,
  );
  assert.match(repairedNoventaSummary, /Noventa di Piave Designer Outlet/);
  assert.doesNotMatch(repairedNoventaSummary, /Castel Romano/,
    "CMS metadata from another McArthurGlen outlet must never leak into Noventa presentation copy.");

  const baseCampaign: ParsedOfficialCampaign = {
    campaignId: "noventa-official-integrity-test",
    sourceId: noventa.sourceId,
    sourceUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-noventa/offers/asics-test/",
    sourceHost: "www.mcarthurglen.com",
    sourceLocale: "en",
    sourceFingerprint: "integrity-source-fingerprint",
    outletId: noventa.outletId,
    outletName: noventa.outletName,
    brandName: "ASICS",
    headline: "Now for €89.99",
    summary: wrongNoventaSummary,
    conditions: "Selected ASICS lines only while stocks last.",
    discountLabel: "€50.00 extra saving on outlet price",
    startsOn: "2026-09-01",
    endsOn: "2026-09-30",
    dateEvidenceSource: "detail_page",
    timeZone: "Europe/Rome",
    featuredPriority: 100,
    type: "offer",
  };

  const translatedOutletName = "Noventa Tasarım Outlet'i";
  const validProvider: CampaignTranslationProvider = async contents => contents.map(content => content
    .replaceAll(noventa.outletName, translatedOutletName)
    .replaceAll("€89.99", "89,99 €")
    .replaceAll("€50.00", "50,00 €"));
  const localized = await buildCampaignLocalization(baseCampaign, validProvider);
  assert.deepEqual(localized.failedLocales, [], "Valid localized currency formatting must remain publishable.");
  for (const locale of localized.completeLocales) {
    const text = localized.localizedText[locale];
    assert.equal(text.brandName, "ASICS", `${locale}: brand proper noun changed.`);
    assert.match(text.summary, /Noventa di Piave Designer Outlet/,
      `${locale}: canonical outlet proper noun was not restored.`);
    assert.doesNotMatch(text.summary, /Castel Romano/,
      `${locale}: wrong outlet metadata leaked through localization.`);
  }

  const currencyWords: Record<string, [string, string]> = {
    tr: ["89,99 avro", "50,00 avro"],
    es: ["89,99 euros", "50,00 euros"],
    fr: ["89,99 euros", "50,00 euros"],
    de: ["89,99 Euro", "50,00 Euro"],
    ar: ["89,99 يورو", "50,00 يورو"],
    ru: ["89,99 евро", "50,00 евро"],
    zh: ["89.99 欧元", "50.00 欧元"],
  };
  const localizedCurrencyWords = await buildCampaignLocalization(baseCampaign, async (contents, language) => {
    const [price, saving] = currencyWords[language];
    return contents.map(content => content.replaceAll("€89.99", price).replaceAll("€50.00", saving));
  });
  assert.deepEqual(localizedCurrencyWords.failedLocales, [],
    "Localized EUR currency words must preserve verified campaign amounts in all seven translated locales.");

  const groupedMoneyCampaign: ParsedOfficialCampaign = {
    ...baseCampaign,
    campaignId: "noventa-grouped-money-integrity-test",
    headline: "Outlet price comparison",
    conditions: "Normal outlet price: €1,350. Recommended retail price: €2,250.",
    discountLabel: "Save €900",
  };
  const localizedGroupedMoney = await buildCampaignLocalization(groupedMoneyCampaign, async contents => contents.map(content => content
    .replaceAll("€1,350", "1 350,00 euros")
    .replaceAll("€2,250", "2 250,00 euros")
    .replaceAll("€900", "900,00 euros")));
  assert.deepEqual(localizedGroupedMoney.failedLocales, [],
    "Space-grouped localized amounts must preserve the same verified EUR values.");

  const corruptMoney = await buildCampaignLocalization(baseCampaign, async contents => contents.map(content =>
    content.replace("€89.99", "€79.99")));
  assert.equal(corruptMoney.failedLocales.length, 7,
    "A translation that changes an official campaign price must fail every translated locale and fall back to English.");

  const quantityCampaign: ParsedOfficialCampaign = {
    ...baseCampaign,
    campaignId: "noventa-quantity-integrity-test",
    headline: "Buy more and save",
    summary: "Selected products only.",
    conditions: "Terms and conditions apply.",
    discountLabel: "6 + 3 free on selected products",
  };
  const validQuantity = await buildCampaignLocalization(quantityCampaign, async contents => contents.map(content =>
    content.replace("6 + 3 free", "6 + 3 ücretsiz")));
  assert.deepEqual(validQuantity.failedLocales, [], "Equivalent localized quantity-free evidence must remain valid.");
  const validQuantityChinese = await buildCampaignLocalization(quantityCampaign, async contents => contents.map(content =>
    content.replace("6 + 3 free", "6 + 3 免费")));
  assert.deepEqual(validQuantityChinese.failedLocales, [], "Equivalent Chinese quantity-free evidence must remain valid.");
  const corruptQuantity = await buildCampaignLocalization(quantityCampaign, async contents => contents.map(content =>
    content.replace("6 + 3 free", "6 + 2 ücretsiz")));
  assert.equal(corruptQuantity.failedLocales.length, 7,
    "A translation that changes quantity-free campaign evidence must be rejected.");

  const english = localized.localizedText.en;
  const defensiveClient = resolveCampaignDisplayText({
    tr: { ...localized.localizedText.tr, headline: "Şimdi 79,99 €" },
  }, "tr", english);
  assert.equal(defensiveClient.headline, english.headline,
    "Client must reject stored localized monetary evidence that changes the verified price.");
  const localizedCurrencyClient = resolveCampaignDisplayText({
    ru: { ...localized.localizedText.ru, headline: "Сейчас за 89,99 евро", discountLabel: "Экономия 50,00 евро" },
  }, "ru", english);
  assert.equal(localizedCurrencyClient.headline, "Сейчас за 89,99 евро",
    "Client must accept localized currency words when the verified amount is unchanged.");
  assert.equal(localizedCurrencyClient.discountLabel, "Экономия 50,00 евро");

  const legacyClientCopy = sanitizeCampaignPresentationText({
    brandName: "ASICS",
    headline: "Seçili ürünlerde ikinci ürün %50 indirimli.",
    summary: "McArthurGlen Designer Outlet Castel Romano'da ASICS ürünlerini keşfedin.",
    conditions: "McArthurGlen Designer Outlet Castel Romano'da seçili ürünlerde geçerlidir.",
    discountLabel: "Ekstra %50 indirim",
  }, noventa.outletId, noventa.outletName);
  assert.match(legacyClientCopy.summary, /Noventa di Piave Designer Outlet/);
  assert.doesNotMatch(legacyClientCopy.summary, /Castel Romano/,
    "Client must defensively repair already-stored cross-outlet presentation text.");

  const duplicateConditions = sanitizeCampaignPresentationText({
    brandName: "ASICS",
    headline: "Ekstra %50 indirim",
    summary: "Seçili ürünlerde ikinci ürün %50 indirimli.",
    conditions: "Seçili ürünlerde ikinci ürün %50 indirimli. Stoklarla sınırlıdır.",
    discountLabel: "Ekstra %50 indirim",
  }, noventa.outletId, noventa.outletName);
  assert.equal(duplicateConditions.conditions, "Stoklarla sınırlıdır.",
    "Campaign conditions must not repeat the summary before the actual condition text.");

  const root = process.cwd();
  const heroComponent = readFileSync(join(root, "src/components/LocalHeroImageCard.tsx"), "utf8");
  const outletHero = readFileSync(join(root, "src/components/OutletHero.tsx"), "utf8");
  const campaignService = readFileSync(join(root, "src/services/outletCampaignService.ts"), "utf8");
  assert.match(heroComponent, /fillImage:\s*\{[\s\S]{0,120}height:\s*["']100%["']/,
    "Native campaign detail hero must keep the outlet image at full card height.");
  assert(campaignService.includes("getCanonicalCampaignOutletName")
    && campaignService.includes("sanitizeCampaignPresentationText")
    && campaignService.includes("outletName: canonicalOutletName"),
  "Client campaign parsing must use canonical outlet identity and sanitize display copy.");
  assert(outletHero.includes("subscribeActiveOutletCampaignsForOutlet")
    && outletHero.includes("navigation.navigate(\"CampaignDetail\"")
    && outletHero.includes("formatCampaignDate(campaign.endsOn, language)"),
  "Outlet detail must surface its live verified campaigns and link every campaign to CampaignDetail.");

  console.log("Campaign integrity audit passed: 22 canonical outlet identities, host parity, outlet-detail live campaigns, 8-language proper nouns, localized monetary/quantity evidence, legacy repair, condition dedupe, and full-height hero.");
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});