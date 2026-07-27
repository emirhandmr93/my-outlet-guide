import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { getBrandsForOutlet } from "../src/services/brandService";
import { supportedLanguageCodes, translations, type TranslationLanguage } from "../src/translations/translations";
import {
  parseOutletRetailCount,
  resolveOutletRetailCountDisplay,
  type OutletRetailCountDisplay,
} from "../src/utils/outletDisplayFormatters";

const activeOutlets = outlets.filter((outlet) => outlet.status === "active");
const emptySources = activeOutlets.filter((outlet) => !String(outlet.storesCountText ?? "").trim());
const qualitativeSources = activeOutlets.filter((outlet) => {
  const source = String(outlet.storesCountText ?? "").trim();
  return source.length > 0 && !/\d/.test(source);
});

const expectedUnsafeNumeric = (source: string) => {
  const retailNouns = source.match(/\b(?:stores?|shops?|boutiques?|brands?)\b/gi)?.length ?? 0;
  const numbers = source.match(/\d+/g)?.length ?? 0;
  return (retailNouns >= 2 && numbers >= 2)
    || /\d+\s+flagship outlets?\s+and\s+\d+\s+restaurants?/i.test(source);
};

const numericUnparsedSources = activeOutlets
  .map((outlet) => ({ outletId: outlet.outletId, source: String(outlet.storesCountText ?? "").trim() }))
  .filter(({ source }) => /\d/.test(source) && !parseOutletRetailCount(source) && !expectedUnsafeNumeric(source));

const displays: Array<{ outletId: string; language: TranslationLanguage; raw: string; display: OutletRetailCountDisplay; label: string; listedCount: number }> = [];
for (const outlet of activeOutlets) {
  const listedCount = getBrandsForOutlet(outlet.outletId).length;
  for (const language of supportedLanguageCodes) {
    const t = (key: string) => translations[language][key] ?? key;
    const display = resolveOutletRetailCountDisplay(outlet.storesCountText, listedCount, language, t);
    displays.push({ outletId: outlet.outletId, language, raw: String(outlet.storesCountText ?? "").trim(), display, label: t(display.labelKey), listedCount });
  }
}

const semanticMismatches: string[] = [];
const rawEnglishLeakage: string[] = [];
const emptyDisplays: string[] = [];
const forbiddenValue = /^(?:n\/?a|unknown|not verified|placeholder|mock|nan|infinity|0)$/i;
for (const item of displays) {
  const id = `${item.outletId}:${item.language}`;
  if (!item.label.trim() || !item.display.value.trim() || item.label.includes("sharedCards.") || item.display.value.includes("outlet.retailCount.")) emptyDisplays.push(id);
  if (item.display.value === item.raw || forbiddenValue.test(item.display.value) || item.display.value.length > 32 || item.label.length > 32) semanticMismatches.push(`${id}: invalid value or abnormal prose`);
  const expectedKey = item.display.source === "official_store_count" ? "sharedCards.quickFacts.stores"
    : item.display.source === "official_brand_count" ? "sharedCards.quickFacts.brands"
      : item.display.source === "official_boutique_count" ? "sharedCards.quickFacts.boutiques"
        : item.display.source === "listed_brand_fallback" ? "sharedCards.quickFacts.listedBrands"
          : "sharedCards.quickFacts.retailCount";
  if (item.display.labelKey !== expectedKey) semanticMismatches.push(`${id}: ${item.display.source} uses ${item.display.labelKey}`);
  if (item.display.source === "listed_brand_fallback" && (item.display.count !== item.listedCount || item.display.value !== String(item.listedCount))) semanticMismatches.push(`${id}: listed-brand fallback mismatch`);
  if (item.language !== "en" && /\b(?:stores?|shops?|brands?|more than|over|almost|approximately|up to)\b/i.test(item.display.value)) rawEnglishLeakage.push(`${id}: ${item.display.value}`);
}

