import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isTaxFreeGuideAvailable } from "../src/services/taxFreeGuideService";
import { supportedLanguageCodes, translations } from "../src/translations/translations";

const read = (path: string) => readFileSync(path, "utf8");

for (const locale of supportedLanguageCodes) {
  assert(translations[locale]["taxGuide.openGuide"]?.trim(), `taxGuide.openGuide exists for ${locale}`);
}

for (const countryId of ["france", "turkey", "united-arab-emirates"]) {
  assert.equal(isTaxFreeGuideAvailable(countryId), true, `${countryId} guide is available`);
}
for (const countryId of ["united-kingdom", "united-states", "canada", "unknown-country"]) {
  assert.equal(isTaxFreeGuideAvailable(countryId), false, `${countryId} guide is unavailable`);
}
assert.equal(isTaxFreeGuideAvailable(" FRANCE "), true, "guide helper normalizes country IDs");

const card = read("src/components/cards/TaxFreeCard.tsx");
assert(/guideButtonText\?: string/.test(card), "TaxFreeCard exposes optional guideButtonText presentation prop");
assert(/onPressGuide\?: \(\) => void/.test(card), "TaxFreeCard exposes optional onPressGuide presentation prop");
assert(card.includes("shouldShowGuideButton = hasDisplayValue(guideButtonText) && Boolean(onPressGuide)"), "TaxFreeCard renders only non-empty actionable guide button");
assert(!/@react-navigation|useNavigation|navigation\.navigate/.test(card), "TaxFreeCard contains no navigation logic");
assert(card.includes('accessibilityRole="button"') && card.includes("accessibilityLabel={guideButtonText}"), "TaxFreeCard guide action is accessible");

const outlet = read("src/screens/OutletDetailScreen.tsx");
assert(outlet.includes("isTaxFreeGuideAvailable"), "OutletDetailScreen uses isTaxFreeGuideAvailable");
assert(outlet.includes("isTaxFreeGuideAvailable(outlet.countryId)"), "OutletDetailScreen checks guide availability from outlet.countryId");
assert(outlet.includes('guideButtonText={hasTaxFreeGuide ? t("taxGuide.openGuide") : undefined}'), "OutletDetailScreen passes localized guide button text only when available");
assert(outlet.includes('navigation.navigate("TaxFreeGuide", { countryId: outlet.countryId })'), "OutletDetailScreen passes outlet.countryId to TaxFreeGuide");

const navTypes = read("src/navigation/types.ts");
assert(/TaxFreeGuide:\s*\{ countryId\?: string \} \| undefined/.test(navTypes), "route type accepts undefined and optional countryId");

const guideScreen = read("src/screens/TaxFreeGuideScreen.tsx");
assert(guideScreen.includes("route.params?.countryId"), "TaxFreeGuideScreen reads optional route countryId");
assert(guideScreen.includes("isTaxFreeGuideAvailable(normalizedRouteCountryId)"), "invalid route country IDs are ignored");
assert(guideScreen.includes("const effectiveCountryId = shouldApplyRouteCountry ? validRouteCountryId! : selectedCountryId"), "valid route country is used for the initial displayed guide");
assert(guideScreen.includes("useLayoutEffect"), "TaxFreeGuideScreen synchronizes selected country before paint where supported");
assert(guideScreen.includes("lastAppliedRouteCountryIdRef"), "TaxFreeGuideScreen tracks applied route country params");
assert(guideScreen.includes("validRouteCountryId === lastAppliedRouteCountryIdRef.current"), "unchanged params do not repeatedly override manual selection");
assert(guideScreen.includes("validRouteCountryId && validRouteCountryId !== lastAppliedRouteCountryIdRef.current"), "changed valid params can be applied once");
assert(/TaxFreeGuide:\s*\{ countryId\?: string \} \| undefined/.test(guideScreen), "TaxFreeGuideScreen local route type keeps navigation without params supported");

console.log("Tax Free outlet entry checks passed.");
