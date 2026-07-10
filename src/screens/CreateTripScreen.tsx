import DateTimePicker from "@react-native-community/datetimepicker";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { outlets } from "../constants/outlets";
import { TripSegment, useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { formatCityDisplayName, formatCountryDisplayName, formatOutletLocationSubtitle } from "../utils/locationDisplay";
import { navigateToTripOutletSelection } from "../navigation/tripOutletSelection";
import type { RootStackParamList } from "../navigation/types";
import { requireAuth } from "../utils/requireAuth";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(date: Date | null, emptyText: string) {
  return date ? formatDate(date) : emptyText;
}

export function CreateTripScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CreateTrip">>();
  const { isLoggedIn } = useUser();
  const { addTrip } = useTrips();
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();

  const selectedOutlet = outlets.find((outlet) => outlet.outletId === route.params?.outletId);
  const outletCity = selectedOutlet?.cityId || selectedOutlet?.city || "";
  const outletCountry = selectedOutlet?.countryId || selectedOutlet?.country || "";
  const destinationText = selectedOutlet ? formatOutletLocationSubtitle(outletCity, outletCountry, language) : "";
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [returnAirport, setReturnAirport] = useState("");
  const [outboundDateTime, setOutboundDateTime] = useState("");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);
  const [flightOpen, setFlightOpen] = useState(false);

  useEffect(() => {
    requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") });
  }, [isLoggedIn, navigation, t]);

  const initialSegments = useMemo<TripSegment[]>(() => {
    if (!selectedOutlet || !startDate || !endDate) return [];
    return [{
      id: `outlet-${selectedOutlet.outletId}`,
      outletId: selectedOutlet.outletId,
      outletName: selectedOutlet.outletName,
      cityId: outletCity || undefined,
      cityName: outletCity ? formatCityDisplayName(outletCity, language) : undefined,
      countryCode: outletCountry || undefined,
      countryName: outletCountry ? formatCountryDisplayName(outletCountry, language) : undefined,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    }];
  }, [endDate, language, outletCity, outletCountry, selectedOutlet, startDate]);

  function chooseDestination() {
    navigateToTripOutletSelection(navigation);
  }

  if (!isLoggedIn) {
    return null;
  }

  async function saveTrip() {
    if (!requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") })) return;
    if (!tripName.trim()) {
      Alert.alert(t("createTrip.validationTitle"), t("createTrip.tripNameRequired"));
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert(t("createTrip.validationTitle"), t("createTrip.dateRangeRequired"));
      return;
    }
    if (formatDate(endDate) < formatDate(startDate)) {
      Alert.alert(t("createTrip.validationTitle"), t("createTrip.endDateBeforeStart"));
      return;
    }

    setSaving(true);
    try {
      const newTripId = await addTrip({
        tripName: tripName.trim(),
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        outletId: selectedOutlet?.outletId,
        outletName: selectedOutlet?.outletName,
        destination: destinationText || undefined,
        country: outletCountry ? formatCountryDisplayName(outletCountry, language) : undefined,
        city: outletCity ? formatCityDisplayName(outletCity, language) : undefined,
        notes: notes.trim() || undefined,
        segments: initialSegments,
        flightDetails: {
          airline: airline.trim() || undefined,
          flightNumber: flightNumber.trim() || undefined,
          departureAirport: departureAirport.trim() || undefined,
          returnAirport: returnAirport.trim() || undefined,
          outboundDateTime: outboundDateTime.trim() || undefined,
          returnDateTime: returnDateTime.trim() || undefined,
        },
      });
      navigation.navigate("TripDetail", { tripId: newTripId });
    } catch (error) {
      console.log("Create trip error", error);
      const isPermissionDenied = (error as { code?: unknown }).code === "permission-denied";
      Alert.alert(t("createTrip.saveFailedTitle"), t(isPermissionDenied ? "createTrip.permissionDeniedMessage" : "createTrip.saveFailedMessage"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("createTrip.heroKicker")}</Text>
        <Text style={styles.title}>{t("createTrip.heroTitle")}</Text>
        <Text style={styles.subtitle}>{t("createTrip.heroSubtitle")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("createTrip.tripDetails")}</Text>
        <Text style={styles.label}>{t("createTrip.tripName")}</Text>
        <TextInput style={styles.input} placeholder={t("createTrip.tripNamePlaceholder")} placeholderTextColor="#8A8A8A" value={tripName} onChangeText={setTripName} />
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>{t("createTrip.startDate")}</Text>
            <TouchableOpacity style={styles.inputBox} activeOpacity={0.86} onPress={() => { if (!startDate) setStartDate(new Date()); setPickerTarget("start"); }}>
              <Text style={startDate ? styles.inputText : styles.placeholderText}>{displayDate(startDate, t("createTrip.selectStartDate"))}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateColumn}>
            <Text style={styles.label}>{t("createTrip.endDate")}</Text>
            <TouchableOpacity style={styles.inputBox} activeOpacity={0.86} onPress={() => { if (!endDate) setEndDate(startDate || new Date()); setPickerTarget("end"); }}>
              <Text style={endDate ? styles.inputText : styles.placeholderText}>{displayDate(endDate, t("createTrip.selectEndDate"))}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.label}>{t("createTrip.notes")}</Text>
        <TextInput style={[styles.input, styles.notesInput]} placeholder={t("createTrip.notesPlaceholder")} placeholderTextColor="#8A8A8A" value={notes} onChangeText={setNotes} multiline />
      </View>

      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.86} onPress={() => setFlightOpen((value) => !value)}>
          <Text style={styles.sectionTitle}>{t("createTrip.flightInfo")}</Text>
          <Text style={styles.helperText}>{t("createTrip.flightHelper")}</Text>
        </TouchableOpacity>
        {flightOpen && <>
          <TextInput style={styles.input} placeholder={t("createTrip.airline")} placeholderTextColor="#8A8A8A" value={airline} onChangeText={setAirline} />
          <TextInput style={styles.input} placeholder={t("createTrip.flightNumber")} placeholderTextColor="#8A8A8A" value={flightNumber} onChangeText={setFlightNumber} />
          <TextInput style={styles.input} placeholder={t("createTrip.departureAirport")} placeholderTextColor="#8A8A8A" value={departureAirport} onChangeText={setDepartureAirport} />
          <TextInput style={styles.input} placeholder={t("createTrip.returnAirport")} placeholderTextColor="#8A8A8A" value={returnAirport} onChangeText={setReturnAirport} />
          <TextInput style={styles.input} placeholder={t("createTrip.outboundDateTime")} placeholderTextColor="#8A8A8A" value={outboundDateTime} onChangeText={setOutboundDateTime} />
          <TextInput style={styles.input} placeholder={t("createTrip.returnDateTime")} placeholderTextColor="#8A8A8A" value={returnDateTime} onChangeText={setReturnDateTime} />
        </>}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("createTrip.destinations")}</Text>
        {selectedOutlet ? <View style={styles.segmentCard}><Text style={styles.outletName}>{selectedOutlet.outletName}</Text><Text style={styles.helperText}>{destinationText}</Text></View> : <Text style={styles.helperText}>{t("createTrip.destinationsOptional")}</Text>}
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.86} onPress={chooseDestination}><Text style={styles.secondaryButtonText}>{t("createTrip.addCityOutlet")}</Text></TouchableOpacity>
      </View>

      {pickerTarget && <View style={styles.pickerCard}>
        <DateTimePicker value={(pickerTarget === "start" ? startDate : endDate) || new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(_, selectedDate) => { if (selectedDate) pickerTarget === "start" ? setStartDate(selectedDate) : setEndDate(selectedDate); if (Platform.OS !== "ios") setPickerTarget(null); }} />
        {Platform.OS === "ios" && <TouchableOpacity style={styles.doneButton} onPress={() => setPickerTarget(null)}><Text style={styles.doneButtonText}>{t("createTrip.done")}</Text></TouchableOpacity>}
      </View>}

      <TouchableOpacity style={[styles.primaryButton, saving && styles.disabledButton]} activeOpacity={0.86} onPress={saveTrip} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? t("createTrip.saving") : t("createTrip.createCta")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20 }, heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 }, kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 }, subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 }, card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 }, sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 10 }, outletName: { color: "#0B1F3A", fontSize: 20, fontWeight: "900" }, label: { color: "#0B1F3A", fontWeight: "900", marginBottom: 8, marginTop: 4 }, helperText: { color: "#666666", lineHeight: 21, marginBottom: 12 }, input: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", color: "#0B1F3A", fontWeight: "700", marginBottom: 12 }, notesInput: { minHeight: 104, textAlignVertical: "top" }, inputBox: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 }, inputText: { color: "#0B1F3A", fontWeight: "800" }, placeholderText: { color: "#8A8A8A", fontWeight: "700" }, dateRow: { flexDirection: "row", gap: 10 }, dateColumn: { flex: 1 }, pickerCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 }, doneButton: { backgroundColor: "#0B1F3A", borderRadius: 16, padding: 14, marginTop: 8 }, doneButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" }, primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17 }, secondaryButton: { backgroundColor: "#F8F1D8", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#E7D79A" }, segmentCard: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 14, marginBottom: 12 }, secondaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, disabledButton: { opacity: 0.65 }, primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
