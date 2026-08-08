import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { WebDatePickerButton } from "../components/WebDatePickerButton";
import {
  FlightDealAirportRegion,
  supportedFlightDealAirports,
  SupportedFlightDealAirport,
} from "../constants/flightDealAirports";
import { useTranslation } from "../hooks/useTranslation";
import { NativeDirectionRoot, useLayoutDirection } from "../hooks/useLayoutDirection";
import { heroAssets } from "../media/heroAssets";
import { buildAviasalesAffiliateSearchUrl, AviasalesTripClass } from "../services/aviasalesAffiliateLink";
import { trackWebEvent } from "../utils/webAnalytics";
import colors from "../theme/colors";
import { formatCityDisplayName, formatCountryDisplayName } from "../utils/locationDisplay";
import { formatIsoDateOnly, localDateToIso, parseIsoDateOnly } from "../utils/dateOnly";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";
import { supportedLanguageCodes, TranslationLanguage } from "../translations/translations";

type TripType = "roundTrip" | "oneWay";
type PickerMode = "origin" | "destination" | null;
type AirportFilter = "popular" | FlightDealAirportRegion;
type DateTarget = "depart" | "return" | null;
const FILTERS: AirportFilter[] = ["popular", "TR", "EUROPE", "MIDDLE_EAST", "ASIA", "AMERICAS"];

function todayString() { return localDateToIso(new Date()); }

