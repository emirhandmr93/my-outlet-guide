import fs from "node:fs";
import path from "node:path";

const homePath = path.resolve(process.cwd(), "src/screens/HomeScreen.tsx");
const source = fs.readFileSync(homePath, "utf8");

const has = (pattern: RegExp) => pattern.test(source);
const errorsFor = (checks: Array<[string, boolean]>) =>
  checks.filter(([, passed]) => !passed).map(([message]) => message);

const alignmentEffect = source.match(
  /useEffect\(\(\) => \{\n    if \(!useNativeRtlOffsets\) return;[\s\S]*?return \(\) => cancelAnimationFrame\(frame\);[\s\S]*?\n  \}, \[[^\]]+\]\);/,
)?.[0] ?? "";

const ltrBranches = [...source.matchAll(/if \(!useNativeRtlOffsets\) \{([\s\S]*?)\n    \}/g)].map((match) => match[1]);
const cityHandler = source.match(/function handleCityScroll[\s\S]*?\n  }\n\n  function navigateTo/)?.[0] ?? "";
const webCityBranch = cityHandler.match(/if \(Platform\.OS === "web"\) \{([\s\S]*?)\n    }\n\n    if \(!useNativeRtlOffsets\)/)?.[1] ?? "";
const nativeLtrCityBranch = cityHandler.match(/if \(!useNativeRtlOffsets\) \{([\s\S]*?)\n    }\n    if \(!cityRtlReady/)?.[1] ?? "";
const ltrRealignmentEffect = source.match(
  /useEffect\(\(\) => \{\n    if \(Platform\.OS === "web" \|\| useNativeRtlOffsets\) return;[\s\S]*?return \(\) => frames\.forEach\(cancelAnimationFrame\);[\s\S]*?\n  \}, \[[^\]]+\]\);/,
)?.[0] ?? "";

const ltrMountScrollCommands = alignmentEffect && alignmentEffect.indexOf("scrollTo") < alignmentEffect.indexOf("if (!useNativeRtlOffsets)")
  ? ["alignment effect can scroll before its native RTL gate"]
  : [];

