import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  EUROPEAN_OUTLET_INDEX_EDITION,
  EUROPEAN_OUTLET_RESEARCH_COPY,
  getEuropeanOutletCountryMetrics,
} from "../constants/europeanOutletResearch";
import { useLanguage } from "../contexts/LanguageContext";
import { formatCountryDisplayName } from "../utils/locationDisplay";
import type { RootStackParamList } from "../navigation/types";

const metrics = getEuropeanOutletCountryMetrics();

export function OutletShoppingIndexScreen() {
  const { language } = useLanguage();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const copy = EUROPEAN_OUTLET_RESEARCH_COPY[language];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>MY OUTLET GUIDE · {EUROPEAN_OUTLET_INDEX_EDITION}</Text>
        <Text style={styles.title}>{copy.indexTitle}</Text>
        <Text style={styles.subtitle}>{copy.indexSubtitle}</Text>
        <Text style={styles.intro}>{copy.indexIntro}</Text>
      </View>

      <View style={styles.list}>
        {metrics.map((metric) => (
          <Pressable
            key={metric.countryId}
            accessibilityRole="button"
            onPress={() => navigation.navigate("Country", { countryId: metric.countryId })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{metric.rank}</Text>
              </View>
              <View style={styles.countryBlock}>
                <Text style={styles.countryName}>{formatCountryDisplayName(metric.countryId, language)}</Text>
                <Text style={styles.countryCta}>{copy.openCountryLabel}</Text>
              </View>
              <View style={styles.scoreBlock}>
                <Text style={styles.score}>{metric.score}</Text>
                <Text style={styles.scoreLabel}>{copy.scoreLabel}</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <Stat label={copy.outletsLabel} value={metric.outletCount} />
              <Stat label={copy.brandsLabel} value={metric.brandCount} />
              <Stat label={copy.citiesLabel} value={metric.cityCount} />
              <Stat label={copy.transportLabel} value={`${metric.transportCoveragePct}%`} />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.note}>{copy.indexCaveat}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("EditorialMethodology")}>
          <Text style={styles.primaryButtonText}>{copy.methodologyCta}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("TaxFreeCalculator")}>
          <Text style={styles.secondaryButtonText}>{copy.taxFreeCta}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 32, paddingBottom: 120, maxWidth: 980, width: "100%", alignSelf: "center" },
  hero: { marginBottom: 24 },
  eyebrow: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#0B1F3A", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#0B1F3A", fontSize: 18, lineHeight: 25, fontWeight: "700", marginTop: 8 },
  intro: { color: "#5F6875", fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 820 },
  list: { gap: 12 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E5E7EB", padding: 18 },
  cardPressed: { opacity: 0.78 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankBadge: { minWidth: 42, height: 42, borderRadius: 12, backgroundColor: "#F3E9BF", alignItems: "center", justifyContent: "center" },
  rankText: { color: "#7A6214", fontWeight: "900" },
  countryBlock: { flex: 1 },
  countryName: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  countryCta: { color: "#7A8492", fontSize: 12, marginTop: 3 },
  scoreBlock: { alignItems: "flex-end" },
  score: { color: "#0B1F3A", fontSize: 24, fontWeight: "900" },
  scoreLabel: { color: "#7A8492", fontSize: 11 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, gap: 8 },
  stat: { minWidth: 130, flexGrow: 1, flexBasis: 130, backgroundColor: "#F7F8FA", borderRadius: 12, padding: 12 },
  statValue: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  statLabel: { color: "#6B7280", fontSize: 11, marginTop: 2 },
  noteCard: { backgroundColor: "#FFF9E8", borderRadius: 16, borderWidth: 1, borderColor: "#E8D58A", padding: 16, marginTop: 20 },
  note: { color: "#665313", fontSize: 13, lineHeight: 20 },
  actions: { marginTop: 18, gap: 10 },
  primaryButton: { backgroundColor: "#0B1F3A", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: { backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center", borderWidth: 1, borderColor: "#D8DDE5" },
  secondaryButtonText: { color: "#0B1F3A", fontWeight: "900" },
});
