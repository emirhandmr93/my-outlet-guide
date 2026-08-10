import assert from "node:assert/strict";
import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { brands } from "../src/constants/brands";
import { transportationGuides } from "../src/constants/transportationGuides";
import { localizeTargetGuide, targetContentLanguages, targetOutletQuickInfo } from "../src/constants/targetOutletLocalization";

const targetOutletIds = ["al-khiran-hybrid-outlet-mall","dubai-outlet-mall","the-outlet-village","rinku-premium-outlets","gotemba-premium-outlets","mitsui-outlet-park-kisarazu"];
const guides = transportationGuides.filter((guide) => targetOutletIds.includes(guide.outletId));
const prohibited = /check\s+(?:the\s+)?(?:official|current|timetable|fare|route|operator|provider|availability)|confirm\s+(?:the\s+)?(?:current|service|fare|timetable|operator)|ask\s+station\s+staff|journey\s+planner|verify\s+(?:the\s+)?(?:current|timetable|public transport)/i;
assert.equal(new Set(guides.map(({guideId})=>guideId)).size,guides.length,"duplicate target guideId");
for(const guide of guides){
 assert(targetOutletIds.includes(guide.outletId) && outlets.some(({outletId})=>outletId===guide.outletId),`${guide.guideId}: invalid outletId`);
 assert(guide.originId.trim() && guide.transportationType && guide.title.trim(),`${guide.guideId}: incomplete route identity`);
 assert(guide.estimatedDuration.trim(),`${guide.guideId}: empty duration`); assert(guide.estimatedCost.trim(),`${guide.guideId}: empty cost`);
 assert(guide.steps.length && guide.steps.every(step=>step.description.trim()),`${guide.guideId}: empty steps`);
 assert(!prohibited.test([guide.title,guide.estimatedDuration,guide.estimatedCost,...guide.steps.map(({description})=>description)].join(" ")),`${guide.guideId}: fallback wording`);
 for(const language of targetContentLanguages){const copy=localizeTargetGuide(guide,language);assert(copy,`${guide.guideId}/${language}: missing localization`);assert(copy!.title.trim()&&copy!.estimatedDuration.trim()&&copy!.estimatedCost.trim()&&copy!.steps.every(Boolean),`${guide.guideId}/${language}: incomplete localization`);}
}
for(const outletId of targetOutletIds){for(const language of targetContentLanguages){const copy=targetOutletQuickInfo[outletId]?.[language];assert(copy?.openingHours&&copy.parking&&copy.storesCountText&&copy.services.length&&copy.cityCenterName,`${outletId}/${language}: incomplete Quick Information`);}}
const alKhiran=outletBrands.filter(({outletId})=>outletId==="al-khiran-hybrid-outlet-mall");
assert.equal(alKhiran.length,44,"Al Khiran displayed/mapped brand count changed");
assert.equal(new Set(alKhiran.map(({brandId})=>brandId)).size,44,"Al Khiran has duplicate brands");
const brandIds=new Set(brands.map(({brandId})=>brandId)); assert(alKhiran.every(({brandId})=>brandIds.has(brandId)),"Al Khiran has invalid brand IDs");
console.log(`Target localization valid: ${targetOutletIds.length} outlets, ${guides.length} guides, ${targetContentLanguages.length} languages; Al Khiran 44 valid brands.`);
