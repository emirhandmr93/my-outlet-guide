import { getTaxFreeRule } from "../constants/taxFreeRules";
import { getTaxFreeCountryGuide } from "../constants/taxFreeGuides";
import { countries } from "../constants/countries";
import { getTaxFreePolicyDisplayModel, normalizeTaxFreeCountryStatus } from "../utils/taxFreeDisplay";
import type { TranslationLanguage } from "../translations/translations";

type Translate = (key: string) => string;

function normalizeGuideCountryId(countryId: string | null | undefined): string | undefined {
  const normalizedCountryId = typeof countryId === "string" ? countryId.trim().toLowerCase() : "";
  return normalizedCountryId.length > 0 ? normalizedCountryId : undefined;
}

function resolveTaxFreeGuideAvailability(countryId: string | null | undefined) {
  const normalizedCountryId = normalizeGuideCountryId(countryId);
  const country = normalizedCountryId
    ? countries.find((item) => item.countryId === normalizedCountryId)
    : undefined;
  const rule = normalizedCountryId ? getTaxFreeRule(normalizedCountryId) : undefined;
  const guide = normalizedCountryId ? getTaxFreeCountryGuide(normalizedCountryId) : undefined;
  const countryStatus = normalizeTaxFreeCountryStatus(country?.taxFreeStatus);
  const isGuideAvailable = Boolean(country && guide && rule && guide.status === countryStatus);

  return { country, rule, guide, countryStatus, isGuideAvailable };
}

export function isTaxFreeGuideAvailable(countryId: string): boolean {
  return resolveTaxFreeGuideAvailability(countryId).isGuideAvailable;
}

export function getTaxFreeGuideDisplayModel(countryId: string, language: TranslationLanguage, t: Translate) {
  const { country, rule, guide, countryStatus, isGuideAvailable } = resolveTaxFreeGuideAvailability(countryId);
  const policyDisplay = rule ? getTaxFreePolicyDisplayModel(rule, language, t) : undefined;

  return {
    country,
    rule,
    guide,
    policyDisplay,
    countryStatus,
    isGuideAvailable,
  };
}
