import { useState } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

import { countries } from "../constants/countries";
import { useTranslation } from "../hooks/useTranslation";
import { getLocalizedCountryName } from "../utils/localization";

type CountrySelectorProps = {
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
};

const desktopFlagSvgs: Record<string, string> = {
  france: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><path fill="#002654" d="M0 0h1v2H0z"/><path fill="#fff" d="M1 0h1v2H1z"/><path fill="#ed2939" d="M2 0h1v2H2z"/></svg>',
  turkey: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><path fill="#e30a17" d="M0 0h3v2H0z"/><path fill="#fff" d="M1.32.43a.57.57 0 1 0 0 1.14.46.46 0 1 1 0-1.14zM1.84.67l.07.2.21.01-.17.13.06.2-.17-.12-.17.12.06-.2-.17-.13.21-.01z"/></svg>',
  portugal: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><path fill="#006600" d="M0 0h1.2v2H0z"/><path fill="#ff0000" d="M1.2 0h1.8v2H1.2z"/><circle cx="1.2" cy="1" r=".39" fill="#ffcc00"/><circle cx="1.2" cy="1" r=".25" fill="#fff" stroke="#006600" stroke-width=".07"/><path fill="#e30a17" d="M1.12.82h.16v.36h-.16z"/></svg>',
  japan: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><path fill="#fff" d="M0 0h3v2H0z"/><circle cx="1.5" cy="1" r=".6" fill="#bc002d"/></svg>',
  switzerland: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path fill="#d52b1e" d="M0 0h1v1H0z"/><path fill="#fff" d="M.38.18h.24v.2h.2v.24h-.2v.2H.38v-.2h-.2V.38h.2z"/></svg>',
};

function getDesktopFlagUri(countryId: string) {
  const svg = desktopFlagSvgs[countryId];
  return svg ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` : null;
}

function getIsoCode(flag: string | undefined, countryId: string) {
  const indicators = Array.from(flag ?? "");
  if (
    indicators.length !== 2 ||
    indicators.some((indicator) => {
      const point = indicator.codePointAt(0);
      return !point || point < 0x1f1e6 || point > 0x1f1ff;
    })
  ) {
    return countryId.toUpperCase();
  }
  return indicators
    .map((indicator) => String.fromCharCode(indicator.codePointAt(0)! - 0x1f1e6 + 65))
    .join("");
}

export function SavingsCountryFlag({
  countryId,
  size = 28,
}: {
  countryId: string;
  size?: number;
}) {
  const country = countries.find((item) => item.countryId === countryId);
  const { width } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const uri = isDesktopWeb && !imageFailed ? getDesktopFlagUri(countryId) : null;
  const isoCode = getIsoCode(country?.countryFlag, countryId);

  if (uri) {
    return (
      <Image
        accessibilityLabel={`${country?.countryName ?? countryId} flag`}
        source={{ uri }}
        style={[styles.flagImage, { width: size, height: Math.round(size * 0.67) }]}
        onError={() => setImageFailed(true)}
      />
    );
  }

  if (isDesktopWeb) {
    return (
      <View accessibilityLabel={`${country?.countryName ?? countryId} flag`} style={[styles.isoFallback, { width: size, height: Math.round(size * 0.67) }]}>
        <Text style={[styles.isoFallbackText, { fontSize: Math.max(8, Math.round(size * 0.37)) }]}>{isoCode}</Text>
      </View>
    );
  }

  return <Text style={[styles.emoji, { fontSize: size }]}>{country?.countryFlag ?? "🌍"}</Text>;
}

export function CountrySelector({ selectedCountryId, onSelectCountry }: CountrySelectorProps) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) || countries[0];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("common.country")}</Text>
      <TouchableOpacity
        style={[styles.selectedBox, open && styles.selectedBoxOpen]}
        activeOpacity={0.86}
        onPress={() => setOpen((current) => !current)}
      >
        <View style={styles.countryRow}>
          <SavingsCountryFlag countryId={selectedCountry.countryId} size={24} />
          <Text style={styles.selectedText}>{getLocalizedCountryName(selectedCountry, language)}</Text>
        </View>
        <Text style={styles.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.optionsBox}>
          {countries.map((country, index) => (
            <TouchableOpacity
              key={country.countryId}
              style={[styles.option, index === countries.length - 1 && styles.optionLast]}
              activeOpacity={0.86}
              onPress={() => {
                onSelectCountry(country.countryId);
                setOpen(false);
              }}
            >
              <SavingsCountryFlag countryId={country.countryId} size={20} />
              <Text style={styles.optionText}>{getLocalizedCountryName(country, language)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: "#687386", fontSize: 12, fontWeight: "900", letterSpacing: 0.8, marginBottom: 8, textTransform: "uppercase" },
  selectedBox: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E0E5EC", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  selectedBoxOpen: { borderColor: "#C9A227" },
  countryRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  selectedText: { flex: 1, color: "#0B1F3A", fontSize: 16, fontWeight: "900", marginLeft: 10 },
  chevron: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginLeft: 12 },
  optionsBox: { marginTop: 8, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E0E5EC", overflow: "hidden" },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#E0E5EC", flexDirection: "row", alignItems: "center" },
  optionLast: { borderBottomWidth: 0 },
  optionText: { color: "#0B1F3A", fontSize: 14, fontWeight: "800", marginLeft: 10 },
  flagImage: { borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(11,31,58,0.2)" },
  isoFallback: { alignItems: "center", justifyContent: "center", borderRadius: 2, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(11,31,58,0.2)", backgroundColor: "#F7F8FA" },
  isoFallbackText: { color: "#0B1F3A", fontWeight: "900" },
  emoji: { includeFontPadding: false },
});
