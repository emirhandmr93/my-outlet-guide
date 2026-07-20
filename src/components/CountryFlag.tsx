import { useMemo, useState } from "react";
import { Image, Platform, StyleSheet, Text, type ImageStyle, type StyleProp } from "react-native";
import { countries } from "../constants/countries";

type CountryFlagProps = { countryId: string; size?: number; style?: StyleProp<ImageStyle> };

function getIsoCode(flag: string) {
  const indicators = Array.from(flag);
  const points = indicators.map((indicator) => indicator.codePointAt(0));
  if (points.length !== 2 || points.some((point) => !point || point < 0x1f1e6 || point > 0x1f1ff)) return null;
  return String.fromCharCode(...points.map((point) => point! - 0x1f1e6 + 65));
}

export function CountryFlag({ countryId, size = 28, style }: CountryFlagProps) {
  const country = useMemo(() => countries.find((item) => item.countryId === countryId), [countryId]);
  const [imageFailed, setImageFailed] = useState(false);
  const emoji = country?.countryFlag ?? "🌍";
  const isoCode = country ? getIsoCode(country.countryFlag) : null;
  const accessibilityLabel = `${country?.countryName ?? countryId} flag`;
  if (Platform.OS !== "web" || !isoCode || imageFailed) return <Text accessibilityLabel={accessibilityLabel} style={[styles.emoji, { fontSize: size }, style]}>{emoji}</Text>;
  return <Image source={{ uri: `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png` }} accessibilityLabel={accessibilityLabel} style={[styles.image, { width: size, height: Math.round(size * 0.75) }, style]} resizeMode="cover" onError={() => setImageFailed(true)} />;
}

const styles = StyleSheet.create({
  image: { borderRadius: 3, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(11,31,58,0.2)" },
  emoji: { includeFontPadding: false },
});
