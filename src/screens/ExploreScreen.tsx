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

import { searchAll, searchOutlets } from "../services/searchService";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { outlets } from "../constants/outlets";
import { getPopularBrands } from "../services/brandService";
import { getCityName, getCountryName } from "../services/locationService";
import { useTranslation } from "../hooks/useTranslation";

type ExploreFilter = "country" | "city" | "outlet" | "brand";

type BrandCategoryId =
  | "luxury"
  | "fashion"
  | "sportswear"
  | "shoesBags"
  | "beauty"
  | "jewelryWatches"
  | "kids"
  | "homeLifestyle"
  | "foodChocolate";

const filters: { id: ExploreFilter; labelKey: string }[] = [
  { id: "country", labelKey: "explore.filters.countries" },
  { id: "city", labelKey: "explore.filters.cities" },
  { id: "outlet", labelKey: "explore.filters.outlets" },
  { id: "brand", labelKey: "explore.filters.brands" },
];

const popularSearches = ["Paris", "Nike", "La Vallée", "Italy", "Gucci"];

const brandCategories: {
  id: BrandCategoryId;
  icon: string;
  titleKey: string;
  subtitleKey: string;
  keywords: string[];
}[] = [
  {
    id: "luxury",
    icon: "💎",
    titleKey: "explore.categories.luxury.title",
    subtitleKey: "explore.categories.luxury.subtitle",
    keywords: [
      "gucci",
      "prada",
      "saint laurent",
      "ysl",
      "dior",
      "rolex",
      "hermès",
      "hermes",
      "louis vuitton",
      "balenciaga",
      "burberry",
      "bottega",
      "moncler",
      "armani",
      "boss",
    ],
  },
  {
    id: "fashion",
    icon: "👗",
    titleKey: "explore.categories.fashion.title",
    subtitleKey: "explore.categories.fashion.subtitle",
    keywords: [
      "ami",
      "acne",
      "diesel",
      "guess",
      "anne fontaine",
      "a bathing ape",
      "polo",
      "ralph lauren",
      "lacoste",
      "tommy",
      "calvin klein",
    ],
  },
  {
    id: "sportswear",
    icon: "👟",
    titleKey: "explore.categories.sportswear.title",
    subtitleKey: "explore.categories.sportswear.subtitle",
    keywords: [
      "nike",
      "adidas",
      "puma",
      "asics",
      "new balance",
      "under armour",
      "anta",
      "reebok",
      "salomon",
      "the north face",
      "tnf",
    ],
  },
  {
    id: "shoesBags",
    icon: "👜",
    titleKey: "explore.categories.shoesBags.title",
    subtitleKey: "explore.categories.shoesBags.subtitle",
    keywords: [
      "coach",
      "furla",
      "michael kors",
      "mk",
      "samsonite",
      "tod",
      "clarks",
      "geox",
      "jimmy choo",
      "longchamp",
      "tumi",
    ],
  },
  {
    id: "beauty",
    icon: "💄",
    titleKey: "explore.categories.beauty.title",
    subtitleKey: "explore.categories.beauty.subtitle",
    keywords: [
      "sephora",
      "l'occitane",
      "loccitane",
      "rituals",
      "the body shop",
      "kiehl",
      "mac",
      "estee lauder",
    ],
  },
  {
    id: "jewelryWatches",
    icon: "💍",
    titleKey: "explore.categories.jewelryWatches.title",
    subtitleKey: "explore.categories.jewelryWatches.subtitle",
    keywords: [
      "rolex",
      "omega",
      "swarovski",
      "tag heuer",
      "pandora",
      "tissot",
      "fossil",
    ],
  },
  {
    id: "kids",
    icon: "🧸",
    titleKey: "explore.categories.kids.title",
    subtitleKey: "explore.categories.kids.subtitle",
    keywords: ["lego", "kids", "baby", "chicco", "disney", "name it"],
  },
  {
    id: "homeLifestyle",
    icon: "🏡",
    titleKey: "explore.categories.homeLifestyle.title",
    subtitleKey: "explore.categories.homeLifestyle.subtitle",
    keywords: [
      "home",
      "lifestyle",
      "villeroy",
      "le creuset",
      "zwilling",
      "wmf",
      "samsonite",
    ],
  },
  {
    id: "foodChocolate",
    icon: "🍫",
    titleKey: "explore.categories.foodChocolate.title",
    subtitleKey: "explore.categories.foodChocolate.subtitle",
    keywords: [
      "lindt",
      "godiva",
      "chocolate",
      "haribo",
      "illy",
      "lavazza",
      "food",
    ],
  },
];

