import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "src/navigation/AppNavigator.tsx"), "utf8");
const diagnostic = fs.readFileSync(path.join(root, "src/navigation/StartupMountDiagnostic.tsx"), "utf8");
const expected = ["chooser", "build3-stack", "current-stack", "simple-tabs", "stack-simple-tabs", "stack-home-tabs", "full-current-app"];
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
  [diagnostic.includes('<Tabs.Screen name="Home" component={HomeScreen} />'), "real Home is not mounted for Home"],
  [["Explore","MyTrips","Savings","Profile"].every(name => diagnostic.includes(`<Tabs.Screen name="${name}" component={HomeProbeScreen} />`)), "non-Home tabs are not all plain probes"],
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
const lists = [diagnosticGateErrors,persistenceErrors,build3Errors,currentStackErrors,simpleTabsErrors,stackTabsErrors,realHomeProbeErrors,fullAppErrors,platformProtectionErrors];
console.log("Stage ID list:", JSON.stringify(expected));
console.log("Diagnostic gate error list:", JSON.stringify(diagnosticGateErrors));
console.log("Persistence error list:", JSON.stringify(persistenceErrors));
console.log("Build 3 stack error list:", JSON.stringify(build3Errors));
console.log("Current stack error list:", JSON.stringify(currentStackErrors));
console.log("Simple tabs error list:", JSON.stringify(simpleTabsErrors));
console.log("Stack-tabs error list:", JSON.stringify(stackTabsErrors));
console.log("Real Home probe error list:", JSON.stringify(realHomeProbeErrors));
console.log("Full app error list:", JSON.stringify(fullAppErrors));
console.log("Platform protection error list:", JSON.stringify(platformProtectionErrors));
const count = lists.reduce((sum,list) => sum + list.length, 0);
console.log("Error count:", count);
process.exitCode = count === 0 ? 0 : 1;
