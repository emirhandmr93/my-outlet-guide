import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import type { RestaurantItem } from "../../services/restaurantService";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { motion } from "../../theme/motion";

type RestaurantsCardProps = {
  title: string;
  restaurants: RestaurantItem[];
  notAvailableText: string;
};

export function RestaurantsCard({
  title,
  restaurants,
  notAvailableText,
}: RestaurantsCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleRestaurants = showAll ? restaurants : restaurants.slice(0, 3);

  return (
    <Card>
      <View style={styles.headerRow}>
        <SectionTitle title={title} />
        {restaurants.length > 0 ? (
          <Text style={styles.countText}>{restaurants.length} places</Text>
        ) : null}
      </View>

      {restaurants.length > 0 ? (
        <>
          {visibleRestaurants.map((restaurant) => (
            <View key={restaurant.restaurantId} style={styles.restaurantCard}>
              <View style={styles.iconBubble}>
                <Text style={styles.icon}>☕</Text>
              </View>

              <View style={styles.restaurantContent}>
                <Text style={styles.restaurantTitle}>{restaurant.restaurantName}</Text>
                <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
                <Text style={styles.restaurantPrice}>{restaurant.priceLevel}</Text>
              </View>
            </View>
          ))}

          {restaurants.length > 3 ? (
            <TouchableOpacity
              activeOpacity={motion.pressOpacity}
              style={styles.viewAllButton}
              onPress={() => setShowAll((value) => !value)}
            >
              <Text style={styles.viewAllText}>{showAll ? "Show less" : "View all restaurants"}</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : (
        <Text style={styles.emptyText}>{notAvailableText}</Text>
      )}
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

  restaurantCard: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },

  icon: {
    fontSize: 22,
  },

  restaurantContent: {
    flex: 1,
  },

  restaurantTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weightBlack,
    fontSize: typography.bodyLarge,
  },

  restaurantCategory: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: typography.weightSemiBold,
  },

  restaurantPrice: {
    marginTop: spacing.sm,
    color: colors.gold,
    fontWeight: typography.weightBlack,
    fontSize: typography.body,
  },

  viewAllButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  viewAllText: {
    color: colors.textInverse,
    fontSize: typography.body,
    fontWeight: typography.weightBlack,
    textAlign: "center",
  },

  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: typography.lineBody,
  },
});