const ltrLayoutChangeRealignmentErrors = errorsFor([
  ["native LTR realignment is not excluded on web", ltrRealignmentEffect.includes('if (Platform.OS === "web" || useNativeRtlOffsets) return;')],
  ["native LTR realignment is not excluded in RTL", ltrRealignmentEffect.includes("|| useNativeRtlOffsets")],
  ["three independent previous-ready layout refs are missing", ["featuredLtrLayoutRef", "recommendedLtrLayoutRef", "cityLtrLayoutRef"].every((name) => has(new RegExp(`const ${name} = useRef<CarouselLayoutSignature \\| null>\\(null\\);`)))],
  ["first valid layout does not store without scrolling", /if \(previousSignature === null\) \{\s*previousLayoutRef\.current = signature;\s*return;\s*}/.test(ltrRealignmentEffect)],
  ["unchanged layout does not return without a command", ltrRealignmentEffect.includes("if (!layoutChanged) return;")],
  ["changed layout is not required before command creation", ltrRealignmentEffect.indexOf("if (!layoutChanged) return;") < ltrRealignmentEffect.indexOf("requestAnimationFrame")],
  ["LTR realignment content > 0 guard is missing", ltrRealignmentEffect.includes("content <= 0")],
  ["LTR realignment viewport > 0 guard is missing", ltrRealignmentEffect.includes("viewport <= 0")],
  ["LTR realignment interval > 0 guard is missing", ltrRealignmentEffect.includes("interval <= 0")],
  ["LTR realignment finite-value guard is missing", ltrRealignmentEffect.includes("[interval, content, viewport].every(Number.isFinite)") && ltrRealignmentEffect.includes("Number.isFinite(targetOffset)")],
  ["LTR realignment maximum-offset clamp is missing", ltrRealignmentEffect.includes("Math.max(content - viewport, 0)") && ltrRealignmentEffect.includes("Math.min(Math.max(activeIndex * interval, 0), maxOffset)")],
  ["LTR realignment is not frame deferred", ltrRealignmentEffect.includes("requestAnimationFrame")],
  ["LTR realignment frame cleanup is missing", ltrRealignmentEffect.includes("frames.forEach(cancelAnimationFrame)")],
  ["featured realignment does not use latest activeSlideIndex", ltrRealignmentEffect.includes("activeSlideIndexRef.current")],
  ["recommended realignment does not use latest activeRecommendedIndex", ltrRealignmentEffect.includes("activeRecommendedIndexRef.current")],
  ["city realignment does not use latest activeCityIndex", ltrRealignmentEffect.includes("activeCityIndexRef.current")],
  ["native LTR momentum branches contain corrective scrollTo", ltrBranches.every((branch) => !branch.includes("scrollTo"))],
  ["native city dots are no longer rendered", has(/Platform\.OS !== "web" \? \([\s\S]*?length: cityPageCount/)],
  ["web city behavior is missing", webCityBranch.includes("getClosestSnapIndex(currentOffset, citySnapOffsets)") && webCityBranch.includes("cityCarouselRef.current?.scrollTo")],
]);

const rtlReadinessGuardErrors = errorsFor([
  ["explicit native RTL offset gate is missing", has(/const useNativeRtlOffsets = Platform\.OS !== "web" && isNativeRTL;/)],
  ["alignment effect is not gated before scheduling", alignmentEffect.startsWith("useEffect(() => {\n    if (!useNativeRtlOffsets) return;")],
  ["content > 0 guard is missing", has(/metrics\.content <= 0/)],
  ["viewport > 0 guard is missing", has(/metrics\.viewport <= 0/)],
  ["non-empty snap offset guard is missing", has(/snapOffsets\.length === 0/)],
  ["finite metric/offset guard is missing", has(/\.every\(Number\.isFinite\)/) && has(/Number\.isFinite\(targetOffset\)/)],
  ["alignment is not deferred to the next frame", alignmentEffect.includes("requestAnimationFrame")],
  ["alignment frame cleanup is missing", alignmentEffect.includes("cancelAnimationFrame(frame)")],
  ["carousels do not have independent readiness calls", (alignmentEffect.match(/alignCarousel\(/g)?.length ?? 0) === 3],
]);

const unsafeEmptyOffsetErrors = errorsFor([
  ["getClosestSnapIndex does not safely handle an empty list", has(/function getClosestSnapIndex[\s\S]*?if \(snapOffsets\.length === 0 \|\| !Number\.isFinite\(offset\)\) return 0;/)],
  ["featured RTL auto-advance can command fewer than two offsets", has(/itemCount <= \(useNativeRtlOffsets \? 1 : 0\)\) return;/)],
  ["recommended RTL auto-advance can command fewer than two offsets", has(/useNativeRtlOffsets && recommendedSnapOffsets\.length < 2\) return;/)],
  ["RTL momentum handlers do not all reject empty offsets", (source.match(/RtlReady \|\| \w+SnapOffsets\.length === 0\) return;/g)?.length ?? 0) === 3],
]);

const nonFiniteOffsetRiskErrors = errorsFor([
  ["snap generation does not reject non-finite inputs", has(/!Number\.isFinite\(interval\)/) && has(/!Number\.isFinite\(contentWidth\)/) && has(/!Number\.isFinite\(viewportWidth\)/)],
  ["snap generation can retain a negative or non-finite offset", has(/if \(!Number\.isFinite\(offset\) \|\| offset < 0\) continue;/)],
  ["snap generation does not deduplicate offsets", has(/return \[\.\.\.new Set\(offsets\)\];/)],
  ["auto-advance target offset is not finite-checked", (source.match(/!Number\.isFinite\(targetOffset\)/g)?.length ?? 0) >= 3],
]);

