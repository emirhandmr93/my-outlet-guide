import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { hasWebSeoTransportation } from "../src/constants/webSeoTransportation";
import {
  getWebSeoBreadcrumbs,
  getWebSeoInternalLinks,
  isWebSeoPublicOutlet,
  type WebSeoInternalLink,
  type WebSeoLogicalPage,
} from "../src/constants/webSeo";
import { resolveTranslation } from "../src/i18n/translationResolver";
import type { TranslationLanguage } from "../src/translations/locale";

const CAPACITY = 40;
const PROTECTED_BRAND_IDS: ReadonlySet<string> = new Set([
  "tissot",
  "yves-saint-laurent",
  "carters",
  "giordano",
  "umbro",
  "wilson",
]);

const activeBrandById = new Map(
  brands.filter((brand) => brand.brandStatus === "active").map((brand) => [brand.brandId, brand] as const),
);
const publicOutletById = new Map(
  outlets.filter(isWebSeoPublicOutlet).map((outlet) => [outlet.outletId, outlet] as const),
);

const relationOutletsByBrandId = new Map<string, string[]>();
const relationBrandsByOutletId = new Map<string, string[]>();
for (const relation of outletBrands) {
  if (relation.relationStatus !== "active") continue;
  if (!activeBrandById.has(relation.brandId) || !publicOutletById.has(relation.outletId)) continue;

  const outletsForBrand = relationOutletsByBrandId.get(relation.brandId) ?? [];
  if (!outletsForBrand.includes(relation.outletId)) outletsForBrand.push(relation.outletId);
  relationOutletsByBrandId.set(relation.brandId, outletsForBrand);

  const brandsForOutlet = relationBrandsByOutletId.get(relation.outletId) ?? [];
  if (!brandsForOutlet.includes(relation.brandId)) brandsForOutlet.push(relation.brandId);
  relationBrandsByOutletId.set(relation.outletId, brandsForOutlet);
}
for (const [brandId, outletIds] of relationOutletsByBrandId) {
  relationOutletsByBrandId.set(brandId, [...outletIds].sort());
}

const legacyLoad = new Map<string, number>();
const legacyOutletByBrandId = new Map<string, string>();
for (const brand of activeBrandById.values()) {
  const candidates = [...(relationOutletsByBrandId.get(brand.brandId) ?? [])].sort(
    (a, b) => (legacyLoad.get(a) ?? 0) - (legacyLoad.get(b) ?? 0) || a.localeCompare(b),
  );
  const chosen = candidates[0];
  if (!chosen) continue;
  legacyOutletByBrandId.set(brand.brandId, chosen);
  legacyLoad.set(chosen, (legacyLoad.get(chosen) ?? 0) + 1);
}

const prioritizedBrands = [...activeBrandById.values()]
  .filter((brand) => relationOutletsByBrandId.has(brand.brandId))
  .sort(
    (a, b) =>
      Number(PROTECTED_BRAND_IDS.has(b.brandId)) - Number(PROTECTED_BRAND_IDS.has(a.brandId)) ||
      b.rankingWeight - a.rankingWeight ||
      (relationOutletsByBrandId.get(b.brandId)?.length ?? 0) -
        (relationOutletsByBrandId.get(a.brandId)?.length ?? 0) ||
      a.brandId.localeCompare(b.brandId),
  );
const priorityByBrandId = new Map(prioritizedBrands.map((brand, index) => [brand.brandId, index] as const));
const candidatesByBrandId = new Map(
  prioritizedBrands.map((brand) => [
    brand.brandId,
    [...(relationOutletsByBrandId.get(brand.brandId) ?? [])].sort(
      (a, b) =>
        Number(b === legacyOutletByBrandId.get(brand.brandId)) -
          Number(a === legacyOutletByBrandId.get(brand.brandId)) ||
        a.localeCompare(b),
    ),
  ] as const),
);

const assignedOutletByBrandId = new Map<string, string>();
const occupantBrandIdsByOutletId = new Map<string, string[]>();

