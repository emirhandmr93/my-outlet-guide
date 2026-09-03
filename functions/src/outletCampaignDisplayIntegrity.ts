import { officialCampaignSources, type OfficialCampaignSource } from "./outletCampaignSources";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clean(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function comparable(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("en-US");
}

function mcarthurGlenCore(outletName: string): string {
  return outletName
    .replace(/^McArthurGlen\s+/i, "")
    .replace(/^Designer Outlet\s+/i, "")
    .replace(/\s+Designer Outlet$/i, "")
    .trim();
}

export function campaignOutletAliases(source: OfficialCampaignSource): string[] {
  const aliases = new Set<string>([source.outletName]);
  if (source.operator === "mcarthurglen") {
    const withoutOperator = source.outletName.replace(/^McArthurGlen\s+/i, "").trim();
    const core = mcarthurGlenCore(source.outletName);
    aliases.add(withoutOperator);
    if (core.length >= 4) {
      aliases.add(`Designer Outlet ${core}`);
      aliases.add(`${core} Designer Outlet`);
      aliases.add(`McArthurGlen Designer Outlet ${core}`);
      aliases.add(`McArthurGlen ${core} Designer Outlet`);
    }
  } else if (source.operator === "the_bicester_collection") {
    aliases.add(`The Bicester Collection ${source.outletName}`);
  }
  return [...aliases]
    .map(value => clean(value, 180))
    .filter(value => value.length >= 4)
    .sort((left, right) => right.length - left.length || left.localeCompare(right));
}

const sourceByOutletId = new Map(officialCampaignSources.map(source => [source.outletId, source]));
const monitoredAliases = officialCampaignSources.flatMap(source =>
  campaignOutletAliases(source).map(alias => ({ outletId: source.outletId, alias })),
).sort((left, right) => right.alias.length - left.alias.length || left.alias.localeCompare(right.alias));
const monitoredAliasSet = new Set(monitoredAliases.map(({ alias }) => comparable(alias)));

export function canonicalCampaignOutletName(outletId: string, fallback = "Outlet"): string {
  return sourceByOutletId.get(outletId)?.outletName ?? fallback;
}

export function isMonitoredCampaignOutletReference(value: string): boolean {
  return monitoredAliasSet.has(comparable(value));
}

/**
 * Campaign pages are outlet-scoped. Some operator CMS pages reuse metadata from
 * another centre or use several operator-specific variants of the same outlet
 * name. Presentation copy must always identify the outlet selected by the
 * verified source URL. The untouched source URL/fingerprint remain stored for
 * auditability; this helper only normalizes player-facing text.
 */
export function sanitizeOfficialCampaignPresentationText(
  value: string,
  outletId: string,
  canonicalOutletName: string,
  maxLength: number,
): string {
  let normalized = clean(value, Math.max(maxLength * 2, maxLength));
  if (!normalized) return "";
  const source = sourceByOutletId.get(outletId);
  if (!source || source.outletName !== canonicalOutletName) return clean(normalized, maxLength);

  for (const { alias } of monitoredAliases) {
    normalized = normalized.replace(new RegExp(escapeRegExp(alias), "giu"), canonicalOutletName);
  }
  return clean(normalized, maxLength);
}

export function dedupeOfficialCampaignConditions(summary: string, conditions: string): string {
  const compactSummary = clean(summary, 700);
  const compactConditions = clean(conditions, 900);
  if (!compactSummary || !compactConditions) return compactConditions;
  if (comparable(compactSummary) === comparable(compactConditions)) return "";
  if (comparable(compactConditions).startsWith(comparable(compactSummary))) {
    return clean(compactConditions.slice(compactSummary.length).replace(/^[.。;:!?,，、\-–—]+\s*/, ""), 900);
  }
  return compactConditions;
}
