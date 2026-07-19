import DateTimePicker from "@react-native-community/datetimepicker";
import { createElement, useEffect, useState } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TripFlightLegDetails, TripReminderPlanItem, TripSegment, useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { getTripWeatherForecast, type TripWeatherResult } from "../services/liveWeatherService";
import { getTripStatusLabel } from "../utils/getTripStatusLabel";
import { getFloatingTabClearance, getScreenTopInset, getScrollIndicatorBottomInset } from "../utils/safeAreaLayout";

type RouteParams = { TripDetail: { tripId: string } };

function applyParams(template: string, params?: Record<string, string>) {
  return Object.entries(params || {}).reduce((text, [key, value]) => text.replace(`{{${key}}}`, value), template);
}

function ReminderRow({ item, t }: { item: TripReminderPlanItem; t: (key: string) => string }) {
  const relatedOutlet = item.messageParams?.outlet || item.outletId;
  const relatedPlace = [item.cityName, relatedOutlet].filter(Boolean).join(" · ");
  return <View style={styles.reminderRow}>
    <Text style={styles.detailLabel}>{item.date} · {t(item.title)}</Text>
    <Text style={styles.detailValue}>{applyParams(t(item.body), item.messageParams)}</Text>
    {relatedPlace ? <Text style={styles.reminderMeta}>{relatedPlace}</Text> : null}
    {item.source ? <Text style={styles.reminderMeta}>{item.source}</Text> : null}
  </View>;
}


function hasFlightLeg(leg?: TripFlightLegDetails) {
  return Boolean(leg && Object.values(leg).some(Boolean));
}

function FlightLegCard({ label, leg, reminder, t }: { label: string; leg?: TripFlightLegDetails; reminder?: TripReminderPlanItem; t: (key: string) => string }) {
  if (!hasFlightLeg(leg)) return null;
  const flightName = [leg?.airline, leg?.flightNumber].filter(Boolean).join(" ");
  const route = [leg?.departureAirport, leg?.arrivalAirport].filter(Boolean).join(" → ");
  const dateTime = [leg?.departureDate, leg?.departureTime].filter(Boolean).join(" · ");
  return <View style={styles.flightLegCard}>
    <Text style={styles.detailLabel}>{label}</Text>
    {flightName ? <Text style={styles.detailValue}>{flightName}</Text> : null}
    {route ? <Text style={styles.detailValue}>{route}</Text> : null}
    {dateTime ? <Text style={styles.detailValue}>{dateTime}</Text> : null}
    {reminder ? <Text style={styles.reminderMeta}>{t("flightAlerts.reminderReady")}</Text> : null}
  </View>;
}

function getReminderStatusText(status: string | undefined, t: (key: string) => string) {
  if (status === "scheduled") return t("tripDetail.notificationsScheduled");
  if (status === "partial" || status === "failed") return t("tripDetail.notificationsPartial");
  if (status === "denied") return t("notifications.permission.denied");
  return t("tripDetail.reminderPlanPreview");
}

