import { readFileSync } from "node:fs";
import { countries } from "../src/constants/countries";
import { getMaximumRefundRate, getTaxFreeRule, taxFreeRules } from "../src/constants/taxFreeRules";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { getTaxFreePolicyDisplayModel } from "../src/utils/taxFreeDisplay";
import { getLocalizedTaxFreeSourceName, getTaxFreeSourceDisplayRows, isMappedTaxFreeSourceName } from "../src/utils/taxFreeSourceDisplay";
import { supportedLanguageCodes } from "../src/translations/translations";

const read = (path: string) => readFileSync(path, "utf8");
const sourceNames = [...new Set(taxFreeRules.flatMap((rule) => [rule.schemeSource.name, rule.vatRateSource.name, rule.minimumPurchaseSource?.name, rule.refundPolicy.source.name]).filter((name): name is string => Boolean(name)))].sort();
const unmappedSourceList = sourceNames.filter((name) => !isMappedTaxFreeSourceName(name));
const rateMismatchList: string[] = [];
const rawVatAsRefundList: string[] = [];
const placeholderLeakageList: string[] = [];
const rawEnglishSourceLeakageList: string[] = [];
const countryFallbackErrorList: string[] = [];
const duplicateSourceRowList: string[] = [];
const providerRules = taxFreeRules.filter((rule) => rule.refundPolicy.mode === "provider_dependent_upper_bound");
const tFor = (language: typeof supportedLanguageCodes[number]) => (key: string) => resolveTranslation(language, key);

for (const rule of taxFreeRules) {
  for (const language of supportedLanguageCodes) {
    const model = getTaxFreePolicyDisplayModel(rule, language, tFor(language), new Date("2026-07-27T12:00:00Z"));
    if (rule.refundPolicy.mode === "provider_dependent_upper_bound") {
      if (model.kind !== "maximum_rate" || model.rate !== getMaximumRefundRate(rule)) rateMismatchList.push(`${rule.countryId}/${language}`);
      if (!model.summary.toLocaleLowerCase(language).replace(/-/g, " ").includes("tax free") || !model.rateText) rateMismatchList.push(`${rule.countryId}/${language}: unclear summary`);
    } else if (model.rate !== undefined || model.rateText !== undefined) rateMismatchList.push(`${rule.countryId}/${language}: unexpected rate`);
    if (model.summary.includes("%{rate}")) placeholderLeakageList.push(`${rule.countryId}/${language}`);
  }
}

const expected: Record<string, [string, string]> = { italy: ["18.0%", "18,0%"], germany: ["16.0%", "16,0%"], france: ["16.7%", "16,7%"], turkey: ["16.7%", "16,7%"], switzerland: ["7.5%", "7,5%"] };
for (const [countryId, [en, tr]] of Object.entries(expected)) {
  const rule = getTaxFreeRule(countryId)!;
  const enModel = getTaxFreePolicyDisplayModel(rule, "en", tFor("en"));
  const trModel = getTaxFreePolicyDisplayModel(rule, "tr", tFor("tr"));
  if (enModel.rateText !== en || trModel.rateText !== tr || enModel.rateText === `${rule.vatRate}%` || trModel.rateText === `${rule.vatRate}%`) rateMismatchList.push(`${countryId}: ${enModel.rateText}/${trModel.rateText}`);
}

for (const name of sourceNames) for (const language of supportedLanguageCodes) {
  const source = taxFreeRules.flatMap((rule) => [rule.schemeSource, rule.vatRateSource, rule.minimumPurchaseSource, rule.refundPolicy.source]).find((item) => item?.name === name)!;
  const display = getLocalizedTaxFreeSourceName(source, language, tFor(language));
  if (display.includes("taxFreeSource.") || display.includes("%{")) placeholderLeakageList.push(`${name}/${language}`);
  if (language !== "en" && /Revenue Administration|Customs|Government Portal|VAT refunds|VAT rates|Tourism Agency/.test(display)) rawEnglishSourceLeakageList.push(`${name}/${language}: ${display}`);
}

for (const rule of taxFreeRules) for (const language of supportedLanguageCodes) {
  const rows = getTaxFreeSourceDisplayRows(rule, language, tFor(language));
  const identities = rows.map((row) => row.identity);
  if (new Set(identities).size !== identities.length) duplicateSourceRowList.push(`${rule.countryId}/${language}`);
  if (!rows.some((row) => row.roles.includes("scheme")) || !rows.some((row) => row.roles.includes("vat_rate"))) countryFallbackErrorList.push(`${rule.countryId}/${language}: missing source role`);
  if (rule.minimumPurchaseStatus === "verified_amount" && !rows.some((row) => row.roles.includes("minimum"))) countryFallbackErrorList.push(`${rule.countryId}/${language}: missing minimum source role`);
  if (!rows.some((row) => row.roles.includes("refund_policy"))) countryFallbackErrorList.push(`${rule.countryId}/${language}: missing refund policy role`);
}

