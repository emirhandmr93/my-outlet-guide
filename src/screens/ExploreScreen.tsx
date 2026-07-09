import { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getFloatingTabClearance,
  getScreenTopInset,
  getScrollIndicatorBottomInset,
} from "../utils/safeAreaLayout";
import { getExploreVisibleSearchResults } from "../services/exploreSearchResults";
import { searchOutlets } from "../services/searchService";
import {
  expandSearchValues,
  normalizeSearchText,
} from "../services/searchAliases";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { outlets } from "../constants/outlets";
import { getCityName, getCountryName } from "../services/locationService";
import { useTranslation } from "../hooks/useTranslation";

type ExploreFilter = "country" | "city" | "outlet";
const filters: { id: ExploreFilter; labelKey: string; icon: string }[] = [
  { id: "country", labelKey: "explore.filters.countries", icon: "🌍" },
  { id: "city", labelKey: "explore.filters.cities", icon: "📍" },
  { id: "outlet", labelKey: "explore.filters.outlets", icon: "🛍️" },
];
const popularSearches = ["Paris", "Burberry", "France", "Italy", "Nike"];
const preferredCityOrder = [
  "paris",
  "milan",
  "london",
  "munich",
  "vienna",
  "barcelona",
  "amsterdam",
];
const cityImageMap: Record<string, any> = {
  paris: require("../../assets/city-images/Paris.webp"),
  milan: require("../../assets/city-images/Milano.webp"),
  london: require("../../assets/city-images/London.webp"),
  munich: require("../../assets/city-images/Munich.webp"),
  vienna: require("../../assets/city-images/Vienna.webp"),
};
function outletCount(countryId?: string, cityId?: string) {
  return outlets.filter(
    (o) =>
      (!countryId || o.countryId === countryId) &&
      (!cityId || o.cityId === cityId),
  ).length;
}
function formatOutletCount(count: number, t: (key: string) => string) {
  return `${count} ${t(count === 1 ? "explore.countryOutletSingular" : "explore.countryOutletPlural")}`;
}

const localizedCityAliases: Record<string, string[]> = {
  munich: ["münih", "munih", "münchen"],
  vienna: ["viyana"],
  london: ["londra"],
  milan: ["milano"],
  paris: ["paris"],
  barcelona: ["barselona"],
  cologne: ["köln", "koln"],
  rome: ["roma"],
  amsterdam: ["amsterdam"],
};

function citySearchHaystack(city: {
  cityId: string;
  cityName: string;
  countryId: string;
}) {
  return normalizeSearchText(
    [
      city.cityName,
      city.cityId,
      getCountryName(city.countryId),
      city.countryId,
      ...expandSearchValues(getCountryName(city.countryId)),
      ...expandSearchValues(city.countryId.replace(/-/g, " ")),
      ...(localizedCityAliases[city.cityId] ?? []),
    ].join(" "),
  );
}
function resultIcon(type: string) {
  return type === "country"
    ? "🌍"
    : type === "city"
      ? "📍"
      : type === "brand"
        ? "🏷️"
        : "🛍️";
}
function resultLabel(type: string, t: (key: string) => string) {
  return t(
    type === "country"
      ? "searchResult.country"
      : type === "city"
        ? "searchResult.city"
        : type === "brand"
          ? "searchResult.brand"
          : "searchResult.outlet",
  );
}

