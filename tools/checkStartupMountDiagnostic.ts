import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "src/navigation/AppNavigator.tsx"), "utf8");
const diagnostic = fs.readFileSync(path.join(root, "src/navigation/StartupMountDiagnostic.tsx"), "utf8");
const home = fs.readFileSync(path.join(root, "src/screens/HomeScreen.tsx"), "utf8");
const expected = ["chooser", "build3-stack", "current-stack", "simple-tabs", "stack-simple-tabs", "stack-home-tabs", "full-current-app", "home-hooks-only", "home-header-search", "home-featured-only", "home-recommended-only", "home-static-only", "home-cities-only", "home-full-no-effects-no-modal", "home-modal-only"];
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
const fullAppErrors = errors([
  [diagnostic.includes("return props.fullCurrentApp"), "full stage does not delegate to current app tree"],
  [currentTree >= 0 && gate > currentTree, "current production tree is not retained before diagnostic selection"],
]);
const platformProtectionErrors = errors([
  [app.includes('Platform.OS === "ios"'), "iOS platform guard missing"],
  [app.includes("return currentAppNavigationTree"), "Android/web normal return missing"],
  [onboarding >= 0 && onboarding < gate, "onboarding must precede diagnostic gate"],
]);
const lists = [diagnosticGateErrors,persistenceErrors,build3Errors,currentStackErrors,simpleTabsErrors,stackTabsErrors,realHomeProbeErrors,homeLayerDiagnosticErrors,productionFaithfulHomeErrors,fullAppErrors,platformProtectionErrors];
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
console.log("Full app error list:", JSON.stringify(fullAppErrors));
console.log("Platform protection error list:", JSON.stringify(platformProtectionErrors));
const count = lists.reduce((sum,list) => sum + list.length, 0);
console.log("Error count:", count);
process.exitCode = count === 0 ? 0 : 1;
