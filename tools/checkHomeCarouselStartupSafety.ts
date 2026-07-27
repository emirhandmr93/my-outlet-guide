import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.resolve(process.cwd(), "src/screens/HomeScreen.tsx"),
  "utf8",
);
const has = (pattern: RegExp) => pattern.test(source);
const errorsFor = (checks: Array<[string, boolean]>) =>
  checks.filter(([, passed]) => !passed).map(([message]) => message);

const alignmentEffect = source.match(
  /useEffect\(\(\) => \{\n    if \(!useNativeRtlOffsets\) return;[\s\S]*?return \(\) => cancelAnimationFrame\(frame\);[\s\S]*?\n  \}, \[[^\]]+\]\);/,
)?.[0] ?? "";
const ltrRealignmentEffect = source.match(
  /useEffect\(\(\) => \{\n    if \(Platform\.OS === "web" \|\| useNativeRtlOffsets\) return;[\s\S]*?return \(\) => frames\.forEach\(cancelAnimationFrame\);[\s\S]*?\n  \}, \[[^\]]+\]\);/,
)?.[0] ?? "";
const cityList = source.match(/<FlatList[\s\S]*?data=\{popularCities\}[\s\S]*?\n          \/>/)?.[0] ?? "";

const ltrMountScrollCommands =
  alignmentEffect &&
  alignmentEffect.indexOf("scrollTo") < alignmentEffect.indexOf("if (!useNativeRtlOffsets)")
    ? ["alignment effect can scroll before its native RTL gate"]
    : [];

const ltrLayoutChangeRealignmentErrors = errorsFor([
  ["native LTR realignment is not excluded on web", ltrRealignmentEffect.includes('if (Platform.OS === "web" || useNativeRtlOffsets) return;')],
  ["Featured and Recommended layout refs are missing", ["featuredLtrLayoutRef", "recommendedLtrLayoutRef"].every((name) => source.includes(`const ${name} = useRef<CarouselLayoutSignature | null>(null);`))],
  ["first valid layout does not store without scrolling", /if \(previousSignature === null\) \{\s*previousLayoutRef\.current = signature;\s*return;\s*}/.test(ltrRealignmentEffect)],
  ["changed layout is not required before command creation", ltrRealignmentEffect.indexOf("if (!layoutChanged) return;") < ltrRealignmentEffect.indexOf("requestAnimationFrame")],
  ["layout metrics are not finite guarded", ltrRealignmentEffect.includes("[interval, content, viewport].every(Number.isFinite)")],
  ["layout target is not clamped", ltrRealignmentEffect.includes("Math.min(Math.max(activeIndex * interval, 0), maxOffset)")],
  ["layout frame cleanup is missing", ltrRealignmentEffect.includes("frames.forEach(cancelAnimationFrame)")],
  ["Popular Cities incorrectly participates in layout realignment", !ltrRealignmentEffect.includes("cityCarouselRef") && !ltrRealignmentEffect.includes("cityMetrics")],
]);

