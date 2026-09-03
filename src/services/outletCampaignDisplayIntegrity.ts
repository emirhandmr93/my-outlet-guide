import { officialCampaignHostsByOutlet } from "../constants/officialCampaignHosts";
import { outlets } from "../constants/outlets";

export type CampaignPresentationText = {
  brandName: string;
  headline: string;
  summary: string;
  conditions: string;
  discountLabel: string;
};

const trackedOutletIds = new Set(Object.keys(officialCampaignHostsByOutlet));
const trackedOutlets = outlets
  .filter(outlet => typeof outlet.outletId === "string" && trackedOutletIds.has(outlet.outletId))
  .flatMap(outlet => typeof outlet.name === "string" && outlet.name.trim()
    ? [{ outletId: outlet.outletId as string, name: outlet.name.trim() }]
    : []);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compact(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function outletAliases(name: string): string[] {
  const aliases = new Set<string>([name]);
  const withoutOperator = name.replace(/^McArthurGlen\s+/i, "").trim();
  const hasDesignerOutlet = /(?:^Designer Outlet\s+|\s+Designer Outlet$)/i.test(withoutOperator);
  if (hasDesignerOutlet || /^McArthurGlen\s+/i.test(name)) {
    const core = withoutOperator
      .replace(/^Designer Outlet\s+/i, "")
      .replace(/\s+Designer Outlet$/i, "")
      .trim();
    aliases.add(withoutOperator);
    if (core.length >= 4) {
      aliases.add(`Designer Outlet ${core}`);
      aliases.add(`${core} Designer Outlet`);
      aliases.add(`McArthurGlen Designer Outlet ${core}`);
      aliases.add(`McArthurGlen ${core} Designer Outlet`);
    }
  }
  if (/\bVillage$/i.test(name)) aliases.add(`The Bicester Collection ${name}`);
  return [...aliases].filter(value => value.length >= 4)
    .sort((left, right) => right.length - left.length || left.localeCompare(right));
}

const monitoredAliases = trackedOutlets.flatMap(outlet =>
  outletAliases(outlet.name).map(alias => ({ outletId: outlet.outletId, alias })),
).sort((left, right) => right.alias.length - left.alias.length || left.alias.localeCompare(right.alias));
const normalizedMonitoredAliases = new Set(monitoredAliases.map(({ alias }) => compact(alias).toLocaleLowerCase("en-US")));

export function getCanonicalCampaignOutletName(outletId: string): string | null {
  return trackedOutlets.find(outlet => outlet.outletId === outletId)?.name ?? null;
}

export function isTrackedCampaignOutletReference(value: string): boolean {
  return normalizedMonitoredAliases.has(compact(value).toLocaleLowerCase("en-US"));
}

export function sanitizeCampaignPresentationValue(
  value: string,
  outletId: string,
  canonicalOutletName: string,
  maxLength: number,
): string {
  let normalized = compact(value);
  const canonical = getCanonicalCampaignOutletName(outletId);
  if (!canonical || canonical !== canonicalOutletName) return normalized.slice(0, maxLength);
  for (const { alias } of monitoredAliases) {
    normalized = normalized.replace(new RegExp(escapeRegExp(alias), "giu"), canonicalOutletName);
  }
  return compact(normalized).slice(0, maxLength);
}

function dedupeConditions(summary: string, conditions: string): string {
  const compactSummary = compact(summary);
  const compactConditions = compact(conditions);
  if (!compactConditions || !compactSummary) return compactConditions;
  if (compactConditions.localeCompare(compactSummary, undefined, { sensitivity: "accent" }) === 0) return "";
  if (compactConditions.toLocaleLowerCase().startsWith(compactSummary.toLocaleLowerCase())) {
    return compact(compactConditions.slice(compactSummary.length).replace(/^[.。;:!?,，、\-–—]+\s*/, ""));
  }
  return compactConditions;
}

export function sanitizeCampaignPresentationText(
  text: CampaignPresentationText,
  outletId: string,
  canonicalOutletName: string,
): CampaignPresentationText {
  const summary = sanitizeCampaignPresentationValue(text.summary, outletId, canonicalOutletName, 700);
  const conditions = sanitizeCampaignPresentationValue(text.conditions, outletId, canonicalOutletName, 900);
  return {
    brandName: text.brandName,
    headline: sanitizeCampaignPresentationValue(text.headline, outletId, canonicalOutletName, 200),
    summary,
    conditions: dedupeConditions(summary, conditions),
    discountLabel: sanitizeCampaignPresentationValue(text.discountLabel, outletId, canonicalOutletName, 160),
  };
}
