export type TaxFreeRule = {
  countryCode: string;
  countryName: string;
  countryId: string;
  currency: string;
  vatRate: number;
  minimumPurchaseAmount?: number;
  providerFeeRate?: number;
  sourceUrl: string;
  sourceName: string;
  effectiveDate: string;
  notes: string;
};

export const taxFreeRules: TaxFreeRule[] = [
  {
    countryCode: "FR",
    countryName: "France",
    countryId: "france",
    currency: "EUR",
    vatRate: 20,
    minimumPurchaseAmount: 100,
    sourceUrl:
      "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en",
    sourceName: "European Commission VAT rates",
    effectiveDate: "2026-07-08",
    notes:
      "Standard VAT rate only. Tax-free eligibility, minimum purchase rules, store participation, operator fees, and customs validation requirements can change and must be confirmed before purchase.",
  },
  {
    countryCode: "IT",
    countryName: "Italy",
    countryId: "italy",
    currency: "EUR",
    vatRate: 22,
    minimumPurchaseAmount: 70.01,
    sourceUrl:
      "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en",
    sourceName: "European Commission VAT rates",
    effectiveDate: "2026-07-08",
    notes:
      "Standard VAT rate only. Tax-free eligibility, minimum purchase rules, store participation, operator fees, and customs validation requirements can change and must be confirmed before purchase.",
  },
  {
    countryCode: "DE",
    countryName: "Germany",
    countryId: "germany",
    currency: "EUR",
    vatRate: 19,
    sourceUrl:
      "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en",
    sourceName: "European Commission VAT rates",
    effectiveDate: "2026-07-08",
    notes:
      "Standard VAT rate only. Provider/store fees and any purchase eligibility rules are not included because no source-backed fee rate is bundled in the app.",
  },
  {
    countryCode: "ES",
    countryName: "Spain",
    countryId: "spain",
    currency: "EUR",
    vatRate: 21,
    sourceUrl:
      "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en",
    sourceName: "European Commission VAT rates",
    effectiveDate: "2026-07-08",
    notes:
      "Standard VAT rate only. Provider/store fees and any purchase eligibility rules are not included because no source-backed fee rate is bundled in the app.",
  },
  {
    countryCode: "CH",
    countryName: "Switzerland",
    countryId: "switzerland",
    currency: "CHF",
    vatRate: 8.1,
    minimumPurchaseAmount: 300,
    sourceUrl: "https://www.estv.admin.ch/en/vat-rates-switzerland",
    sourceName: "Swiss Federal Tax Administration VAT rates",
    effectiveDate: "2026-07-08",
    notes:
      "Normal VAT rate only. Provider/store fees and final refund eligibility are not included because no source-backed fee rate is bundled in the app.",
  },
  {
    countryCode: "AE",
    countryName: "United Arab Emirates",
    countryId: "united-arab-emirates",
    currency: "AED",
    vatRate: 5,
    sourceUrl:
      "https://u.ae/en/information-and-services/finance-and-investment/taxation/vat/tax-refund-for-tourists",
    sourceName: "The Official Portal of the UAE Government",
    effectiveDate: "2026-07-08",
    notes:
      "Standard VAT rate only. UAE tourist refunds require registered retailers and validation; provider/store fees are not included.",
  },
  {
    countryCode: "JP",
    countryName: "Japan",
    countryId: "japan",
    currency: "JPY",
    vatRate: 10,
    sourceUrl:
      "https://www.jetro.go.jp/en/invest/setting_up/section3/page6.html",
    sourceName: "JETRO overview of consumption tax",
    effectiveDate: "2026-07-08",
    notes:
      "General consumption tax rate only; reduced-rate goods and store-specific tax-free procedures are not included.",
  },
];

export function getTaxFreeRule(countryId: string) {
  return taxFreeRules.find((rule) => rule.countryId === countryId);
}
