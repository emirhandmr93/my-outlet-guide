import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { getBrandsForOutlet } from "../src/services/brandService";
import { supportedLanguageCodes, translations, type TranslationLanguage } from "../src/translations/translations";
import {
  formatOutletRetailCountCompactText,
  parseOutletRetailCount,
  resolveOutletRetailCountDisplay,
  type OutletRetailCountDisplay,
} from "../src/utils/outletDisplayFormatters";

const activeOutlets = outlets.filter((outlet) => outlet.status === "active");
const isCombinedVenueSource = (source: string) => /\d/.test(source)
  && /\b(?:outlets?|shops?|stores?)\b[^;]{0,80}\b(?:services?|restaurants?|caf[eé]s?|food\s+venues?|leisure|entertainment|cinemas?)\b/i.test(source);
const combinedTotalSources = activeOutlets
  .map((outlet) => ({ outletId: outlet.outletId, source: String(outlet.storesCountText ?? "").trim() }))
  .filter(({ source }) => isCombinedVenueSource(source));
const expectedUnsafeNumeric = (source: string) => {
  const retailNouns = source.match(/\b(?:stores?|shops?|boutiques?|brands?)\b/gi)?.length ?? 0;
  const numbers = source.match(/\d+/g)?.length ?? 0;
  return isCombinedVenueSource(source) || (retailNouns >= 2 && numbers >= 2);
};
const numericUnparsedSources = activeOutlets
  .map((outlet) => ({ outletId: outlet.outletId, source: String(outlet.storesCountText ?? "").trim() }))
  .filter(({ source }) => /\d/.test(source) && !parseOutletRetailCount(source) && !expectedUnsafeNumeric(source));

type AuditItem = { outletId: string; language: TranslationLanguage; raw: string; display: OutletRetailCountDisplay; label: string; compact: string; listedCount: number };
const displays: AuditItem[] = [];
for (const outlet of activeOutlets) {
  const listedCount = getBrandsForOutlet(outlet.outletId).length;
  for (const language of supportedLanguageCodes) {
    const t = (key: string) => translations[language][key] ?? key;
    const display = resolveOutletRetailCountDisplay(outlet.storesCountText, listedCount, language, t);
    displays.push({ outletId: outlet.outletId, language, raw: String(outlet.storesCountText ?? "").trim(), display, label: t(display.labelKey), compact: formatOutletRetailCountCompactText(display, t), listedCount });
  }
}

const quickFactsEmptyDisplays: string[] = [];
const compactCardEmptyDisplays: string[] = [];
const semanticMismatches: string[] = [];
const bareNumberCards: string[] = [];
const rawEnglishLeakage: string[] = [];
const listedBrandMislabeled: string[] = [];
const qualifierCollisions: string[] = [];
const combinedTotalsIncorrectlyParsed: string[] = [];
for (const item of displays) {
  const id = `${item.outletId}:${item.language}`;
  if (!item.label.trim() || !item.display.value.trim() || /(?:sharedCards\.|outlet\.retailCount\.)/.test(`${item.label} ${item.display.value}`)) quickFactsEmptyDisplays.push(id);
  if (!item.compact.trim() || item.compact.includes("outlet.retailCount.") || /•\s*$/.test(item.compact)) compactCardEmptyDisplays.push(id);
  if (/^\s*\d+\+?\s*$/.test(item.compact)) bareNumberCards.push(id);
  const expectedKey = item.display.source === "official_store_count" ? "sharedCards.quickFacts.stores"
    : item.display.source === "official_brand_count" ? "sharedCards.quickFacts.brands"
      : item.display.source === "official_boutique_count" ? "sharedCards.quickFacts.boutiques"
        : item.display.source === "listed_brand_fallback" ? "sharedCards.quickFacts.listedBrands" : "sharedCards.quickFacts.retailCount";
  if (item.display.labelKey !== expectedKey) semanticMismatches.push(`${id}: label/source mismatch`);
  if (item.display.source.startsWith("official_") && (item.compact === item.display.value || item.display.count === undefined || item.display.qualifier === undefined)) semanticMismatches.push(`${id}: compact noun or official semantics missing`);
  if (item.display.source === "listed_brand_fallback" && (item.display.count !== item.listedCount || item.display.value !== String(item.listedCount) || item.compact === String(item.listedCount) || item.display.labelKey !== "sharedCards.quickFacts.listedBrands")) listedBrandMislabeled.push(id);
  if (item.language !== "en" && /\b(?:stores?|shops?|brands?|more than|over|almost|approximately|up to|listed brands)\b/i.test(`${item.display.value} ${item.compact}`)) rawEnglishLeakage.push(id);
}

for (const source of ["150 shops and services", "over 50 stores and restaurants", "Over 80 shops, restaurants and cafés"]) {
  if (parseOutletRetailCount(source) !== null) combinedTotalsIncorrectlyParsed.push(source);
}
for (const item of combinedTotalSources) {
  if (parseOutletRetailCount(item.source) !== null) combinedTotalsIncorrectlyParsed.push(item.outletId);
  for (const display of displays.filter((candidate) => candidate.outletId === item.outletId)) {
    if (!["listed_brand_fallback", "not_verified"].includes(display.display.source)) semanticMismatches.push(`${display.outletId}:${display.language}: combined-total fallback missing`);
  }
}

