import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "src/navigation/AppNavigator.tsx"), "utf8");
const diagnostic = fs.readFileSync(path.join(root, "src/navigation/StartupMountDiagnostic.tsx"), "utf8");
const home = fs.readFileSync(path.join(root, "src/screens/HomeScreen.tsx"), "utf8");
const expected = ["chooser", "build3-stack", "current-stack", "simple-tabs", "stack-simple-tabs", "stack-home-tabs", "full-current-app", "home-hooks-only", "home-header-search", "home-featured-only", "home-recommended-only", "home-static-only", "home-cities-only", "home-full-no-effects-no-modal", "home-modal-only", "home-all-carousels", "home-three-scroll-shells", "home-progressive-forward", "home-progressive-reverse", "home-featured-recommended", "home-featured-cities", "home-recommended-cities", "home-delayed-featured", "home-delayed-recommended", "home-delayed-cities", "home-featured-recommended-no-metrics", "home-delayed-featured-no-metrics", "home-featured-recommended-no-images", "home-delayed-featured-no-images", "home-featured-recommended-one-item", "home-lightweight-all-carousels"];
const errors = (checks: Array<[boolean,string]>) => checks.filter(([ok]) => !ok).map(([,message]) => message);
const gate = app.indexOf('Platform.OS === "ios" && IOS_STARTUP_MOUNT_DIAGNOSTIC_ENABLED');
const onboarding = app.indexOf("if (shouldShowOnboarding)");
const currentTree = app.indexOf("const currentAppNavigationTree");
const build3 = diagnostic.slice(diagnostic.indexOf("function Build3StackDiagnostic"), diagnostic.indexOf("function CurrentShell"));
const simple = diagnostic.slice(diagnostic.indexOf("function PlainTabs"), diagnostic.indexOf("type Props"));
const current = diagnostic.slice(diagnostic.indexOf("function CurrentShell"), diagnostic.indexOf("const choices"));
const storageTerms = ["AsyncStorage", "Firebase", "SecureStore", "setTimeout", "setInterval", "URLSearchParams", "process.env"];
const diagnosticGateErrors = errors([
  [gate > onboarding && onboarding >= 0, "iOS gate must occur after onboarding gate"],
  [app.includes('Platform.OS === "ios" && IOS_STARTUP_MOUNT_DIAGNOSTIC_ENABLED && !shouldShowOnboarding'), "exact iOS-only gate missing"],
  [diagnostic.includes("export const IOS_STARTUP_MOUNT_DIAGNOSTIC_ENABLED = true;"), "enabled constant must be explicitly true"],
]);
const persistenceErrors = errors([
  [diagnostic.includes('useState<Stage>("chooser")'), "stage state must default to chooser"],
  [storageTerms.every(term => !diagnostic.includes(term)), "diagnostic must not persist or automatically advance stage"],
]);
const build3Errors = errors([
  [build3.includes("<NavigationContainer>"), "plain NavigationContainer missing"],
  [build3.includes("Build3.Navigator"), "build 3 native stack missing"],
  [!build3.includes("direction=") && !build3.includes("NativeDirectionRoot") && !build3.includes("ref="), "build 3 must not use direction/root/ref"],
  [!build3.includes("headerLeft") && !build3.includes("headerTitle:"), "build 3 must not customize header left/title"],
  [build3.includes("BUILD 3 STACK MOUNTED") || diagnostic.includes("BUILD 3 STACK MOUNTED"), "build 3 text missing"],
]);
const currentStackErrors = errors([
  [current.includes("NativeDirectionRoot") && current.includes("direction={direction}") && current.includes("ref={currentRef}"), "current direction/root/ref missing"],
  [current.includes("screenOptions={screenOptions as never}"), "current header configuration missing"],
]);
const simpleTabsErrors = errors([
  [diagnostic.includes('stage === "simple-tabs"') && diagnostic.includes("<NavigationContainer><SimpleTabs /></NavigationContainer>"), "simple tabs stage missing"],
  [simple.includes('name="Home"') && simple.includes('name="Explore"') && simple.includes('name="MyTrips"') && simple.includes('name="Savings"') && simple.includes('name="Profile"'), "five simple tabs missing"],
  [diagnostic.includes("const SimpleTabs = () => <PlainTabs />") && !diagnostic.includes("const SimpleTabs = () => <Current"), "simple tabs includes production home or outer stack"],
]);
const stackTabsErrors = errors([
  [diagnostic.includes('stage === "stack-simple-tabs"') && current.includes('tabs === "simple"'), "stack + simple tabs mapping missing"],
  [current.includes("Current.Navigator") && current.includes("StackTabs"), "native stack + bottom tabs composition missing"],
]);
const realHomeProbeErrors = errors([
  [diagnostic.includes("const CurrentHomeTabs = () => <HomeTabs />") && diagnostic.includes('stage === "stack-home-tabs"'), "real Home is not mounted without a diagnostic prop"],
  [["Explore","MyTrips","Savings","Profile"].every(name => diagnostic.includes(`<Tabs.Screen name="${name}" component={HomeProbeScreen} />`)), "non-Home tabs are not all plain probes"],
]);
const homeModes = ["hooks-only", "header-search", "featured-only", "recommended-only", "static-only", "cities-only", "full-no-effects-no-modal", "modal-only"];
const hooksOnlyReturn = home.slice(home.indexOf('if (diagnosticMode === "hooks-only")'), home.indexOf('if (diagnosticMode === "modal-only")'));
const homeLayerDiagnosticErrors = errors([
  [homeModes.every(mode => diagnostic.includes(`"${mode}"`)), "all eight Home diagnostic modes must exist"],
  [homeModes.every(mode => diagnostic.includes(`"home-${mode}"`)), "all eight Home stage IDs must map to modes"],
  [diagnostic.includes('return <CurrentShell {...props} tabs="home" homeMode={homeMode} />'), "Home stages must share current stack + tabs shell"],
  [["Explore","MyTrips","Savings","Profile"].every(name => diagnostic.includes(`<Tabs.Screen name="${name}" component={HomeProbeScreen} />`)), "non-Home diagnostic tabs must remain plain"],
  [hooksOnlyReturn.includes("HOME HOOKS MOUNTED") && ["ScrollView","Image","ImageBackground","HomeHeader","SearchBar","Modal"].every(term => !hooksOnlyReturn.includes(term)), "hooks-only return must be plain"],
  [home.includes("export function HomeScreen({ diagnosticMode") && home.indexOf('if (diagnosticMode === "hooks-only")') > home.lastIndexOf("useEffect(() =>"), "hooks-only must execute the full unconditional hook/effect path"],
  [(home.match(/if \(!homeEffectsEnabled\) return;/g) ?? []).length === 4 && home.includes("const homeEffectsEnabled = diagnosticMode === undefined"), "non-current modes must disable all programmatic effects while default enables them"],
  [home.includes('diagnosticMode === "header-search"') && home.includes("<HomeHeader") && home.includes("<SearchBar"), "header/search mode must use real components"],
  [home.includes('diagnosticMode === "featured-only"') && home.includes("FEATURED CAROUSEL MOUNTED"), "Featured-only mode missing"],
  [home.includes('diagnosticMode === "recommended-only"') && home.includes("RECOMMENDED CAROUSEL MOUNTED"), "Recommended-only mode missing"],
  [home.includes('diagnosticMode === "static-only"') && home.includes("STATIC HOME SECTIONS MOUNTED"), "static-only mode missing"],
  [home.includes('diagnosticMode === "cities-only"') && home.includes("POPULAR CITIES MOUNTED") && home.includes("cityPageCount"), "cities-only carousel/dots missing"],
  [home.includes('diagnosticMode === "full-no-effects-no-modal"') && home.includes('showQuickMenu = diagnosticMode === undefined || diagnosticMode === "modal-only"'), "full-no-effects mode must exclude Modal"],
  [home.includes('diagnosticMode === "modal-only"') && home.includes("quickMenuModal(false)") && home.includes("HOME MODAL MOUNTED"), "modal-only mode missing hidden current Modal"],
  [diagnostic.includes("const CurrentHomeTabs = () => <HomeTabs />") && !diagnostic.includes('<HomeTabs diagnosticMode={undefined}'), "existing full Home stage must remain unmodified"],
]);
const markerGuards: Array<[string, string]> = [
  ["header-search", "HOME HEADER AND SEARCH MOUNTED"],
  ["featured-only", "FEATURED CAROUSEL MOUNTED"],
  ["recommended-only", "RECOMMENDED CAROUSEL MOUNTED"],
  ["static-only", "STATIC HOME SECTIONS MOUNTED"],
  ["cities-only", "POPULAR CITIES MOUNTED"],
  ["full-no-effects-no-modal", "FULL HOME WITHOUT EFFECTS OR MODAL"],
];
const productionFaithfulHomeErrors = errors([
  [markerGuards.every(([mode, marker]) => home.includes(`diagnosticMode === "${mode}" ? <Text>${marker}</Text> : null`)), "every visual-tree marker must use its exact diagnostic mode guard"],
  [home.includes('if (diagnosticMode === "hooks-only")') && home.includes("HOME HOOKS MOUNTED"), "hooks-only marker guard missing"],
  [home.includes('if (diagnosticMode === "modal-only")') && home.includes("HOME MODAL MOUNTED"), "modal-only marker guard missing"],
  [home.includes("const showFullVisualTree = diagnosticMode === undefined") && markerGuards.every(([mode, marker]) => !home.includes(`showFullVisualTree ? <Text>${marker}`)), "default Home may expose a diagnostic marker"],
  [diagnostic.includes("const CurrentHomeTabs = () => <HomeTabs />") && !diagnostic.includes('<CurrentHomeTabs diagnosticMode='), "stack-home-tabs must mount HomeScreen without a diagnostic prop"],
  [diagnostic.includes('if (stage === "full-current-app") return props.fullCurrentApp'), "full-current-app must delegate to current production tree"],
  [markerGuards.every(([mode, marker]) => markerGuards.filter(([otherMode]) => otherMode !== mode).every(([, otherMarker]) => !`diagnosticMode === "${mode}" ? <Text>${marker}</Text> : null`.includes(otherMarker))), "an isolated visual stage can expose another stage marker"],
]);
const combinedModes = ["all-carousels", "three-scroll-shells", "progressive-forward", "progressive-reverse"];
const plainShellStart = home.indexOf('if (diagnosticMode === "three-scroll-shells")');
const plainShell = home.slice(plainShellStart, home.indexOf("\n\n  return (\n    <>", plainShellStart));
const combinedHomeDiagnosticErrors = errors([
  [expected.length >= 19, "the existing 19 diagnostic stages must remain"],
  [combinedModes.every(mode => diagnostic.includes(`"home-${mode}"`) && diagnostic.includes(`"${mode}"`)), "all four combined Home stages and modes must exist"],
  [diagnostic.includes('const homeMode = [...homeChoices, ...combinedHomeChoices, ...finalCarouselChoices, ...imageMeasurementChoices]') && diagnostic.includes('return <CurrentShell {...props} tabs="home" homeMode={homeMode} />'), "combined stages must share current stack + tabs shell"],
  [["Explore","MyTrips","Savings","Profile"].every(name => diagnostic.includes(`<Tabs.Screen name="${name}" component={HomeProbeScreen} />`)), "combined non-Home tabs must remain plain"],
  [home.includes('const showAllCarousels = diagnosticMode === "all-carousels"') && home.includes('const showFeatured = showFullVisualTree || showAllCarousels') && home.includes('const showRecommended = showFullVisualTree || showAllCarousels') && home.includes('const showCities = showFullVisualTree || showAllCarousels'), "all-carousels must enable Featured, Recommended, and Cities"],
  [home.includes('const showHeaderSearch = showFullVisualTree || diagnosticMode === "header-search"') && home.includes('const showStatic = showFullVisualTree || diagnosticMode === "static-only"'), "all-carousels must exclude Header/Search and Static"],
  [home.includes("ALL HOME CAROUSELS MOUNTED") && home.includes('const showQuickMenu = diagnosticMode === undefined || diagnosticMode === "modal-only"'), "all-carousels marker or Modal exclusion missing"],
  [(plainShell.match(/<ScrollView/g) ?? []).length === 4 && (plainShell.match(/horizontal/g) ?? []).length === 3, "three-scroll-shells must contain one vertical and exactly three horizontal ScrollViews"],
  [plainShell.includes("plainCards") && plainShell.includes("<View") && ["Image", "ImageBackground", "HomeHeader", "SearchBar", "DashboardSectionHeader", "Modal", "onMomentumScrollEnd", "onContentSizeChange", "onLayout", "scrollTo", "requestAnimationFrame"].every(term => !plainShell.includes(term)), "three-scroll-shells must be plain and command-free"],
  [home.includes('const progressiveForwardOrder = ["Header/Search", "Featured", "Recommended", "Static Activity/Tools", "Popular Cities"]'), "progressive forward order is incorrect"],
  [home.includes('const progressiveReverseOrder = ["Popular Cities", "Static Activity/Tools", "Recommended", "Featured", "Header/Search"]'), "progressive reverse order is incorrect"],
  [home.includes("const [diagnosticProgressStep, setDiagnosticProgressStep] = useState(0)") && home.includes("Math.min(step + 1, 5)"), "progressive state must default to zero and increment/clamp at five"],
  [home.includes("mountedProgressiveSections") && home.includes("nextProgressiveSection") && home.includes("MOUNT NEXT SECTION"), "progressive manual controls are incomplete"],
  [home.includes('const homeEffectsEnabled = diagnosticMode === undefined') && home.includes('const showQuickMenu = diagnosticMode === undefined || diagnosticMode === "modal-only"'), "combined effects or Modal exclusion is incorrect"],
  [!["setTimeout", "InteractionManager"].some(term => home.includes(term)), "automatic progressive scheduling is forbidden"],
  [diagnostic.includes('useState<Stage>("chooser")') && !diagnostic.includes("AsyncStorage"), "combined stage persistence is forbidden"],
]);
const finalCarouselModes = ["featured-recommended", "featured-cities", "recommended-cities", "delayed-featured", "delayed-recommended", "delayed-cities"];
const finalCarouselIsolationErrors = errors([
  [expected.length >= 25, "the existing 25 diagnostic stages must remain"],
  [finalCarouselModes.every(mode => diagnostic.includes(`"home-${mode}"`) && diagnostic.includes(`"${mode}"`)), "all six final carousel stages and modes must exist"],
  [diagnostic.includes('const homeMode = [...homeChoices, ...combinedHomeChoices, ...finalCarouselChoices, ...imageMeasurementChoices]') && diagnostic.includes('return <CurrentShell {...props} tabs="home" homeMode={homeMode} />'), "final carousel stages must share current stack + tabs shell"],
  [["Explore","MyTrips","Savings","Profile"].every(name => diagnostic.includes(`<Tabs.Screen name="${name}" component={HomeProbeScreen} />`)), "final carousel non-Home tabs must remain plain"],
  [home.includes('const showFeaturedRecommended = diagnosticMode === "featured-recommended"') && home.includes("showFeaturedRecommended || showFeaturedCities") && home.includes("showFeaturedRecommended || showRecommendedCities"), "Featured + Recommended initial pair is incorrect"],
  [home.includes('const showFeaturedCities = diagnosticMode === "featured-cities"') && home.includes("showFeaturedRecommended || showFeaturedCities") && home.includes("showFeaturedCities || showRecommendedCities"), "Featured + Cities initial pair is incorrect"],
  [home.includes('const showRecommendedCities = diagnosticMode === "recommended-cities"') && home.includes("showFeaturedRecommended || showRecommendedCities") && home.includes("showFeaturedCities || showRecommendedCities"), "Recommended + Cities initial pair is incorrect"],
  [["FEATURED AND RECOMMENDED MOUNTED", "FEATURED AND CITIES MOUNTED", "RECOMMENDED AND CITIES MOUNTED"].every(marker => home.includes(marker)), "static pair markers are incomplete"],
  [home.includes("const [diagnosticDelayedCarouselMounted, setDiagnosticDelayedCarouselMounted] = useState(false)"), "delayed state must be component-local and default false"],
  [home.includes('const isDelayedFeatured = diagnosticMode === "delayed-featured"') && home.includes('const isDelayedRecommended = diagnosticMode === "delayed-recommended"') && home.includes('const isDelayedCities = diagnosticMode === "delayed-cities"'), "delayed mode selectors are incomplete"],
  [home.includes("isDelayedFeatured || isDelayedFinalFeatured") && home.includes("isDelayedRecommended && diagnosticDelayedCarouselMounted") && home.includes("isDelayedCities && diagnosticDelayedCarouselMounted"), "delayed stages must initially mount zero and then exactly their requested carousel"],
  [home.includes("MOUNT CAROUSEL") && home.includes("setDiagnosticDelayedCarouselMounted(true)") && (home.match(/setDiagnosticDelayedCarouselMounted\(true\)/g) ?? []).length === 1, "delayed stages need exactly one explicit mount action"],
  [["DELAYED FEATURED READY", "DELAYED FEATURED MOUNTED", "DELAYED RECOMMENDED READY", "DELAYED RECOMMENDED MOUNTED", "DELAYED CITIES READY", "DELAYED CITIES MOUNTED"].every(marker => home.includes(marker)), "delayed ready/mounted markers are incomplete"],
  [!["setTimeout", "InteractionManager"].some(term => home.includes(term)), "automatic delayed advancement is forbidden"],
  [home.includes('const homeEffectsEnabled = diagnosticMode === undefined') && home.includes('const showQuickMenu = diagnosticMode === undefined || diagnosticMode === "modal-only"'), "final carousel modes must disable effects and exclude Modal"],
  [diagnostic.includes('useState<Stage>("chooser")') && !["AsyncStorage", "Firebase", "SecureStore", "URLSearchParams"].some(term => diagnostic.includes(term)), "final carousel persistence is forbidden"],
]);
const imageMeasurementModes = ["featured-recommended-no-metrics", "delayed-featured-no-metrics", "featured-recommended-no-images", "delayed-featured-no-images", "featured-recommended-one-item", "lightweight-all-carousels"];
const imageMeasurementIsolationErrors = errors([
  [expected.length === 31, "final diagnostic stage count must be 31"],
  [imageMeasurementModes.every(mode => diagnostic.includes(`"home-${mode}"`) && diagnostic.includes(`"${mode}"`)), "all six image/measurement stages and modes must exist"],
  [diagnostic.includes('const homeMode = [...homeChoices, ...combinedHomeChoices, ...finalCarouselChoices, ...imageMeasurementChoices]') && diagnostic.includes('return <CurrentShell {...props} tabs="home" homeMode={homeMode} />'), "new stages must share current stack + tabs shell"],
  [home.includes('const carouselMetricsEnabled = !showFeaturedRecommendedNoMetrics && !isDelayedFeaturedNoMetrics') && home.includes("ref={carouselMetricsEnabled ? carouselRef : undefined}") && home.includes("ref={carouselMetricsEnabled ? recommendedCarouselRef : undefined}"), "no-metrics modes must detach carousel refs"],
  [home.includes("snapToOffsets={carouselMetricsEnabled ? featuredNativeSnapOffsets : undefined}") && home.includes("snapToOffsets={carouselMetricsEnabled ? recommendedNativeSnapOffsets : undefined}") && home.includes("onLayout={carouselMetricsEnabled ?") && home.includes("onContentSizeChange={carouselMetricsEnabled ?"), "no-metrics modes must detach measurement and offset wiring"],
  [home.includes('const carouselImagesEnabled = !showFeaturedRecommendedNoImages && !isDelayedFeaturedNoImages') && home.includes("FeaturedImageContainer") && home.includes("RecommendedImageContainer"), "no-images modes must replace both image containers"],
  [home.includes("showFeaturedRecommendedOneItem ? slides.slice(0, 1)") && home.includes("showFeaturedRecommendedOneItem ? recommendedOutlets.slice(0, 1)"), "one-item mode must render only the first item in both real carousels"],
  [(home.match(/<FlatList/g) ?? []).length === 2 && home.includes("initialNumToRender={1}") && home.includes("initialNumToRender={2}") && home.split("maxToRenderPerBatch={1}").length - 1 === 2 && home.split("windowSize={3}").length - 1 === 2, "lightweight mode must use the required two diagnostic FlatLists"],
  [(home.match(/getItemLayout=/g) ?? []).length >= 2 && home.includes("handleLightweightRecommendedScroll") && home.includes("handleLightweightCityScroll"), "lightweight lists need stable layouts and manual indicators"],
  [["FEATURED AND RECOMMENDED NO METRICS MOUNTED", "DELAYED FEATURED NO METRICS READY", "DELAYED FEATURED NO METRICS MOUNTED", "FEATURED AND RECOMMENDED NO IMAGES MOUNTED", "DELAYED FEATURED NO IMAGES READY", "DELAYED FEATURED NO IMAGES MOUNTED", "FEATURED AND RECOMMENDED ONE ITEM MOUNTED", "LIGHTWEIGHT ALL CAROUSELS MOUNTED"].every(marker => home.includes(marker)), "new diagnostic markers are incomplete"],
  [home.includes('const homeEffectsEnabled = diagnosticMode === undefined') && home.includes('const showQuickMenu = diagnosticMode === undefined || diagnosticMode === "modal-only"'), "new modes must disable effects and exclude Modal without changing default Home"],
]);
const fullAppErrors = errors([
  [diagnostic.includes("return props.fullCurrentApp"), "full stage does not delegate to current app tree"],
  [currentTree >= 0 && gate > currentTree, "current production tree is not retained before diagnostic selection"],
]);
const platformProtectionErrors = errors([
  [app.includes('Platform.OS === "ios"'), "iOS platform guard missing"],
  [app.includes("return currentAppNavigationTree"), "Android/web normal return missing"],
  [onboarding >= 0 && onboarding < gate, "onboarding must precede diagnostic gate"],
]);
const lists = [diagnosticGateErrors,persistenceErrors,build3Errors,currentStackErrors,simpleTabsErrors,stackTabsErrors,realHomeProbeErrors,homeLayerDiagnosticErrors,productionFaithfulHomeErrors,combinedHomeDiagnosticErrors,finalCarouselIsolationErrors,imageMeasurementIsolationErrors,fullAppErrors,platformProtectionErrors];
console.log("Stage ID list:", JSON.stringify(expected));
console.log("Diagnostic gate error list:", JSON.stringify(diagnosticGateErrors));
console.log("Persistence error list:", JSON.stringify(persistenceErrors));
console.log("Build 3 stack error list:", JSON.stringify(build3Errors));
console.log("Current stack error list:", JSON.stringify(currentStackErrors));
console.log("Simple tabs error list:", JSON.stringify(simpleTabsErrors));
console.log("Stack-tabs error list:", JSON.stringify(stackTabsErrors));
console.log("Real Home probe error list:", JSON.stringify(realHomeProbeErrors));
console.log("Home layer diagnostic error list:", JSON.stringify(homeLayerDiagnosticErrors));
console.log("Production-faithful Home error list:", JSON.stringify(productionFaithfulHomeErrors));
console.log("Combined Home diagnostic error list:", JSON.stringify(combinedHomeDiagnosticErrors));
console.log("Final carousel isolation error list:", JSON.stringify(finalCarouselIsolationErrors));
console.log("Image and measurement isolation error list:", JSON.stringify(imageMeasurementIsolationErrors));
console.log("Full app error list:", JSON.stringify(fullAppErrors));
console.log("Platform protection error list:", JSON.stringify(platformProtectionErrors));
const count = lists.reduce((sum,list) => sum + list.length, 0);
console.log("Error count:", count);
process.exitCode = count === 0 ? 0 : 1;
