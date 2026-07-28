import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.resolve(process.cwd(), "src/screens/HomeScreen.tsx"),
  "utf8",
);
const list = source.match(/<RecommendedFlatList[\s\S]*?\n          \/>/)?.[0] ?? "";
const handler = source.match(
  /function handleRecommendedScroll[\s\S]*?\n  }\n\n  function handleCityScroll/,
)?.[0] ?? "";
const timer = source.match(
  /useEffect\(\(\) => \{\n    const interval = setInterval\(\(\) => \{[\s\S]*?recommendedCarouselRef[\s\S]*?\}, 5500\);[\s\S]*?\n  }, \[[^\]]+\]\);/,
)?.[0] ?? "";

const checks: Array<[string, boolean]> = [
  ["Recommended is not a lightweight FlatList", list.length > 0],
  ["Recommended ref is not typed", source.includes("useRef<VirtualizedOutletList<RecommendedOutlet> | null>")],
  ["stable outlet ID keys are missing", list.includes("keyExtractor={(outlet) => outlet.id}")],
  ["getItemLayout is missing", list.includes("getItemLayout={(_, index) => ({")],
  ["initial render count is not one", list.includes("initialNumToRender={1}")],
  ["render batch size is not one", list.includes("maxToRenderPerBatch={1}")],
  ["window size is not three", list.includes("windowSize={3}")],
  ["native snap interval is missing", list.includes('snapToInterval={Platform.OS === "web" ? undefined : recommendedSnapInterval}')],
  ["native start snapping is missing", list.includes('snapToAlignment={Platform.OS === "web" ? undefined : "start"}')],
  ["native fast deceleration is missing", list.includes('decelerationRate={Platform.OS === "web" ? undefined : "fast"}')],
  ["native interval momentum is not disabled", list.includes('disableIntervalMomentum={Platform.OS === "web" ? undefined : true}')],
  ["momentum handler is missing", list.includes("onMomentumScrollEnd={handleRecommendedScroll}")],
  ["finite offset guard is missing", handler.includes("!Number.isFinite(offset)")],
  ["finite positive interval guard is missing", handler.includes("!Number.isFinite(recommendedSnapInterval)") && handler.includes("recommendedSnapInterval <= 0")],
  ["index rounding is missing", handler.includes("Math.round(offset / recommendedSnapInterval)")],
  ["safe index clamp is missing", handler.includes("Math.min(Math.max(nextIndex, 0), recommendedLastIndex)")],
  ["momentum handler issues corrective scrolling", !/scrollTo(?:Offset|Index|End)?/.test(handler)],
  ["5,500 ms automatic transition is missing", timer.includes("}, 5500);")],
  ["automatic transition is not index based", timer.includes("scrollToIndex({ index: nextIndex, animated: true })")],
  ["Recommended measurement state remains", !source.includes("recommendedMetrics")],
  ["Recommended layout ref remains", !source.includes("recommendedLtrLayoutRef")],
  ["Recommended active-index ref remains", !source.includes("activeRecommendedIndexRef")],
  ["Recommended measured snap offsets remain", !source.includes("recommendedSnapOffsets") && !source.includes("recommendedNativeSnapOffsets")],
  ["Recommended layout measurement callbacks remain", !list.includes("onLayout") && !list.includes("onContentSizeChange")],
];

const errors = checks.filter(([, passed]) => !passed).map(([message]) => message);
console.log(`Recommended lightweight-list error list: ${JSON.stringify(errors)}`);
console.log(`Error count: ${errors.length}`);
process.exitCode = errors.length === 0 ? 0 : 1;
