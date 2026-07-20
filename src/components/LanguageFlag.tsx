import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

type LanguageFlagProps = {
  flag: string;
  languageName: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

function regionalIndicatorToIsoCode(flag: string) {
  const codePoints = Array.from(flag).map((character) => character.codePointAt(0));

  if (
    codePoints.length !== 2 ||
    codePoints.some(
      (codePoint) =>
        codePoint === undefined || codePoint < 0x1f1e6 || codePoint > 0x1f1ff,
    )
  ) {
    return undefined;
  }

  return String.fromCharCode(...codePoints.map((codePoint) => 65 + (codePoint! - 0x1f1e6)));
}

export function LanguageFlag({ flag, languageName, size = 24, style }: LanguageFlagProps) {
  const [hasFailed, setHasFailed] = useState(false);
  const isoCode = regionalIndicatorToIsoCode(flag);
  const flattenedStyle = StyleSheet.flatten(style);

  useEffect(() => {
    setHasFailed(false);
  }, [flag]);

  if (Platform.OS !== "web") {
    return <Text style={[styles.nativeFlag, { fontSize: size }, style]}>{flag}</Text>;
  }

  const height = Math.round(size * 0.75);

  if (hasFailed || !isoCode) {
    return (
      <View
        accessibilityLabel={languageName}
        style={[styles.placeholder, { width: size, height }, style]}
      >
        <View style={styles.placeholderGlobe} />
      </View>
    );
  }

  return React.createElement("img", {
    src: `https://flagcdn.com/w80/${isoCode.toLowerCase()}.png`,
    alt: languageName,
    "aria-label": languageName,
    onError: () => setHasFailed(true),
    style: {
      display: "block",
      width: size,
      height,
      objectFit: "cover",
      borderRadius: 3,
      border: "1px solid rgba(11,31,58,0.20)",
      flexShrink: 0,
      ...(flattenedStyle as object),
    },
  });
}

const styles = StyleSheet.create({
  nativeFlag: { flexShrink: 0 },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(11,31,58,0.20)",
    flexShrink: 0,
  },
  placeholderGlobe: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#64748B",
  },
});
