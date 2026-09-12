import { outlets } from "../src/constants/outlets";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportationGuides } from "../src/constants/transportationGuides";
import { expansionRoutes } from "../src/constants/expansionTransportationData";
import { getTargetQuickInfo, localizeTargetGuide } from "../src/constants/targetOutletLocalization";
import { expansionDistanceLabel } from "../src/constants/expansionOutletLocalization";
import { localizeExpansionPlace } from "../src/constants/expansionPlaceNames";
import { resolveTranslation } from "../src/i18n/translationResolver";
import type { TranslationLanguage } from "../src/translations/locale";
const scope = new Set([...expansionRoutes.map(r => r.outletId), "shisui-premium-outlets", "sano-premium-outlets", "kobe-sanda-premium-outlets"]);
const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const brandById = new Map(brands.map(b => [b.brandId, b]));
export function expansionTransportFallback(id: string, language: TranslationLanguage): string | undefined {
 const g = transportationGuides.find(g => g.guideId === id && scope.has(g.outletId));
 if (!g) return undefined;
 const copy = localizeTargetGuide(g, language);
 if (!copy) return undefined;
 return `<li data-transportation-id="${esc(id)}"><strong>${esc(copy.title)}</strong><p>${esc(copy.estimatedDuration)} · <span data-transportation-fare="true">${esc(copy.estimatedCost)}</span></p><ol>${copy.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></li>`;
}
export function expansionOutletFallback(id: string, language: TranslationLanguage): string {
 if (!scope.has(id)) return "";
 const outlet = outlets.find(o => o.outletId === id)!;
 const quick = getTargetQuickInfo(id, language);
 if (!quick) return "";
 const retail = outletBrands.filter(r => r.outletId === id && r.relationStatus === "active").map(r => brandById.get(r.brandId)).filter(b => b?.brandStatus === "active");
 const dining = restaurants.filter(r => r.outletId === id && r.status === "active");
 const t = (key: string) => esc(resolveTranslation(language, key));
 const distance = outlet.distanceBasis === "straight-line" ? ` (${esc(expansionDistanceLabel(language))})` : "";
 const airport = (outlet.airports ?? []).map((a: any)=>`${esc(a.code)} · ${esc(String(a.distanceKm))} km`).join("; ");
 const centre = outlet.cityCenterInfo?.name ? `${esc(localizeExpansionPlace(outlet.cityCenterInfo.name, language))} · ${esc(String(outlet.cityCenterInfo.distanceKm))} km${distance}` : "";
 return `<section data-outlet-expansion="${esc(id)}"><h2>${t("outlet.quickFacts")}</h2><p>${esc(outlet.address)}</p><p>${esc(quick.openingHours)}</p><p>${esc(quick.storesCountText)}</p><p>${airport}${distance}</p>${centre ? `<p>${centre}</p>` : ""}<ul>${quick.services.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><h2>${t("outlet.brands")}</h2><ul data-expansion-brands="true">${retail.map(b=>`<li data-brand-id="${esc(b!.brandId)}">${esc(b!.brandName)}</li>`).join("")}</ul><h2>${t("outlet.restaurantsCafes")}</h2><ul data-expansion-restaurants="true">${dining.map(r=>`<li data-restaurant-id="${esc(r.restaurantId)}">${esc(r.restaurantName)}</li>`).join("")}</ul></section>`;
}