const ltrSnapModeErrors = errorsFor([
  ["featured LTR carousel does not use snapToInterval", has(/snapToInterval=\{useNativeRtlOffsets \? undefined : carouselWidth\}/)],
  ["recommended LTR carousel does not use snapToInterval", has(/snapToInterval=\{useNativeRtlOffsets \? undefined : outletCardWidth \+ spacing\.md\}/)],
  ["city native LTR carousel does not use snapToInterval", has(/snapToInterval=\{Platform\.OS === "web" \|\| useNativeRtlOffsets \? undefined : citySnapInterval\}/)],
  ["LTR momentum branch contains corrective scrollTo", ltrBranches.every((branch) => !branch.includes("scrollTo"))],
  ["LTR momentum index calculation is not interval based", ltrBranches.filter((branch) => branch.includes("contentOffset.x /")).length >= 3],
]);

const rtlSnapModeErrors = errorsFor([
  ["featured snapToOffsets is not RTL-ready gated", has(/const featuredNativeSnapOffsets = featuredRtlReady \?/)],
  ["recommended snapToOffsets is not RTL-ready gated", has(/const recommendedNativeSnapOffsets = recommendedRtlReady \?/)],
  ["city snapToOffsets is not RTL-ready gated", has(/const cityNativeSnapOffsets = cityRtlReady \?/)],
  ["RTL correction does not require a real deviation", (source.match(/Math\.abs\(logicalOffset - targetOffset\) > 1/g)?.length ?? 0) === 3],
]);

const webCitySnapModeErrors = errorsFor([
  ["web city path is not explicit and ordered before native LTR", cityHandler.indexOf('if (Platform.OS === "web")') >= 0 && cityHandler.indexOf('if (Platform.OS === "web")') < cityHandler.indexOf("if (!useNativeRtlOffsets)")],
  ["web city path does not use citySnapOffsets", webCityBranch.includes("citySnapOffsets")],
  ["web city path does not calculate the closest snap index", webCityBranch.includes("getClosestSnapIndex(currentOffset, citySnapOffsets)")],
  ["web city path does not perform corrective scrolling", webCityBranch.includes("cityCarouselRef.current?.scrollTo")],
  ["web city correction is not limited to deviations over one pixel", webCityBranch.includes("Math.abs(currentOffset - targetOffset) > 1")],
  ["web city path does not return before native logic", webCityBranch.trimEnd().endsWith("return;") && (webCityBranch.match(/return;/g)?.length ?? 0) >= 3],
  ["web city carousel unexpectedly enables snapToInterval", has(/snapToInterval=\{Platform\.OS === "web" \|\| useNativeRtlOffsets \? undefined : citySnapInterval\}/)],
  ["web city carousel does not invoke the three-path momentum handler", has(/onMomentumScrollEnd=\{handleCityScroll\}/)],
  ["native LTR city path contains corrective scrollTo", !nativeLtrCityBranch.includes("scrollTo")],
  ["native RTL city readiness guard is missing", cityHandler.includes("if (!cityRtlReady || citySnapOffsets.length === 0) return;")],
]);

const preservedBehaviorErrors = errorsFor([
  ["5,500 ms featured/recommended timing changed", (source.match(/\}, 5500\);/g)?.length ?? 0) === 2],
  ["Share App behavior is missing", has(/async function shareApp\(\)/) && has(/Share\.share\(getAppSharePayload/)],
  ["Rate App behavior is missing", has(/async function rateApp\(\)/) && has(/nativeIosReviewUrl/)],
  ["home feature image resolver usage is missing", has(/getHomeFeatureImage\("discover-outlets"\)/)],
  ["recommended outlet image resolver usage is missing", has(/getRecommendedOutletImage\(outlet\)/)],
  ["popular city image resolver usage is missing", has(/getPopularCityImage\("istanbul"\)/)],
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
