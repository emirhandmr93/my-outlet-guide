import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeDirectionRoot } from "../hooks/useLayoutDirection";
import { HomeScreen } from "../screens/HomeScreen";

export const IOS_STARTUP_MOUNT_DIAGNOSTIC_ENABLED = true;
export const STARTUP_MOUNT_DIAGNOSTIC_STAGE_IDS = ["chooser", "build3-stack", "current-stack", "simple-tabs", "stack-simple-tabs", "stack-home-tabs", "full-current-app"] as const;
type Stage = (typeof STARTUP_MOUNT_DIAGNOSTIC_STAGE_IDS)[number];
type Tabs = { Home: undefined; Explore: undefined; MyTrips: undefined; Savings: undefined; Profile: undefined };
type StackParams = { Probe: undefined; MainTabs: undefined };
const Build3 = createNativeStackNavigator<StackParams>();
const Current = createNativeStackNavigator<StackParams>();
const Tabs = createBottomTabNavigator<Tabs>();
const currentRef = createNavigationContainerRef<StackParams>();
const Screen = ({ text }: { text: string }) => <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}><Text style={{ fontSize: 20, fontWeight: "800" }}>{text}</Text></View>;
const Build3Screen = () => <Screen text="BUILD 3 STACK MOUNTED" />;
const CurrentScreen = () => <Screen text="CURRENT LTR STACK MOUNTED" />;
const SimpleScreen = () => <Screen text="SIMPLE TABS MOUNTED" />;
const StackTabsScreen = () => <Screen text="STACK AND SIMPLE TABS MOUNTED" />;
const HomeProbeScreen = () => <Screen text="HOME TABS PROBE" />;
function PlainTabs({ component = SimpleScreen }: { component?: typeof SimpleScreen }) { return <Tabs.Navigator screenOptions={{ headerShown: false }}><Tabs.Screen name="Home" component={component} /><Tabs.Screen name="Explore" component={component} /><Tabs.Screen name="MyTrips" component={component} /><Tabs.Screen name="Savings" component={component} /><Tabs.Screen name="Profile" component={component} /></Tabs.Navigator>; }
const SimpleTabs = () => <PlainTabs />;
const StackTabs = () => <PlainTabs component={StackTabsScreen} />;
function HomeTabs() { return <Tabs.Navigator screenOptions={{ headerShown: false }}><Tabs.Screen name="Home" component={HomeScreen} /><Tabs.Screen name="Explore" component={HomeProbeScreen} /><Tabs.Screen name="MyTrips" component={HomeProbeScreen} /><Tabs.Screen name="Savings" component={HomeProbeScreen} /><Tabs.Screen name="Profile" component={HomeProbeScreen} /></Tabs.Navigator>; }
type Props = { direction: "ltr" | "rtl" | undefined; screenOptions: object | ((props: never) => object); fullCurrentApp: ReactNode };
function Build3StackDiagnostic() { return <NavigationContainer><Build3.Navigator screenOptions={{ headerShown: true, headerBackTitle: "Back", headerTintColor: "#0B1F3A", headerTitleStyle: { color: "#0B1F3A", fontWeight: "900" }, headerStyle: { backgroundColor: "#FFFFFF" } }}><Build3.Screen name="Probe" component={Build3Screen} /></Build3.Navigator></NavigationContainer>; }
function CurrentShell({ direction, screenOptions, tabs }: Props & { tabs?: "simple" | "home" }) { const component = tabs === "home" ? HomeTabs : tabs === "simple" ? StackTabs : CurrentScreen; const name = tabs ? "MainTabs" : "Probe"; return <NativeDirectionRoot><NavigationContainer direction={direction} ref={currentRef}><Current.Navigator screenOptions={screenOptions as never}><Current.Screen name={name} component={component} options={tabs ? { headerShown: false } : undefined} /></Current.Navigator></NavigationContainer></NativeDirectionRoot>; }
const choices: Array<[Exclude<Stage,"chooser">, string]> = [["build3-stack","Stage 1 — Build 3 style native stack"],["current-stack","Stage 2 — Current LTR stack shell"],["simple-tabs","Stage 3 — Simple bottom tabs"],["stack-simple-tabs","Stage 4 — Native stack + simple tabs"],["stack-home-tabs","Stage 5 — Native stack + tabs + real Home"],["full-current-app","Stage 6 — Full current app"]];
const guide = ["Build 3 stack fails → native-stack shell fails","Build 3 stack works, Current stack fails → current direction/header/root configuration","Current stack works, Simple tabs fails → bottom tabs layer","Simple tabs works, Stack + tabs fails → nested stack/tab composition","Stack + tabs works, Real Home fails → Home tree","Real Home works, Full app fails → full route/screen registration or configuration"];
function Chooser({ select }: { select: (stage: Exclude<Stage,"chooser">) => void }) { return <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 72, flexGrow: 1 }}><Text style={{ fontSize: 26, fontWeight: "900" }}>iOS Startup Mount Diagnostic</Text><Text style={{ marginVertical: 16 }}>Select one layer, then fully terminate and reopen the process.</Text>{choices.map(([id,label]) => <Pressable key={id} onPress={() => select(id)} style={{ backgroundColor: "#0B1F3A", padding: 16, marginBottom: 10 }}><Text style={{ color: "white", fontWeight: "800" }}>{label}</Text><Text style={{ color: "#C9A227" }}>{id}</Text></Pressable>)}<Text style={{ fontSize: 18, fontWeight: "900", marginTop: 16 }}>Interpretation guide</Text>{guide.map(x => <Text key={x} style={{ marginTop: 8 }}>• {x}</Text>)}</ScrollView>; }
export function StartupMountDiagnostic(props: Props) { const [stage, setStage] = useState<Stage>("chooser"); if (stage === "chooser") return <Chooser select={setStage} />; if (stage === "build3-stack") return <Build3StackDiagnostic />; if (stage === "current-stack") return <CurrentShell {...props} />; if (stage === "simple-tabs") return <NavigationContainer><SimpleTabs /></NavigationContainer>; if (stage === "stack-simple-tabs") return <CurrentShell {...props} tabs="simple" />; if (stage === "stack-home-tabs") return <CurrentShell {...props} tabs="home" />; return props.fullCurrentApp; }
