import assert from "node:assert/strict";

import {
  buildCampaignLocalization,
  campaignTranslationLanguages,
  type CampaignTranslationProvider,
} from "../functions/src/outletCampaignLocalization";
import type { ParsedOfficialCampaign } from "../functions/src/outletCampaignParser";
import { resolveCampaignDisplayText } from "../src/services/outletCampaignLocalization";
import { supportedLanguageCodes } from "../src/translations/locale";

const campaign: ParsedOfficialCampaign = {
  campaignId: "serravalle-official-test",
  sourceId: "serravalle-designer-outlet-official",
  sourceUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/offers/test/",
  sourceHost: "www.mcarthurglen.com",
  sourceLocale: "en",
  sourceFingerprint: "source-fingerprint-v1",
  outletId: "serravalle-designer-outlet",
  outletName: "Serravalle Designer Outlet",
  brandName: "Summer Sale",
  headline: "Extra savings on summer styles",
  summary: "Shop selected summer styles for a limited time at participating stores.",
  conditions: "Selected lines only. Terms and conditions apply.",
  discountLabel: "Extra 50% off",
  discountPercent: 50,
  startsOn: "2026-08-29",
  endsOn: "2026-08-31",
  dateEvidenceSource: "official_listing",
  timeZone: "Europe/Rome",
  featuredPriority: 50_100,
  type: "offer",
};

async function main() {
  assert.deepEqual([...campaignTranslationLanguages], [...supportedLanguageCodes],
    "Campaign translations must cover exactly the eight production languages.");

  let providerCalls = 0;
  const provider: CampaignTranslationProvider = async (contents, targetLanguage) => {
    providerCalls += 1;
    return contents.map(content => `[${targetLanguage}] ${content}`);
  };
  const complete = await buildCampaignLocalization(campaign, provider);
  assert.equal(providerCalls, 7, "The English source must be retained and seven target languages translated.");
  assert.deepEqual(complete.completeLocales, [...supportedLanguageCodes]);
  assert.deepEqual(complete.failedLocales, []);
  assert.equal(complete.localizedText.en.headline, campaign.headline, "English must remain exact source text.");
  assert.match(complete.localizedText.tr.headline, /^\[tr\]/);
  assert.match(complete.localizedText.ar.discountLabel, /50%/);
  assert.match(complete.localizedText.zh.summary, /^\[zh\]/);

  providerCalls = 0;
  const reused = await buildCampaignLocalization(campaign, provider, {
    localizedText: complete.localizedText,
    completeLocales: complete.completeLocales,
  });
  assert.equal(providerCalls, 0, "Completed translations must be reused for an unchanged source fingerprint.");
  assert.deepEqual(reused.localizedText, complete.localizedText);

  const partial = await buildCampaignLocalization(campaign, async (contents, targetLanguage) => {
    if (targetLanguage === "ar") throw new Error("temporary_translation_failure");
    return contents.map(content => `[${targetLanguage}] ${content}`);
  });
  assert.deepEqual(partial.failedLocales, ["ar"]);
  assert.deepEqual(partial.localizedText.ar, partial.localizedText.en,
    "A failed locale must fall back to the verified English source without blocking publication.");

  const corruptedDiscount = await buildCampaignLocalization(campaign, async contents =>
    contents.map(content => content.replace("50%", "40%")));
  assert.deepEqual(corruptedDiscount.failedLocales, ["tr", "es", "fr", "de", "ar", "ru", "zh"],
    "Translations that alter percentage evidence must be rejected.");

  const turkish = resolveCampaignDisplayText(complete.localizedText, "tr", complete.localizedText.en);
  assert.match(turkish.headline, /^\[tr\]/);
  assert.match(turkish.discountLabel, /50%/);

  const turkishPrefixPercent = resolveCampaignDisplayText({
    tr: { ...complete.localizedText.tr, discountLabel: "Ekstra %50 indirim" },
  }, "tr", complete.localizedText.en);
  assert.equal(turkishPrefixPercent.discountLabel, "Ekstra %50 indirim",
    "The client must accept Turkish percent-before-number discount formatting.");

  const chineseWrittenZhe = resolveCampaignDisplayText({
    zh: { ...complete.localizedText.zh, discountLabel: "额外五折优惠" },
  }, "zh", complete.localizedText.en);
  assert.equal(chineseWrittenZhe.discountLabel, "额外五折优惠",
    "The client must accept Chinese written-numeral 折 discounts already validated by ingestion.");

  const chineseFullWidthPercent = resolveCampaignDisplayText({
    zh: { ...complete.localizedText.zh, discountLabel: "额外优惠50％" },
  }, "zh", complete.localizedText.en);
  assert.equal(chineseFullWidthPercent.discountLabel, "额外优惠50％",
    "The client must accept full-width localized percent characters.");

  const safeFallback = resolveCampaignDisplayText({
    tr: { ...complete.localizedText.tr, discountLabel: "Ekstra %40 indirim" },
  }, "tr", complete.localizedText.en);
  assert.equal(safeFallback.headline, complete.localizedText.tr.headline);
  assert.equal(safeFallback.discountLabel, complete.localizedText.en.discountLabel,
    "The client must independently reject localized discount evidence that changes the percentage.");
  assert.deepEqual(resolveCampaignDisplayText({}, "ru", complete.localizedText.en), complete.localizedText.en,
    "Missing locale data must fall back to English field-for-field.");

  console.log("Outlet campaign localization check passed: 8 locales, cache reuse, localized discount syntax, safe fallback, and discount integrity.");
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
