import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import colors from "../theme/colors";

type TravelBasketPromoCardProps = {
  onPress: () => void;
};

export function TravelBasketPromoCard({ onPress }: TravelBasketPromoCardProps) {
  const { t } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();

  return (
    <View style={styles.card}>
      <View style={[styles.header, isNativeRTL && styles.rowReverse]}>
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.iconCircle}>
          <MaterialCommunityIcons name="basket-outline" size={25} color={colors.gold} />
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.title, isNativeRTL && styles.rtlText]}>{t("travelBasket.promoTitle")}</Text>
          <Text style={[styles.body, isNativeRTL && styles.rtlText]}>{t("travelBasket.promoBody")}</Text>
        </View>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t("travelBasket.promoCta")}
        activeOpacity={0.78}
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{t("travelBasket.promoCta")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderColor: colors.gold,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  header: { alignItems: "flex-start", flexDirection: "row", gap: 14 },
  rowReverse: { flexDirection: "row-reverse" },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(201,162,39,0.16)",
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  textColumn: { flex: 1 },
  title: { color: colors.textInverse, fontSize: 20, fontWeight: "900" },
  body: { color: "#D8DEE9", fontSize: 14, lineHeight: 21, marginTop: 6 },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonText: { color: colors.primary, fontWeight: "900", textAlign: "center" },
});
