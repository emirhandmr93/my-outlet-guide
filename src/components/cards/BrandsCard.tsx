import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import type { BrandCategoryGroup } from "../../services/brandService";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useTranslation } from "../../hooks/useTranslation";

type BrandsCardProps = {
  title: string;
  brandSearch: string;
  setBrandSearch: (value: string) => void;
  openCategory: string | null;
  setOpenCategory: (value: string | null) => void;
  brandCategoryGroups: BrandCategoryGroup[];
};


const aliasMap: Record<string, string[]> = {
  "saint laurent": ["ysl", "yves saint laurent", "laurent"],
  "michael kors": ["mk"],
  "the north face": ["tnf", "north face"],
  "dolce & gabbana": ["d&g", "dg", "dolce gabbana"],
  "polo ralph lauren": ["ralph lauren", "rl", "polo"],
  "calvin klein": ["ck"],
  "louis vuitton": ["lv"],
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function brandMatchesSearch(brand: any, search: string) {
  const query = normalize(search);

  if (!query) return true;

  const brandName = normalize(brand.brandName || "");
  const aliases = [
    ...(Array.isArray(brand.aliases) ? brand.aliases : []),
    ...(aliasMap[brandName] || []),
  ].map(normalize);

  return brandName.includes(query) || aliases.some((alias) => alias.includes(query));
}

export function BrandsCard({
  title,
  brandSearch,
  setBrandSearch,
  openCategory,
  setOpenCategory,
  brandCategoryGroups,
}: BrandsCardProps) {
  const { t } = useTranslation();
  const totalBrandCount = brandCategoryGroups.reduce(
    (total, category) => total + category.brands.length,
    0
  );

  return (
    <Card>
      <View style={styles.headerRow}>
        <SectionTitle title={title} />
        <Text style={styles.countText}>{`${totalBrandCount} ${t("sharedCards.brands.countSuffix")}`}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder={t("sharedCards.brands.searchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        value={brandSearch}
        onChangeText={setBrandSearch}
        returnKeyType="search"
      />

      {brandCategoryGroups.map((category) => {
        const filteredBrands = category.brands.filter((brand) =>
          brandMatchesSearch(brand, brandSearch)
        );

        if (brandSearch && filteredBrands.length === 0) {
          return null;
        }

        const isOpen = openCategory === category.categoryId || Boolean(brandSearch);

        return (
          <View key={category.categoryId} style={styles.categoryBox}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.categoryButton}
              onPress={() => setOpenCategory(isOpen ? null : category.categoryId)}
            >
              <View style={styles.categoryTitleRow}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryTextBlock}>
                  <Text style={styles.categoryTitle}>{category.categoryName}</Text>
                  <Text style={styles.categoryMeta}>{`${filteredBrands.length} ${t("sharedCards.brands.countSuffix")}`}</Text>
                </View>
              </View>

              <Text style={styles.chevron}>{isOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {isOpen ? (
              <View style={styles.brandGrid}>
                {filteredBrands.map((brand) => (
                  <View key={brand.brandId} style={styles.brandPill}>
                    <Text style={styles.brandName}>{brand.brandName}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: spacing.sm,
  },

  countText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    marginTop: -spacing.xs,
  },

  searchInput: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBold,
  },

  categoryBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: "hidden",
  },

  categoryButton: {
    minHeight: 70,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  categoryIcon: {
    fontSize: 26,
    marginRight: spacing.md,
  },

  categoryTextBlock: {
    flex: 1,
  },

  categoryTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
  },

  categoryMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: typography.weightBold,
    marginTop: spacing.xs,
  },

  chevron: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: typography.weightBlack,
    marginLeft: spacing.sm,
  },

  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  brandPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },

  brandName: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: typography.weightExtraBold,
  },
});
