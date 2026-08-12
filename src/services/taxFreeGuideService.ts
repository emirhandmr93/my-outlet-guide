import { getTaxFreePolicySummaryKey, getTaxFreeRule } from "../constants/taxFreeRules";
import { getTaxFreeConciseProcessFamily, type TaxFreeCountryGuide } from "../constants/taxFreeGuides";
import { countries } from "../constants/countries";
import { getTaxFreePolicyDisplayModel, normalizeTaxFreeCountryStatus } from "../utils/taxFreeDisplay";
import type { TranslationLanguage } from "../translations/locale";

type Translate = (key: string) => string;

export type TaxFreeConcisePresentation = {
  family: "eu" | "standard" | "japan";
  stepKeys: [string, string, string, string, string];
  immediateWarningKey: string;
  processCard: TaxFreeProcessCardPresentation;
};

export type TaxFreeProcessCardVariant = "conditional" | "japan_point_of_sale" | "japan_post_export";

export type TaxFreeProcessCardPresentation = {
  variant: TaxFreeProcessCardVariant;
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
};

function getProcessCardPresentation(variant: TaxFreeProcessCardVariant): TaxFreeProcessCardPresentation {
  const prefix = `taxGuide.processCard.${variant}`;
  return { variant, titleKey: `${prefix}.title`, descriptionKey: `${prefix}.description`, actionKey: `${prefix}.action` };
}

export function getTaxFreeConcisePresentation(countryId: string, date = new Date()): TaxFreeConcisePresentation {
  const family = getTaxFreeConciseProcessFamily(countryId);
  if (family === "japan") {
    const japanRule = getTaxFreeRule("japan");
    const period = japanRule && getTaxFreePolicySummaryKey(japanRule, date) === "taxCalc.futureRegimeNoEstimate"
      ? "after"
      : "before";
    return {
      family,
      stepKeys: [0, 1, 2, 3, 4].map((index) => `taxGuide.concise.japan.${period}.step${index + 1}`) as TaxFreeConcisePresentation["stepKeys"],
      immediateWarningKey: `taxGuide.concise.japan.${period}.warning`,
      processCard: getProcessCardPresentation(period === "before" ? "japan_point_of_sale" : "japan_post_export"),
    };
  }
  return {
    family,
    stepKeys: [0, 1, 2, 3, 4].map((index) => `taxGuide.concise.${family}.step${index + 1}`) as TaxFreeConcisePresentation["stepKeys"],
    immediateWarningKey: `taxGuide.concise.${family}.warning`,
    processCard: getProcessCardPresentation("conditional"),
  };
}

function normalizeGuideCountryId(countryId: string | null | undefined): string | undefined {
  const normalizedCountryId = typeof countryId === "string" ? countryId.trim().toLowerCase() : "";
  return normalizedCountryId.length > 0 ? normalizedCountryId : undefined;
}

function resolveTaxFreeGuideAvailability(countryId: string | null | undefined, guides: TaxFreeCountryGuide[]) {
  const normalizedCountryId = normalizeGuideCountryId(countryId);
  const country = normalizedCountryId
    ? countries.find((item) => item.countryId === normalizedCountryId)
    : undefined;
  const rule = normalizedCountryId ? getTaxFreeRule(normalizedCountryId) : undefined;
  const guide = normalizedCountryId ? guides.find((item) => item.countryId === normalizedCountryId) : undefined;
  const countryStatus = normalizeTaxFreeCountryStatus(country?.taxFreeStatus);
  const isGuideAvailable = Boolean(country && guide && rule && guide.status === countryStatus);

  return { country, rule, guide, countryStatus, isGuideAvailable };
}

export function isTaxFreeGuideAvailable(countryId: string, guides: TaxFreeCountryGuide[]): boolean {
  return resolveTaxFreeGuideAvailability(countryId, guides).isGuideAvailable;
}

export function getTaxFreeGuideDisplayModel(countryId: string, language: TranslationLanguage, t: Translate, guides: TaxFreeCountryGuide[], date = new Date()) {
  const { country, rule, guide, countryStatus, isGuideAvailable } = resolveTaxFreeGuideAvailability(countryId, guides);
  const policyDisplay = rule ? getTaxFreePolicyDisplayModel(rule, language, t) : undefined;
  const concisePresentation = guide ? getTaxFreeConcisePresentation(guide.countryId, date) : undefined;

  return {
    country,
    rule,
    guide,
    policyDisplay,
    countryStatus,
    isGuideAvailable,
    concisePresentation,
  };
}
