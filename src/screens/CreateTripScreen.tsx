import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useTrips } from "../contexts/TripsContext";
import { useUser } from "../contexts/UserContext";
import { requireAuth } from "../utils/requireAuth";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CreateTripScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn } = useUser();
  const { addTrip } = useTrips();

  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [pickerType, setPickerType] = useState<"start" | "end" | "departureTime" | null>(null);

  function saveTrip() {
    if (!requireAuth({ isLoggedIn, navigation })) {
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
      return;
    }

    if (endDate < startDate) {
      alert("End date cannot be before start date.");
      return;
    }

    const newTripId = addTrip({
      tripName: tripName.trim() || "Shopping Trip",
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      tripCities: [],
      flightNumber: flightNumber.trim() || undefined,
      departureAirport: departureAirport.trim() || undefined,
      departureTime: departureTime
        ? departureTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : undefined,
    });

    navigation.navigate("TripDetail", { tripId: newTripId });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>NEW SHOPPING TRIP</Text>
        <Text style={styles.title}>Build your outlet plan.</Text>
        <Text style={styles.subtitle}>
          Add travel dates and flight details first. Cities can be added after creating the trip.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trip details</Text>

        <Text style={styles.label}>Trip name</Text>
        <TextInput
          style={styles.input}
          placeholder="Paris & Milan shopping trip"
          placeholderTextColor="#8A8A8A"
          value={tripName}
          onChangeText={setTripName}
        />

        <Text style={styles.label}>Start date</Text>
        <TouchableOpacity
          style={styles.inputBox}
          activeOpacity={0.86}
          onPress={() => {
            if (!startDate) setStartDate(new Date());
            setPickerType("start");
          }}
        >
          <Text style={startDate ? styles.inputText : styles.placeholderText}>
            {startDate ? formatDate(startDate) : "Select start date"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>End date</Text>
        <TouchableOpacity
          style={styles.inputBox}
          activeOpacity={0.86}
          onPress={() => {
            if (!endDate) setEndDate(startDate || new Date());
            setPickerType("end");
          }}
        >
          <Text style={endDate ? styles.inputText : styles.placeholderText}>
            {endDate ? formatDate(endDate) : "Select end date"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Flight details</Text>
        <Text style={styles.helperText}>Optional, but useful for reminders and dashboard updates.</Text>

        <TextInput
          style={styles.input}
          placeholder="Flight number, e.g. TK1821"
          placeholderTextColor="#8A8A8A"
          value={flightNumber}
          onChangeText={setFlightNumber}
          autoCapitalize="characters"
        />

        <TextInput
          style={styles.input}
          placeholder="Departure airport, e.g. ESB"
          placeholderTextColor="#8A8A8A"
          value={departureAirport}
          onChangeText={setDepartureAirport}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.inputBox}
          activeOpacity={0.86}
          onPress={() => setPickerType("departureTime")}
        >
          <Text style={departureTime ? styles.inputText : styles.placeholderText}>
            {departureTime
              ? departureTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Select departure time"}
          </Text>
        </TouchableOpacity>
      </View>

      {pickerType && (
        <View style={styles.pickerCard}>
          <DateTimePicker
            value={
              pickerType === "start"
                ? startDate || new Date()
                : pickerType === "end"
                ? endDate || startDate || new Date()
                : departureTime || new Date()
            }
            mode={pickerType === "departureTime" ? "time" : "date"}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              if (!selectedDate) {
                setPickerType(null);
                return;
              }
              if (pickerType === "start") {
                setStartDate(selectedDate);
                if (endDate && selectedDate > endDate) setEndDate(null);
              }
              if (pickerType === "end") setEndDate(selectedDate);
              if (pickerType === "departureTime") setDepartureTime(selectedDate);
              if (Platform.OS !== "ios") setPickerType(null);
            }}
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setPickerType(null)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} activeOpacity={0.86} onPress={saveTrip}>
        <Text style={styles.primaryButtonText}>Create trip →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120 },
  heroCard: { backgroundColor: "#0B1F3A", borderRadius: 30, padding: 24, marginBottom: 16 },
  kicker: { color: "#C9A227", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginBottom: 10 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  subtitle: { color: "#D8DEE9", fontSize: 15, lineHeight: 22, marginTop: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 26, padding: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  sectionTitle: { color: "#0B1F3A", fontSize: 21, fontWeight: "900", marginBottom: 14 },
  label: { color: "#0B1F3A", fontWeight: "900", marginBottom: 8, marginTop: 4 },
  helperText: { color: "#666666", lineHeight: 21, marginBottom: 14 },
  input: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", color: "#0B1F3A", fontWeight: "700", marginBottom: 12 },
  inputBox: { backgroundColor: "#F7F8FA", borderRadius: 16, padding: 15, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12 },
  inputText: { color: "#0B1F3A", fontWeight: "800" },
  placeholderText: { color: "#8A8A8A", fontWeight: "700" },
  pickerCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 14 },
  doneButton: { backgroundColor: "#0B1F3A", borderRadius: 16, padding: 14, marginTop: 8 },
  doneButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  primaryButton: { backgroundColor: "#C9A227", borderRadius: 20, padding: 17 },
  primaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
});
