import { generateConstantFromCsv } from "./baseCsvGenerator";

export function generateTransportationGuides(): void {
  generateConstantFromCsv({
    csvFileName: "TransportationGuides.csv",
    outputFileName: "transportationGuides.ts",
    exportName: "transportationGuides",
    mapRow: (row) => ({
      guideId: row.guideId,
      outletId: row.outletId,
      language: row.language || "en",
      title: row.title,
      summary: row.summary,
      steps: row.steps ? row.steps.split(";").map((step) => step.trim()).filter(Boolean) : [],
      estimatedDuration: row.estimatedDuration,
      estimatedPrice: row.estimatedPrice,
      bestFor: row.bestFor,
      status: row.status || "active",
    }),
  });
}
