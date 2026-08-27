export type OutletVisitProgress = {
  schemaVersion: 2;
  outletId: string;
  checkedBrandIds: string[];
  priorityBrandIds: string[];
  orderedBrandIds: string[];
  note: string;
  startedAt: number;
  updatedAt: number;
};

const MAX_CHECKED_BRANDS = 1_000;
const MAX_NOTE_LENGTH = 1_000;

function uniqueAllowedBrandIds(values: unknown, allowedBrandIds: readonly string[]) {
  if (!Array.isArray(values)) return [];
  const allowed = new Set(allowedBrandIds);
  return Array.from(new Set(values.filter(
    (value): value is string => typeof value === "string" && allowed.has(value),
  ))).slice(0, MAX_CHECKED_BRANDS);
}

function normalizeBrandOrder(values: unknown, allowedBrandIds: readonly string[]) {
  const ordered = uniqueAllowedBrandIds(values, allowedBrandIds);
  const included = new Set(ordered);
  return [...ordered, ...allowedBrandIds.filter((brandId) => !included.has(brandId))];
}

function normalizeNote(value: unknown) {
  return typeof value === "string" ? value.slice(0, MAX_NOTE_LENGTH) : "";
}

export function normalizeOutletVisitProgress(
  value: unknown,
  outletId: string,
  allowedBrandIds: readonly string[],
  now = Date.now(),
): OutletVisitProgress {
  const candidate = value && typeof value === "object" && !Array.isArray(value)
    ? value as Partial<OutletVisitProgress>
    : {};
  const startedAt = typeof candidate.startedAt === "number" && Number.isFinite(candidate.startedAt)
    ? candidate.startedAt
    : now;
  const updatedAt = typeof candidate.updatedAt === "number" && Number.isFinite(candidate.updatedAt)
    ? candidate.updatedAt
    : now;

  return {
    schemaVersion: 2,
    outletId,
    checkedBrandIds: uniqueAllowedBrandIds(candidate.checkedBrandIds, allowedBrandIds),
    priorityBrandIds: uniqueAllowedBrandIds(candidate.priorityBrandIds, allowedBrandIds),
    orderedBrandIds: normalizeBrandOrder(candidate.orderedBrandIds, allowedBrandIds),
    note: normalizeNote(candidate.note),
    startedAt,
    updatedAt,
  };
}

export function toggleOutletVisitPriority(
  progress: OutletVisitProgress,
  brandId: string,
  allowedBrandIds: readonly string[],
  now = Date.now(),
): OutletVisitProgress {
  if (!allowedBrandIds.includes(brandId)) return progress;
  const priority = new Set(progress.priorityBrandIds);
  if (priority.has(brandId)) priority.delete(brandId);
  else priority.add(brandId);
  return normalizeOutletVisitProgress(
    { ...progress, priorityBrandIds: Array.from(priority), updatedAt: now },
    progress.outletId,
    allowedBrandIds,
    now,
  );
}

export function moveOutletVisitBrand(
  progress: OutletVisitProgress,
  brandId: string,
  direction: -1 | 1,
  allowedBrandIds: readonly string[],
  now = Date.now(),
): OutletVisitProgress {
  const order = normalizeBrandOrder(progress.orderedBrandIds, allowedBrandIds);
  const currentIndex = order.indexOf(brandId);
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= order.length) return progress;
  [order[currentIndex], order[targetIndex]] = [order[targetIndex], order[currentIndex]];
  return normalizeOutletVisitProgress(
    { ...progress, orderedBrandIds: order, updatedAt: now },
    progress.outletId,
    allowedBrandIds,
    now,
  );
}

export function setOutletVisitNote(
  progress: OutletVisitProgress,
  note: string,
  allowedBrandIds: readonly string[],
  now = Date.now(),
): OutletVisitProgress {
  return normalizeOutletVisitProgress(
    { ...progress, note, updatedAt: now },
    progress.outletId,
    allowedBrandIds,
    now,
  );
}

export function toggleOutletVisitBrand(
  progress: OutletVisitProgress,
  brandId: string,
  allowedBrandIds: readonly string[],
  now = Date.now(),
): OutletVisitProgress {
  const allowed = new Set(allowedBrandIds);
  if (!allowed.has(brandId)) return progress;
  const checked = new Set(progress.checkedBrandIds);
  if (checked.has(brandId)) checked.delete(brandId);
  else checked.add(brandId);
  return normalizeOutletVisitProgress(
    { ...progress, checkedBrandIds: Array.from(checked), updatedAt: now },
    progress.outletId,
    allowedBrandIds,
    now,
  );
}