const cityImageMap: Record<string, any> = {
  paris: require("../../assets/city-images/Paris.webp"),
  milan: require("../../assets/city-images/Milano.webp"),
  london: require("../../assets/city-images/London.webp"),
  munich: require("../../assets/city-images/Munich.webp"),
  vienna: require("../../assets/city-images/Vienna.webp"),
};

function getResultIcon(type: string) {
  if (type === "country") return "🌍";
  if (type === "city") return "📍";
  if (type === "brand") return "🏷️";
  return "🛍️";
}

function getResultLabel(type: string, t: (key: string) => string) {
  if (type === "country") return t("searchResult.country");
  if (type === "city") return t("searchResult.city");
  if (type === "brand") return t("searchResult.brand");
  if (type === "category") return t("searchResult.category");
  return t("searchResult.outlet");
}

function getResultSubtitle(
  item: { subtitle: string; type: string },
  t: (key: string) => string,
) {
  if (item.type === "country") return t("searchResult.country");
  if (item.type === "city") return t("searchResult.city");
  if (item.type === "brand") return t("searchResult.brand");
  if (item.type === "category") return t("searchResult.category");
  return item.subtitle;
}

function formatCountryOutletText(
  countryId: string,
  t: (key: string) => string,
) {
  const count = outlets.filter(
    (outlet) => outlet?.countryId === countryId,
  ).length;
  if (count <= 1) return t("explore.countryCtaSingular");
  return t("explore.countryCtaPlural");
}

