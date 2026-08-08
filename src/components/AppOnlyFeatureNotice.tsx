import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { appStoreDownloadUrl, getAppDownloadStore, googlePlayDownloadUrl } from "../constants/appLinks";

type AppOnlyFeatureNoticeProps = { title: string; body: string; badge: string; ctaLabel: string; helperText?: string; compact?: boolean };

export function AppOnlyFeatureNotice({ title, body, badge, ctaLabel, helperText, compact = false }: AppOnlyFeatureNoticeProps) {
  const webStore = Platform.OS === "web" && typeof navigator !== "undefined"
    ? getAppDownloadStore(navigator.userAgent, navigator.maxTouchPoints)
    : null;
  const stores = Platform.OS === "android" || webStore === "google-play"
    ? [{ label: ctaLabel, url: googlePlayDownloadUrl }]
    : Platform.OS === "ios" || webStore === "app-store"
      ? [{ label: ctaLabel, url: appStoreDownloadUrl }]
      : [
          { label: "App Store", url: appStoreDownloadUrl },
          { label: "Google Play", url: googlePlayDownloadUrl },
        ];

  function openStore(url: string) {
    void Linking.openURL(url).catch(() => undefined);
  }

  return <View style={[styles.card, compact && styles.compact]}>
    <View style={styles.icon}><MaterialCommunityIcons name="cellphone" size={24} color="#C9A227" /></View>
    <Text style={styles.badge}>{badge}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
    {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    <View style={styles.storeActions}>
      {stores.map((store) => <TouchableOpacity
        key={store.url}
        accessibilityRole="link"
        accessibilityLabel={store.label}
        activeOpacity={0.84}
        onPress={() => openStore(store.url)}
        style={styles.cta}
      >
        <Text style={styles.ctaText}>{store.label}</Text>
      </TouchableOpacity>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  card: { width: "100%", maxWidth: 680, alignSelf: "center", backgroundColor: "#0B1F3A", borderRadius: 26, padding: 24, borderWidth: 1, borderColor: "#C9A227" }, compact: { padding: 18 },
  icon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(201,162,39,0.16)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  badge: { alignSelf: "flex-start", color: "#0B1F3A", backgroundColor: "#C9A227", overflow: "hidden", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontWeight: "900", letterSpacing: .7 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 12 }, body: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 8 }, helper: { color: "#C9A227", fontSize: 13, lineHeight: 19, marginTop: 10 },
  storeActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  cta: { flexGrow: 1, minWidth: 150, borderRadius: 16, padding: 14, backgroundColor: "#C9A227" }, ctaText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
