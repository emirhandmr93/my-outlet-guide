import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { app } from "./src/firebase/config";

export default function App() {
return (
<View style={styles.container}>
<Text style={styles.title}>MY OUTLET GUIDE</Text>
<Text style={styles.subtitle}>Firebase connected ✅</Text>
<Text style={styles.smallText}>{app.name}</Text>
<StatusBar style="auto" />
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#FFFFFF",
alignItems: "center",
justifyContent: "center",
padding: 24,
},
title: {
fontSize: 28,
fontWeight: "700",
color: "#0B1F3A",
marginBottom: 12,
},
subtitle: {
fontSize: 18,
color: "#C9A227",
marginBottom: 8,
},
smallText: {
fontSize: 14,
color: "#666666",
},
});