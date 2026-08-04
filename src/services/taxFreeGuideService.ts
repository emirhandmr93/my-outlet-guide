import { getTaxFreeRule } from "../constants/taxFreeRules";
import { getTaxFreeCountryGuide } from "../constants/taxFreeGuides";
import { countries } from "../constants/countries";
import { getTaxFreePolicyDisplayModel, normalizeTaxFreeCountryStatus } from "../utils/taxFreeDisplay";
import type { TranslationLanguage } from "../translations/translations";

type Translate = (key: string) => string;

export function getTaxFreeGuideDisplayModel(countryId: string, language: TranslationLanguage, t: Translate) {
  const country = countries.find((item) => item.countryId === countryId);
  const rule = getTaxFreeRule(countryId);
  const guide = getTaxFreeCountryGuide(countryId);
  const policyDisplay = rule ? getTaxFreePolicyDisplayModel(rule, language, t) : undefined;
  return {
    country,
    rule,
    guide,
    policyDisplay,
    countryStatus: normalizeTaxFreeCountryStatus(country?.taxFreeStatus),
    isGuideAvailable: Boolean(guide && rule && guide.status === normalizeTaxFreeCountryStatus(country?.taxFreeStatus)),
  };
}
