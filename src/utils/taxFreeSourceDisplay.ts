import type { TaxFreeSource } from "../constants/taxFreeRules";
import type { TranslationLanguage } from "../translations/translations";

type Translate = (key: string) => string;

export const taxFreeSourceTranslationKeys = {
  "Agenzia delle Entrate": "taxFreeSource.agenziaDelleEntrate",
  "European Commission — VAT rates": "taxCalc.sourceEuropeanCommissionVatRates",
  "European Commission — VAT refunds": "taxFreeSource.europeanCommissionVatRefunds",
  "French Customs": "taxFreeSource.frenchCustoms",
  "Invest KOREA / KOTRA": "taxFreeSource.investKoreaKotra",
  "Japan National Tax Agency": "taxFreeSource.japanNationalTaxAgency",
  "Japan Tourism Agency": "taxFreeSource.japanTourismAgency",
  "Japan Tourism Agency — refund-system transition": "taxFreeSource.japanTourismAgencyTransition",
  "Korea Tourism Organization / VISITKOREA": "taxFreeSource.koreaTourismVisitKorea",
  "Norwegian Customs": "taxFreeSource.norwegianCustoms",
  "Norwegian Tax Administration": "taxFreeSource.norwegianTaxAdministration",
  "Portuguese Tax and Customs Authority": "taxFreeSource.portugueseTaxCustoms",
  "State Taxation Administration": "taxFreeSource.stateTaxationAdministration",
  "Swiss Federal Tax Administration": "taxFreeSource.swissFederalTaxAdministration",
  "Thailand Revenue Department": "taxFreeSource.thailandRevenueDepartment",
  "Turkish Revenue Administration": "taxFreeSource.turkishRevenueAdministration",
  "UAE Government Portal": "taxFreeSource.uaeGovernmentPortal",
} as const;

export function isMappedTaxFreeSourceName(name: string) {
  return Object.prototype.hasOwnProperty.call(taxFreeSourceTranslationKeys, name);
}

export function getLocalizedTaxFreeSourceName(
  source: TaxFreeSource,
  _language: TranslationLanguage,
  t: Translate,
) {
  const key = taxFreeSourceTranslationKeys[source.name as keyof typeof taxFreeSourceTranslationKeys];
  return key ? t(key) : source.name;
}