export function FlightSearchScreen() {
  const { t, language } = useTranslation();
  const { isNativeRTL } = useLayoutDirection();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 1024;
  const desktopAirportPicker = Platform.OS === "web" && width >= 768;
  const desktopAirportPickerHeight = Math.min(720, Math.max(0, height - 48));
  const [tripType, setTripType] = useState<TripType>("roundTrip");
  const [origin, setOrigin] = useState<SupportedFlightDealAirport | null>(null);
  const [destination, setDestination] = useState<SupportedFlightDealAirport | null>(null);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [tripClass, setTripClass] = useState<AviasalesTripClass>("economy");
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [filter, setFilter] = useState<AirportFilter>("popular");
  const [filterText, setFilterText] = useState("");
  const [dateTarget, setDateTarget] = useState<DateTarget>(null);
  const [draftDate, setDraftDate] = useState(new Date());
  const [opening, setOpening] = useState(false);

  const locale = supportedLanguageCodes.includes(language.trim().toLowerCase() as any)
    ? language.trim().toLowerCase()
    : "en";
  const displayDate = (value: string) => formatIsoDateOnly(value) || t("flightSearch.selectDate");
  const openAirportPicker = (mode: Exclude<PickerMode, null>) => { setPickerMode(mode); setFilterText(""); setFilter("popular"); };
  const excludedCode = pickerMode === "origin" ? destination?.airportCode : origin?.airportCode;
  const airportOptions = useMemo(() => {
    const query = filterText.trim().toLocaleLowerCase();
    return supportedFlightDealAirports
      .filter((airport) => airport.airportCode !== excludedCode)
      .filter((airport) => filter === "popular" ? airport.popular : airport.region === filter)
      .filter((airport) => !query || `${airport.cityName} ${formatCityDisplayName(airport.cityName, language)} ${airport.countryName} ${formatCountryDisplayName(airport.countryName, language)} ${airport.airportName} ${airport.airportCode} ${(airport.searchAliases ?? []).join(" ")}`.toLocaleLowerCase().includes(query))
      .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)))
      .slice(0, 50);
  }, [excludedCode, filter, filterText, language]);

  function selectTripType(value: TripType) { setTripType(value); if (value === "oneWay") setReturnDate(""); }
  function openDatePicker(target: Exclude<DateTarget, null>) {
    const value = target === "depart" ? departDate : returnDate;
    setDraftDate(parseIsoDateOnly(value) ?? parseIsoDateOnly(target === "return" ? departDate : "") ?? new Date());
    setDateTarget(target);
  }
  function confirmDate() {
    const value = localDateToIso(draftDate);
    if (dateTarget === "depart") { setDepartDate(value); if (returnDate && returnDate < value) setReturnDate(""); }
    if (dateTarget === "return") setReturnDate(value);
    setDateTarget(null);
  }
  function updateWebDate(target: Exclude<DateTarget, null>, value: string) {
    if (target === "depart") { setDepartDate(value); if (returnDate && returnDate < value) setReturnDate(""); }
    else setReturnDate(value);
  }
  function adjustPassenger(kind: "adults" | "children" | "infants", delta: number) {
    if (kind === "adults") {
      const next = adults + delta;
      if (next >= 1 && next <= 9 && next + children <= 9 && infants <= next) setAdults(next);
    } else if (kind === "children") {
      const next = children + delta;
      if (next >= 0 && next <= 8 && adults + next <= 9) setChildren(next);
    } else {
      const next = infants + delta;
      if (next >= 0 && next <= 9 && next <= adults) setInfants(next);
    }
  }
  function validationMessage() {
    if (!origin) return t("flightSearch.originRequired");
    if (!destination) return t("flightSearch.destinationRequired");
    if (origin.airportCode === destination.airportCode) return t("flightSearch.sameAirportError");
    if (!departDate || !parseIsoDateOnly(departDate)) return t("flightSearch.departDateRequired");
    if (departDate < todayString()) return t("flightSearch.pastDateError");
    if (tripType === "roundTrip" && (!returnDate || !parseIsoDateOnly(returnDate))) return t("flightSearch.returnDateRequired");
    if (tripType === "roundTrip" && returnDate < departDate) return t("flightSearch.returnBeforeDeparture");
    if (adults < 1 || adults > 9 || children < 0 || children > 8 || infants < 0 || infants > adults || adults + children > 9) return t("flightSearch.passengerError");
    return null;
  }
  async function search() {
    if (opening) return;
    const validation = validationMessage();
    if (validation) { Alert.alert(t("flightSearch.validationTitle"), validation); return; }
    setOpening(true);
    try {
      const url = buildAviasalesAffiliateSearchUrl({
        originIata: origin!.airportCode,
        destinationIata: destination!.airportCode,
        departDate,
        ...(tripType === "roundTrip" ? { returnDate } : {}),
        adults, children, infants, tripClass, subId: "app_flight_search", locale, currency: "EUR",
      });
      trackWebEvent("outbound_affiliate_click", { affiliate: "aviasales", placement: "flight_search" });
      if (Platform.OS === "web") await Linking.openURL(url);
      else await WebBrowser.openBrowserAsync(url);
    } catch {
      Alert.alert(t("flightSearch.openFailedTitle"), t("flightSearch.openFailedBody"));
    } finally { setOpening(false); }
  }
  const airportTitle = (airport: SupportedFlightDealAirport) => `${formatCityDisplayName(airport.cityName, language)} · ${airport.airportCode}`;
  const filterLabel = (value: AirportFilter) => t(`flightSearch.filter${value === "popular" ? "Popular" : value === "TR" ? "Turkey" : value === "EUROPE" ? "Europe" : value === "MIDDLE_EAST" ? "MiddleEast" : value === "ASIA" ? "Asia" : "Americas"}`);

  return <>
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, desktop && styles.desktop, { paddingTop: desktop ? 32 : getScreenTopInset(insets.top), paddingBottom: desktop ? 32 : getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }} keyboardShouldPersistTaps="handled">
      <LocalHeroImageCard imageSource={heroAssets.flightDeals} responsiveWeb style={styles.hero} contentStyle={styles.heroContent}>
        <Text style={styles.kicker}>{t("flightSearch.kicker")}</Text><Text style={styles.heroTitle}>{t("flightSearch.title")}</Text><Text style={styles.heroSubtitle}>{t("flightSearch.subtitle")}</Text>
      </LocalHeroImageCard>
      <View style={styles.card}>
        <Text style={styles.label}>{t("flightSearch.tripType")}</Text><View style={[styles.segment, isNativeRTL && styles.rowReverse]}>{(["roundTrip", "oneWay"] as TripType[]).map(value => <Segment key={value} selected={tripType === value} label={t(`flightSearch.${value}`)} onPress={() => selectTripType(value)} />)}</View>
        <AirportButton label={t("flightSearch.origin")} placeholder={t("flightSearch.selectOrigin")} airport={origin} title={origin ? airportTitle(origin) : ""} country={false} language={language} onPress={() => openAirportPicker("origin")} />
        <AirportButton label={t("flightSearch.destination")} placeholder={t("flightSearch.selectDestination")} airport={destination} title={destination ? airportTitle(destination) : ""} country language={language} onPress={() => openAirportPicker("destination")} />
        <View style={[styles.dateRow, isNativeRTL && styles.rowReverse]}>
          <DateControl label={t("flightSearch.departDate")} value={departDate} display={displayDate(departDate)} placeholder={t("flightSearch.selectDate")} minimumDate={todayString()} onChange={value => updateWebDate("depart", value)} onPress={() => openDatePicker("depart")} />
          {tripType === "roundTrip" ? <DateControl label={t("flightSearch.returnDate")} value={returnDate} display={displayDate(returnDate)} placeholder={t("flightSearch.selectDate")} minimumDate={departDate || todayString()} onChange={value => updateWebDate("return", value)} onPress={() => openDatePicker("return")} /> : null}
        </View>
        <Text style={styles.label}>{t("flightSearch.passengers")}</Text>
        {([["adults", adults], ["children", children], ["infants", infants]] as const).map(([kind, value]) => <View key={kind} style={[styles.counterRow, isNativeRTL && styles.rowReverse]}><Text style={styles.counterLabel}>{t(`flightSearch.${kind}`)}</Text><View style={styles.counter}><CounterButton label={`− ${t(`flightSearch.${kind}`)}`} symbol="−" onPress={() => adjustPassenger(kind, -1)} /><Text style={styles.count}>{value}</Text><CounterButton label={`+ ${t(`flightSearch.${kind}`)}`} symbol="+" onPress={() => adjustPassenger(kind, 1)} /></View></View>)}
        <Text style={styles.label}>{t("flightSearch.cabinClass")}</Text><View style={[styles.segment, isNativeRTL && styles.rowReverse]}>{(["economy", "business"] as AviasalesTripClass[]).map(value => <Segment key={value} selected={tripClass === value} label={t(`flightSearch.${value}`)} onPress={() => setTripClass(value)} />)}</View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t("flightSearch.searchButton")} disabled={opening} onPress={search} style={[styles.searchButton, opening && styles.disabled]}><Text style={styles.searchText}>{opening ? t("flightSearch.openingProvider") : t("flightSearch.searchButton")}</Text></TouchableOpacity>
      </View>
      <View style={styles.disclosure}><Text style={styles.disclosureTitle}>{t("flightSearch.providerTitle")}</Text><Text style={styles.disclosureText}>{t("flightSearch.providerDisclosure")}</Text><Text style={styles.disclosureText}>{t("flightSearch.priceNotice")}</Text><Text style={styles.disclosureText}>{t("flightSearch.affiliateDisclosure")}</Text></View>
    </ScrollView>
    <Modal visible={pickerMode !== null} transparent animationType="slide" onRequestClose={() => setPickerMode(null)}>
      <NativeDirectionRoot>
        <View style={[styles.overlay, desktopAirportPicker && styles.desktopPickerOverlay]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.keyboard, desktopAirportPicker && styles.desktopPickerKeyboard]}
          >
            <View
              style={[
                styles.modalCard,
                desktopAirportPicker && styles.desktopPickerCard,
                desktopAirportPicker
                  ? { height: desktopAirportPickerHeight, maxHeight: desktopAirportPickerHeight }
                  : { paddingBottom: insets.bottom + 12 },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{pickerMode === "origin" ? t("flightSearch.selectOrigin") : t("flightSearch.selectDestination")}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.filterScroller} contentContainerStyle={styles.filters}>
                  {FILTERS.map(value => <Pressable key={value} accessibilityRole="button" onPress={() => setFilter(value)} style={[styles.chip, filter === value && styles.chipActive]}><Text style={[styles.chipText, filter === value && styles.chipTextActive]}>{filterLabel(value)}</Text></Pressable>)}
                </ScrollView>
                <TextInput accessibilityLabel={t("flightSearch.airportSearch")} value={filterText} onChangeText={setFilterText} placeholder={t("flightSearch.airportSearch")} placeholderTextColor={colors.textMuted} style={[styles.input, isNativeRTL && styles.rtlText]} />
              </View>
              <View style={styles.airportResults}>
                <FlatList data={airportOptions} keyExtractor={item => item.airportCode} keyboardShouldPersistTaps="handled" ListEmptyComponent={<Text style={styles.empty}>{t("flightSearch.noAirportResults")}</Text>} renderItem={({ item }) => <TouchableOpacity style={styles.airportRow} onPress={() => { if (pickerMode === "origin") setOrigin(item); else setDestination(item); setPickerMode(null); }}><Text style={styles.airportTitle}>{airportTitle(item)}</Text><Text style={styles.airportMeta}>{item.airportName} · {formatCountryDisplayName(item.countryName, language)}</Text></TouchableOpacity>} />
              </View>
              <TouchableOpacity accessibilityRole="button" style={styles.close} onPress={() => setPickerMode(null)}><Text style={styles.closeText}>{t("flightSearch.close")}</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </NativeDirectionRoot>
    </Modal>
    {Platform.OS !== "web" ? <Modal visible={dateTarget !== null} transparent animationType="fade" onRequestClose={() => setDateTarget(null)}><NativeDirectionRoot><View style={styles.overlay}><View style={styles.dateModal}><Text style={styles.modalTitle}>{dateTarget === "depart" ? t("flightSearch.departDate") : t("flightSearch.returnDate")}</Text><DateTimePicker value={draftDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "calendar"} minimumDate={parseIsoDateOnly(dateTarget === "return" ? departDate : todayString()) ?? new Date()} onChange={(_, value) => value && setDraftDate(value)} /><View style={styles.modalActions}><TouchableOpacity onPress={() => setDateTarget(null)}><Text style={styles.closeText}>{t("flightSearch.close")}</Text></TouchableOpacity><TouchableOpacity style={styles.confirm} onPress={confirmDate}><Text style={styles.searchText}>{t("flightSearch.selectDate")}</Text></TouchableOpacity></View></View></View></NativeDirectionRoot></Modal> : null}
  </>;
}