// Prove the service excludes inactive relations/brands and deduplicates relations.
for (const outlet of activeOutlets) {
  const activeBrandIds = new Set(outletBrands
    .filter((relation) => relation.outletId === outlet.outletId && relation.relationStatus === "active")
    .map((relation) => relation.brandId));
  const expected = brands.filter((brand) => brand.brandStatus === "active" && activeBrandIds.has(brand.brandId)).length;
  if (getBrandsForOutlet(outlet.outletId).length !== expected) semanticMismatches.push(`${outlet.outletId}: active unique brand service mismatch`);
}

function acceptance(outletId: string, language: TranslationLanguage) {
  return displays.find((item) => item.outletId === outletId && item.language === language);
}
const expectedExamples: Array<[string, TranslationLanguage, string, string]> = [
  ["barberino", "en", "Stores", "More than 130"], ["barberino", "tr", "Mağazalar", "130'dan fazla"],
  ["castel-romano", "tr", "Markalar", "150'den fazla"], ["fidenza-village", "de", "Boutiquen", "120+"],
];
for (const [outletId, language, label, value] of expectedExamples) {
  const item = acceptance(outletId, language);
  if (!item || item.label !== label || item.display.value !== value) semanticMismatches.push(`${outletId}:${language}: expected ${label} / ${value}`);
}
const qualifierExamples = [
  ["130 stores", "exact", "130"], ["130+ stores", "plus", "130+"],
  ["Over 130 stores", "more_than", "More than 130"], ["Nearly 130 stores", "almost", "Almost 130"],
  ["Approximately 130 stores", "about", "About 130"], ["Up to 130 stores", "up_to", "Up to 130"],
] as const;
for (const [source, qualifier, expectedValue] of qualifierExamples) {
  const parsed = parseOutletRetailCount(source);
  const display = resolveOutletRetailCountDisplay(source, 0, "en", (key) => translations.en[key] ?? key);
  if (parsed?.qualifier !== qualifier || display.qualifier !== qualifier || display.value !== expectedValue) semanticMismatches.push(`qualifier: ${source}`);
}
for (const outletId of ["212-outlet", "starcity-outlet", "venezia-mega-outlet", "deepo-outlet-center"]) {
  const item = acceptance(outletId, "tr");
  if (!item || !["listed_brand_fallback", "not_verified"].includes(item.display.source)) semanticMismatches.push(`${outletId}: unsafe empty-source fallback`);
}

const uniqueOfficial = activeOutlets.map((outlet) => parseOutletRetailCount(outlet.storesCountText));
const sourceCounts = Object.fromEntries(["official_store_count", "official_brand_count", "official_boutique_count", "listed_brand_fallback", "not_verified"].map((source) => [source, displays.filter((item) => item.language === "en" && item.display.source === source).length]));
const errorCount = numericUnparsedSources.length + semanticMismatches.length + rawEnglishLeakage.length + emptyDisplays.length;
console.log(`Active outlet count: ${activeOutlets.length}`);
console.log(`Parseable official store count: ${uniqueOfficial.filter((item) => item?.kind === "store").length}`);
console.log(`Parseable official brand count: ${uniqueOfficial.filter((item) => item?.kind === "brand").length}`);
console.log(`Parseable official boutique count: ${uniqueOfficial.filter((item) => item?.kind === "boutique").length}`);
console.log(`Listed-brand fallback count: ${sourceCounts.listed_brand_fallback}`);
console.log(`Not-verified fallback count: ${sourceCounts.not_verified}`);
console.log(`Empty source count: ${emptySources.length}`);
console.log(`Qualitative source count: ${qualitativeSources.length}`);
console.log(`Numeric unparsed source list: ${JSON.stringify(numericUnparsedSources)}`);
console.log(`Semantic mismatch list: ${JSON.stringify(semanticMismatches)}`);
console.log(`Raw English leakage list: ${JSON.stringify(rawEnglishLeakage)}`);
console.log(`Empty display list: ${JSON.stringify(emptyDisplays)}`);
console.log(`Error count: ${errorCount}`);
if (errorCount > 0) process.exitCode = 1;