const germanyRowsTr = getTaxFreeSourceDisplayRows(getTaxFreeRule("germany")!, "tr", tFor("tr"));
if (!germanyRowsTr.some((row) => row.authorityName === "Avrupa Komisyonu — KDV iadeleri" && row.roles.includes("scheme")) || !germanyRowsTr.some((row) => row.authorityName === "Avrupa Komisyonu KDV oranları" && row.roles.includes("vat_rate"))) countryFallbackErrorList.push("Germany localized source rows");
const italyRowsTr = getTaxFreeSourceDisplayRows(getTaxFreeRule("italy")!, "tr", tFor("tr"));
if (!italyRowsTr.some((row) => row.authorityName === "Agenzia delle Entrate") || !italyRowsTr.some((row) => row.authorityName === "Avrupa Komisyonu KDV oranları" && row.roles.includes("vat_rate"))) countryFallbackErrorList.push("Italy localized source rows");
const turkeyRowsTr = getTaxFreeSourceDisplayRows(getTaxFreeRule("turkey")!, "tr", tFor("tr"));
if (turkeyRowsTr.length !== 1 || turkeyRowsTr[0].authorityName !== "Gelir İdaresi Başkanlığı" || turkeyRowsTr[0].roles.length !== 4 || turkeyRowsTr.some((row) => row.authorityName.includes("Turkish Revenue Administration"))) countryFallbackErrorList.push("Turkey combined localized source row");

const screenPaths = ["src/screens/OutletDetailScreen.tsx", "src/components/cards/TaxFreeCard.tsx", "src/screens/TaxFreeCalculatorScreen.tsx", "src/screens/TaxFreeGuideScreen.tsx", "src/screens/CountryScreen.tsx"];
const screenSource = screenPaths.map(read).join("\n");
if (/KDV oranı:\s*[^\n]*vatRate|VAT rate:\s*[^\n]*vatRate|Vergi oranı:\s*[^\n]*vatRate/i.test(screenSource)) rawVatAsRefundList.push("primary Tax Free screen source");
const countrySource = read("src/screens/CountryScreen.tsx");
if (countrySource.includes("taxFreeRules[0]")) countryFallbackErrorList.push("taxFreeRules[0] fallback");
if (countrySource.includes("minimumPurchaseAmount ?? 0")) countryFallbackErrorList.push("zero minimum fallback");
if (countrySource.includes("country.vatRate")) countryFallbackErrorList.push("VAT primary card");
for (const country of countries.filter(({ taxFreeStatus }) => taxFreeStatus !== "available")) if (getTaxFreeRule(country.countryId)) countryFallbackErrorList.push(`${country.countryId}: unexpected rule`);
for (const path of screenPaths) if (path !== "src/screens/TaxFreeCalculatorScreen.tsx" && !read(path).includes("getTaxFreePolicyDisplayModel") && !read(path).includes("taxFreeSummary")) countryFallbackErrorList.push(`${path}: display helper missing`);
const calculatorSource = read("src/screens/TaxFreeCalculatorScreen.tsx");
const sourceHelperSource = read("src/utils/taxFreeSourceDisplay.ts");
if (!calculatorSource.includes("getTaxFreeSourceDisplayRows(rule, language, t") || !sourceHelperSource.includes("source: rule.vatRateSource") || !sourceHelperSource.includes("getLocalizedTaxFreeSourceName(source, language, t)")) countryFallbackErrorList.push("calculator production source flow missing");
const japanRule = getTaxFreeRule("japan")!;
const japanBefore = getTaxFreePolicyDisplayModel(japanRule, "en", tFor("en"), new Date("2026-10-31T14:59:59.999Z"));
const japanAfter = getTaxFreePolicyDisplayModel(japanRule, "en", tFor("en"), new Date("2026-10-31T15:00:00.000Z"));
if (japanBefore.kind !== "point_of_sale" || japanAfter.kind !== "future_regime" || !countrySource.includes('policyDisplay?.kind === "future_regime"') || !countrySource.includes("taxFree.futureRegimeMinimumNotModeled")) countryFallbackErrorList.push("Japan future minimum display");
const guideSource = read("src/screens/TaxFreeGuideScreen.tsx");
for (const id of ["united-kingdom", "canada", "united-states"]) if (getTaxFreeRule(id)) countryFallbackErrorList.push(`${id}: guide unexpectedly has rule`);
if (!guideSource.includes("{!rule ? (") || !guideSource.includes("notAvailableExplanation") || guideSource.indexOf("{!rule ? (") > guideSource.indexOf('t("taxGuide.taxFreeProcess")')) countryFallbackErrorList.push("unavailable guide isolation");

const errorCount = unmappedSourceList.length + rateMismatchList.length + rawVatAsRefundList.length + placeholderLeakageList.length + rawEnglishSourceLeakageList.length + countryFallbackErrorList.length + duplicateSourceRowList.length;
console.log(`Rule count: ${taxFreeRules.length}`);
console.log(`Provider-dependent count: ${providerRules.length}`);
console.log(`Official-formula count: ${taxFreeRules.filter((r) => r.refundPolicy.mode === "official_formula").length}`);
console.log(`Official-table count: ${taxFreeRules.filter((r) => r.refundPolicy.mode === "official_refund_table").length}`);
console.log(`Point-of-sale count: ${taxFreeRules.filter((r) => r.refundPolicy.mode === "point_of_sale_exemption").length}`);
console.log(`Mapped unique source count: ${sourceNames.length - unmappedSourceList.length}`);
console.log("Unmapped source list:", unmappedSourceList);
console.log("Rate mismatch list:", rateMismatchList);
console.log("Raw VAT-as-refund list:", rawVatAsRefundList);
console.log("Placeholder leakage list:", placeholderLeakageList);
console.log("Raw English source leakage list:", rawEnglishSourceLeakageList);
console.log("Duplicate source-row list:", duplicateSourceRowList);
console.log("Country fallback error list:", countryFallbackErrorList);
console.log(`Error count: ${errorCount}`);
if (errorCount) process.exit(1);