export function ExploreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreFilter | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [outletQuery, setOutletQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  useEffect(() => {
    const q = route.params?.initialQuery;
    if (typeof q === "string" && q.trim()) {
      setSearch(q);
      setActiveTab(null);
    }
  }, [route.params?.initialQuery]);
  const availableCountryIds = useMemo(
    () => Array.from(new Set(outlets.map((o) => o.countryId))),
    [],
  );
  const availableCityIds = useMemo(
    () => Array.from(new Set(outlets.map((o) => o.cityId))),
    [],
  );
  const availableCountries = useMemo(
    () =>
      countries
        .filter((c) => availableCountryIds.includes(c.countryId))
        .sort((a, b) => a.countryName.localeCompare(b.countryName)),
    [availableCountryIds],
  );
  const availableCities = useMemo(() => {
    const order = new Map(
      preferredCityOrder.map((cityId, index) => [cityId, index]),
    );
    return cities
      .filter((c) => availableCityIds.includes(c.cityId))
      .sort(
        (a, b) =>
          (order.get(a.cityId) ?? 999) - (order.get(b.cityId) ?? 999) ||
          a.cityName.localeCompare(b.cityName),
      );
  }, [availableCityIds]);
  const suggestions = useMemo(
    () => getExploreVisibleSearchResults(search, activeTab ? [activeTab] : []),
    [search, activeTab],
  );
  const q = search.trim();
  const filteredCountries = availableCountries.filter(
    (c) =>
      !countryQuery.trim() ||
      normalizeSearchText(`${c.countryName} ${c.countryId}`).includes(
        normalizeSearchText(countryQuery),
      ),
  );
  const filteredCities = availableCities.filter((c) => {
    const hay = citySearchHaystack(c);
    return (
      (!cityQuery.trim() || hay.includes(normalizeSearchText(cityQuery))) &&
      (!countryFilter || c.countryId === countryFilter)
    );
  });
  const outletResults = useMemo(
    () =>
      searchOutlets(outletQuery).filter(
        (o) =>
          (!countryFilter || o.countryId === countryFilter) &&
          (!cityFilter || o.cityId === cityFilter),
      ),
    [outletQuery, countryFilter, cityFilter],
  );
  function resetFilters() {
    setCountryFilter(null);
    setCityFilter(null);
    setCountryQuery("");
    setCityQuery("");
    setOutletQuery("");
  }
  const hasCityFilters = Boolean(countryFilter || cityQuery.trim());
  const hasOutletFilters = Boolean(
    countryFilter || cityFilter || outletQuery.trim(),
  );
  function openResult(item: any) {
    if (item.type === "brand")
      navigation.navigate("BrandResults", {
        brandId: item.id,
        mode: "chooseCountry",
      });
    else if (item.type === "city")
      navigation.navigate("CityResults", { cityId: item.id });
    else if (item.type === "country")
      navigation.navigate("Country", { countryId: item.id });
    else navigation.navigate("OutletDetail", { outletId: item.id });
  }
  function setTab(tab: ExploreFilter) {
    setActiveTab(activeTab === tab ? null : tab);
    setSearch("");
  }
  const compactCities = availableCities.slice(0, 4);
  return (
    <View style={styles.screenRoot}>
      <View
        pointerEvents="none"
        style={[styles.topSafeScrim, { height: insets.top }]}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: getScreenTopInset(insets.top),
            paddingBottom: getFloatingTabClearance(insets.bottom),
          },
        ]}
        scrollIndicatorInsets={{
          top: getScreenTopInset(insets.top),
          bottom: getScrollIndicatorBottomInset(insets.bottom),
        }}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRing} />
          <Text style={styles.heroKicker}>{t("explore.heroKicker")}</Text>
          <Text style={styles.heroTitle}>{t("explore.heroTitle")}</Text>
          <Text style={styles.heroText}>{t("explore.heroSubtitle")}</Text>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t("explore.searchPlaceholder")}
            placeholderTextColor="#8B94A3"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearIcon}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRowPadded}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                activeTab === f.id && styles.filterChipActive,
              ]}
              onPress={() => setTab(f.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeTab === f.id && styles.filterTextActive,
                ]}
              >
                {f.icon} {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {q ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t("explore.searchResults")}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t("explore.resultsFor")} “{q}” · {suggestions.length}
              </Text>
            </View>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={styles.resultCard}
                onPress={() => openResult(item)}
              >
                <View style={styles.resultIconWrap}>
                  <Text style={styles.resultIcon}>{resultIcon(item.type)}</Text>
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.resultTypeInline}>
                    {resultLabel(item.type, t)}
                  </Text>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultSubtitle}>
                    {["Brand", "City", "Country", "Category"].includes(
                      item.subtitle,
                    )
                      ? resultLabel(item.type, t)
                      : item.subtitle}
                  </Text>
                </View>
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))}
            {suggestions.length === 0 ? <Empty t={t} /> : null}
          </>
        ) : activeTab === null ? (
          <DefaultHub
            t={t}
            setTab={setActiveTab}
            runSearch={setSearch}
            cities={compactCities}
            navigation={navigation}
          />
        ) : null}
        {activeTab === "country" && !q ? (
          <>
            <Header
              title={t("explore.countryTabTitle")}
              subtitle={t("explore.countryTabSubtitle")}
            />
            <MiniSearch
              value={countryQuery}
              setValue={setCountryQuery}
              placeholder={t("explore.countrySearchPlaceholder")}
              t={t}
            />
            <Text style={styles.resultCount}>
              {filteredCountries.length} {t("explore.resultCount")}
            </Text>
            <View style={styles.countryList}>
              {filteredCountries.map((c) => (
                <TouchableOpacity
                  key={c.countryId}
                  style={styles.countryRow}
                  onPress={() =>
                    navigation.navigate("Country", { countryId: c.countryId })
                  }
                >
                  <Text style={styles.countryFlag}>{c.countryFlag}</Text>
                  <View style={styles.countryContent}>
                    <Text style={styles.countryName}>{c.countryName}</Text>
                    <Text style={styles.countryMeta}>
                      {formatOutletCount(outletCount(c.countryId), t)}
                    </Text>
                  </View>
                  <Text style={styles.countryArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
            {filteredCountries.length === 0 ? <Empty t={t} /> : null}
          </>
        ) : null}
        {activeTab === "city" && !q ? (
          <>
            <Header
              title={t("explore.cityTabTitle")}
              subtitle={t("explore.cityTabSubtitle")}
            />
            <MiniSearch
              value={cityQuery}
              setValue={setCityQuery}
              placeholder={t("explore.citySearchPlaceholder")}
              t={t}
            />
            <FilterRail
              countries={availableCountries}
              activeCountry={countryFilter}
              setCountry={setCountryFilter}
              reset={hasCityFilters ? resetFilters : undefined}
              t={t}
            />
            <Text style={styles.resultCount}>
              {filteredCities.length} {t("explore.resultCount")}
            </Text>
            {filteredCities.map((c) => (
              <CityRow key={c.cityId} city={c} t={t} navigation={navigation} />
            ))}
          </>
        ) : null}
        {activeTab === "outlet" && !q ? (
          <>
            <Header
              title={t("explore.outletTabTitle")}
              subtitle={t("explore.outletTabSubtitle")}
            />
            <MiniSearch
              value={outletQuery}
              setValue={setOutletQuery}
              placeholder={t("explore.outletSearchPlaceholder")}
              t={t}
            />
            <FilterRail
              countries={availableCountries}
              cities={availableCities}
              activeCountry={countryFilter}
              setCountry={setCountryFilter}
              activeCity={cityFilter}
              setCity={setCityFilter}
              reset={hasOutletFilters ? resetFilters : undefined}
              t={t}
            />
            <Text style={styles.resultCount}>
              {outletResults.length} {t("explore.resultCount")}
            </Text>
            {outletResults.map((o) => (
              <TouchableOpacity
                key={o.outletId}
                style={styles.resultCard}
                onPress={() =>
                  navigation.navigate("OutletDetail", { outletId: o.outletId })
                }
              >
                <View style={styles.resultIconWrap}>
                  <Text style={styles.resultIcon}>🛍️</Text>
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.resultTypeInline}>
                    {t("searchResult.outlet")}
                  </Text>
                  <Text style={styles.resultTitle}>{o.name}</Text>
                  <Text style={styles.resultSubtitle}>
                    {getCityName(o.cityId)}, {getCountryName(o.countryId)}
                  </Text>
                </View>
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}
function MiniSearch({ value, setValue, placeholder, t }: any) {
  return (
    <View style={styles.searchBoxSmall}>
      <Text style={styles.searchIconSmall}>⌕</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#8B94A3"
        value={value}
        onChangeText={setValue}
      />
      {value ? (
        <TouchableOpacity onPress={() => setValue("")}>
          <Text style={styles.clearSmall}>{t("explore.clear")}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
function Empty({ t }: any) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{t("explore.noResults")}</Text>
      <Text style={styles.emptyText}>{t("explore.noResultsText")}</Text>
    </View>
  );
}
function DefaultHub({ t, setTab, runSearch, cities, navigation }: any) {
  const cards: Array<[ExploreFilter, string, string, string]> = [
    [
      "country",
      "🌍",
      "explore.discoverByCountryTitle",
      "explore.discoverByCountrySubtitle",
    ],
    [
      "outlet",
      "🛍️",
      "explore.discoverOutletsTitle",
      "explore.discoverOutletsSubtitle",
    ],
    [
      "city",
      "📍",
      "explore.discoverByCityTitle",
      "explore.discoverByCitySubtitle",
    ],
  ];
  return (
    <>
      <Header
        title={t("explore.popularSearches")}
        subtitle={t("explore.popularSearchesSubtitle")}
      />
      <View style={styles.popularSearchGrid}>
        {popularSearches.map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.popularSearchChip}
            onPress={() => runSearch(p)}
          >
            <Text style={styles.popularSearchText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Header
        title={t("explore.discoveryTitle")}
        subtitle={t("explore.discoverySubtitle")}
      />
      <View style={styles.discoveryGrid}>
        {cards.map(([tab, icon, title, sub]) => (
          <TouchableOpacity
            key={tab}
            style={styles.discoveryCard}
            onPress={() => setTab(tab)}
          >
            <Text style={styles.discoveryIcon}>{icon}</Text>
            <Text style={styles.discoveryTitle}>{t(title)}</Text>
            <Text style={styles.discoveryText}>{t(sub)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Header
        title={t("explore.popularCities")}
        subtitle={t("explore.popularCitiesSubtitle")}
      />
      {cities.map((c: any) => (
        <CityRow key={c.cityId} city={c} t={t} navigation={navigation} />
      ))}
    </>
  );
}
function CityRow({ city, t, navigation }: any) {
  const img = cityImageMap[city.cityId];
  return (
    <TouchableOpacity
      style={styles.cityRow}
      onPress={() =>
        navigation.navigate("CityResults", { cityId: city.cityId })
      }
    >
      {img ? (
        <Image source={img} style={styles.cityThumb} />
      ) : (
        <View style={styles.cityNoImage}>
          <Text style={styles.cityNoImageText}>✦</Text>
        </View>
      )}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{city.cityName}</Text>
        <Text style={styles.resultSubtitle}>
          {getCountryName(city.countryId)} ·{" "}
          {formatOutletCount(outletCount(undefined, city.cityId), t)}
        </Text>
      </View>
      <Text style={styles.resultArrow}>›</Text>
    </TouchableOpacity>
  );
}
function FilterRail({
  countries,
  cities,
  activeCountry,
  setCountry,
  activeCity,
  setCity,
  reset,
  t,
}: any) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRowPadded}
    >
      {reset ? (
        <TouchableOpacity style={styles.filterChip} onPress={reset}>
          <Text style={styles.filterText}>× {t("explore.clearFilters")}</Text>
        </TouchableOpacity>
      ) : null}
      {countries?.slice(0, 12).map((c: any) => (
        <TouchableOpacity
          key={c.countryId}
          style={[
            styles.filterChip,
            activeCountry === c.countryId && styles.filterChipActive,
          ]}
          onPress={() =>
            setCountry(activeCountry === c.countryId ? null : c.countryId)
          }
        >
          <Text
            style={[
              styles.filterText,
              activeCountry === c.countryId && styles.filterTextActive,
            ]}
          >
            {c.countryFlag} {c.countryName}
          </Text>
        </TouchableOpacity>
      ))}
      {cities?.slice(0, 12).map((c: any) => (
        <TouchableOpacity
          key={c.cityId}
          style={[
            styles.filterChip,
            activeCity === c.cityId && styles.filterChipActive,
          ]}
          onPress={() => setCity(activeCity === c.cityId ? null : c.cityId)}
        >
          <Text
            style={[
              styles.filterText,
              activeCity === c.cityId && styles.filterTextActive,
            ]}
          >
            {c.cityName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: "#F7F8FA" },
  topSafeScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F7F8FA",
    zIndex: 10,
  },
  container: { flex: 1, backgroundColor: "#F6F7F9" },
  content: { padding: 20 },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 26,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,.28)",
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  heroGlow: {
    position: "absolute",
    right: -35,
    top: -45,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: "rgba(201,162,39,.20)",
  },
  heroRing: {
    position: "absolute",
    right: 20,
    bottom: -55,
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 18,
    borderColor: "rgba(255,255,255,.07)",
  },
  heroKicker: {
    color: "#C9A227",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 10,
  },
  heroText: {
    color: "#E7EDF5",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  searchBox: {
    minHeight: 62,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 14,
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  searchBoxSmall: {
    minHeight: 54,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 12,
  },
  searchIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F2F5F9",
    color: "#0B1F3A",
    textAlign: "center",
    lineHeight: 42,
    fontSize: 22,
    fontWeight: "900",
    marginRight: 10,
  },
  searchIconSmall: { fontSize: 20, marginRight: 10, color: "#0B1F3A" },
  searchInput: {
    flex: 1,
    color: "#0B1F3A",
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 0,
  },
  clearIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#F2F5F9",
    color: "#687386",
    textAlign: "center",
    lineHeight: 32,
    fontSize: 28,
    fontWeight: "900",
  },
  clearSmall: { color: "#C9A227", fontWeight: "900" },
  filterRow: { gap: 10, paddingRight: 20, marginBottom: 8 },
  filterRowPadded: {
    gap: 10,
    paddingLeft: 2,
    paddingRight: 24,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    minHeight: 44,
    justifyContent: "center",
  },
  filterChipActive: { backgroundColor: "#0B1F3A", borderColor: "#0B1F3A" },
  filterText: {
    color: "#677083",
    fontWeight: "900",
    fontSize: 13,
    flexShrink: 1,
  },
  filterTextActive: { color: "#C9A227" },
  sectionHeader: { marginTop: 20, marginBottom: 12 },
  sectionTitle: {
    color: "#0B1F3A",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    color: "#687386",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    marginTop: 4,
  },
  popularSearchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  popularSearchChip: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },
  popularSearchText: { color: "#0B1F3A", fontSize: 14, fontWeight: "900" },
  discoveryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  discoveryCard: {
    width: "48%",
    minHeight: 128,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },
  discoveryIcon: { fontSize: 24, marginBottom: 10 },
  discoveryTitle: { color: "#0B1F3A", fontSize: 16, fontWeight: "900" },
  discoveryText: {
    color: "#687386",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  countryList: {
    backgroundColor: "#fff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    overflow: "hidden",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E5EC",
  },
  countryFlag: { fontSize: 28, width: 42 },
  countryContent: { flex: 1, minWidth: 0, paddingRight: 10 },
  countryName: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
    flexShrink: 1,
  },
  countryMeta: {
    color: "#8A6A09",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },
  countryArrow: { color: "#C9A227", fontSize: 24, fontWeight: "900" },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 10,
  },
  cityThumb: { width: 58, height: 58, borderRadius: 17, marginRight: 12 },
  cityNoImage: {
    width: 58,
    height: 58,
    borderRadius: 17,
    marginRight: 12,
    backgroundColor: "#F5EBC8",
    alignItems: "center",
    justifyContent: "center",
  },
  cityNoImageText: { color: "#C9A227", fontSize: 22, fontWeight: "900" },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 10,
  },
  resultIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFF7E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resultIcon: { fontSize: 19 },
  resultContent: { flex: 1, minWidth: 0 },
  resultTypeInline: {
    color: "#C9A227",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  resultTitle: {
    color: "#0B1F3A",
    fontSize: 17,
    fontWeight: "900",
    flexShrink: 1,
  },
  resultSubtitle: {
    color: "#687386",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    flexShrink: 1,
  },
  resultArrow: {
    color: "#C9A227",
    fontSize: 25,
    fontWeight: "900",
    marginLeft: 8,
  },
  resultCount: {
    color: "#687386",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    alignItems: "center",
  },
  emptyTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  emptyText: {
    color: "#687386",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  brandGroup: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 12,
    overflow: "hidden",
  },
  brandCategoryRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  brandCategoryIcon: { fontSize: 24, marginRight: 12 },
  brandCategoryContent: { flex: 1, minWidth: 0 },
  brandCategoryTitle: { color: "#0B1F3A", fontSize: 17, fontWeight: "900" },
  brandCategorySubtitle: {
    color: "#687386",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E0E5EC",
    backgroundColor: "#fff",
  },
});
