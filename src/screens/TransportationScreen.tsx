import { RouteProp, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { getTransportationLabel } from "../utils/transportationFormatter";
import { transportationGuides } from "../constants/transportationGuides";

function getFallbackSteps(guide: any) {
  const title = String(guide.title || "").toLowerCase();
  const type = String(guide.transportationType || "").toLowerCase();

  if (title.includes("charles de gaulle") || title.includes("cdg")) {
    return [
      { order: 1, description: "Follow airport signs to the RER/TGV train area." },
      { order: 2, description: "Take a train connection towards central Paris or Marne-la-Vallée." },
      { order: 3, description: "Change where required for Val d'Europe station." },
      { order: 4, description: "Get off at Val d'Europe and follow signs towards La Vallée Village." },
      { order: 5, description: "Walk approximately 5 minutes to the outlet entrance." },
    ];
  }

  if (title.includes("orly")) {
    return [
      { order: 1, description: "Follow airport signs to the public transport connection." },
      { order: 2, description: "Travel towards central Paris and connect to the RER A line." },
      { order: 3, description: "Take RER A towards Marne-la-Vallée Chessy." },
      { order: 4, description: "Get off at Val d'Europe station." },
      { order: 5, description: "Walk approximately 5 minutes to La Vallée Village." },
    ];
  }

  if (title.includes("disney")) {
    return [
      { order: 1, description: "Start from the Disneyland Paris / Val d'Europe area." },
      { order: 2, description: "Follow pedestrian signs towards Centre Commercial Val d'Europe." },
      { order: 3, description: "Continue towards La Vallée Village entrance." },
    ];
  }

  if (type.includes("taxi") || title.includes("taxi") || title.includes("uber")) {
    return [
      { order: 1, description: "Open your preferred ride-hailing or taxi app." },
      { order: 2, description: "Set La Vallée Village, Serris as the destination." },
      { order: 3, description: "Confirm the estimated fare and pickup point before starting the ride." },
      { order: 4, description: "Ask to be dropped near the main entrance or guest services area." },
      { order: 5, description: "For the return trip, check vehicle availability before outlet closing time." },
    ];
  }

  if (type.includes("shuttle") || title.includes("shuttle")) {
    return [
      { order: 1, description: "Check the latest shuttle timetable before departure." },
      { order: 2, description: "Arrive at the pickup point at least 10 minutes early." },
      { order: 3, description: "Confirm that the shuttle goes to La Vallée Village / Val d'Europe." },
      { order: 4, description: "Keep the return schedule saved before you start shopping." },
    ];
  }

  if (type.includes("train") || title.includes("rer") || title.includes("paris")) {
    return [
      { order: 1, description: "Go to a central Paris RER A station such as Châtelet–Les Halles, Auber, Charles de Gaulle–Étoile, or Nation." },
      { order: 2, description: "Take RER A towards Marne-la-Vallée Chessy." },
      { order: 3, description: "Get off at Val d'Europe station." },
      { order: 4, description: "Follow signs towards Centre Commercial Val d'Europe / La Vallée Village." },
      { order: 5, description: "Walk approximately 5 minutes to the outlet entrance." },
    ];
  }

  return [
    { order: 1, description: "Check the latest route and schedule before departure." },
    { order: 2, description: "Follow the indicated transport option towards Val d'Europe / Serris." },
    { order: 3, description: "Use maps or station signs for the final walking section to La Vallée Village." },
  ];
}

type RouteParams = {
  Transportation: {
    outletId: string;
  };
};

function RouteGuideCard({ guide, isRecommended }: { guide: any; isRecommended?: boolean }) {
  const sortedSteps = (guide.steps?.length ? [...guide.steps] : getFallbackSteps(guide)).sort((a, b) => a.order - b.order);

  return (
    <View style={styles.card}>
      {isRecommended ? <Text style={styles.badge}>Recommended Route</Text> : null}
      <Text style={styles.routeTitle}>{guide.title}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoBox}>{getTransportationLabel(guide.transportationType)}</Text>
        <Text style={styles.infoBox}>⏱️ {guide.estimatedDuration}</Text>
        <Text style={styles.infoBox}>💰 {guide.estimatedCost}</Text>
      </View>

      <Text style={styles.sectionTitle}>Step-by-step guide</Text>
      {sortedSteps.map((step) => (
        <View key={`${guide.guideId}-${step.order}`} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{step.order}</Text>
          <Text style={styles.stepText}>{step.description}</Text>
        </View>
      ))}
    </View>
  );
}

export function TransportationScreen() {
  const route = useRoute<RouteProp<RouteParams, "Transportation">>();
  const outletId = route.params?.outletId;
  const { t } = useTranslation();

  const guides = transportationGuides.filter((guide) => guide.outletId === outletId);
  const recommendedGuide = guides.find((guide) => guide.recommended) || guides[0];
  const otherGuides = guides.filter(
    (guide) => guide.guideId !== recommendedGuide?.guideId
  );

  if (!recommendedGuide) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{t("transportation.notAvailable")}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{t("transportation.title")}</Text>
      <Text style={styles.pageSubtitle}>{t("transportation.subtitle")}</Text>

      <RouteGuideCard guide={recommendedGuide} isRecommended />

      {otherGuides.length > 0 ? (
        <>
          <Text style={styles.sectionTitleOutside}>{t("transportation.otherOptions")}</Text>
          {otherGuides.map((guide) => (
            <RouteGuideCard key={guide.guideId} guide={guide} />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1F3A",
    textAlign: "center",
  },
  pageTitle: { fontSize: 28, fontWeight: "800", color: "#0B1F3A" },
  pageSubtitle: {
    fontSize: 15,
    color: "#C9A227",
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF8E1",
    color: "#0B1F3A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontWeight: "800",
    marginBottom: 12,
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 14,
  },
  infoRow: {
    gap: 8,
    marginBottom: 18,
  },
  infoBox: {
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 12,
    color: "#0B1F3A",
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B1F3A",
    marginBottom: 12,
  },
  sectionTitleOutside: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B1F3A",
    marginTop: 20,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0B1F3A",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    color: "#666666",
    lineHeight: 20,
  },
  noStepsText: {
    color: "#666666",
    lineHeight: 21,
    fontStyle: "italic",
  },
});
