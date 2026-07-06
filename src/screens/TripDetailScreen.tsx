import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { useTrips } from "../contexts/TripsContext";
import { useTranslation } from "../hooks/useTranslation";
import { getTripStatusLabel } from "../utils/getTripStatusLabel";

type RouteParams = {
  TripDetail: {
    tripId: string;
  };
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCountryName(countryId: string) {
  return countries.find((country) => country.countryId === countryId)?.countryName || countryId;
}

export function TripDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, "TripDetail">>();
  const navigation = useNavigation<any>();
  const { trips, addCityToTrip } = useTrips();
  const { t } = useTranslation();

  const trip = trips.find((item) => item.id === route.params?.tripId);

  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.cityId || "");
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [pickerType, setPickerType] = useState<"arrival" | "departure" | null>(null);

  if (!trip) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyTitle}>{t("tripDetail.notFound")}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>{t("tripDetail.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeTrip = trip;
  const selectedCity = cities.find((city) => city.cityId === selectedCityId) || cities[0];

  function handleAddCity() {
    if (!selectedCity || !arrivalDate || !departureDate) {
      alert(t("tripDetail.alertCityDates"));
      return;
    }

    if (departureDate < arrivalDate) {
      alert(t("tripDetail.alertDeparture"));
      return;
    }

    const tripStart = new Date(activeTrip.startDate);
    const tripEnd = new Date(activeTrip.endDate);
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(23, 59, 59, 999);

    if (arrivalDate < tripStart || departureDate > tripEnd) {
      alert(t("tripDetail.alertInsideTrip"));
      return;
    }

    addCityToTrip(activeTrip.id, {
      cityId: selectedCity.cityId,
      cityName: selectedCity.cityName,
      arrivalDate: formatDate(arrivalDate),
      departureDate: formatDate(departureDate),
    });

    setArrivalDate(null);
    setDepartureDate(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("tripDetail.heroKicker")}</Text>
        <Text style={styles.title}>{activeTrip.tripName}</Text>
        <Text style={styles.subtitle}>{activeTrip.startDate} → {activeTrip.endDate}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{getTripStatusLabel(activeTrip.status, t)}</Text>
          <Text style={styles.summaryLabel}>{t("tripDetail.statusSummary")}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{activeTrip.tripCities.length}</Text>
          <Text style={styles.summaryLabel}>{t("trips.cities")}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("tripDetail.flight")}</Text>
        <Text style={styles.detailLabel}>{t("tripDetail.flightNumber")}</Text>
        <Text style={styles.detailValue}>{activeTrip.flightNumber || t("tripDetail.notAdded")}</Text>
        <Text style={styles.detailLabel}>{t("tripDetail.departureAirport")}</Text>
        <Text style={styles.detailValue}>{activeTrip.departureAirport || t("tripDetail.notAdded")}</Text>
        <Text style={styles.detailLabel}>{t("tripDetail.departureTime")}</Text>
        <Text style={styles.detailValue}>{activeTrip.departureTime || t("tripDetail.notAdded")}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("tripDetail.tripCities")}</Text>

        {activeTrip.tripCities.length === 0 ? (
          <View style={styles.emptyCityBox}>
            <Text style={styles.emptyCityTitle}>{t("tripDetail.emptyCityTitle")}</Text>
            <Text style={styles.emptyCityText}>
              {t("tripDetail.emptyCityTextLong")}
            </Text>
          </View>
        ) : (
          activeTrip.tripCities.map((city) => (
            <View key={`${city.cityId}-${city.arrivalDate}`} style={styles.cityCard}>
              <Text style={styles.cityTitle}>{city.cityName}</Text>
              <Text style={styles.cityText}>{city.arrivalDate} → {city.departureDate}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("tripDetail.addCityTitle")}</Text>

        <View style={styles.cityGrid}>
          {cities.map((city) => {
            const selected = city.cityId === selectedCityId;

            return (
              <TouchableOpacity
                key={city.cityId}
                style={[styles.cityOption, selected && styles.cityOptionSelected]}
                onPress={() => setSelectedCityId(city.cityId)}
                activeOpacity={0.86}
              >
                <Text style={[styles.cityOptionTitle, selected && styles.cityOptionTitleSelected]}>
                  {city.cityName}
                </Text>
                <Text style={[styles.cityOptionText, selected && styles.cityOptionTextSelected]}>
                  {getCountryName(city.countryId)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.detailLabel}>{t("tripDetail.arrivalDate")}</Text>
        <TouchableOpacity
          style={styles.inputBox}
          activeOpacity={0.86}
          onPress={() => {
            if (!arrivalDate) setArrivalDate(new Date(activeTrip.startDate));
            setPickerType("arrival");
          }}
        >
          <Text style={arrivalDate ? styles.inputText : styles.placeholderText}>
            {arrivalDate ? formatDate(arrivalDate) : t("tripDetail.selectArrivalDate")}
          </Text>
        </TouchableOpacity>

        <Text style={styles.detailLabel}>{t("tripDetail.departureDate")}</Text>
        <TouchableOpacity
          style={styles.inputBox}
          activeOpacity={0.86}
          onPress={() => {
            if (!departureDate) setDepartureDate(arrivalDate || new Date(activeTrip.endDate));
            setPickerType("departure");
          }}
        >
          <Text style={departureDate ? styles.inputText : styles.placeholderText}>
            {departureDate ? formatDate(departureDate) : t("tripDetail.selectDepartureDate")}
          </Text>
        </TouchableOpacity>

        {pickerType && (
          <View style={styles.pickerCard}>
            <DateTimePicker
              value={pickerType === "arrival" ? arrivalDate || new Date(activeTrip.startDate) : departureDate || arrivalDate || new Date(activeTrip.endDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                if (!selectedDate) {
                  setPickerType(null);
                  return;
                }

                if (pickerType === "arrival") {
                  setArrivalDate(selectedDate);
                  if (departureDate && selectedDate > departureDate) setDepartureDate(null);
                }

                if (pickerType === "departure") setDepartureDate(selectedDate);
                if (Platform.OS !== "ios") setPickerType(null);
              }}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity style={styles.doneButton} onPress={() => setPickerType(null)}>
                <Text style={styles.doneButtonText}>{t("tripDetail.done")}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.86} onPress={handleAddCity}>
          <Text style={styles.primaryButtonText}>{t("tripDetail.addCityCta")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  centerState: { flex: 1, backgroundColor: "#F7F8FA", padding: 24, justifyContent: "center" },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryBox: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  summaryValue: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  summaryLabel: { color: "#C9A227", fontSize: 12, fontWeight: "900", marginTop: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 },
  detailLabel: { color: "#C9A227", fontWeight: "900", marginTop: 8, marginBottom: 4 },
  detailValue: { color: "#0B1F3A", fontWeight: "800", lineHeight: 21 },
  emptyTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 12 },
  emptyCityBox: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  emptyCityTitle: { color: "#0B1F3A", fontWeight: "900" },
  emptyCityText: { color: "#666666", lineHeight: 21, marginTop: 7 },
  cityCard: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10 },
  cityTitle: { color: "#0B1F3A", fontSize: 18, fontWeight: "900" },
  cityText: { color: "#666666", marginTop: 5, fontWeight: "700" },
  cityGrid: { gap: 10, marginBottom: 14 },
  cityOption: { backgroundColor: "#F7F8FA", borderRadius: 18, padding: 15, borderWidth: 1, borderColor: "#E5E7EB" },
  cityOptionSelected: { backgroundColor: "#0B1F3A", borderColor: "#0B1F3A" },
  cityOptionTitle: { color: "#0B1F3A", fontWeight: "900" },
  cityOptionTitleSelected: { color: "#FFFFFF" },
  cityOptionText: { color: "#666666", marginTop: 4 },
  cityOptionTextSelected: { color: "#D8DEE9" },
  inputBox: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  inputText: { color: "#0B1F3A", fontWeight: "800" },
  placeholderText: { color: "#8A8A8A", fontWeight: "700" },
  pickerCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  doneButton: { backgroundColor: "#0B1F3A", borderRadius: 16, padding: 14, marginTop: 8 },
  doneButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17, marginTop: 4 },
  primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
