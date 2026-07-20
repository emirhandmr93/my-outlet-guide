import { useEffect, useMemo, useState } from "react";
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
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
import { CountryFlag } from "../components/CountryFlag";
import { useTranslation } from "../hooks/useTranslation";
import type { MainTabParamList, RootStackParamList } from "../navigation/types";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
  formatOutletLocationSubtitle,
} from "../utils/locationDisplay";
import type { TranslationLanguage } from "../translations/translations";
import { heroAssets } from "../media/heroAssets";
import { getPopularCityImage } from "../media/imageResolvers";

type ExploreFilter = "country" | "city" | "outlet";
const filters: { id: ExploreFilter; labelKey: string; icon: string }[] = [
  { id: "country", labelKey: "explore.filters.countries", icon: "🌍" },
  { id: "city", labelKey: "explore.filters.cities", icon: "📍" },
  { id: "outlet", labelKey: "explore.filters.outlets", icon: "🛍️" },
];
const popularSearches = [
  { query: "Paris", labelKey: "explore.popularSearch.paris" },
  { query: "Burberry", labelKey: "explore.popularSearch.burberry" },
  { query: "France", labelKey: "explore.popularSearch.france" },
  { query: "Italy", labelKey: "explore.popularSearch.italy" },
  { query: "Nike", labelKey: "explore.popularSearch.nike" },
];
const preferredCityOrder = [
  "paris",
  "milan",
  "london",
  "munich",
  "vienna",
  "barcelona",
  "amsterdam",
];
// City row photos share the same native city resolver as Home popular city cards.
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

