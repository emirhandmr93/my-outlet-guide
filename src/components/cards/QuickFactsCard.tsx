import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../card";
import { SectionTitle } from "../SectionTitle";
import type { CurrentWeather } from "../../services/weatherService";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export type QuickFactsCardProps = {
  title: string;
  weather: CurrentWeather | null;
  weatherLoading: boolean;
  weatherError: boolean;
  weatherLoadingText: string;
  weatherUnavailableText: string;
  cityName: string;
  openingHoursLabel: string;
  openingHours: string;
  addressLabel: string;
  address: string;
  storesCountText: string;
  cityCenterDistanceKm: number;
  airportDistanceKm: number;
  nearestAirportName?: string;
  airportSummary?: string;
  reviewCountLabel: string;
  reviewCount: number;
  rating?: string | number;
  onPressStores?: () => void;
  onPressTaxFree?: () => void;
  onPressAirport?: () => void;
  onPressRating?: () => void;
};

function FactTile({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.factIcon}>{icon}</Text>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={styles.factTile}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.factTile}>{content}</View>;
}

export function QuickFactsCard({
  title,
  openingHours,
  storesCountText,
  cityCenterDistanceKm,
  airportDistanceKm,
  nearestAirportName,
  airportSummary,
  reviewCount,
  rating,
  onPressStores,
  onPressTaxFree,
  onPressAirport,
  onPressRating,
}: QuickFactsCardProps) {
  const airportText =
    airportSummary ||
    (nearestAirportName
      ? `${nearestAirportName} • ${airportDistanceKm} km`
      : `${airportDistanceKm} km`);

  const ratingText = rating ? `${rating} (${reviewCount})` : `${reviewCount}`;

  return (
    <Card>
      <SectionTitle title={title} />

      <View style={styles.grid}>
        <FactTile icon="🕒" label="Hours" value={openingHours} />
        <FactTile icon="🛍️" label="Stores" value={storesCountText} onPress={onPressStores} />
        <FactTile icon="💰" label="Tax Free" value="Available" onPress={onPressTaxFree} />
        <FactTile icon="✈️" label="Airports" value={airportText} onPress={onPressAirport} />
        <FactTile icon="🚗" label="City Center" value={`${cityCenterDistanceKm} km`} />
        <FactTile icon="⭐" label="Rating" value={ratingText} onPress={onPressRating} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  factTile: {
    width: "48%",
    minHeight: 118,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  factIcon: {
    fontSize: 22,
    marginBottom: spacing.sm,
  },

  factLabel: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },

  factValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: typography.weightBlack,
    lineHeight: 21,
  },
});
