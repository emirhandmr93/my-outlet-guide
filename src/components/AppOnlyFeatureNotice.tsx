import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type AppOnlyFeatureNoticeProps = { title: string; body: string; badge: string; ctaLabel: string; helperText?: string; compact?: boolean };

/** A single, intentionally inactive launch point for the future app-opening flow. */
export function AppOnlyFeatureNotice({ title, body, badge, ctaLabel, helperText, compact = false }: AppOnlyFeatureNoticeProps) {
  return <View style={[styles.card, compact && styles.compact]}>
    <View style={styles.icon}><MaterialCommunityIcons name="cellphone" size={24} color="#C9A227" /></View>
    <Text style={styles.badge}>{badge}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
    {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    <View accessibilityState={{ disabled: true }} style={styles.cta}><Text style={styles.ctaText}>{ctaLabel}</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  card: { width: "100%", maxWidth: 680, alignSelf: "center", backgroundColor: "#0B1F3A", borderRadius: 26, padding: 24, borderWidth: 1, borderColor: "#C9A227" }, compact: { padding: 18 },
  icon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(201,162,39,0.16)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  badge: { alignSelf: "flex-start", color: "#0B1F3A", backgroundColor: "#C9A227", overflow: "hidden", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: "900", letterSpacing: .7 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 12 }, body: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 8 }, helper: { color: "#C9A227", fontSize: 13, lineHeight: 19, marginTop: 10 },
  cta: { marginTop: 18, borderRadius: 16, padding: 14, backgroundColor: "rgba(255,255,255,0.12)", opacity: .72 }, ctaText: { color: "#FFF", fontWeight: "900", textAlign: "center" },
});
