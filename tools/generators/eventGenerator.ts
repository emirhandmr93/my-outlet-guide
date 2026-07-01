import { generateConstantFromCsv } from "./baseCsvGenerator";

export function generateEvents(): void {
  generateConstantFromCsv({
    csvFileName: "Events.csv",
    outputFileName: "events.ts",
    exportName: "events",
    mapRow: (row) => ({
      eventId: row.eventId,
      outletId: row.outletId,
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
