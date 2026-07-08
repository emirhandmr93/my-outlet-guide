import { createGenerator } from "./createGenerator";

export const generateTaxFreeRules = createGenerator({
  sourceFileName: "TaxFreeRules.csv",
  outputFileName: "taxFreeRules.ts",
  exportName: "taxFreeRules",
  rowMapper: (row) => ({
    countryCode: row.countryCode,
    countryName: row.countryName,
    countryId: row.countryId,
    currency: row.currency,
    vatRate: Number(row.vatRate),
    minimumPurchaseAmount: row.minimumPurchaseAmount
      ? Number(row.minimumPurchaseAmount)
      : undefined,
    providerFeeRate: row.providerFeeRate
      ? Number(row.providerFeeRate)
      : undefined,
    sourceUrl: row.sourceUrl,
    sourceName: row.sourceName,
    effectiveDate: row.effectiveDate,
    notes: row.notes,
  }),
});