function todayAtMidnight() { const today = new Date(); today.setHours(0, 0, 0, 0); return today; }
function parseDate(value: string) { return new Date(`${value}T00:00:00`); }
function formatDate(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`; }

function SegmentRow({ segment, onEdit, onDelete }: { segment: TripSegment; onEdit: () => void; onDelete: () => void }) {
  const place = [segment.cityName, segment.outletName].filter(Boolean).join(" · ") || segment.countryName || segment.title;
  return <View style={styles.segmentCard}><Text style={styles.detailValue}>{segment.startDate} – {segment.endDate} · {place}</Text>{segment.countryName ? <Text style={styles.detailLabel}>{segment.countryName}</Text> : null}{segment.notes ? <Text style={styles.detailValue}>{segment.notes}</Text> : null}<View style={styles.actionRow}><TouchableOpacity style={styles.smallButton} onPress={onEdit}><Text style={styles.smallButtonText}>✎</Text></TouchableOpacity><TouchableOpacity style={styles.deleteButton} onPress={onDelete}><Text style={styles.deleteButtonText}>×</Text></TouchableOpacity></View></View>;
}

export function TripDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "TripDetail">>();
  const navigation = useNavigation<any>();
  const { trips, updateTrip, deleteTrip } = useTrips();
  const { t, language } = useTranslation();
  const [weather, setWeather] = useState<TripWeatherResult | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingDates, setSavingDates] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);
  const [draftDate, setDraftDate] = useState(todayAtMidnight());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const insets = useSafeAreaInsets();
  const trip = trips.find((item) => item.id === route.params?.tripId || item.tripId === route.params?.tripId);

  useEffect(() => {
    let active = true;
    if (!trip || trip.segments.length === 0) {
      setWeather(null);
      return;
    }
    setWeatherLoading(true);
    getTripWeatherForecast(trip, language)
      .then((result) => { if (active) setWeather(result); })
      .catch(() => { if (active) setWeather({ provider: "Open-Meteo", status: "unavailable", locations: [] }); })
      .finally(() => { if (active) setWeatherLoading(false); });
    return () => { active = false; };
  }, [trip?.id, trip?.updatedAt, language]);

  if (!trip) return <View style={styles.centerState}><Text style={styles.emptyTitle}>{t("tripDetail.notFound")}</Text><TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}><Text style={styles.primaryButtonText}>{t("tripDetail.goBack")}</Text></TouchableOpacity></View>;
  const hasFlightSummary = Boolean(hasFlightLeg(trip.flightDetails?.return));
  const returnReminder = trip.reminderPlan.find((item) => item.type === "returnFlight");
  const openEditor = (segmentId?: string) => navigation.navigate("TripSegmentEditor", { tripId: trip.id, segmentId });
  const confirmDelete = (segmentId: string) => Alert.alert(t("tripSegment.deleteTitle"), t("tripSegment.deleteBody"), [{ text: t("common.cancel"), style: "cancel" }, { text: t("tripDetail.deleteRouteCta"), style: "destructive", onPress: () => updateTrip(trip.id, { segments: trip.segments.filter((item) => item.id !== segmentId) }) }]);
  const openDateEditor = () => { setStartDate(trip.startDate); setEndDate(trip.endDate); setEditingDates(true); };
  const openDatePicker = (target: "start" | "end") => { setDraftDate(parseDate(target === "start" ? startDate : endDate)); setPickerTarget(target); };
  const confirmDatePicker = () => { const value = formatDate(draftDate); if (draftDate < todayAtMidnight()) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.pastDateBlocked")); if (pickerTarget === "end" && value < startDate) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.endDateBeforeStart")); if (pickerTarget === "start") { setStartDate(value); if (endDate < value) setEndDate(value); } else setEndDate(value); setPickerTarget(null); };
  const saveDates = async () => { if (startDate < formatDate(todayAtMidnight()) || endDate < formatDate(todayAtMidnight())) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.pastDateBlocked")); if (endDate < startDate) return Alert.alert(t("createTrip.validationTitle"), t("createTrip.endDateBeforeStart")); setSavingDates(true); try { await updateTrip(trip.id, { startDate, endDate }); setEditingDates(false); } catch { Alert.alert(t("createTrip.saveFailedTitle"), t("createTrip.saveFailedMessage")); } finally { setSavingDates(false); } };
  const confirmTripDelete = () => Alert.alert(t("trips.deleteConfirmTitle"), t("trips.deleteConfirmMessage"), [{ text: t("common.cancel"), style: "cancel" }, { text: t("common.delete"), style: "destructive", onPress: async () => { if (deleting) return; setDeleting(true); try { await deleteTrip(trip.id); navigation.navigate("MyTrips"); } catch (error) { const denied = (error as { code?: string }).code === "permission-denied"; Alert.alert(t("trips.deleteFailedTitle"), t(denied ? "trips.permissionDeniedMessage" : "trips.deleteFailedMessage")); } finally { setDeleting(false); } } }]);

  return <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: getScreenTopInset(insets.top), paddingBottom: getFloatingTabClearance(insets.bottom) }]} scrollIndicatorInsets={{ bottom: getScrollIndicatorBottomInset(insets.bottom) }}>
    <View style={styles.heroCard}><Text style={styles.kicker}>{t("tripDetail.heroKicker")}</Text><Text style={styles.title}>{trip.tripName}</Text><Text style={styles.subtitle}>{trip.startDate} – {trip.endDate}</Text></View>
    <View style={styles.summaryRow}><View style={styles.summaryBox}><Text style={styles.summaryValue}>{getTripStatusLabel(trip.status, t)}</Text><Text style={styles.summaryLabel}>{t("tripDetail.statusSummary")}</Text></View><View style={styles.summaryBox}><Text style={styles.summaryValue}>{trip.startDate} – {trip.endDate}</Text><Text style={styles.summaryLabel}>{t("createTrip.visitDates")}</Text></View></View>
    <View style={styles.card}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{t("createTrip.visitDates")}</Text><TouchableOpacity style={styles.secondaryButton} onPress={openDateEditor}><Text style={styles.secondaryButtonText}>{t("tripDetail.editRouteCta")}</Text></TouchableOpacity></View>{editingDates ? <><View style={styles.actionRow}><TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker("start")}><Text style={styles.detailLabel}>{t("tripSegment.startDate")}</Text><Text style={styles.detailValue}>{startDate}</Text></TouchableOpacity><TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker("end")}><Text style={styles.detailLabel}>{t("tripSegment.endDate")}</Text><Text style={styles.detailValue}>{endDate}</Text></TouchableOpacity></View><TouchableOpacity style={[styles.primaryButton, savingDates && styles.disabledButton]} onPress={saveDates} disabled={savingDates}><Text style={styles.primaryButtonText}>{t("createTrip.done")}</Text></TouchableOpacity></> : <Text style={styles.detailValue}>{trip.startDate} – {trip.endDate}</Text>}</View>
    <View style={styles.card}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{t("tripDetail.routeSection")}</Text>{trip.segments.length > 0 ? <TouchableOpacity style={styles.secondaryButton} onPress={() => openEditor()}><Text style={styles.secondaryButtonText}>{t("tripDetail.addRouteCta")}</Text></TouchableOpacity> : null}</View>{trip.segments.length > 0 ? trip.segments.map((segment) => <SegmentRow key={segment.id} segment={segment} onEdit={() => openEditor(segment.id)} onDelete={() => confirmDelete(segment.id)} />) : <View style={styles.emptySegment}><Text style={styles.emptyTitle}>{t("tripDetail.emptyRouteTitle")}</Text><Text style={styles.emptyText}>{t("tripDetail.emptyRouteText")}</Text><TouchableOpacity style={styles.secondaryButton} onPress={() => openEditor()}><Text style={styles.secondaryButtonText}>{t("tripDetail.addRouteCta")}</Text></TouchableOpacity></View>}</View>

    {weather?.status === "provider_not_configured" ? null : <View style={styles.card}><Text style={styles.sectionTitle}>{t("weather.title")}</Text>{trip.segments.length === 0 ? <Text style={styles.helperText}>{t("weather.emptyRoute")}</Text> : weatherLoading ? <Text style={styles.helperText}>{t("weather.checkingAvailability")}</Text> : weather?.status === "unavailable" ? <Text style={styles.helperText}>{t("weather.unavailable")}</Text> : weather?.status === "missing_coordinates" ? <Text style={styles.helperText}>{t("weather.unavailable")}</Text> : weather?.locations.length ? <View>{weather.status === "out_of_range" ? <Text style={styles.helperText}>{t("weather.outOfRange")}</Text> : null}{weather.locations.flatMap((location) => location.daily.map((day) => <View key={`${location.key}-${day.date}`} style={styles.weatherDayCard}><Text style={styles.detailLabel}>{day.date} · {location.label}</Text><Text style={styles.detailValue}>{day.conditionLabel}</Text><Text style={styles.reminderMeta}>{t("weather.tempMax")}: {day.tempMax ?? "—"}°C · {t("weather.tempMin")}: {day.tempMin ?? "—"}°C</Text><Text style={styles.reminderMeta}>{t("weather.precipitationProbability")}: {day.precipitationProbabilityMax ?? "—"}% · {t("weather.wind")}: {day.windSpeedMax ?? "—"} km/h</Text>{day.precipitationSum != null ? <Text style={styles.reminderMeta}>{t("weather.precipitation")}: {day.precipitationSum} mm</Text> : null}</View>))}<Text style={styles.disclaimer}>{t("weather.sourceOpenMeteo")}</Text>{weather.updatedAt ? <Text style={styles.disclaimer}>{t("currency.lastUpdated")}: {weather.updatedAt}</Text> : null}</View> : <Text style={styles.helperText}>{t("weather.unavailable")}</Text>}</View>}
    <View style={styles.card}><Text style={styles.sectionTitle}>{t("tripDetail.reminderPlan")}</Text><Text style={styles.helperText}>{getReminderStatusText(trip.notificationSync?.status, t)}</Text>{trip.reminderPlan.length > 0 ? [...trip.reminderPlan].sort((a, b) => a.date.localeCompare(b.date)).map((item) => <ReminderRow key={item.id} item={item} t={t} />) : <View style={styles.emptySegment}><Text style={styles.emptyTitle}>{t("tripDetail.noRemindersTitle")}</Text><Text style={styles.emptyText}>{t("tripDetail.noRemindersText")}</Text></View>}</View>
    {hasFlightSummary && <View style={styles.card}><Text style={styles.sectionTitle}>{t("flightAlerts.flightInfo")}</Text><FlightLegCard label={t("flightAlerts.returnFlight")} leg={trip.flightDetails?.return} reminder={returnReminder} t={t} /></View>}
    {trip.notes ? <View style={styles.card}><Text style={styles.sectionTitle}>{t("createTrip.notes")}</Text><Text style={styles.detailValue}>{trip.notes}</Text></View> : null}
    <TouchableOpacity style={[styles.tripDeleteButton, deleting && styles.disabledButton]} onPress={confirmTripDelete} disabled={deleting}><Text style={styles.deleteButtonText}>{deleting ? t("createTrip.saving") : t("common.delete")}</Text></TouchableOpacity>
    <Modal visible={Boolean(pickerTarget)} transparent animationType="slide" onRequestClose={() => setPickerTarget(null)}><View style={styles.modalScrim}><View style={styles.pickerModal}>{Platform.OS === "web" ? createElement("input", { type: "date", value: formatDate(draftDate), min: formatDate(todayAtMidnight()), onChange: (event: any) => { const date = parseDate(event.target.value); if (!Number.isNaN(date.getTime())) setDraftDate(date); }, style: styles.webPickerInput }) : <DateTimePicker value={draftDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "calendar"} minimumDate={todayAtMidnight()} onChange={(_, date) => date && setDraftDate(date)} />}<View style={styles.actionRow}><TouchableOpacity style={styles.secondaryButton} onPress={() => setPickerTarget(null)}><Text style={styles.secondaryButtonText}>{t("common.cancel")}</Text></TouchableOpacity><TouchableOpacity style={styles.primaryButton} onPress={confirmDatePicker}><Text style={styles.primaryButtonText}>{t("createTrip.done")}</Text></TouchableOpacity></View></View></View></Modal>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#F7F8FA" }, content: { padding: 20 }, centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F7F8FA" }, heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 }, kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 }, subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 }, summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 }, summaryBox: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" }, summaryValue: { color: "#0B1F3A", fontSize: 16, fontWeight: "900" }, summaryLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 4 }, card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10 }, sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 }, detailLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 8, marginBottom: 4 }, detailValue: { color: "#0B1F3A", fontSize: 16, fontWeight: "800", lineHeight: 23 }, helperText: { color: "#666666", lineHeight: 20, marginTop: -6, marginBottom: 12 }, reminderMeta: { color: "#666666", fontSize: 12, fontWeight: "800", marginTop: 6 }, emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 8 }, emptyText: { color: "#666666", textAlign: "center", lineHeight: 21, marginBottom: 14 }, primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17, minWidth: 120 }, primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, secondaryButton: { backgroundColor: "#F8F1D8", borderRadius: 18, padding: 12, borderWidth: 1, borderColor: "#E7D79A" }, secondaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" }, segmentCard: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 14, marginBottom: 10 }, emptySegment: { alignItems: "center", backgroundColor: "#F7F8FA", borderRadius: 18, padding: 16 }, reminderRow: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 14, marginBottom: 10 }, flightLegCard: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 14, marginBottom: 10 }, actionRow: { flexDirection: "row", gap: 8, marginTop: 12 }, smallButton: { backgroundColor: "#F8F1D8", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 }, smallButtonText: { color: "#0B1F3A", fontWeight: "900" }, deleteButton: { backgroundColor: "#FEE2E2", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 }, deleteButtonText: { color: "#991B1B", fontWeight: "900" }, tripDeleteButton: { backgroundColor: "#FEE2E2", borderRadius: 20, padding: 17, marginBottom: 14 }, disabledButton: { opacity: 0.6 }, dateButton: { flex: 1, backgroundColor: "#F7F8FA", borderRadius: 16, padding: 12 }, modalScrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(11,31,58,0.45)" }, pickerModal: { backgroundColor: "#FFF", padding: 20, borderTopLeftRadius: 26, borderTopRightRadius: 26 }, webPickerInput: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, fontSize: 16 }, weatherDayCard: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 12, marginTop: 10 }, disclaimer: { color: "#667085", marginTop: 10, lineHeight: 18 } });