function Segment({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress} style={[styles.segmentButton, selected && styles.segmentActive]}><Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{label}</Text></Pressable>; }
function CounterButton({ label, symbol, onPress }: { label: string; symbol: string; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={onPress} style={styles.counterButton}><Text style={styles.counterSymbol}>{symbol}</Text></Pressable>; }
function AirportButton({ label, placeholder, airport, title, country, language, onPress }: { label: string; placeholder: string; airport: SupportedFlightDealAirport | null; title: string; country: boolean; language: TranslationLanguage; onPress: () => void }) { return <View><Text style={styles.label}>{label}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={label} style={styles.selector} onPress={onPress}><Text style={styles.airportTitle}>{airport ? title : placeholder}</Text>{airport ? <Text style={styles.airportMeta}>{airport.airportName}{country ? ` · ${formatCountryDisplayName(airport.countryName, language)}` : ""}</Text> : null}</TouchableOpacity></View>; }
function DateControl({ label, value, display, placeholder, minimumDate, onChange, onPress }: { label: string; value: string; display: string; placeholder: string; minimumDate: string; onChange: (value: string) => void; onPress: () => void }) { return <View style={styles.dateControl}><Text style={styles.label}>{label}</Text>{Platform.OS === "web" ? <WebDatePickerButton accessibilityLabel={label} value={value} placeholder={placeholder} minimumDate={minimumDate} onChange={onChange} style={styles.selector} textStyle={styles.airportTitle} placeholderStyle={styles.airportTitle} /> : <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} style={styles.selector} onPress={onPress}><Text style={styles.airportTitle}>{display}</Text></TouchableOpacity>}</View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: 16, gap: 18 }, desktop: { width: "100%", maxWidth: 920, alignSelf: "center" }, hero: { borderRadius: 24 }, heroContent: { padding: 24, minHeight: 190, justifyContent: "flex-end" }, kicker: { color: colors.gold, fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }, heroTitle: { color: colors.textInverse, fontSize: 30, fontWeight: "900", marginTop: 6 }, heroSubtitle: { color: "rgba(255,255,255,.9)", fontSize: 16, lineHeight: 23, marginTop: 7 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border }, label: { color: colors.textPrimary, fontSize: 13, fontWeight: "900", marginTop: 5 }, segment: { flexDirection: "row", padding: 4, borderRadius: 14, backgroundColor: colors.surfaceMuted, gap: 4 }, rowReverse: { flexDirection: "row-reverse" }, segmentButton: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 11 }, segmentActive: { backgroundColor: colors.primary }, segmentText: { color: colors.textSecondary, fontWeight: "800" }, segmentTextActive: { color: colors.textInverse }, selector: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, padding: 14, minHeight: 56, justifyContent: "center" }, airportTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" }, airportMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 }, dateRow: { flexDirection: "row", gap: 12 }, dateControl: { flex: 1 }, input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: colors.textPrimary, backgroundColor: colors.surface }, hint: { color: colors.textMuted, fontSize: 11, marginTop: 4 }, counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 5 }, counterLabel: { color: colors.textPrimary, fontWeight: "700" }, counter: { flexDirection: "row", alignItems: "center", gap: 14 }, counterButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.gold }, counterSymbol: { color: colors.primary, fontSize: 21, fontWeight: "900" }, count: { minWidth: 20, textAlign: "center", color: colors.textPrimary, fontWeight: "900" }, searchButton: { backgroundColor: colors.gold, borderRadius: 15, padding: 16, alignItems: "center", marginTop: 8 }, searchText: { color: colors.primary, fontWeight: "900", fontSize: 15 }, disabled: { opacity: .6 }, disclosure: { backgroundColor: colors.goldSurface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.gold }, disclosureTitle: { color: colors.primary, fontSize: 17, fontWeight: "900", marginBottom: 8 }, disclosureText: { color: colors.textSecondary, lineHeight: 20, marginTop: 5 },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }, keyboard: { flex: 1, justifyContent: "flex-end" }, modalCard: { backgroundColor: colors.surface, height: "88%", maxHeight: "88%", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }, desktopPickerOverlay: { justifyContent: "center", alignItems: "center", padding: 24 }, desktopPickerKeyboard: { width: "100%", maxWidth: 700, justifyContent: "center" }, desktopPickerCard: { width: "100%", borderRadius: 24 }, modalHeader: { flexShrink: 0 }, modalTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: "900", marginBottom: 12 }, filterScroller: { flexGrow: 0, flexShrink: 0 }, filters: { alignItems: "center", gap: 8, paddingBottom: 12 }, chip: { alignSelf: "center", flexShrink: 0, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.surfaceMuted }, chipActive: { backgroundColor: colors.primary }, chipText: { color: colors.textSecondary, fontWeight: "700" }, chipTextActive: { color: colors.textInverse }, airportResults: { flex: 1, minHeight: 0 }, airportRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border }, empty: { color: colors.textMuted, textAlign: "center", padding: 30 }, close: { alignItems: "center", padding: 14 }, closeText: { color: colors.primary, fontWeight: "900" }, rtlText: { textAlign: "right" }, dateModal: { backgroundColor: colors.surface, margin: 18, marginBottom: "auto", marginTop: "auto", padding: 18, borderRadius: 22 }, modalActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 22, marginTop: 12 }, confirm: { backgroundColor: colors.gold, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12 },
});
