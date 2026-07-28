import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(process.cwd(), "src/screens/HomeScreen.tsx"), "utf8");
const featured = source.match(/<FlatList<FeaturedSlide>[\s\S]*?\n\s*\/>/)?.[0] ?? "";
const recommended = source.match(/<RecommendedFlatList[\s\S]*?\n\s*\/>/)?.[0] ?? "";
const errors = [
  ["Featured is not a FlatList", featured.length > 0],
  ["Featured stable keys are missing", featured.includes("keyExtractor={(slide) => slide.id}")],
  ["Featured fixed layout is missing", featured.includes("getItemLayout={(_, index) => ({")],
  ["Featured native snap interval is missing", featured.includes('Platform.OS === "web" ? undefined : carouselWidth')],
  ["Recommended native snap interval is missing", recommended.includes('Platform.OS === "web" ? undefined : recommendedSnapInterval')],
  ["native LTR physical geometry is missing", source.includes('nativeCarouselGeometry: {\n    direction: "ltr"')],
  ["native Arabic card direction is missing", source.includes('nativeCarouselRtlContent: {\n    direction: "rtl"')],
  ["5,500 ms timers changed", (source.match(/}, 5500\);/g)?.length ?? 0) === 2],
  ["Featured web timer fallback is missing", source.includes('if (Platform.OS === "web") setActiveSlideIndex(nextIndex);')],
  ["Recommended web timer fallback is missing", source.includes('if (Platform.OS === "web") setActiveRecommendedIndex(nextIndex);')],
  ["timer state fallbacks are not web-only", (source.match(/if \(Platform\.OS === "web"\) setActive(?:Slide|Recommended)Index\(nextIndex\);/g)?.length ?? 0) === 2],
  ["measurement-heavy Featured wiring remains", !/CarouselLayoutSignature|featuredMetrics|featuredSnapOffsets|featuredNativeSnapOffsets|featuredLtrLayoutRef/.test(source)],
  ["unsafe alignment wiring remains", !/snapToOffsets|requestAnimationFrame|onContentSizeChange/.test(featured)],
  ["diagnostic code entered Home", !/StartupMountDiagnostic|checkStartupMountDiagnostic|diagnostic/i.test(source)],
].filter(([, passed]) => !passed).map(([message]) => message);
console.log(`Home carousel startup-safety error list: ${JSON.stringify(errors)}`);
console.log(`Error count: ${errors.length}`);
process.exitCode = errors.length === 0 ? 0 : 1;
