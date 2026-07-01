import { generateConstantFromCsv } from "./baseCsvGenerator";

export function generateDeals(): void {
  generateConstantFromCsv({
    csvFileName: "Deals.csv",
    outputFileName: "deals.ts",
    exportName: "deals",
    mapRow: (row) => ({
      dealId: row.dealId,
      outletId: row.outletId,
      brandId: row.brandId || undefined,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      endDate: row.endDate,
      language: row.language || "en",
      status: row.status || "active",
      priority: Number(row.priority || 0),
    }),
  });
}
