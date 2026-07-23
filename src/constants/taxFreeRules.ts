export type TaxFreeCountryStatus = "available" | "not_available" | "not_verified";
export type MinimumPurchaseStatus = "verified_amount" | "no_statutory_minimum" | "not_verified";
export type MinimumPurchaseComparison = "at_least" | "greater_than";

export type TaxFreeRule = {
  countryCode: string;
  countryName: string;
  countryId: string;
  currency: string;
  vatRate: number;
  minimumPurchaseAmount?: number;
  providerFeeRate?: number;
  minimumPurchaseBasis?: "gross" | "net";
  minimumPurchaseComparison?: MinimumPurchaseComparison;
  minimumPurchaseStatus: MinimumPurchaseStatus;
  refundEstimateMode: "maximum_vat_component";
  sourceUrl: string;
  sourceName: string;
  effectiveDate: string;
  notes: string;
};

const euVatRatesUrl = "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en";
const checkedDate = "2026-07-23";
const euNotes = "European Commission VAT rate reference. Confirm tourist-retail eligibility and retailer participation before purchase; the estimate is the maximum VAT component before operator and administration fees.";

export const taxFreeRules: TaxFreeRule[] = [
  { countryCode: "CN", countryName: "China", countryId: "china", currency: "CNY", vatRate: 13, minimumPurchaseAmount: 200, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount", refundEstimateMode: "maximum_vat_component", sourceUrl: "https://english.www.gov.cn/policies/latestreleases/202304/01/content_WS6427d39bc6d0f528699dbb39.html", sourceName: "The State Council of the People’s Republic of China", effectiveDate: checkedDate, notes: "Official departure tax-refund policy; CNY 200 is modeled only for the official refund-shopping minimum." },
  { countryCode: "AT", countryName: "Austria", countryId: "austria", currency: "EUR", vatRate: 20, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "BE", countryName: "Belgium", countryId: "belgium", currency: "EUR", vatRate: 21, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "BG", countryName: "Bulgaria", countryId: "bulgaria", currency: "EUR", vatRate: 20, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "HR", countryName: "Croatia", countryId: "croatia", currency: "EUR", vatRate: 25, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "CZ", countryName: "Czech Republic", countryId: "czech-republic", currency: "CZK", vatRate: 21, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "DK", countryName: "Denmark", countryId: "denmark", currency: "DKK", vatRate: 25, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "EE", countryName: "Estonia", countryId: "estonia", currency: "EUR", vatRate: 24, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "FI", countryName: "Finland", countryId: "finland", currency: "EUR", vatRate: 25.5, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "FR", countryName: "France", countryId: "france", currency: "EUR", vatRate: 20, minimumPurchaseAmount: 100, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "DE", countryName: "Germany", countryId: "germany", currency: "EUR", vatRate: 19, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "GR", countryName: "Greece", countryId: "greece", currency: "EUR", vatRate: 24, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "HU", countryName: "Hungary", countryId: "hungary", currency: "HUF", vatRate: 27, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "IE", countryName: "Ireland", countryId: "ireland", currency: "EUR", vatRate: 23, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "IT", countryName: "Italy", countryId: "italy", currency: "EUR", vatRate: 22, minimumPurchaseAmount: 70, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "LV", countryName: "Latvia", countryId: "latvia", currency: "EUR", vatRate: 21, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "LT", countryName: "Lithuania", countryId: "lithuania", currency: "EUR", vatRate: 21, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "NL", countryName: "Netherlands", countryId: "netherlands", currency: "EUR", vatRate: 21, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "PL", countryName: "Poland", countryId: "poland", currency: "PLN", vatRate: 23, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "PT", countryName: "Portugal", countryId: "portugal", currency: "EUR", vatRate: 23, minimumPurchaseAmount: 50, minimumPurchaseBasis: "net", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount", refundEstimateMode: "maximum_vat_component", sourceUrl: "https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/Pages/faqs-00950.aspx", sourceName: "Portuguese Tax and Customs Authority", effectiveDate: checkedDate, notes: "Purchase value must exceed EUR 50 excluding VAT. The estimate is the maximum VAT component before operator and administration fees." },
  { countryCode: "RO", countryName: "Romania", countryId: "romania", currency: "RON", vatRate: 19, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "SK", countryName: "Slovakia", countryId: "slovakia", currency: "EUR", vatRate: 23, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "ES", countryName: "Spain", countryId: "spain", currency: "EUR", vatRate: 21, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "SE", countryName: "Sweden", countryId: "sweden", currency: "SEK", vatRate: 25, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: euVatRatesUrl, sourceName: "European Commission — VAT rates", effectiveDate: checkedDate, notes: euNotes },
  { countryCode: "CH", countryName: "Switzerland", countryId: "switzerland", currency: "CHF", vatRate: 8.1, minimumPurchaseAmount: 300, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount", refundEstimateMode: "maximum_vat_component", sourceUrl: "https://www.estv.admin.ch/en/tax-free-for-tourists", sourceName: "Swiss Federal Tax Administration", effectiveDate: checkedDate, notes: "Swiss tax-free shopping threshold and VAT conditions must be confirmed with the retailer." },
  { countryCode: "NO", countryName: "Norway", countryId: "norway", currency: "NOK", vatRate: 25, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: "https://www.toll.no/en/travelling-to-and-from-norway/reimbursement-of-vat-to-tourists", sourceName: "Norwegian Tax Administration", effectiveDate: checkedDate, notes: "Official Norwegian Tax Administration tourist VAT refund guidance; no numeric minimum is modeled without a verified source." },
  { countryCode: "TR", countryName: "Turkey", countryId: "turkey", currency: "TRY", vatRate: 20, minimumPurchaseAmount: 1000, minimumPurchaseBasis: "net", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount", refundEstimateMode: "maximum_vat_component", sourceUrl: "https://cdn.gib.gov.tr/api/gibportal-file/file/getFile?objectKey=MEVZUAT_TEBLIGLER%2FUNIVERSAL%2F2026%2Fkdv_genteb.pdf", sourceName: "Turkish Revenue Administration", effectiveDate: checkedDate, notes: "The consolidated VAT communiqué requires an invoice value above TRY 1,000 excluding VAT." },
  { countryCode: "AE", countryName: "United Arab Emirates", countryId: "united-arab-emirates", currency: "AED", vatRate: 5, minimumPurchaseStatus: "not_verified", refundEstimateMode: "maximum_vat_component", sourceUrl: "https://u.ae/en/information-and-services/finance-and-investment/taxation/vat/tax-refund-for-tourists", sourceName: "UAE Government Portal", effectiveDate: checkedDate, notes: "Official UAE tourist VAT refund guidance; retailer participation and final refund conditions apply." },
];

export function getTaxFreeRule(countryId: string) {
  return taxFreeRules.find((rule) => rule.countryId === countryId);
}