function citySearchHaystack(
  city: {
    cityId: string;
    cityName: string;
    countryId: string;
  },
  language: TranslationLanguage,
) {
  return normalizeSearchText(
    [
      city.cityName,
      city.cityId,
      formatCountryDisplayName(city.countryId, language),
      city.countryId,
      ...expandSearchValues(formatCountryDisplayName(city.countryId, language)),
      ...expandSearchValues(city.countryId.replace(/-/g, " ")),
      formatCityDisplayName(city.cityId, language),
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

function formatResultTitle(item: any, language: TranslationLanguage) {
  if (item.type === "country")
    return formatCountryDisplayName(item.id, language);
  if (item.type === "city") return formatCityDisplayName(item.id, language);
  return item.title;
}

function formatResultSubtitle(
  item: any,
  t: (key: string) => string,
  language: TranslationLanguage,
) {
  if (item.type === "outlet" && item.routeParams?.outletId) {
    const outlet = outlets.find(
      (entry) =>
        entry.outletId === item.routeParams.outletId ||
        entry.outletId === item.id,
    );
    if (outlet)
      return formatOutletLocationSubtitle(
        outlet.cityId,
        outlet.countryId,
        language,
      );
  }
  if (item.type === "city") {
    const city = cities.find((entry) => entry.cityId === item.id);
    if (city)
      return `${formatCountryDisplayName(city.countryId, language)} · ${formatOutletCount(outletCount(undefined, city.cityId), t)}`;
  }
  if (item.type === "country")
    return formatOutletCount(outletCount(item.id), t);
  return ["Brand", "City", "Country", "Category"].includes(item.subtitle)
    ? resultLabel(item.type, t)
    : item.subtitle;
}

export function ExploreScreen() {
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const desktopSidebarWidth = 216;
  const desktopHorizontalPadding = 68;
  const contentWidth = Math.min(
    Math.max(width - desktopSidebarWidth - desktopHorizontalPadding, 0),
    1180,
  );
  const twoColumnWidth = (contentWidth - 12) / 2;
  const threeColumnWidth = (contentWidth - 24) / 3;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, "Explore">>();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ExploreFilter | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [outletQuery, setOutletQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  useEffect(() => {
    const q = route.params?.initialQuery;
    const initialTab = route.params?.initialTab;
    if (typeof q === "string" && q.trim()) {
      setSearch(q);
      setActiveTab(null);
      return;
    }
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [route.params?.initialQuery, route.params?.initialTab]);
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
        .sort((a, b) =>
          formatCountryDisplayName(a.countryId, language).localeCompare(
            formatCountryDisplayName(b.countryId, language),
          ),
        ),
    [availableCountryIds, language],
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
          formatCityDisplayName(a.cityId, language).localeCompare(
            formatCityDisplayName(b.cityId, language),
          ),
      );
  }, [availableCityIds, language]);
  const suggestions = useMemo(
    () => getExploreVisibleSearchResults(search, activeTab ? [activeTab] : []),
    [search, activeTab],
  );
  const q = search.trim();
  const filteredCountries = availableCountries.filter(
    (c) =>
      !countryQuery.trim() ||
      normalizeSearchText(
        [
          c.countryName,
          c.countryId,
          formatCountryDisplayName(c.countryId, language),
          ...expandSearchValues(c.countryName),
        ].join(" "),
      ).includes(normalizeSearchText(countryQuery)),
  );
  const filteredCities = availableCities.filter((c) => {
    const hay = citySearchHaystack(c, language);
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
            paddingBottom: isDesktopWeb
              ? 32
              : getFloatingTabClearance(insets.bottom),
          },
          isDesktopWeb && styles.contentDesktop,
        ]}
        scrollIndicatorInsets={{
          top: getScreenTopInset(insets.top),
          bottom: getScrollIndicatorBottomInset(insets.bottom),
        }}
      >
        <View style={isDesktopWeb ? styles.pageDesktop : undefined}>
        <ImageBackground
          source={heroAssets.explore}
          resizeMode="cover"
          style={[styles.heroCard, isDesktopWeb && styles.heroCardDesktop]}
          imageStyle={[
            styles.heroImage,
            Platform.OS === "web" ? styles.heroImageWeb : null,
          ]}
        >
          <View
            style={[
              styles.heroTextScrim,
              isDesktopWeb && styles.heroTextScrimDesktop,
            ]}
          >
            <Text style={styles.heroKicker}>{t("explore.heroKicker")}</Text>
            <Text style={[styles.heroTitle, isDesktopWeb && styles.heroTitleDesktop]}>
              {t("explore.heroTitle")}
            </Text>
            <Text style={[styles.heroText, isDesktopWeb && styles.heroTextDesktop]}>
              {t("explore.heroSubtitle")}
            </Text>
          </View>
        </ImageBackground>
        {activeTab === null ? (
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={[styles.searchInput, Platform.OS === "web" && styles.searchInputWeb]}
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
        ) : null}
        <View style={styles.primaryTabRow}>
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
        </View>
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
            <View style={isDesktopWeb ? styles.twoColumnGrid : undefined}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={`${item.type}-${item.id}`}
                style={[styles.resultCard, isDesktopWeb && { width: twoColumnWidth }]}
                onPress={() => openResult(item)}
              >
                <View style={styles.resultIconWrap}>
                  {item.type === "country" ? <CountryFlag countryId={item.id} size={26} /> : item.type === "city" && cities.find((city) => city.cityId === item.id) ? <CountryFlag countryId={cities.find((city) => city.cityId === item.id)!.countryId} size={22} /> : <Text style={styles.resultIcon}>{resultIcon(item.type)}</Text>}
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.resultTypeInline}>
                    {resultLabel(item.type, t)}
                  </Text>
                  <Text style={styles.resultTitle}>
                    {formatResultTitle(item, language)}
                  </Text>
                  <Text style={styles.resultSubtitle}>
                    {formatResultSubtitle(item, t, language)}
                  </Text>
                </View>
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))}
            </View>
            {suggestions.length === 0 ? <Empty t={t} /> : null}
          </>
        ) : activeTab === null ? (
          <DefaultHub
            t={t}
            setTab={setActiveTab}
            runSearch={setSearch}
            cities={compactCities}
            navigation={navigation}
            language={language}
            isDesktopWeb={isDesktopWeb}
            twoColumnWidth={twoColumnWidth}
            threeColumnWidth={threeColumnWidth}
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
              language={language}
            />
            <Text style={styles.resultCount}>
              {filteredCountries.length} {t("explore.resultCount")}
            </Text>
            <View style={isDesktopWeb ? styles.threeColumnGrid : styles.countryList}>
              {filteredCountries.map((c) => (
                <TouchableOpacity
                  key={c.countryId}
                  style={[styles.countryRow, isDesktopWeb && styles.countryCardDesktop, isDesktopWeb && { width: threeColumnWidth }]}
                  onPress={() =>
                    navigation.navigate("Country", { countryId: c.countryId })
                  }
                >
                  <CountryFlag countryId={c.countryId} size={28} style={styles.countryFlag} />
                  <View style={styles.countryContent}>
                    <Text style={styles.countryName}>
                      {formatCountryDisplayName(c.countryId, language)}
                    </Text>
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
              language={language}
            />
            <FilterRail
              countries={availableCountries}
              activeCountry={countryFilter}
              setCountry={setCountryFilter}
              reset={hasCityFilters ? resetFilters : undefined}
              t={t}
              language={language}
              isDesktopWeb={isDesktopWeb}
            />
            <Text style={styles.resultCount}>
              {filteredCities.length} {t("explore.resultCount")}
            </Text>
            <View style={isDesktopWeb ? styles.twoColumnGrid : undefined}>
            {filteredCities.map((c) => (
              <CityRow
                key={c.cityId}
                city={c}
                t={t}
                language={language}
                navigation={navigation}
                compact
                isDesktopWeb={isDesktopWeb}
                width={twoColumnWidth}
              />
            ))}
            </View>
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
              language={language}
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
              language={language}
              isDesktopWeb={isDesktopWeb}
            />
            <Text style={styles.resultCount}>
              {outletResults.length} {t("explore.resultCount")}
            </Text>
            <View style={isDesktopWeb ? styles.twoColumnGrid : undefined}>
            {outletResults.map((o) => (
              <TouchableOpacity
                key={o.outletId}
                style={[styles.resultCard, isDesktopWeb && { width: twoColumnWidth }]}
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
                    {formatOutletLocationSubtitle(
                      o.cityId,
                      o.countryId,
                      language,
                    )}
                  </Text>
                </View>
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))}
            </View>
          </>
        ) : null}
        </View>
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
        style={[
          styles.searchInput,
          Platform.OS === "web" && styles.searchInputWeb,
        ]}
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
function DefaultHub({
  t,
  setTab,
  runSearch,
  cities,
  navigation,
  language,
  isDesktopWeb,
  twoColumnWidth,
  threeColumnWidth,
}: any) {
  const cards: Array<[ExploreFilter, string, string, string]> = [
    [
      "outlet",
      "🛍️",
      "explore.discoverOutletsTitle",
      "explore.discoverOutletsSubtitle",
    ],
    [
      "country",
      "🌍",
      "explore.discoverByCountryTitle",
      "explore.discoverByCountrySubtitle",
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
            key={p.query}
            style={styles.popularSearchChip}
            onPress={() => runSearch(p.query)}
          >
            <Text style={styles.popularSearchText}>{t(p.labelKey)}</Text>
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
            style={[
              styles.discoveryCard,
              isDesktopWeb
                ? { width: threeColumnWidth }
                : tab === "outlet"
                ? styles.discoveryCardPrimary
                : styles.discoveryCardSecondary,
            ]}
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
      <View style={isDesktopWeb ? styles.twoColumnGrid : undefined}>
      {cities.map((c: any) => (
        <CityRow
          key={c.cityId}
          city={c}
          t={t}
          language={language}
          navigation={navigation}
          isDesktopWeb={isDesktopWeb}
          width={twoColumnWidth}
        />
      ))}
      </View>
    </>
  );
}
function CityRow({ city, t, navigation, language, compact, isDesktopWeb, width }: any) {
  const img = getPopularCityImage(city);
  return (
    <TouchableOpacity
      style={[styles.cityRow, isDesktopWeb && { width }]}
      onPress={() =>
        navigation.navigate("CityResults", { cityId: city.cityId })
      }
    >
      {!compact && img ? (
        <Image source={img} style={styles.cityThumb} />
      ) : (
        <View style={styles.cityAvatar}>
          <CountryFlag countryId={city.countryId} size={22} />
        </View>
      )}
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>
          {formatCityDisplayName(city.cityId, language)}
        </Text>
        <View style={styles.citySubtitleRow}>
          <CountryFlag countryId={city.countryId} size={18} />
          <Text style={styles.resultSubtitle}>{formatCountryDisplayName(city.countryId, language)} · {formatOutletCount(outletCount(undefined, city.cityId), t)}</Text>
        </View>
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
  language,
  isDesktopWeb,
}: any) {
  const chips = (
    <>
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
            <CountryFlag countryId={c.countryId} size={20} /> {formatCountryDisplayName(c.countryId, language)}
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
            <CountryFlag countryId={c.countryId} size={18} /> {formatCityDisplayName(c.cityId, language)}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
  if (isDesktopWeb) {
    return <View style={styles.filterRowDesktop}>{chips}</View>;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRowPadded}
    >
      {chips}
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
  contentDesktop: { paddingHorizontal: 34 },
  pageDesktop: { width: "100%", maxWidth: 1180, alignSelf: "center" },
  heroCard: {
    minHeight: 214,
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,.30)",
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  heroCardDesktop: { minHeight: 332 },
  heroImage: {
    borderRadius: 30,
  },
  heroImageWeb: {
width: "100%",
height: "100%",
objectFit: "cover",
objectPosition: "58% 50%",
} as any,
  heroTextScrim: {
    alignSelf: "stretch",
    maxWidth: "76%",
    minHeight: 214,
    justifyContent: "center",
    padding: 26,
    paddingRight: 22,
    backgroundColor: "rgba(6, 20, 40, .54)",
  },
  heroTextScrimDesktop: { maxWidth: "56%", minHeight: 332, padding: 32 },
  heroKicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
    flexShrink: 1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 10,
    flexShrink: 1,
  },
  heroTitleDesktop: { fontSize: 38, lineHeight: 45 },
  heroText: {
    color: "#E7EDF5",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    flexShrink: 1,
  },
  heroTextDesktop: { maxWidth: 440 },
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
  searchInputWeb: { outlineStyle: "none" } as any,
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
  primaryTabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  filterRowPadded: {
    gap: 10,
    paddingLeft: 20,
    paddingRight: 24,
    marginBottom: 8,
  },
  filterRowDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
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
    fontSize: 12,
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
  twoColumnGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  threeColumnGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  discoveryCard: {
    minHeight: 128,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },
  discoveryCardPrimary: { width: "100%" },
  discoveryCardSecondary: { flex: 1, minWidth: "46%" },
  discoveryIcon: { fontSize: 24, marginBottom: 10 },
  discoveryTitle: { color: "#0B1F3A", fontSize: 16, fontWeight: "900" },
  discoveryText: {
    color: "#687386",
    fontSize: 12,
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
  countryCardDesktop: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    borderBottomWidth: 1,
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
    fontSize: 12,
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
  cityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    marginRight: 12,
    backgroundColor: "#F2F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cityAvatarText: { fontSize: 22 },
  citySubtitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
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
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 12,
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