const rtlReadinessGuardErrors = errorsFor([
  ["explicit native RTL offset gate is missing", source.includes('const useNativeRtlOffsets = Platform.OS !== "web" && isNativeRTL;')],
  ["alignment effect is not gated before scheduling", alignmentEffect.startsWith("useEffect(() => {\n    if (!useNativeRtlOffsets) return;")],
  ["content/viewport guards are missing", alignmentEffect.includes("metrics.content <= 0") && alignmentEffect.includes("metrics.viewport <= 0")],
  ["finite offset guards are missing", alignmentEffect.includes(".every(Number.isFinite)") && alignmentEffect.includes("Number.isFinite(targetOffset)")],
  ["Featured and Recommended do not have independent alignment calls", (alignmentEffect.match(/alignCarousel\(/g)?.length ?? 0) === 2],
  ["Popular Cities incorrectly has an RTL corrective command", !alignmentEffect.includes("cityCarouselRef")],
]);

const unsafeEmptyOffsetErrors = errorsFor([
  ["closest snap helper does not reject an empty list", has(/function getClosestSnapIndex[\s\S]*?snapOffsets\.length === 0/)],
  ["Featured RTL auto-advance lacks its offset-count guard", source.includes("itemCount <= (useNativeRtlOffsets ? 1 : 0)")],
  ["Recommended RTL auto-advance lacks its offset-count guard", source.includes("recommendedSnapOffsets.length < 2")],
]);

const nonFiniteOffsetRiskErrors = errorsFor([
  ["snap generation does not reject non-finite inputs", ["interval", "contentWidth", "viewportWidth"].every((name) => source.includes(`!Number.isFinite(${name})`))],
  ["snap generation can retain a bad offset", source.includes("if (!Number.isFinite(offset) || offset < 0) continue;")],
  ["auto-advance offsets are not finite checked", (source.match(/!Number\.isFinite\(targetOffset\)/g)?.length ?? 0) >= 3],
]);

const ltrSnapModeErrors = errorsFor([
  ["Featured LTR snap interval is missing", source.includes("snapToInterval={useNativeRtlOffsets ? undefined : carouselWidth}")],
  ["Recommended LTR snap interval is missing", source.includes("snapToInterval={useNativeRtlOffsets ? undefined : outletCardWidth + spacing.md}")],
  ["Popular Cities native snap interval is missing", cityList.includes('snapToInterval={Platform.OS === "web" ? undefined : citySnapInterval}')],
  ["Popular Cities contains a corrective scroll command", !/scrollTo(?:Offset|Index|End)?/.test(cityList)],
]);

const rtlSnapModeErrors = errorsFor([
  ["Featured snap offsets are not readiness gated", source.includes("const featuredNativeSnapOffsets = featuredRtlReady ?")],
  ["Recommended snap offsets are not readiness gated", source.includes("const recommendedNativeSnapOffsets = recommendedRtlReady ?")],
  ["Popular Cities still uses RTL snap offsets", !source.includes("cityNativeSnapOffsets") && !cityList.includes("snapToOffsets")],
]);

const webCitySnapModeErrors = errorsFor([
  ["Popular Cities is not a virtualized FlatList", cityList.length > 0],
  ["web is forced to use native interval snapping", cityList.includes('snapToInterval={Platform.OS === "web" ? undefined : citySnapInterval}')],
  ["mobile-web indicators are missing", source.includes('const showCityPageIndicators = Platform.OS !== "web" || !isDesktopWeb;')],
  ["Popular Cities is not driven by momentum events", cityList.includes("onMomentumScrollEnd={handleCityScroll}")],
]);

const preservedBehaviorErrors = errorsFor([
  ["5,500 ms Featured/Recommended timing changed", (source.match(/\}, 5500\);/g)?.length ?? 0) === 2],
  ["Share App behavior is missing", source.includes("async function shareApp()") && source.includes("Share.share(getAppSharePayload")],
  ["Rate App behavior is missing", source.includes("async function rateApp()") && source.includes("nativeIosReviewUrl")],
  ["Popular Cities images are missing", source.includes('getPopularCityImage("istanbul")') && cityList.includes("source={city.image}")],
]);

const reports: Array<[string, string[]]> = [
  ["LTR mount scroll command list", ltrMountScrollCommands],
  ["LTR layout-change realignment error list", ltrLayoutChangeRealignmentErrors],
  ["RTL readiness guard list", rtlReadinessGuardErrors],
  ["Unsafe empty-offset list", unsafeEmptyOffsetErrors],
  ["Non-finite offset risk list", nonFiniteOffsetRiskErrors],
  ["LTR snap-mode error list", ltrSnapModeErrors],
  ["RTL snap-mode error list", rtlSnapModeErrors],
  ["Web city snap-mode error list", webCitySnapModeErrors],
  ["Preserved behavior error list", preservedBehaviorErrors],
];

for (const [label, errors] of reports) console.log(`${label}: ${JSON.stringify(errors)}`);
const errorCount = reports.reduce((count, [, errors]) => count + errors.length, 0);
console.log(`Error count: ${errorCount}`);
process.exitCode = errorCount === 0 ? 0 : 1;
