import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { outlets } from "../constants/outlets";
import { useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { formatCityDisplayName, formatCountryDisplayName, formatOutletLocationSubtitle } from "../utils/locationDisplay";
import { requireAuth } from "../utils/requireAuth";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

type RouteParams = {
  CreateTrip: {
    outletId?: string;
  };
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CreateTripScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "CreateTrip">>();
  const { isLoggedIn } = useUser();
  const { addTrip } = useTrips();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();

  const selectedOutlet = outlets.find((outlet) => outlet.outletId === route.params?.outletId);
  const outletCity = selectedOutlet?.cityId || selectedOutlet?.city || "";
  const outletCountry = selectedOutlet?.countryId || selectedOutlet?.country || "";
  const destinationText = selectedOutlet ? formatOutletLocationSubtitle(outletCity, outletCountry, language) : "";
  const [tripName, setTripName] = useState("");
  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") });
  }, [isLoggedIn, navigation, t]);

  function chooseOutlet() {
    navigation.navigate("Explore", { screen: "Outlets", params: { tripPrompt: true } });
  }

  if (!isLoggedIn) {
    return null;
  }

  if (!selectedOutlet) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
        scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
      >
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>{t("createTrip.heroKicker")}</Text>
          <Text style={styles.title}>{t("createTrip.missingOutletTitle")}</Text>
          <Text style={styles.subtitle}>{t("createTrip.missingOutletMessage")}</Text>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyTitle}>{t("createTrip.missingOutletTitle")}</Text>
          <Text style={styles.emptyText}>{t("createTrip.missingOutletMessage")}</Text>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.86} onPress={chooseOutlet}>
            <Text style={styles.primaryButtonText}>{t("createTrip.chooseOutletCta")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  async function saveTrip() {
    if (!requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") })) {
      return;
    }

    if (!selectedOutlet) {
      return;
    }

    if (!tripName.trim()) {
      Alert.alert(t("createTrip.validationTitle"), t("createTrip.tripNameRequired"));
      return;
    }

    setSaving(true);
    try {
      const newTripId = await addTrip({
        tripName: tripName.trim(),
        outletId: selectedOutlet.outletId,
        outletName: selectedOutlet.outletName,
        destination: destinationText,
        country: outletCountry ? formatCountryDisplayName(outletCountry, language) : undefined,
        city: outletCity ? formatCityDisplayName(outletCity, language) : undefined,
        visitDate: visitDate ? formatDate(visitDate) : undefined,
        notes: notes.trim() || undefined,
      });

      navigation.navigate("TripDetail", { tripId: newTripId });
    } catch (error) {
      console.log("Create trip error", error);
      const isPermissionDenied = (error as { code?: unknown }).code === "permission-denied";
      Alert.alert(
        t("createTrip.saveFailedTitle"),
        t(isPermissionDenied ? "createTrip.permissionDeniedMessage" : "createTrip.saveFailedMessage"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]}
      scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("createTrip.heroKicker")}</Text>
        <Text style={styles.title}>{t("createTrip.heroTitle")}</Text>
        <Text style={styles.subtitle}>{t("createTrip.heroSubtitle")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("createTrip.outletDestination")}</Text>
        <Text style={styles.outletName}>{selectedOutlet.outletName}</Text>
        <Text style={styles.helperText}>{destinationText}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("createTrip.tripDetails")}</Text>

        <Text style={styles.label}>{t("createTrip.tripName")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("createTrip.tripNamePlaceholder")}
          placeholderTextColor="#8A8A8A"
          value={tripName}
          onChangeText={setTripName}
        />

        <Text style={styles.label}>{t("createTrip.visitDate")}</Text>
        <TouchableOpacity
          style={styles.inputBox}
          activeOpacity={0.86}
          onPress={() => {
            if (!visitDate) setVisitDate(new Date());
            setShowDatePicker(true);
          }}
        >
          <Text style={visitDate ? styles.inputText : styles.placeholderText}>
            {visitDate ? formatDate(visitDate) : t("createTrip.selectVisitDate")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>{t("createTrip.notes")}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder={t("createTrip.notesPlaceholder")}
          placeholderTextColor="#8A8A8A"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {showDatePicker && (
        <View style={styles.pickerCard}>
          <DateTimePicker
            value={visitDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              if (selectedDate) setVisitDate(selectedDate);
              if (Platform.OS !== "ios") setShowDatePicker(false);
            }}
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.doneButtonText}>{t("createTrip.done")}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={[styles.primaryButton, saving && styles.disabledButton]} activeOpacity={0.86} onPress={saveTrip} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? t("createTrip.saving") : t("createTrip.createCta")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 },
  outletName: { color: "#0B1F3A", fontSize: 20, fontWeight: "900" },
  label: { color: "#0B1F3A", fontWeight: "900", marginBottom: 8, marginTop: 4 },
  helperText: { color: "#666666", lineHeight: 21, marginTop: 6 },
  input: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", color: "#0B1F3A", fontWeight: "700", marginBottom: 12 },
  notesInput: { minHeight: 104, textAlignVertical: "top" },
  inputBox: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  inputText: { color: "#0B1F3A", fontWeight: "800" },
  placeholderText: { color: "#8A8A8A", fontWeight: "700" },
  pickerCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  doneButton: { backgroundColor: "#0B1F3A", borderRadius: 16, padding: 14, marginTop: 8 },
  doneButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17 },
  emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 24, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900" },
  emptyText: { color: "#666666", textAlign: "center", lineHeight: 21, marginTop: 8, marginBottom: 16 },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
