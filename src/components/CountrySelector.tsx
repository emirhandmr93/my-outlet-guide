import { useEffect, useState } from "react";
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { countries } from "../constants/countries";
import { useTranslation } from "../hooks/useTranslation";
import { getLocalizedCountryName } from "../utils/localization";
import { DropdownOption, DropdownSelector } from "./DropdownSelector";

type CountrySelectorProps = { selectedCountryId: string; onSelectCountry: (countryId: string) => void };
type FlagArtwork = { svg: string; ratio: number };

const svg = (ratio: number, content: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ratio} 1">${content}</svg>`;
const horizontal = (ratio: number, colors: string[]) => svg(ratio, colors.map((color, index) => `<rect y="${index * 100 / colors.length}%" width="100%" height="${100 / colors.length}%" fill="${color}"/>`).join(""));
const vertical = (ratio: number, colors: string[]) => svg(ratio, colors.map((color, index) => `<rect x="${index * 100 / colors.length}%" width="${100 / colors.length}%" height="100%" fill="${color}"/>`).join(""));
const flag = (ratio: number, content: string) => svg(ratio, content);

const desktopFlags: Record<string, FlagArtwork> = {
  austria: { ratio: 1.5, svg: horizontal(1.5, ["#ed2939", "#fff", "#ed2939"]) },
  belgium: { ratio: 13 / 15, svg: vertical(13 / 15, ["#000", "#ffd90c", "#ef3340"]) },
  canada: { ratio: 2, svg: flag(2, '<rect width="25%" height="100%" fill="#d80621"/><rect x="25%" width="50%" height="100%" fill="#fff"/><rect x="75%" width="25%" height="100%" fill="#d80621"/><path d="M1 .17l.06.2.1-.08-.03.16.15.02-.16.11.1.09-.2-.03L1 .78.98.64l-.2.03.1-.09-.16-.11.15-.02-.03-.16.1.08z" fill="#d80621"/>') },
  china: { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="100%" fill="#de2910"/><path d="M.24.16l.035.1.105.002-.084.064.03.1-.086-.06-.086.06.03-.1-.084-.064.105-.002z" fill="#ffde00"/>') },
  croatia: { ratio: 2, svg: horizontal(2, ["#ff0000", "#fff", "#171796"]) },
  "czech-republic": { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="50%" fill="#fff"/><rect y="50%" width="100%" height="50%" fill="#d7141a"/><path d="M0 0l.75.5L0 1z" fill="#11457e"/>') },
  denmark: { ratio: 37 / 28, svg: flag(37 / 28, '<rect width="100%" height="100%" fill="#c60c30"/><path d="M.38 0h.12v1H.38zM0 .43h1v.14H0z" fill="#fff"/>') },
  finland: { ratio: 18 / 11, svg: flag(18 / 11, '<rect width="100%" height="100%" fill="#fff"/><path d="M.36 0h.16v1H.36zM0 .4h1v.2H0z" fill="#003580"/>') },
  bulgaria: { ratio: 5 / 3, svg: horizontal(5 / 3, ["#fff", "#00966e", "#d62612"]) },
  estonia: { ratio: 11 / 7, svg: horizontal(11 / 7, ["#4891d9", "#000", "#fff"]) },
  romania: { ratio: 1.5, svg: vertical(1.5, ["#002b7f", "#fcd116", "#ce1126"]) },
  france: { ratio: 1.5, svg: vertical(1.5, ["#002654", "#fff", "#ed2939"]) },
  germany: { ratio: 5 / 3, svg: horizontal(5 / 3, ["#000", "#dd0000", "#ffce00"]) },
  greece: { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="100%" fill="#0d5eaf"/><path d="M0 .11h1.5v.11H0zm0 .22h1.5v.11H0zm0 .44h1.5v.11H0zm0 .22h1.5v.11H0z" fill="#fff"/><path d="M0 0h.55v.55H0zM.22 0h.11v.55H.22zM0 .22h.55v.11H0z" fill="#fff"/>') },
  hungary: { ratio: 2, svg: horizontal(2, ["#ce2939", "#fff", "#477050"]) },
  ireland: { ratio: 2, svg: vertical(2, ["#169b62", "#fff", "#ff883e"]) },
  italy: { ratio: 1.5, svg: vertical(1.5, ["#009246", "#fff", "#ce2b37"]) },
  japan: { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="100%" fill="#fff"/><circle cx=".75" cy=".5" r=".3" fill="#bc002d"/>') },
  latvia: { ratio: 2, svg: horizontal(2, ["#9e3039", "#fff", "#9e3039"]) },
  lithuania: { ratio: 5 / 3, svg: horizontal(5 / 3, ["#fdb913", "#006a44", "#c1272d"]) },
  netherlands: { ratio: 1.5, svg: horizontal(1.5, ["#ae1c28", "#fff", "#21468b"]) },
  norway: { ratio: 11 / 8, svg: flag(11 / 8, '<rect width="100%" height="100%" fill="#ba0c2f"/><path d="M.31 0h.2v1h-.2zM0 .39h1v.22H0z" fill="#fff"/><path d="M.36 0h.1v1h-.1zM0 .445h1v.11H0z" fill="#00205b"/>') },
  poland: { ratio: 8 / 5, svg: horizontal(8 / 5, ["#fff", "#dc143c"]) },
  portugal: { ratio: 1.5, svg: flag(1.5, '<rect width="40%" height="100%" fill="#006600"/><rect x="40%" width="60%" height="100%" fill="#ff0000"/><circle cx=".6" cy=".5" r=".19" fill="#ffcc00"/><circle cx=".6" cy=".5" r=".12" fill="#fff" stroke="#006600" stroke-width=".04"/>') },
  slovakia: { ratio: 1.5, svg: horizontal(1.5, ["#fff", "#0b4ea2", "#ee1c25"]) },
  "south-korea": { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="100%" fill="#fff"/><circle cx=".75" cy=".5" r=".23" fill="#cd2e3a"/><path d="M.75.27a.23.23 0 0 0 0 .46.115.115 0 0 0 0-.23.115.115 0 0 1 0-.23" fill="#0047a0"/><path d="M.2.2l.12.08m-.12-.02l.12.08M1.18.2l.12.08m-.12-.02l.12.08M.2.72l.12.08m-.12-.02l.12.08M1.18.72l.12.08m-.12-.02l.12.08" stroke="#000" stroke-width=".035"/>') },
  spain: { ratio: 1.5, svg: horizontal(1.5, ["#aa151b", "#f1bf00", "#aa151b"]) },
  sweden: { ratio: 8 / 5, svg: flag(8 / 5, '<rect width="100%" height="100%" fill="#006aa7"/><path d="M.31 0h.14v1H.31zM0 .4h1v.2H0z" fill="#fecc00"/>') },
  switzerland: { ratio: 1, svg: flag(1, '<rect width="100%" height="100%" fill="#d52b1e"/><path d="M.38.18h.24v.2h.2v.24h-.2v.2H.38v-.2h-.2V.38h.2z" fill="#fff"/>') },
  thailand: { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="100%" fill="#a51931"/><path d="M0 .17h1.5v.16H0zm0 .34h1.5v.16H0z" fill="#fff"/><path d="M0 .33h1.5v.34H0z" fill="#2d2a4a"/>') },
  turkey: { ratio: 1.5, svg: flag(1.5, '<rect width="100%" height="100%" fill="#e30a17"/><path d="M.66.22a.28.28 0 1 0 0 .56.22.22 0 1 1 0-.56zM.92.38l.035.1.105.002-.084.064.03.1-.086-.06-.086.06.03-.1-.084-.064.105-.002z" fill="#fff"/>') },
  "united-arab-emirates": { ratio: 2, svg: flag(2, '<rect width="25%" height="100%" fill="#ff0000"/><rect x="25%" width="75%" height="33.3%" fill="#00732f"/><rect x="25%" y="33.3%" width="75%" height="33.4%" fill="#fff"/><rect x="25%" y="66.7%" width="75%" height="33.3%" fill="#000"/>') },
  "united-kingdom": { ratio: 2, svg: flag(2, '<rect width="100%" height="100%" fill="#012169"/><path d="M0 0l2 1M2 0L0 1" stroke="#fff" stroke-width=".2"/><path d="M0 0l2 1M2 0L0 1" stroke="#c8102e" stroke-width=".08"/><path d="M.8 0h.4v1H.8zM0 .4h2v.2H0z" fill="#fff"/><path d="M.9 0h.2v1H.9zM0 .45h2v.1H0z" fill="#c8102e"/>') },
  "united-states": { ratio: 19 / 10, svg: flag(19 / 10, '<rect width="100%" height="100%" fill="#fff"/><path d="M0 0h1.9v.077H0zm0 .154h1.9v.077H0zm0 .308h1.9v.077H0zm0 .462h1.9v.077H0zm0 .616h1.9v.077H0zm0 .77h1.9v.077H0zm0 .924h1.9V1H0z" fill="#b22234"/><rect width=".76" height=".54" fill="#3c3b6e"/>') },
};

function isDesktopWeb(platform: string, width: number) { return platform === "web" && width >= 1024; }

function getIsoCode(flag: string | undefined) {
  const indicators = Array.from(flag ?? "");
  if (indicators.length !== 2) return "";
  return indicators.map((indicator) => String.fromCharCode(indicator.codePointAt(0)! - 0x1f1e6 + 65)).join("");
}

export function SavingsCountryFlag({ countryId, size = 28 }: { countryId: string; size?: number }) {
  const { width } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);
  const country = countries.find((item) => item.countryId === countryId);
  const artwork = desktopFlags[countryId];
  const desktop = isDesktopWeb(Platform.OS, width);
  const uri = artwork && `data:image/svg+xml;utf8,${encodeURIComponent(artwork.svg)}`;
  useEffect(() => setImageFailed(false), [countryId, uri]);

  if (!desktop) return <Text style={{ fontSize: size }}>{country?.countryFlag ?? "🌍"}</Text>;
  if (!uri || imageFailed) return <Text style={[styles.isoFallback, { fontSize: Math.max(8, Math.round(size * 0.4))}]}>{getIsoCode(country?.countryFlag)}</Text>;
  return <Image key={countryId} accessible={false} source={{ uri }} resizeMode="contain" style={{ width: size, height: size }} onError={() => setImageFailed(true)} />;
}

export function CountrySelector({ selectedCountryId, onSelectCountry }: CountrySelectorProps) {
  const { t, language } = useTranslation();
  const { width } = useWindowDimensions();
  const desktop = isDesktopWeb(Platform.OS, width);
  const selectedCountry = countries.find((country) => country.countryId === selectedCountryId) || countries[0];
  const options: DropdownOption[] = countries.map((country) => ({ label: `${country.countryFlag} ${getLocalizedCountryName(country, language)}`, value: country.countryId }));

  return <DropdownSelector label={t("common.country")} selectedLabel={`${selectedCountry.countryFlag} ${getLocalizedCountryName(selectedCountry, language)}`} options={options} onSelect={onSelectCountry} renderSelected={desktop ? () => <FlagLabel countryId={selectedCountry.countryId} label={getLocalizedCountryName(selectedCountry, language)} /> : undefined} renderOption={desktop ? (option) => <FlagLabel countryId={option.value} label={option.label.replace(/^\S+\s/, "")} /> : undefined} />;
}

function FlagLabel({ countryId, label }: { countryId: string; label: string }) { return <View style={styles.flagLabel}><SavingsCountryFlag countryId={countryId} size={24} /><Text style={styles.flagLabelText}>{label}</Text></View>; }

const styles = StyleSheet.create({ flagLabel: { flex: 1, flexDirection: "row", alignItems: "center" }, flagLabelText: { color: "#0B1F3A", fontSize: 16, fontWeight: "900", marginLeft: 10 }, isoFallback: { color: "#0B1F3A", fontWeight: "900", textAlign: "center", width: 28 } });