function assign(brandId: string, outletId: string) {
  const previousOutletId = assignedOutletByBrandId.get(brandId);
  if (previousOutletId && previousOutletId !== outletId) {
    occupantBrandIdsByOutletId.set(
      previousOutletId,
      (occupantBrandIdsByOutletId.get(previousOutletId) ?? []).filter((id) => id !== brandId),
    );
  }
  assignedOutletByBrandId.set(brandId, outletId);
  const occupants = occupantBrandIdsByOutletId.get(outletId) ?? [];
  if (!occupants.includes(brandId)) occupantBrandIdsByOutletId.set(outletId, [...occupants, brandId]);
}

function place(
  brandId: string,
  seenBrandIds: Set<string>,
  seenOutletIds: Set<string>,
): boolean {
  if (seenBrandIds.has(brandId)) return false;
  seenBrandIds.add(brandId);

  for (const outletId of candidatesByBrandId.get(brandId) ?? []) {
    if (seenOutletIds.has(outletId)) continue;
    seenOutletIds.add(outletId);

    const occupants = occupantBrandIdsByOutletId.get(outletId) ?? [];
    if (occupants.length < CAPACITY) {
      assign(brandId, outletId);
      return true;
    }

    const movable = [...occupants].sort(
      (a, b) =>
        (priorityByBrandId.get(b) ?? Number.MAX_SAFE_INTEGER) -
          (priorityByBrandId.get(a) ?? Number.MAX_SAFE_INTEGER) ||
        b.localeCompare(a),
    );
    for (const movedBrandId of movable) {
      if (place(movedBrandId, seenBrandIds, seenOutletIds)) {
        assign(brandId, outletId);
        return true;
      }
    }
  }
  return false;
}

for (const brand of prioritizedBrands) {
  place(brand.brandId, new Set<string>(), new Set<string>());
}

const selectedBrandIdsByOutletId = new Map<string, string[]>();
for (const [outletId, relatedBrandIds] of relationBrandsByOutletId) {
  const assignedHere = relatedBrandIds.filter((brandId) => assignedOutletByBrandId.get(brandId) === outletId);
  const selected = [...assignedHere, ...relatedBrandIds]
    .filter((brandId, index, all) => all.indexOf(brandId) === index)
    .slice(0, CAPACITY);
  selectedBrandIdsByOutletId.set(outletId, selected);
}

function addUnique(
  links: WebSeoInternalLink[],
  page: WebSeoLogicalPage,
  name: string,
  path: string,
  relationship: WebSeoInternalLink["relationship"] = "discovery",
) {
  if (path !== page.path && !links.some((item) => item.path === path)) {
    links.push({ name, path, relationship });
  }
}

function baseLinks(page: WebSeoLogicalPage, language: TranslationLanguage): WebSeoInternalLink[] {
  return getWebSeoBreadcrumbs(page, language)
    .slice(0, -1)
    .map((item) => ({ ...item, relationship: "breadcrumb" as const }));
}

export function getFastWebSeoInternalLinks(
  page: WebSeoLogicalPage,
  language: TranslationLanguage,
): WebSeoInternalLink[] {
  if (page.kind !== "outlet" && page.kind !== "brand") {
    return getWebSeoInternalLinks(page, language);
  }

  const links = baseLinks(page, language);

  if (page.kind === "brand") {
    const brandId = page.path.slice("brand/".length);
    for (const outletId of relationOutletsByBrandId.get(brandId) ?? []) {
      const outlet = publicOutletById.get(outletId);
      if (outlet) addUnique(links, page, outlet.name, `outlet/${outletId}`, "brand");
    }
    if (!links.length) addUnique(links, page, resolveTranslation(language, "nav.home"), "");
    return links;
  }

  if (hasWebSeoTransportation(page.outletId!)) {
    addUnique(
      links,
      page,
      `${resolveTranslation(language, "transportation.title")}: ${page.entityName}`,
      `transportation/${page.outletId}`,
      "transportation",
    );
  }
  for (const brandId of selectedBrandIdsByOutletId.get(page.outletId!) ?? []) {
    const brand = activeBrandById.get(brandId);
    if (brand) addUnique(links, page, brand.brandName, `brand/${brandId}`, "brand");
  }
  if (!links.length) addUnique(links, page, resolveTranslation(language, "nav.home"), "");
  return links;
}
