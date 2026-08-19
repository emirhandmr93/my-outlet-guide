import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { EUROPEAN_OUTLET_RESEARCH_COPY } from "../constants/europeanOutletResearch";
import { useLanguage } from "../contexts/LanguageContext";
import type { RootStackParamList } from "../navigation/types";

export function EditorialMethodologyScreen() {
  const { language } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const copy = EUROPEAN_OUTLET_RESEARCH_COPY[language];
  const sections = [
    [copy.scopeTitle, copy.scopeText],
    [copy.sourcesTitle, copy.sourcesText],
    [copy.scoreTitle, copy.scoreText],
    [copy.freshnessTitle, copy.freshnessText],
    [copy.taxTitle, copy.taxText],
    [copy.limitationsTitle, copy.limitationsText],
    [copy.contactTitle, copy.contactText],
  ] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>MY OUTLET GUIDE</Text>
      <Text style={styles.title}>{copy.methodologyTitle}</Text>
      <Text style={styles.subtitle}>{copy.methodologySubtitle}</Text>

      <View style={styles.sections}>
        {sections.map(([title, text]) => (
          <View key={title} style={styles.card}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("OutletShoppingIndex")}>
          <Text style={styles.primaryButtonText}>{copy.indexTitle}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("ContactUs")}>
          <Text style={styles.secondaryButtonText}>{copy.contactTitle}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 32, paddingBottom: 120, maxWidth: 900, width: "100%", alignSelf: "center" },
  eyebrow: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#0B1F3A", fontSize: 30, lineHeight: 36, fontWeight: "900" },
  subtitle: { color: "#5F6875", fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 24 },
  sections: { gap: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", padding: 18 },
  cardTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  cardText: { color: "#5F6875", fontSize: 14, lineHeight: 22 },
  actions: { marginTop: 20, gap: 10 },
  primaryButton: { backgroundColor: "#0B1F3A", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  secondaryButton: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center", borderWidth: 1, borderColor: "#D8DDE5" },
  secondaryButtonText: { color: "#0B1F3A", fontWeight: "900" },
});
