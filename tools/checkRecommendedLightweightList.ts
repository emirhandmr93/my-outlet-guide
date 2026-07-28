import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "src/screens/HomeScreen.tsx"), "utf8");
const list = source.match(/<RecommendedFlatList[\s\S]*?\n\s*\/>/)?.[0] ?? "";
const handler = source.match(/function handleRecommendedScroll[\s\S]*?\n  }\n\n  function handleCityScroll/)?.[0] ?? "";
const checks: Array<[string, boolean]> = [
  ["Recommended is not a lightweight FlatList", list.length > 0],
  ["Recommended ref is not typed", source.includes("useRef<VirtualizedList<RecommendedOutlet> | null>")],
  ["stable outlet ID keys are missing", list.includes("keyExtractor={(outlet) => outlet.id}")],
  ["getItemLayout is missing", list.includes("getItemLayout={(_, index) => ({")],
  ["all five cards are not rendered initially", list.includes("initialNumToRender={5}")],
  ["render batch does not cover all five cards", list.includes("maxToRenderPerBatch={5}")],
  ["window does not cover the fixed collection", list.includes("windowSize={5}")],
  ["clipping remains enabled", list.includes("removeClippedSubviews={false}")],
  ["native snap interval is missing", list.includes('Platform.OS === "web" ? undefined : recommendedSnapInterval')],
  ["momentum handler is missing", list.includes("onMomentumScrollEnd={handleRecommendedScroll}")],
  ["safe index clamp is missing", handler.includes("Math.min(Math.max(logicalIndex, 0), recommendedLastIndex)")],
  ["momentum handler issues corrective scrolling", !/scrollTo(?:Offset|Index|End)?/.test(handler)],
  ["automatic transition is not deterministic index scrolling", source.includes("recommendedCarouselRef.current.scrollToIndex({")],
  ["Recommended measurement wiring remains", !/recommendedMetrics|recommendedSnapOffsets|recommendedNativeSnapOffsets/.test(source) && !list.includes("onLayout") && !list.includes("onContentSizeChange")],
  ["Recommended corrective alignment remains", !list.includes("snapToOffsets") && !list.includes("requestAnimationFrame")],
];
const errors = checks.filter(([, passed]) => !passed).map(([message]) => message);
console.log(`Recommended lightweight-list error list: ${JSON.stringify(errors)}`);
console.log(`Error count: ${errors.length}`);
process.exitCode = errors.length === 0 ? 0 : 1;
