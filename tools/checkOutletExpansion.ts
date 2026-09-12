import assert from "node:assert/strict";
import fs from "node:fs";
import { outlets } from "../src/constants/outlets";
import { cities } from "../src/constants/cities";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { expansionRoutes } from "../src/constants/expansionTransportationData";
import { expansionOutletMetadata } from "../src/constants/expansionOutletMetadata";
import { getTargetQuickInfo, localizeTargetGuide, targetContentLanguages } from "../src/constants/targetOutletLocalization";
import { expansionDistanceLabel } from "../src/constants/expansionOutletLocalization";
import { formatCityDisplayName } from "../src/utils/locationDisplay";
import { validateGlobalSnapshot } from "../src/services/masterDataValidator";
import { getTransportationV2Options, getTransportationOptionDisplayModel, setTransportationV2Records } from "../src/services/transportationV2Service";
import { masterDataCsv, checkMasterDataTable, syncMasterData } from "./syncMasterData";

const directoryIds = ["woodbury-common-premium-outlets", "sawgrass-mills", "orlando-vineland-premium-outlets", "las-vegas-north-premium-outlets", "desert-hills-premium-outlets", "san-francisco-premium-outlets", "siam-premium-outlets", "citygate-outlets", "mitsui-outlet-park-linkou"];
const completedIds = [...directoryIds, "yeoju-premium-outlets", "paju-premium-outlets", "busan-premium-outlets", "genting-highlands-premium-outlets", "shisui-premium-outlets", "kobe-sanda-premium-outlets", "sano-premium-outlets"];
const sameSet = (a: string[], b: string[], label: string) => assert.deepEqual([...new Set(a)].sort(), [...new Set(b)].sort(), label);
const brandIds = new Set(brands.map(b => b.brandId));
let sourceRows = 0;
for (const id of directoryIds) {
 const source = JSON.parse(fs.readFileSync(`data-sources/outlet-expansion-2026-09/raw/${id}.json`, "utf8"));
 const manifest = JSON.parse(fs.readFileSync(`data-sources/outlet-expansion-2026-09/${id}.json`, "utf8"));
 assert.equal(manifest.sourceRecordCount, source.rows.length, `${id}: source count mismatch`);
 assert.equal(manifest.rows.length, source.rows.length, `${id}: a source entry was dropped`);
 const activeBrands: string[] = [], activeDining: string[] = [];
 for (const [i, row] of manifest.rows.entries()) {
  assert(row.name && row.kind, `${id}/${i}: missing source disposition`);
  assert(row.brandIds?.length || row.restaurantId || row.reason, `${id}/${row.name}: unmapped/unexplained source record`);
  for (const b of row.brandIds ?? []) assert(brandIds.has(b), `${id}/${row.name}: invalid brand ${b}`);
  if (row.status === "active") { activeBrands.push(...(row.brandIds ?? [])); if (row.restaurantId) activeDining.push(row.restaurantId); }
 }
 const mapped = outletBrands.filter(r => r.outletId === id && r.relationStatus === "active");
 assert.equal(mapped.length, new Set(mapped.map(r => r.brandId)).size, `${id}: duplicate active brand`);
 sameSet(activeBrands, mapped.map(r => r.brandId), `${id}: active retail/source mismatch`);
 sameSet(activeDining, restaurants.filter(r => r.outletId === id && r.status === "active").map(r => r.restaurantId), `${id}: active dining/source mismatch`);
 sourceRows += source.rows.length;
}
for (const id of completedIds) {
 const o = outlets.find(o => o.outletId === id);
 assert(o && o.status === "active", `${id}: outlet is not visible`);
 assert(cities.some(c => c.cityId === o.cityId && c.countryId === o.countryId), `${id}: missing/mismatched city`);
 assert(Number.isFinite(Number(o.latitude)) && Math.abs(Number(o.latitude)) <= 90 && Number(o.latitude) !== 0, `${id}: invalid latitude`);
 assert(Number.isFinite(Number(o.longitude)) && Math.abs(Number(o.longitude)) <= 180 && Number(o.longitude) !== 0, `${id}: invalid longitude`);
 assert(o.address && o.websiteUrl?.startsWith("https://") && o.openingHours, `${id}: missing metadata`);
 assert(o.airports?.length && o.airports.every((a: any) => /^[A-Z]{3}$/.test(a.code) && a.name && a.distanceKm >= 0), `${id}: missing airport metadata`);
 assert(typeof o.cityCenterDistanceKm === "number" && o.cityCenterDistanceKm >= 0, `${id}: missing centre distance`);
 assert(transportation.some(t => t.outletId === id && t.status === "active" && t.cost && t.duration), `${id}: missing transport summary`);
 assert(restaurants.some(r => r.outletId === id && r.status === "active"), `${id}: missing dining`);
 for (const l of targetContentLanguages) {
  const copy = getTargetQuickInfo(id, l);
  assert(copy?.openingHours && copy.services.length && copy.parking && copy.storesCountText, `${id}/${l}: incomplete quick info`);
  assert(formatCityDisplayName(o.cityId, l), `${id}/${l}: city display missing`);
  assert(expansionDistanceLabel(l), `${id}/${l}: distance basis missing`);
 }
}
assert.equal(outlets.filter(o => o.countryId === "united-states" && o.status === "active").length, 6);
assert(!outlets.some(o => o.outletId === "siam-premium-outlet"), "Siam duplicate metadata identity");
const media = fs.readFileSync("src/media/outletMedia.ts", "utf8");
assert(media.includes('"siam-premium-outlets": ['), "Siam media key disconnected");
assert(media.includes('assets/outlet-images/siam-premium-outlet/hero.webp'), "Existing Siam image path must remain usable");
setTransportationV2Records(transportationGuides, transportationRouteFacts);
for (const r of expansionRoutes) {
 const guide = transportationGuides.find(g => g.guideId === r.guideId)!;
 const fact = transportationRouteFacts.find(f => f.guideId === r.guideId)!;
 assert(guide && fact && guide.updatedAt === r.checkedAt && fact.checkedAt === r.checkedAt, `${r.guideId}: missing verification date`);
 assert(r.fareMin >= 0 && r.fareMax >= r.fareMin && r.durationMax >= r.durationMin && r.durationMin > 0, `${r.guideId}: invalid numeric ranges`);
 assert(/^[A-Z]{3}$/.test(r.currency) && r.fareBasis && r.sources.every(u => /^https:\/\//.test(u)), `${r.guideId}: missing fare provenance`);
 const option = getTransportationV2Options(r.outletId).find(o => o.id === r.guideId);
 assert(option, `${r.guideId}: route hidden by runtime`);
 for (const l of targetContentLanguages) {
  const copy = localizeTargetGuide(guide, l)!;
  const display = getTransportationOptionDisplayModel(option, l);
  assert(copy && copy.steps.length >= 3 && copy.steps.length <= 6, `${r.guideId}/${l}: incomplete steps`);
  assert(copy.steps.every(s => s.trim() && !/\{(?:line|from|to)\}/.test(s)), `${r.guideId}/${l}: unresolved route`);
  assert.equal(display.estimatedFareLabel, copy.estimatedCost, `${r.guideId}/${l}: fare unit or localization lost`);
  if (r.fareMax > 0) assert(display.estimatedFareLabel.includes(r.currency), `${r.guideId}/${l}: missing currency`);
  else assert(!/Approx\.|Yaklaşık/.test(display.estimatedFareLabel), `${r.guideId}/${l}: a free fare must be exact`);
  assert(display.estimatedDurationLabel && display.officialProviderUrl && display.routeDetails.boardingPointLabel && display.routeDetails.alightingPointLabel, `${r.guideId}/${l}: incomplete display`);
  assert.equal(display.steps.length, copy.steps.length, `${r.guideId}/${l}: route steps disappeared`);
 }
}
// Regression: through-fare units, a free city shuttle, and an express train that skips the destination.
const byId = (id: string) => expansionRoutes.find(r => r.guideId === id)!;
assert.equal(byId("new-york-to-woodbury-common-bus").fareUnit, "roundTripFrom");
assert.equal(byId("downtown-las-vegas-to-north-premium-outlets-loop").fareMax, 0);
assert(byId("taipei-main-station-to-mitsui-outlet-park-linkou").notes.includes("commuter"));
assert.equal(byId("taipei-main-station-to-mitsui-outlet-park-linkou").fareMin, 75);
assert.equal(byId("tpe-to-mitsui-outlet-park-linkou-airport-mrt").fareMin, 60);
assert(byId("myeongdong-to-paju-premium-outlets").legs[0].line === "Line 4", "Myeongdong is not on Line 2");
// Real CSV failure modes: commas, quotes, CJK, newlines and nested metadata.
const fixture = [{ name: '春水堂, "Tea"\nCafe', airports: [{ code: "TPE", distanceKm: 14 }], services: ["A;B", "C,D"], active: true }];
checkMasterDataTable("fixture", fixture, masterDataCsv(fixture));
assert.throws(() => checkMasterDataTable("fixture", fixture, masterDataCsv(fixture).replace("TPE", "HKG")), /drift/);
const global = validateGlobalSnapshot();
assert(global.passed, JSON.stringify(global.issues));
syncMasterData(true);
console.log(`Outlet expansion passed: ${completedIds.length} outlets; ${sourceRows} accounted source entries; ${expansionRoutes.length} routes × ${targetContentLanguages.length} languages; ${Object.keys(expansionOutletMetadata).length} new outlets.`);
