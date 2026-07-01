import { generateConstantFromCsv } from "./baseCsvGenerator";

export function generateTaxFreeRules(): void {
  generateConstantFromCsv({
    csvFileName: "TaxFreeRules.csv",
    outputFileName: "taxFreeRules.ts",
    exportName: "taxFreeRules",
    mapRow: (row) => ({
      countryId: row.countryId,
      countryName: row.countryName,
      vatRate: Number(row.vatRate || 0),
      minimumSpend: row.minimumSpend,
      refundRate: row.refundRate ? Number(row.refundRate) : undefined,
      currency: row.currency || "EUR",
      note: row.note,
      status: row.status || "active",
    }),
  });
}