const pureExamples = [
  ["More than 130 stores", "store", 130, "more_than"], ["Over 150 designer brands", "brand", 150, "more_than"],
  ["120+ Boutiques", "boutique", 120, "plus"], ["250 stores", "store", 250, "exact"],
  ["Around 100 stores", "store", 100, "about"], ["Up to 80 brands", "brand", 80, "up_to"],
] as const;
for (const [source, kind, count, qualifier] of pureExamples) {
  const parsed = parseOutletRetailCount(source);
  if (!parsed || parsed.kind !== kind || parsed.count !== count || parsed.qualifier !== qualifier) semanticMismatches.push(`pure parser: ${source}`);
}
for (const language of supportedLanguageCodes) {
  const t = (key: string) => translations[language][key] ?? key;
  const almost = resolveOutletRetailCountDisplay("Almost 100 stores", 0, language, t);
  const about = resolveOutletRetailCountDisplay("Around 100 stores", 0, language, t);
  if (almost.qualifier !== "almost" || about.qualifier !== "about" || almost.value === about.value) qualifierCollisions.push(language);
  for (const [source, qualifier] of [["100 stores", "exact"], ["100+ stores", "plus"], ["Over 100 stores", "more_than"], ["Up to 100 stores", "up_to"]] as const) {
    if (resolveOutletRetailCountDisplay(source, 0, language, t).qualifier !== qualifier) semanticMismatches.push(`${language}: ${qualifier}`);
  }
}

for (const outlet of activeOutlets) {
  const activeBrandIds = new Set(outletBrands.filter((relation) => relation.outletId === outlet.outletId && relation.relationStatus === "active").map((relation) => relation.brandId));
  const expected = brands.filter((brand) => brand.brandStatus === "active" && activeBrandIds.has(brand.brandId)).length;
  if (getBrandsForOutlet(outlet.outletId).length !== expected) semanticMismatches.push(`${outlet.outletId}: active unique brand mismatch`);
}
const userVisibleSources = ["src/screens/CityResultsScreen.tsx", "src/screens/CountryScreen.tsx", "src/screens/OutletDetailScreen.tsx", "src/components/cards/QuickFactsCard.tsx"];
for (const path of userVisibleSources) {
  const source = readFileSync(path, "utf8");
  if (source.includes("formatStores" + "CountText")) semanticMismatches.push(`${path}: deprecated formatter reference`);
  if (path !== "src/screens/OutletDetailScreen.tsx" && /\{\s*outlet\.storesCountText\s*\}/.test(source)) semanticMismatches.push(`${path}: raw storesCountText render`);
}
if (readFileSync("src/utils/outletDisplayFormatters.ts", "utf8").includes("function formatStores" + "CountText")) semanticMismatches.push("deprecated formatter remains");

const expectedExamples: Array<[string, TranslationLanguage, string, string]> = [
  ["barberino", "tr", "Mağazalar", "130'dan fazla mağaza"], ["barberino", "en", "Stores", "More than 130 stores"],
  ["castel-romano", "tr", "Markalar", "150'den fazla marka"], ["fidenza-village", "de", "Boutiquen", "120+ Boutiquen"],
  ["212-outlet", "tr", "Listelenen markalar", "105 listelenen marka"], ["212-outlet", "en", "Listed brands", "105 listed brands"],
];
for (const [outletId, language, label, compact] of expectedExamples) {
  const item = displays.find((candidate) => candidate.outletId === outletId && candidate.language === language);
  if (!item || item.label !== label || item.compact !== compact) semanticMismatches.push(`${outletId}:${language}: acceptance mismatch`);
}

const errorCount = quickFactsEmptyDisplays.length + compactCardEmptyDisplays.length + numericUnparsedSources.length + combinedTotalsIncorrectlyParsed.length + semanticMismatches.length + bareNumberCards.length + rawEnglishLeakage.length + listedBrandMislabeled.length + qualifierCollisions.length;
console.log(`Active outlet count: ${activeOutlets.length}`);
console.log(`Quick Facts empty display list: ${JSON.stringify(quickFactsEmptyDisplays)}`);
console.log(`Compact-card empty display list: ${JSON.stringify(compactCardEmptyDisplays)}`);
console.log(`Numeric unparsed source list: ${JSON.stringify(numericUnparsedSources)}`);
console.log(`Combined-total source outlet list: ${JSON.stringify(combinedTotalSources)}`);
console.log(`Combined totals incorrectly parsed list: ${JSON.stringify(combinedTotalsIncorrectlyParsed)}`);
console.log(`Semantic mismatch list: ${JSON.stringify(semanticMismatches)}`);
console.log(`Bare-number card list: ${JSON.stringify(bareNumberCards)}`);
console.log(`Raw English leakage list: ${JSON.stringify(rawEnglishLeakage)}`);
console.log(`Listed-brand mislabeled list: ${JSON.stringify(listedBrandMislabeled)}`);
console.log(`Qualifier collision list: ${JSON.stringify(qualifierCollisions)}`);
console.log(`Error count: ${errorCount}`);
if (errorCount > 0) process.exitCode = 1;
