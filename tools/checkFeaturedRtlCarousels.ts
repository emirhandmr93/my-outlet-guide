import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "src/screens/HomeScreen.tsx"), "utf8");
const featured = source.match(/<FlatList<FeaturedSlide>[\s\S]*?\n\s*\/>/)?.[0] ?? "";
const recommended = source.match(/<RecommendedFlatList[\s\S]*?\n\s*\/>/)?.[0] ?? "";
const featuredHandler = source.match(/function handleCarouselScroll[\s\S]*?\n\s*}\n\n  function handleRecommendedScroll/)?.[0] ?? "";
const recommendedHandler = source.match(/function handleRecommendedScroll[\s\S]*?\n  }\n\n  function handleCityScroll/)?.[0] ?? "";
const checks: Array<[string, boolean]> = [
  ["Featured lightweight list is missing", featured.length > 0],
  ["Featured does not use stable slide IDs", featured.includes("keyExtractor={(slide) => slide.id}")],
  ["Recommended does not use stable outlet IDs", recommended.includes("keyExtractor={(outlet) => outlet.id}")],
  ["Featured deterministic layout is missing", featured.includes("offset: carouselWidth * index")],
  ["Recommended deterministic layout is missing", recommended.includes("offset: recommendedSnapInterval * index")],
  ["native-only Featured snapping is missing", featured.includes('Platform.OS === "web" ? undefined : carouselWidth')],
  ["native-only Recommended snapping is missing", recommended.includes('Platform.OS === "web" ? undefined : recommendedSnapInterval')],
  ["carousels do not isolate native physical geometry", (source.match(/styles\.nativeCarouselGeometry/g)?.length ?? 0) === 2],
  ["Arabic card content direction is not restored", (source.match(/styles\.nativeCarouselRtlContent/g)?.length ?? 0) === 2],
  ["Featured index is not finite guarded and clamped", featuredHandler.includes("!Number.isFinite(offset)") && featuredHandler.includes("Math.min(Math.max(logicalIndex, 0), slides.length - 1)")],
  ["Recommended index is not finite guarded and clamped", recommendedHandler.includes("!Number.isFinite(offset)") && recommendedHandler.includes("Math.min(Math.max(logicalIndex, 0), recommendedLastIndex)")],
  ["momentum handlers contain corrective commands", !/scrollTo/.test(featuredHandler) && !/scrollTo/.test(recommendedHandler)],
  ["both timers do not use scrollToIndex", (source.match(/\.scrollToIndex\(\{/g)?.length ?? 0) === 2],
  ["both 5,500 ms timers are not retained", (source.match(/}, 5500\);/g)?.length ?? 0) === 2],
  ["Featured legacy geometry remains", !/CarouselLayoutSignature|featuredMetrics|featuredSnapOffsets|snapToOffsets|requestAnimationFrame/.test(source)],
];
const errors = checks.filter(([, passed]) => !passed).map(([message]) => message);
console.log(`Featured/RTL carousel error list: ${JSON.stringify(errors)}`);
console.log(`Error count: ${errors.length}`);
process.exitCode = errors.length === 0 ? 0 : 1;
