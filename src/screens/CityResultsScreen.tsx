import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deals } from "../constants/deals";
import { events } from "../constants/events";
import { outlets } from "../constants/outlets";
import { useTranslation } from "../hooks/useTranslation";
import { getImageSource, getOutletCardHeroImage } from "../media/outletMedia";
import { getConfiguredOutletMediaMode } from "../media/outletMediaConfig";
import { getCountryName } from "../services/locationService";
import { formatRating } from "../services/reviewsRatingsService";

type RouteParams = {
  CityResults: {
    cityId: string;
  };
};

type OutletItem = (typeof outlets)[number];

const cityNames: Record<string, string> = {
  paris: "Paris",
  milan: "Milan",
  london: "London",
};

function hasTaxFree(value: unknown) {
  return value === true || value === "TRUE" || value === "true";
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OutletResultCard({
  outlet,
  onPress,
}: {
  outlet: OutletItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const heroImage = getOutletCardHeroImage(outlet, {
    mode: getConfiguredOutletMediaMode(),
  });
  const displayRating = formatRating(outlet.rating);

  return (
    <TouchableOpacity
      style={styles.outletCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {heroImage ? (
        <Image source={getImageSource(heroImage)} style={styles.outletImage} />
      ) : (
        <View style={styles.outletImagePlaceholder}>
          <Text style={styles.outletImageIcon}>🛍️</Text>
        </View>
      )}

      <View style={styles.outletContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardBadge}>
            {hasTaxFree(outlet.taxFreeAvailable)
              ? t("city.taxFree")
              : t("city.limited")}
          </Text>
          {displayRating ? <Text style={styles.rating}>★ {displayRating}</Text> : null}
        </View>

        <Text style={styles.cardTitle}>{outlet.name}</Text>
        <Text style={styles.cardText}>
          {getCountryName(outlet.countryId)} • {outlet.storesCountText}
        </Text>
        <Text style={styles.tapText}>{t("city.viewOutlet")}</Text>
      </View>
    </TouchableOpacity>
  );
}

function InfoCard({
  title,
  text,
  date,
}: {
  title: string;
  text: string;
  date?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardText}>{text}</Text>
      {date ? <Text style={styles.dateText}>{date}</Text> : null}
    </View>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function CityResultsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<RouteProp<RouteParams, "CityResults">>();

  const cityId = route.params?.cityId || "paris";
  const cityName = cityNames[cityId] || cityId;
  const cityOutlets = outlets.filter((outlet) => outlet.cityId === cityId);
  const cityDeals = deals.filter((deal) => deal.cityId === cityId);
  const cityEvents = events.filter((event) => event.cityId === cityId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("city.heroLabel")}</Text>
        <Text style={styles.heroTitle}>{cityName}</Text>
        <Text style={styles.heroText}>{t("city.heroText")}</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard value={cityOutlets.length} label={t("city.outlets")} />
        <StatCard value={cityDeals.length} label={t("city.deals")} />
        <StatCard value={cityEvents.length} label={t("city.events")} />
      </View>

      <Text style={styles.sectionTitle}>{t("city.availableOutlets")}</Text>
      {cityOutlets.map((outlet) => (
        <OutletResultCard
          key={outlet.outletId}
          outlet={outlet}
          onPress={() =>
            navigation.navigate("OutletDetail", { outletId: outlet.outletId })
          }
        />
      ))}

      <Text style={styles.sectionTitle}>{t("city.currentDeals")}</Text>
      {cityDeals.length > 0 ? (
        cityDeals.map((deal) => (
          <InfoCard
            key={deal.dealId}
            title={deal.title}
            text={deal.description}
            date={`${deal.startDate} - ${deal.endDate}`}
          />
        ))
      ) : (
        <EmptyCard text={t("city.noActiveDeals")} />
      )}

      <Text style={styles.sectionTitle}>{t("city.events")}</Text>
      {cityEvents.length > 0 ? (
        cityEvents.map((event) => (
          <InfoCard
            key={event.eventId}
            title={event.title}
            text={event.description}
            date={`${event.startDate} - ${event.endDate}`}
          />
        ))
      ) : (
        <EmptyCard text={t("city.noUpcomingEvents")} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    color: "#C9A227",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  heroText: { color: "#D8DEE9", fontSize: 15, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statNumber: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  statLabel: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0B1F3A",
    marginTop: 10,
    marginBottom: 12,
  },
  outletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  outletImage: { width: "100%", height: 150, backgroundColor: "#E5E7EB" },
  outletImagePlaceholder: {
    height: 140,
    backgroundColor: "#0B1F3A",
    alignItems: "center",
    justifyContent: "center",
  },
  outletImageIcon: { fontSize: 40 },
  outletContent: { padding: 18 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardBadge: {
    backgroundColor: "#FFF8E1",
    color: "#0B1F3A",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  rating: { color: "#C9A227", fontWeight: "900" },
  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0B1F3A",
    marginBottom: 6,
  },
  cardText: { color: "#666666", lineHeight: 21, fontWeight: "600" },
  dateText: { marginTop: 10, color: "#C9A227", fontWeight: "900" },
  tapText: { marginTop: 12, color: "#0B1F3A", fontWeight: "900" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  emptyText: { color: "#666666", lineHeight: 21 },
});
