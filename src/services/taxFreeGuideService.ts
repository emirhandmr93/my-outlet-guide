import { getTaxFreeRule } from "../constants/taxFreeRules";
import type { TaxFreeCountryGuide } from "../constants/taxFreeGuides";
import { countries } from "../constants/countries";
import { getTaxFreePolicyDisplayModel, normalizeTaxFreeCountryStatus } from "../utils/taxFreeDisplay";
import type { TranslationLanguage } from "../translations/locale";

type Translate = (key: string) => string;

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

export function getTaxFreeGuideDisplayModel(countryId: string, language: TranslationLanguage, t: Translate, guides: TaxFreeCountryGuide[]) {
  const { country, rule, guide, countryStatus, isGuideAvailable } = resolveTaxFreeGuideAvailability(countryId, guides);
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
