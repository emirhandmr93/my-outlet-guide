import fs from "node:fs";
import path from "node:path";

const homePath = path.resolve(process.cwd(), "src/screens/HomeScreen.tsx");
const source = fs.readFileSync(homePath, "utf8");
const has = (pattern: RegExp, value = source) => pattern.test(value);
const errorsFor = (checks: Array<[string, boolean]>) =>
  checks.filter(([, passed]) => !passed).map(([message]) => message);

const cityList = source.match(
  /<FlatList[\s\S]*?data=\{popularCities\}[\s\S]*?\n          \/>/,
)?.[0] ?? "";
const cityHandler = source.match(
  /function handleCityScroll[\s\S]*?\n  }\n\n  function navigateTo/,
)?.[0] ?? "";

const popularCitiesOldCarouselReferences = [
  "cityCarouselRef",
  "cityMetrics",
  "citySnapOffsets",
  "cityMaxOffset",
  "cityRtlReady",
  "cityNativeSnapOffsets",
  "cityLtrLayoutRef",
  "activeCityIndexRef",
].filter((reference) => source.includes(reference));

const programmaticCityCommands = [
  "scrollTo",
  "scrollToOffset",
  "scrollToIndex",
  "scrollToEnd",
].filter((command) => cityList.includes(command) || cityHandler.includes(command));

const cityTimerAlignment = [
  "setInterval",
  "setTimeout",
  "requestAnimationFrame",
  "InteractionManager",
  "onLayout",
  "onContentSizeChange",
].filter((command) => cityList.includes(command) || cityHandler.includes(command));

const flatListConfigurationErrors = errorsFor([
  ["FlatList is not imported from React Native", has(/import \{[\s\S]*?\bFlatList,[\s\S]*?\} from "react-native";/)],
  ["Popular Cities does not use FlatList", cityList.length > 0],
  ["Popular Cities FlatList is not horizontal", has(/\bhorizontal\b/, cityList)],
  ["the horizontal scroll indicator is not hidden", cityList.includes("showsHorizontalScrollIndicator={false}")],
  ["popularCities data is not supplied", cityList.includes("data={popularCities}")],
  ["stable city keys are missing", cityList.includes("keyExtractor={(city) => city.id}")],
  ["native snapToInterval is missing", cityList.includes('snapToInterval={Platform.OS === "web" ? undefined : citySnapInterval}')],
  ["native start alignment is missing", cityList.includes('snapToAlignment={Platform.OS === "web" ? undefined : "start"}')],
  ["native fast deceleration is missing", cityList.includes('decelerationRate={Platform.OS === "web" ? undefined : "fast"}')],
  ["interval momentum is not disabled on native", cityList.includes('disableIntervalMomentum={Platform.OS === "web" ? undefined : true}')],
  ["Popular Cities uses pagingEnabled", !cityList.includes("pagingEnabled")],
  ["Popular Cities uses snapToOffsets", !cityList.includes("snapToOffsets")],
  ["city cards are not rendered by renderItem", cityList.includes("renderItem={({ item: city }) =>")],
  ["city card image is missing", cityList.includes("source={city.image}")],
  ["city card country text is missing", cityList.includes("formatCountryDisplayName(")],
  ["city card title is missing", cityList.includes("formatCityDisplayName(city.id, language)")],
  ["city card navigation is missing", cityList.includes("onPress={() => navigateTo(city.route, city.params)}")],
]);

const activeIndexSafetyErrors = errorsFor([
  ["active city index is not updated from onMomentumScrollEnd", cityList.includes("onMomentumScrollEnd={handleCityScroll}")],
  ["contentOffset.x is not read", cityHandler.includes("event.nativeEvent.contentOffset.x")],
  ["finite interval guard is missing", cityHandler.includes("!Number.isFinite(citySnapInterval)")],
  ["positive interval guard is missing", cityHandler.includes("citySnapInterval <= 0")],
  ["finite offset guard is missing", cityHandler.includes("!Number.isFinite(offset)")],
  ["nearest index rounding is missing", cityHandler.includes("Math.round(offset / citySnapInterval)")],
  ["lower-bound clamp is missing", cityHandler.includes("Math.max(Number.isFinite(nextIndex) ? nextIndex : 0, 0)")],
  ["upper-bound clamp is missing", cityHandler.includes("popularCities.length - 1")],
  ["active index is updated outside the user scroll handler", (source.match(/setActiveCityIndex\(/g)?.length ?? 0) === 1],
]);

const mobileWebIndicatorErrors = errorsFor([
  ["mobile-web indicator condition is missing", source.includes('const showCityPageIndicators = Platform.OS !== "web" || !isDesktopWeb;')],
  ["city indicators do not use the responsive condition", source.includes("{showCityPageIndicators ? (")],
  ["city indicators do not render stable dots", source.includes("key={`city-dot-${city.id}`}")],
  ["active city dot is not connected to activeCityIndex", source.includes("index === activeCityIndex && styles.dotActive")],
  ["web is incorrectly forced to use native snap props", cityList.includes('Platform.OS === "web" ? undefined')],
]);

const sectionOrder = [
  "home.sections.featured.title",
  "home.sections.outlets.title",
  "home.sections.activity.title",
  "home.sections.tools.title",
  "home.sections.cities.title",
];
const sectionPositions = sectionOrder.map((section) => source.indexOf(section));
const preservedHomeBehaviorErrors = errorsFor([
  ["Featured ScrollView carousel is missing", has(/ref=\{carouselRef\}[\s\S]*?onMomentumScrollEnd=\{handleCarouselScroll\}/)],
  ["Recommended ScrollView carousel is missing", has(/ref=\{recommendedCarouselRef\}[\s\S]*?onMomentumScrollEnd=\{handleRecommendedScroll\}/)],
  ["the two 5,500 ms timers were not preserved", (source.match(/\}, 5500\);/g)?.length ?? 0) === 2],
  ["Featured/Recommended programmatic scrolling was not preserved", (source.match(/\.scrollTo\(\{/g)?.length ?? 0) >= 2],
  ["Home section order changed", sectionPositions.every((position, index) => position >= 0 && (index === 0 || position > sectionPositions[index - 1]))],
  ["Share App behavior is missing", source.includes("async function shareApp()") && source.includes("Share.share(getAppSharePayload")],
  ["Rate App behavior is missing", source.includes("async function rateApp()") && source.includes("nativeIosReviewUrl")],
  ["diagnostic code was added to Home", !/StartupMountDiagnostic|checkStartupMountDiagnostic|diagnostic/i.test(source)],
]);

const reports: Array<[string, string[]]> = [
  ["Popular Cities old-carousel reference list", popularCitiesOldCarouselReferences],
  ["Programmatic city command list", programmaticCityCommands],
  ["City timer/alignment list", cityTimerAlignment],
  ["FlatList configuration error list", flatListConfigurationErrors],
  ["Active-index safety error list", activeIndexSafetyErrors],
  ["Mobile-web indicator error list", mobileWebIndicatorErrors],
  ["Preserved Home behavior error list", preservedHomeBehaviorErrors],
];

for (const [label, errors] of reports) console.log(`${label}: ${JSON.stringify(errors)}`);
const errorCount = reports.reduce((count, [, errors]) => count + errors.length, 0);
console.log(`Error count: ${errorCount}`);
process.exitCode = errorCount === 0 ? 0 : 1;
