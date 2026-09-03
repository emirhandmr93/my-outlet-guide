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

assert.equal(officialCampaignSources.length, 22, "Campaign integrity audit requires all 22 approved outlets.");
assert.equal(CAMPAIGN_TRANSLATION_VERSION, 3,
  "Campaign translation cache version must be bumped after display-integrity changes.");

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

const root = process.cwd();
const heroComponent = readFileSync(join(root, "src/components/LocalHeroImageCard.tsx"), "utf8");
const campaignService = readFileSync(join(root, "src/services/outletCampaignService.ts"), "utf8");
assert.match(heroComponent, /fillImage:\s*\{[\s\S]{0,120}height:\s*["']100%["']/,
  "Native campaign detail hero must keep the outlet image at full card height.");
assert(campaignService.includes("getCanonicalCampaignOutletName")
  && campaignService.includes("sanitizeCampaignPresentationText")
  && campaignService.includes("outletName: canonicalOutletName"),
"Client campaign parsing must use canonical outlet identity and sanitize display copy.");

console.log("Campaign integrity audit passed: 22 canonical outlet identities, host parity, 8-language proper nouns, monetary/quantity evidence, legacy repair, and full-height hero.");
