import { getTaxFreeRule } from "../constants/taxFreeRules";
import { getTaxFreeCountryGuide } from "../constants/taxFreeGuides";
import { countries } from "../constants/countries";
import { getTaxFreePolicyDisplayModel, normalizeTaxFreeCountryStatus } from "../utils/taxFreeDisplay";
import type { TranslationLanguage } from "../translations/translations";

type Translate = (key: string) => string;

function resolveTaxFreeGuideAvailability(countryId: string) {
  const country = countries.find((item) => item.countryId === countryId);
  const rule = getTaxFreeRule(countryId);
  const guide = getTaxFreeCountryGuide(countryId);
  const countryStatus = normalizeTaxFreeCountryStatus(country?.taxFreeStatus);
  const isGuideAvailable = Boolean(guide && rule && guide.status === countryStatus);
  return { country, rule, guide, countryStatus, isGuideAvailable };
}

export function isTaxFreeGuideAvailable(countryId: string): boolean {
  return resolveTaxFreeGuideAvailability(countryId).isGuideAvailable;
}

export function getTaxFreeGuideDisplayModel(countryId: string, language: TranslationLanguage, t: Translate) {
  const { country, rule, guide, countryStatus, isGuideAvailable } = resolveTaxFreeGuideAvailability(countryId);
  const policyDisplay = rule ? getTaxFreePolicyDisplayModel(rule, language, t) : undefined;
  return { country, rule, guide, policyDisplay, countryStatus, isGuideAvailable };
}
