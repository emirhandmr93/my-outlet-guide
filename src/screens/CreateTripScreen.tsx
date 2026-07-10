import DateTimePicker from "@react-native-community/datetimepicker";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import type { RootStackParamList } from "../navigation/types";
import { requireAuth } from "../utils/requireAuth";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasAnyValue(values: string[]) {
  return values.some((value) => value.trim().length > 0);
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

type DateTarget = "start" | "end" | "return";

export function CreateTripScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isLoggedIn } = useUser();
  const { addTrip } = useTrips();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [returnDepartureDate, setReturnDepartureDate] = useState("");
  const [returnDepartureTime, setReturnDepartureTime] = useState("");
  const [returnDepartureAirport, setReturnDepartureAirport] = useState("");
  const [returnFlightNumber, setReturnFlightNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<DateTarget | null>(null);
  const [draftDate, setDraftDate] = useState(todayAtMidnight());
  const [flightOpen, setFlightOpen] = useState(false);

  useEffect(() => {
    requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") });
  }, [isLoggedIn, navigation, t]);

  if (!isLoggedIn) return null;

  function openDatePicker(target: DateTarget) {
    const current = target === "start" ? startDate : target === "end" ? endDate : parseDate(returnDepartureDate);
    setDraftDate(current || startDate || todayAtMidnight());
    setPickerTarget(target);
  }

  function confirmDatePicker() {
    const selected = new Date(draftDate);
    selected.setHours(0, 0, 0, 0);
    if (selected < todayAtMidnight()) {
      Alert.alert(t("createTrip.validationTitle"), t("createTrip.pastDateBlocked"));
      return;
    }
    if (pickerTarget === "start") {
      setStartDate(selected);
      if (endDate && formatDate(endDate) < formatDate(selected)) setEndDate(null);
    } else if (pickerTarget === "end") {
      if (startDate && formatDate(selected) < formatDate(startDate)) {
        Alert.alert(t("createTrip.validationTitle"), t("createTrip.endDateBeforeStart"));
        return;
      }
      setEndDate(selected);
    } else if (pickerTarget === "return") {
      setReturnDepartureDate(formatDate(selected));
    }
    setPickerTarget(null);
  }

  async function saveTrip() {
    if (!requireAuth({ isLoggedIn, navigation, message: t("trips.authRequiredCreateMessage") })) return;
    if (!tripName.trim()) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.tripNameRequired"));
    if (!startDate || !endDate) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.dateRangeRequired"));
    if (formatDate(endDate) < formatDate(startDate)) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.endDateBeforeStart"));
    if (startDate < todayAtMidnight() || endDate < todayAtMidnight()) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.pastDateBlocked"));
    const hasReturnDate = returnDepartureDate.trim().length > 0;
    const hasReturnTime = returnDepartureTime.trim().length > 0;
    if (hasReturnDate !== hasReturnTime) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.returnFlightDateTimeRequired"));
    if (hasReturnTime && !isValidTime(returnDepartureTime)) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.flightDateTimeInvalid"));

    const returnValues = [returnDepartureDate, returnDepartureTime, returnDepartureAirport, returnFlightNumber];
    setSaving(true);
    try {
      const newTripId = await addTrip({
        tripName: tripName.trim(),
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        notes: notes.trim() || undefined,
        segments: [],
        flightDetails: hasAnyValue(returnValues) ? { return: {
          flightNumber: returnFlightNumber.trim() || undefined,
          departureAirport: returnDepartureAirport.trim() || undefined,
          departureDate: returnDepartureDate.trim() || undefined,
          departureTime: returnDepartureTime.trim() || undefined,
        } } : undefined,
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

  const pickerTitle = pickerTarget === "start" ? t("createTrip.selectStartDateTitle") : pickerTarget === "end" ? t("createTrip.selectEndDateTitle") : t("createTrip.returnFlightDatePickerTitle");

  return <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
    <View style={styles.heroCard}><Text style={styles.kicker}>{t("createTrip.heroKicker")}</Text><Text style={styles.title}>{t("createTrip.heroTitle")}</Text><Text style={styles.subtitle}>{t("createTrip.heroSubtitle")}</Text></View>
    <View style={styles.card}><Text style={styles.sectionTitle}>{t("createTrip.tripDetails")}</Text><Text style={styles.label}>{t("createTrip.tripName")}</Text><TextInput style={styles.input} placeholder={t("createTrip.tripNamePlaceholder")} placeholderTextColor="#8A8A8A" value={tripName} onChangeText={setTripName} />
      <View style={styles.dateRow}>{([["start", startDate, "createTrip.startDate", "createTrip.selectStartDate"], ["end", endDate, "createTrip.endDate", "createTrip.selectEndDate"]] as const).map(([target, value, label, placeholder]) => <View style={styles.dateColumn} key={target}><Text style={styles.label}>{t(label)}</Text><TouchableOpacity style={[styles.inputBox, pickerTarget === target && styles.activeInputBox]} activeOpacity={0.76} onPress={() => openDatePicker(target)}><Text style={value ? styles.inputText : styles.placeholderText}>{value ? formatDate(value) : t(placeholder)}</Text><Text style={styles.chevron}>⌄</Text></TouchableOpacity></View>)}</View>
      <Text style={styles.label}>{t("createTrip.notes")}</Text><TextInput style={[styles.input, styles.notesInput]} placeholder={t("createTrip.notesPlaceholder")} placeholderTextColor="#8A8A8A" value={notes} onChangeText={setNotes} multiline /></View>
    <View style={styles.card}><TouchableOpacity style={styles.flightHeader} activeOpacity={0.76} onPress={() => setFlightOpen((value) => !value)}><View style={styles.headerText}><Text style={styles.sectionTitle}>{t("createTrip.returnFlightReminderTitle")}</Text><Text style={styles.helperText}>{t("createTrip.returnFlightReminderHelper")}</Text></View><Text style={styles.chevron}>{flightOpen ? "⌃" : "⌄"}</Text></TouchableOpacity>{flightOpen ? <><Text style={styles.label}>{t("createTrip.returnFlightDate")}</Text><TouchableOpacity style={styles.inputBox} activeOpacity={0.76} onPress={() => openDatePicker("return")}><Text style={returnDepartureDate ? styles.inputText : styles.placeholderText}>{returnDepartureDate || t("createTrip.selectReturnDate")}</Text><Text style={styles.chevron}>⌄</Text></TouchableOpacity><Text style={styles.label}>{t("createTrip.returnFlightTime")}</Text><TextInput style={styles.input} placeholder={t("createTrip.selectTime")} placeholderTextColor="#8A8A8A" value={returnDepartureTime} onChangeText={setReturnDepartureTime} /><Text style={styles.label}>{t("createTrip.returnDepartureAirport")}</Text><TextInput style={styles.input} placeholder={t("createTrip.returnDepartureAirportPlaceholder")} placeholderTextColor="#8A8A8A" value={returnDepartureAirport} onChangeText={setReturnDepartureAirport} autoCapitalize="characters" /><Text style={styles.label}>{t("createTrip.returnFlightNumber")}</Text><TextInput style={styles.input} placeholder={t("createTrip.returnFlightNumberPlaceholder")} placeholderTextColor="#8A8A8A" value={returnFlightNumber} onChangeText={setReturnFlightNumber} autoCapitalize="characters" /></> : null}</View>
    <View style={styles.card}><Text style={styles.sectionTitle}>{t("createTrip.routeInfoTitle")}</Text><Text style={styles.helperText}>{t("createTrip.routeInfoBody")}</Text></View>
    <TouchableOpacity style={[styles.primaryButton, saving && styles.disabledButton]} activeOpacity={0.86} onPress={saveTrip} disabled={saving}><Text style={styles.primaryButtonText}>{saving ? t("createTrip.saving") : t("createTrip.createCta")}</Text></TouchableOpacity>
    <Modal visible={Boolean(pickerTarget)} transparent animationType="slide" onRequestClose={() => setPickerTarget(null)}><View style={styles.modalScrim}><View style={styles.pickerModal}><Text style={styles.sectionTitle}>{pickerTitle}</Text><DateTimePicker value={draftDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "calendar"} minimumDate={todayAtMidnight()} onChange={(_, selectedDate) => selectedDate && setDraftDate(selectedDate)} /><View style={styles.modalActions}><TouchableOpacity style={styles.cancelButton} onPress={() => setPickerTarget(null)}><Text style={styles.cancelButtonText}>{t("createTrip.cancel")}</Text></TouchableOpacity><TouchableOpacity style={styles.doneButton} onPress={confirmDatePicker}><Text style={styles.doneButtonText}>{t("createTrip.done")}</Text></TouchableOpacity></View></View></View></Modal>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20 }, heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 }, kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 }, subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 }, card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 }, sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 10 }, label: { color: "#0B1F3A", fontWeight: "900", marginBottom: 8, marginTop: 4 }, helperText: { color: "#666666", lineHeight: 21, marginBottom: 12 }, input: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", color: "#0B1F3A", fontWeight: "700", marginBottom: 12 }, notesInput: { minHeight: 104, textAlignVertical: "top" }, inputBox: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, activeInputBox: { borderColor: "#C9A227", backgroundColor: "#FFF9E8" }, inputText: { color: "#0B1F3A", fontWeight: "800" }, placeholderText: { color: "#8A8A8A", fontWeight: "700" }, chevron: { color: "#C9A227", fontSize: 20, fontWeight: "900" }, dateRow: { flexDirection: "row", gap: 10 }, dateColumn: { flex: 1 }, flightHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, headerText: { flex: 1 }, modalScrim: { flex: 1, backgroundColor: "rgba(11,31,58,0.35)", justifyContent: "flex-end" }, pickerModal: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 }, modalActions: { flexDirection: "row", gap: 10, marginTop: 12 }, cancelButton: { flex: 1, backgroundColor: "#F7F8FA", borderRadius: 16, padding: 14 }, cancelButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, doneButton: { flex: 1, backgroundColor: "#0B1F3A", borderRadius: 16, padding: 14 }, doneButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" }, primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17 }, disabledButton: { opacity: 0.65 }, primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