export function ExploreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [outletSearch, setOutletSearch] = useState("");
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<ExploreFilter[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null,
  );
  const [selectedBrandCategory, setSelectedBrandCategory] =
    useState<BrandCategoryId | null>(null);

  const [outletCountryFilterId, setOutletCountryFilterId] = useState<
    string | null
  >(null);
  const [isOutletCountryPickerOpen, setIsOutletCountryPickerOpen] =
    useState(false);

  useEffect(() => {
    const initialQuery = route.params?.initialQuery;

    if (typeof initialQuery === "string" && initialQuery.trim().length > 0) {
      setSearch(initialQuery);
      setActiveFilters([]);
      setSelectedCountryId(null);
    }
  }, [route.params?.initialQuery]);

  const normalizedSearch = search.trim();
  const isSearching = normalizedSearch.length > 0;
  const hasTypeFilters = activeFilters.length > 0;

  const availableCityIds = useMemo(
    () =>
      Array.from(
        new Set(outlets.filter(Boolean).map((outlet) => outlet.cityId)),
      ),
    [],
  );

  const availableCountryIds = useMemo(
    () =>
      Array.from(
        new Set(outlets.filter(Boolean).map((outlet) => outlet.countryId)),
      ),
    [],
  );

  const shoppingCities = useMemo(() => {
    return cities
      .filter((city) => availableCityIds.includes(city.cityId))
      .sort((a, b) => a.cityName.localeCompare(b.cityName));
  }, [availableCityIds]);

  const availableCountries = useMemo(
    () =>
      countries
        .filter((country) => availableCountryIds.includes(country.countryId))
        .sort((a, b) => a.countryName.localeCompare(b.countryName)),
    [availableCountryIds],
  );

  const allBrands = useMemo(() => getPopularBrands().slice(0, 28), []);

  const getBrandsForCategory = (categoryId: BrandCategoryId) => {
    const category = brandCategories.find((item) => item.id === categoryId);
    if (!category) return [];

    return allBrands.filter((brand) => {
      const normalizedBrand = brand.brandName.toLowerCase();
      return category.keywords.some((keyword) =>
        normalizedBrand.includes(keyword),
      );
    });
  };

  const visibleBrands = useMemo(() => {
    if (!selectedBrandCategory) return [];

    const matchingBrands = getBrandsForCategory(selectedBrandCategory);
    return matchingBrands.length > 0 ? matchingBrands : allBrands.slice(0, 14);
  }, [allBrands, selectedBrandCategory]);

  const searchSuggestions = useMemo(() => {
    return searchAll(normalizedSearch, 30).filter(
      (item) => item.type !== "category",
    );
  }, [normalizedSearch]);

  const visibleSuggestions = useMemo(() => {
    return searchSuggestions.filter((item) => {
      if (activeFilters.length === 0) return item.type !== "outlet";
      return (
        activeFilters.includes(item.type as ExploreFilter) &&
        item.type !== "outlet"
      );
    });
  }, [activeFilters, searchSuggestions]);

  const hasStrongBrandMatch = useMemo(() => {
    if (normalizedSearch.length === 0) return false;

    return searchSuggestions.some((item) => {
      if (item.type !== "brand") return false;
      const normalizedTitle = item.title.toLowerCase();
      const normalizedQuery = normalizedSearch.toLowerCase();

      return (
        normalizedTitle.includes(normalizedQuery) || normalizedQuery.length <= 3
      );
    });
  }, [normalizedSearch, searchSuggestions]);

  const filteredOutlets = useMemo(() => {
    if (hasStrongBrandMatch && !activeFilters.includes("outlet")) return [];
    if (activeFilters.length > 0 && !activeFilters.includes("outlet"))
      return [];

    return searchOutlets(normalizedSearch).filter((outlet) => {
      if (!outlet) return false;
      if (!selectedCountryId) return true;
      return outlet.countryId === selectedCountryId;
    });
  }, [activeFilters, hasStrongBrandMatch, normalizedSearch, selectedCountryId]);

  const outletListResults = useMemo(() => {
    return outlets
      .filter(Boolean)
      .filter((outlet) => {
        if (
          outletCountryFilterId &&
          outlet.countryId !== outletCountryFilterId
        ) {
          return false;
        }

        if (!outletSearch.trim()) return true;

        const query = outletSearch.trim().toLowerCase();
        const outletName = outlet.name.toLowerCase();
        const cityName = getCityName(outlet.cityId).toLowerCase();
        const countryName = getCountryName(outlet.countryId).toLowerCase();

        return (
          outletName.includes(query) ||
          cityName.includes(query) ||
          countryName.includes(query)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [outletSearch, outletCountryFilterId]);

  const showPopularSearches =
    !isSearching && !hasTypeFilters && !selectedCountryId;
  const showCities =
    !isSearching && (!hasTypeFilters || activeFilters.includes("city"));
  const showCountries =
    !isSearching && (!hasTypeFilters || activeFilters.includes("country"));
  const showOutletResults = !isSearching && activeFilters.includes("outlet");
  const showOutletHint = false;
  const showBrands = !isSearching && activeFilters.includes("brand");

  function toggleFilter(filterId: ExploreFilter) {
    setActiveFilters((current) => {
      if (current.includes(filterId)) return [];
      return [filterId];
    });
  }

  function clearContext() {
    setSelectedCountryId(null);
    setOutletCountryFilterId(null);
    setIsOutletCountryPickerOpen(false);
    setSelectedBrandCategory(null);
    setActiveFilters([]);
  }

  function selectCountry(countryId: string) {
    setSelectedCountryId(countryId);
    setOutletCountryFilterId(countryId);
    setActiveFilters(["outlet"]);
  }

  function openResult(item: any) {
    if (item.type === "brand") {
      navigation.navigate("BrandResults", { brandId: item.id });
      return;
    }

    if (item.type === "city") {
      navigation.navigate("CityResults", { cityId: item.id });
      return;
    }

    if (item.type === "country") {
      navigation.navigate("Country", { countryId: item.id });
    }
  }

  function openOutlet(outletId: string) {
    navigation.navigate("OutletDetail", { outletId });
  }

  function runPopularSearch(value: string) {
    setSearch(value);
    setActiveFilters([]);
    setSelectedCountryId(null);
  }

  const selectedCountryName = selectedCountryId
    ? getCountryName(selectedCountryId)
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 132 },
      ]}
      scrollIndicatorInsets={{ top: insets.top, bottom: insets.bottom + 96 }}
    >
      <View style={styles.heroCard}>
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
        {search.length > 0 ? (
          <TouchableOpacity activeOpacity={0.82} onPress={() => setSearch("")}>
            <Text style={styles.clearIcon}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.85}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => toggleFilter(filter.id)}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {t(filter.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedCountryName ? (
        <View style={styles.contextBar}>
          <Text style={styles.contextText}>
            {t("explore.showingOutletsIn")} {selectedCountryName}
          </Text>
          <TouchableOpacity activeOpacity={0.82} onPress={clearContext}>
            <Text style={styles.contextClear}>{t("explore.clear")}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isSearching ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("explore.searchResults")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("explore.resultsFor")} “{normalizedSearch}”
            </Text>
          </View>

          {visibleSuggestions.map((item) => (
            <TouchableOpacity
              key={`${item.type}-${item.id}`}
              style={styles.resultCard}
              activeOpacity={0.86}
              onPress={() => openResult(item)}
            >
              <View style={styles.resultIconWrap}>
                <Text style={styles.resultIcon}>
                  {getResultIcon(item.type)}
                </Text>
              </View>

              <View style={styles.resultContent}>
                <Text style={styles.resultTypeInline}>
                  {getResultLabel(item.type, t)}
                </Text>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultSubtitle}>
                  {getResultSubtitle(item, t)}
                </Text>
              </View>

              <Text style={styles.resultArrow}>→</Text>
            </TouchableOpacity>
          ))}

          {filteredOutlets.map((outlet) => (
            <TouchableOpacity
              key={outlet.outletId}
              style={styles.resultCard}
              activeOpacity={0.86}
              onPress={() => openOutlet(outlet.outletId)}
            >
              <View style={styles.resultIconWrap}>
                <Text style={styles.resultIcon}>🛍️</Text>
              </View>

              <View style={styles.resultContent}>
                <Text style={styles.resultTypeInline}>
                  {t("searchResult.outlet")}
                </Text>
                <Text style={styles.resultTitle}>{outlet.name}</Text>
                <Text style={styles.resultSubtitle}>
                  {getCityName(outlet.cityId)},{" "}
                  {getCountryName(outlet.countryId)}
                </Text>
              </View>

              <Text style={styles.resultArrow}>→</Text>
            </TouchableOpacity>
          ))}

          {visibleSuggestions.length === 0 && filteredOutlets.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("explore.noResults")}</Text>
              <Text style={styles.emptyText}>{t("explore.noResultsText")}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <>
          {showPopularSearches ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("explore.popularSearches")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {t("explore.popularSearchesSubtitle")}
                </Text>
              </View>

              <View style={styles.popularSearchGrid}>
                {popularSearches.map((item) => (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.86}
                    style={styles.popularSearchChip}
                    onPress={() => runPopularSearch(item)}
                  >
                    <Text style={styles.popularSearchText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          {showCities ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("explore.popularCities")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {t("explore.popularCitiesSubtitle")}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {shoppingCities.map((city) => {
                  const cityImage = cityImageMap[city.cityId];

                  return (
                    <TouchableOpacity
                      key={city.cityId}
                      activeOpacity={0.88}
                      style={styles.cityCard}
                      onPress={() =>
                        navigation.navigate("CityResults", {
                          cityId: city.cityId,
                        })
                      }
                    >
                      {cityImage ? (
                        <Image source={cityImage} style={styles.cityImage} />
                      ) : null}
                      <View style={styles.cityOverlay} />
                      <View style={styles.cityContent}>
                        <Text style={styles.cityCountry}>
                          {getCountryName(city.countryId)}
                        </Text>
                        <Text style={styles.cityName}>{city.cityName}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          {showCountries ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("explore.filters.countries")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {t("explore.countriesSubtitle")}
                </Text>
              </View>

              <View style={styles.countryList}>
                {availableCountries.map((country) => {
                  const isSelected = selectedCountryId === country.countryId;

                  return (
                    <TouchableOpacity
                      key={country.countryId}
                      activeOpacity={0.88}
                      style={[
                        styles.countryRow,
                        isSelected && styles.countryRowSelected,
                      ]}
                      onPress={() => selectCountry(country.countryId)}
                    >
                      <Text style={styles.countryFlag}>
                        {country.countryFlag}
                      </Text>

                      <View style={styles.countryContent}>
                        <Text style={styles.countryName}>
                          {country.countryName}
                        </Text>
                        <Text style={styles.countryMeta}>
                          {formatCountryOutletText(country.countryId, t)}
                        </Text>
                      </View>

                      <Text style={styles.countryArrow}>→</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {!isSearching && activeFilters.includes("outlet") ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("explore.filters.outlets")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {t("explore.outletsSubtitle")}
                </Text>
              </View>

              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t("explore.outletSearchPlaceholder")}
                  placeholderTextColor="#8B94A3"
                  value={outletSearch}
                  onChangeText={setOutletSearch}
                  returnKeyType="search"
                  autoCorrect={false}
                />
                {outletSearch.length > 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => setOutletSearch("")}
                  >
                    <Text style={styles.clearIcon}>×</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.countryPickerButton}
                onPress={() => setIsOutletCountryPickerOpen((value) => !value)}
              >
                <Text style={styles.countryPickerText}>
                  {outletCountryFilterId
                    ? `${availableCountries.find((country) => country.countryId === outletCountryFilterId)?.countryFlag || ""} ${
                        availableCountries.find(
                          (country) =>
                            country.countryId === outletCountryFilterId,
                        )?.countryName || t("searchResult.country")
                      }`
                    : `🌍 ${t("explore.allCountries")}`}
                </Text>
                <Text style={styles.countryPickerArrow}>
                  {isOutletCountryPickerOpen ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {isOutletCountryPickerOpen ? (
                <View style={styles.countryPickerList}>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    style={styles.countryPickerOption}
                    onPress={() => {
                      setOutletCountryFilterId(null);
                      setIsOutletCountryPickerOpen(false);
                    }}
                  >
                    <Text style={styles.countryPickerOptionText}>
                      🌍 {t("explore.allCountries")}
                    </Text>
                  </TouchableOpacity>

                  {availableCountries.map((country) => (
                    <TouchableOpacity
                      key={country.countryId}
                      activeOpacity={0.86}
                      style={styles.countryPickerOption}
                      onPress={() => {
                        setOutletCountryFilterId(country.countryId);
                        setIsOutletCountryPickerOpen(false);
                      }}
                    >
                      <Text style={styles.countryPickerOptionText}>
                        {country.countryFlag} {country.countryName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              {outletListResults.map((outlet) => (
                <TouchableOpacity
                  key={outlet.outletId}
                  activeOpacity={0.88}
                  style={styles.resultCard}
                  onPress={() => openOutlet(outlet.outletId)}
                >
                  <View style={styles.resultIconWrap}>
                    <Text style={styles.resultIcon}>🛍️</Text>
                  </View>

                  <View style={styles.resultContent}>
                    <Text style={styles.resultTypeInline}>
                      {t("searchResult.outlet")}
                    </Text>
                    <Text style={styles.resultTitle}>{outlet.name}</Text>
                    <Text style={styles.resultSubtitle}>
                      {getCityName(outlet.cityId)},{" "}
                      {getCountryName(outlet.countryId)}
                    </Text>
                  </View>

                  <Text style={styles.resultArrow}>→</Text>
                </TouchableOpacity>
              ))}

              {outletListResults.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>
                    {t("explore.noOutletsFound")}
                  </Text>
                  <Text style={styles.emptyText}>
                    {t("explore.noOutletsText")}
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

          {showBrands ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t("explore.brandCategories")}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {t("explore.brandCategoriesSubtitle")}
                </Text>
              </View>

              <View style={styles.brandCategoryList}>
                {brandCategories.map((category) => {
                  const isActive = selectedBrandCategory === category.id;
                  const categoryBrands = getBrandsForCategory(category.id);
                  const count =
                    categoryBrands.length || category.keywords.length;

                  return (
                    <View key={category.id}>
                      <TouchableOpacity
                        activeOpacity={0.86}
                        style={[
                          styles.brandCategoryRow,
                          isActive && styles.brandCategoryRowActive,
                        ]}
                        onPress={() =>
                          setSelectedBrandCategory(
                            isActive ? null : category.id,
                          )
                        }
                      >
                        <Text style={styles.brandCategoryIcon}>
                          {category.icon}
                        </Text>
                        <View style={styles.brandCategoryContent}>
                          <Text
                            style={[
                              styles.brandCategoryTitle,
                              isActive && styles.brandCategoryTitleActive,
                            ]}
                          >
                            {t(category.titleKey)} ({count})
                          </Text>
                          <Text
                            style={[
                              styles.brandCategorySubtitle,
                              isActive && styles.brandCategorySubtitleActive,
                            ]}
                          >
                            {t(category.subtitleKey)}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.brandCategoryArrow,
                            isActive && styles.brandCategoryArrowActive,
                          ]}
                        >
                          {isActive ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>

                      {isActive ? (
                        <View style={styles.brandGridInline}>
                          {categoryBrands.map((brand) => (
                            <TouchableOpacity
                              key={brand.brandId}
                              activeOpacity={0.86}
                              style={styles.brandChip}
                              onPress={() =>
                                navigation.navigate("BrandResults", {
                                  brandId: brand.brandId,
                                  mode: "chooseCountry",
                                })
                              }
                            >
                              <Text style={styles.brandText}>
                                🏷️ {brand.brandName}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  content: {
    padding: 20,
    paddingTop: 58,
    paddingBottom: 130,
  },

  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 26,
    marginBottom: 18,
  },

  heroKicker: {
    color: "#C9A227",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
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
    backgroundColor: "#FFFFFF",
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

  searchIcon: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#F2F5F9",
    color: "#0B1F3A",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 42,
    fontSize: 22,
    fontWeight: "900",
    marginRight: 10,
  },

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
    textAlignVertical: "center",
    lineHeight: 32,
    fontSize: 28,
    fontWeight: "900",
  },

  filterRow: {
    gap: 10,
    paddingRight: 20,
    marginBottom: 8,
  },

  filterChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },

  filterChipActive: {
    backgroundColor: "#0B1F3A",
    borderColor: "#0B1F3A",
  },

  filterText: {
    color: "#677083",
    fontWeight: "900",
    fontSize: 13,
  },

  filterTextActive: {
    color: "#C9A227",
  },

  contextBar: {
    marginTop: 4,
    backgroundColor: "#FFF7E0",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  contextText: {
    flex: 1,
    color: "#0B1F3A",
    fontSize: 13,
    fontWeight: "900",
  },

  contextClear: {
    color: "#C9A227",
    fontSize: 13,
    fontWeight: "900",
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
  },

  sectionHeaderCompact: {
    marginTop: 18,
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#0B1F3A",
    fontSize: 24,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },

  popularSearchText: {
    color: "#0B1F3A",
    fontSize: 14,
    fontWeight: "900",
  },

  countryList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    overflow: "hidden",
    shadowColor: "#0B1F3A",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E5EC",
  },

  countryRowSelected: {
    backgroundColor: "#FFF7E0",
  },

  countryFlag: {
    fontSize: 28,
    width: 42,
  },

  countryContent: {
    flex: 1,
  },

  countryName: {
    color: "#0B1F3A",
    fontSize: 18,
    fontWeight: "900",
  },

  countryMeta: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 3,
  },

  countryArrow: {
    color: "#C9A227",
    fontSize: 22,
    fontWeight: "900",
  },

  horizontalList: {
    gap: 14,
    paddingRight: 20,
    marginBottom: 4,
  },

  cityCard: {
    width: 188,
    height: 148,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0B1F3A",
  },

  cityImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  cityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  cityContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },

  cityCountry: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  cityName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  popularOutletRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 11,
  },

  outletIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#FFF7E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  outletIconText: {
    fontSize: 18,
  },

  popularOutletContent: {
    flex: 1,
  },

  popularOutletTitle: {
    color: "#0B1F3A",
    fontSize: 17,
    fontWeight: "900",
  },

  popularOutletMeta: {
    color: "#687386",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  brandCategoryList: {
    gap: 10,
  },

  brandCategoryRow: {
    minHeight: 62,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    flexDirection: "row",
    alignItems: "center",
  },

  brandCategoryRowActive: {
    backgroundColor: "#0B1F3A",
    borderColor: "#0B1F3A",
  },

  brandCategoryIcon: {
    fontSize: 22,
    width: 38,
  },

  brandCategoryContent: {
    flex: 1,
  },

  brandCategoryArrow: {
    color: "#0B1F3A",
    fontSize: 16,
    fontWeight: "900",
  },

  brandCategoryArrowActive: {
    color: "#C9A227",
  },

  brandGridInline: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 10,
    paddingBottom: 4,
  },

  brandCategoryTitle: {
    color: "#0B1F3A",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },

  brandCategoryTitleActive: {
    color: "#C9A227",
  },

  brandCategorySubtitle: {
    color: "#687386",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },

  brandCategorySubtitleActive: {
    color: "#E7EDF5",
  },

  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },

  brandChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },

  brandText: {
    color: "#0B1F3A",
    fontSize: 14,
    fontWeight: "900",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  resultIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#F2F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  resultIcon: {
    fontSize: 21,
  },

  resultContent: {
    flex: 1,
  },

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
  },

  resultSubtitle: {
    color: "#687386",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },

  resultArrow: {
    color: "#C9A227",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E5EC",
  },

  emptyTitle: {
    color: "#0B1F3A",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#687386",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },

  countryPickerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  countryPickerText: {
    color: "#0B1F3A",
    fontSize: 15,
    fontWeight: "900",
  },

  countryPickerArrow: {
    color: "#C9A227",
    fontSize: 14,
    fontWeight: "900",
  },

  countryPickerList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E0E5EC",
    overflow: "hidden",
    marginBottom: 12,
  },

  countryPickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E5EC",
  },

  countryPickerOptionText: {
    color: "#0B1F3A",
    fontSize: 15,
    fontWeight: "800",
  },
});
