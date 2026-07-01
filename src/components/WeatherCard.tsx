import { StyleSheet, Text, View } from "react-native";

import { WeatherForecast } from "../constants/weatherForecasts";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type WeatherCardProps = {
  weather: WeatherForecast;
};

function formatForecastDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const firstForecast = weather.forecasts[0];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>WEATHER</Text>
          <Text style={styles.cityName}>{weather.cityName}</Text>
        </View>

        {firstForecast ? (
          <View style={styles.currentPill}>
            <Text style={styles.currentIcon}>{firstForecast.icon}</Text>
            <Text style={styles.currentTemp}>{firstForecast.temperature}°C</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.forecastList}>
        {weather.forecasts.map((forecast) => (
          <View key={forecast.date} style={styles.forecastRow}>
            <Text style={styles.day}>{formatForecastDate(forecast.date)}</Text>

            <View style={styles.weatherInfo}>
              <Text style={styles.icon}>{forecast.icon}</Text>
              <Text style={styles.temperature}>{forecast.temperature}°C</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadows.card,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  kicker: {
    color: colors.gold,
    fontSize: typography.caption,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },

  cityName: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    fontWeight: "900",
  },

  currentPill: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gold,
  },

  currentIcon: {
    fontSize: 18,
  },

  currentTemp: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "900",
  },

  forecastList: {
    gap: spacing.sm,
  },

  forecastRow: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  day: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: "800",
  },

  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  icon: {
    fontSize: 18,
  },

  temperature: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "900",
  },
});
