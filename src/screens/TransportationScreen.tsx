import { RouteProp, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "../hooks/useTranslation";
import { getTransportationLabel } from "../utils/transportationFormatter";
import { transportationGuides } from "../constants/transportationGuides";

function getFallbackSteps(guide: any, t: (key: string) => string) {
  const title = String(guide.title || "").toLowerCase();
  const type = String(guide.transportationType || "").toLowerCase();

  if (title.includes("charles de gaulle") || title.includes("cdg")) {
    return [
      { order: 1, description: t("transportation.fallback.cdg.step1") },
      { order: 2, description: t("transportation.fallback.cdg.step2") },
      { order: 3, description: t("transportation.fallback.cdg.step3") },
      { order: 4, description: t("transportation.fallback.cdg.step4") },
      {
        order: 5,
        description: t("transportation.fallback.common.walkOutletEntrance"),
      },
    ];
  }

  if (title.includes("orly")) {
    return [
      { order: 1, description: t("transportation.fallback.orly.step1") },
      { order: 2, description: t("transportation.fallback.orly.step2") },
      { order: 3, description: t("transportation.fallback.common.takeRerA") },
      {
        order: 4,
        description: t("transportation.fallback.common.valDEuropeStation"),
      },
      {
        order: 5,
        description: t("transportation.fallback.common.walkLaVallee"),
      },
    ];
  }

  if (title.includes("disney")) {
    return [
      { order: 1, description: t("transportation.fallback.disney.step1") },
      { order: 2, description: t("transportation.fallback.disney.step2") },
      { order: 3, description: t("transportation.fallback.disney.step3") },
    ];
  }

  if (
    type.includes("taxi") ||
    title.includes("taxi") ||
    title.includes("uber")
  ) {
    return [
      { order: 1, description: t("transportation.fallback.taxi.step1") },
      { order: 2, description: t("transportation.fallback.taxi.step2") },
      { order: 3, description: t("transportation.fallback.taxi.step3") },
      { order: 4, description: t("transportation.fallback.taxi.step4") },
      { order: 5, description: t("transportation.fallback.taxi.step5") },
    ];
  }

  if (type.includes("shuttle") || title.includes("shuttle")) {
    return [
      { order: 1, description: t("transportation.fallback.shuttle.step1") },
      { order: 2, description: t("transportation.fallback.shuttle.step2") },
      { order: 3, description: t("transportation.fallback.shuttle.step3") },
      { order: 4, description: t("transportation.fallback.shuttle.step4") },
    ];
  }

  if (
    type.includes("train") ||
    title.includes("rer") ||
    title.includes("paris")
  ) {
    return [
      { order: 1, description: t("transportation.fallback.train.step1") },
      { order: 2, description: t("transportation.fallback.common.takeRerA") },
      {
        order: 3,
        description: t("transportation.fallback.common.valDEuropeStation"),
      },
      { order: 4, description: t("transportation.fallback.train.step4") },
      {
        order: 5,
        description: t("transportation.fallback.common.walkOutletEntrance"),
      },
    ];
  }

  return [
    { order: 1, description: t("transportation.fallback.default.step1") },
    { order: 2, description: t("transportation.fallback.default.step2") },
    { order: 3, description: t("transportation.fallback.default.step3") },
  ];
}

type RouteParams = {
  Transportation: {
    outletId: string;
  };
};

function RouteGuideCard({
  guide,
  isRecommended,
}: {
  guide: any;
  isRecommended?: boolean;
}) {
  const { t } = useTranslation();
  const sortedSteps = (
    guide.steps?.length ? [...guide.steps] : getFallbackSteps(guide, t)
  ).sort((a, b) => a.order - b.order);

  return (
    <View style={styles.card}>
      {isRecommended ? (
        <Text style={styles.badge}>{t("transportation.recommendedRoute")}</Text>
      ) : null}
      <Text style={styles.routeTitle}>{guide.title}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{t("transportation.service")}</Text>
          <Text style={styles.infoValue}>
            {getTransportationLabel(guide.transportationType, t)}
          </Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{t("transportation.duration")}</Text>
          <Text style={styles.infoValue}>⏱️ {guide.estimatedDuration}</Text>
        </View>
        <View style={styles.infoBoxFull}>
          <Text style={styles.infoLabel}>{t("transportation.cost")}</Text>
          <Text style={styles.infoValue}>💰 {guide.estimatedCost}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("transportation.stepByStep")}</Text>
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
  const insets = useSafeAreaInsets();

  const guides = transportationGuides.filter(
    (guide) => guide.outletId === outletId,
  );
  const recommendedGuide =
    guides.find((guide) => guide.recommended) || guides[0];
  const otherGuides = guides.filter(
    (guide) => guide.guideId !== recommendedGuide?.guideId,
  );

  if (!recommendedGuide) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {t("transportation.notAvailable")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 132 },
      ]}
      scrollIndicatorInsets={{ top: insets.top, bottom: insets.bottom + 96 }}
    >
      <Text style={styles.pageTitle}>{t("transportation.title")}</Text>
      <Text style={styles.pageSubtitle}>{t("transportation.subtitle")}</Text>

      <RouteGuideCard guide={recommendedGuide} isRecommended />

      {otherGuides.length > 0 ? (
        <>
          <Text style={styles.sectionTitleOutside}>
            {t("transportation.otherOptions")}
          </Text>
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  infoBox: {
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 12,
  },
  infoBoxFull: {
    width: "100%",
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    padding: 12,
  },
  infoLabel: {
    color: "#7A8494",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#0B1F3A",
    fontWeight: "800",
    lineHeight: 20,
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
