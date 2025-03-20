import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase Import
import { db } from "../firebaseConfig";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

const CreateEventScreen = ({ navigation }) => {
  const [gameName, setGameName] = useState("");
  const [gameDesc, setGameDesc] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("25");
  const [gameType, setGameType] = useState("Seat Based");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setHours(new Date().getHours() + 4))
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pubInfo, setPubInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // If end date is before start date, adjust it
      if (selectedDate > endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setHours(selectedDate.getHours() + 4);
        setEndDate(newEndDate);
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const calculateTimeSlots = () => {
    const slots = {};
    const start = moment(startDate);
    const end = moment(endDate);

    let current = moment(start);
    while (current.isBefore(end)) {
      const slotKey = `${current.format("HH:mm")}-${current
        .add(1, "hour")
        .format("HH:mm")}`;
      slots[slotKey] = parseInt(maxPlayers, 10);
      // Don't increment here as we already added 1 hour above
    }

    return slots;
  };

  const handleCreateEvent = async () => {
    if (!gameName.trim()) {
      Alert.alert("Error", "Please enter a game name");
      return;
    }

    if (!pubInfo) {
      Alert.alert("Error", "Publican information not available");
      return;
    }

    setLoading(true);
    try {
      const timeSlots = calculateTimeSlots();
      const expiresDate = new Date(endDate);
      expiresDate.setDate(expiresDate.getDate() + 30); // Expires 30 days after end date

      const publicanId = await AsyncStorage.getItem("publicanId");

      const eventData = {
        game_name: gameName,
        game_desc: gameDesc,
        game_type: gameType,
        num_seats: parseInt(maxPlayers, 10),
        start_time: moment(startDate).format("YYYY-MM-DDTHH:mm:ss"),
        end_time: moment(endDate).format("YYYY-MM-DDTHH:mm:ss"),
        expires: moment(expiresDate).format("YYYY-MM-DDTHH:mm:ss"),
        available_slots: timeSlots,
        pub_details: {
          pub_id: publicanId,
          pub_name: pubInfo.pub_name,
          pub_address: pubInfo.address,
          xcoord: pubInfo.xcoord,
          ycoord: pubInfo.ycoord,
        },
        participants: [],
        host: publicanId,
        created_at: moment().format("YYYY-MM-DDTHH:mm:ss"),
      };

      await addDoc(collection(db, "games"), eventData);
      Alert.alert("Success", "Event created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#00B4D8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Event</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Event Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event name"
              value={gameName}
              onChangeText={setGameName}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter event description"
              value={gameDesc}
              onChangeText={setGameDesc}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Event Type</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  gameType === "Seat Based" && styles.selectedType,
                ]}
                onPress={() => setGameType("Seat Based")}
              >
                <Text
                  style={
                    gameType === "Seat Based"
                      ? styles.selectedTypeText
                      : styles.typeText
                  }
                >
                  Seat Based
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  gameType === "Open" && styles.selectedType,
                ]}
                onPress={() => setGameType("Open")}
              >
                <Text
                  style={
                    gameType === "Open"
                      ? styles.selectedTypeText
                      : styles.typeText
                  }
                >
                  Open
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Maximum Players</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter maximum number of players"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>
                {moment(startDate).format("MMM DD, YYYY - hh:mm A")}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#00B4D8" />
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="datetime"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>End Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateText}>
                {moment(endDate).format("MMM DD, YYYY - hh:mm A")}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#00B4D8" />
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="datetime"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? "Creating..." : "Create Event"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginRight: 10,
    borderRadius: 8,
  },
  selectedType: {
    backgroundColor: "#00B4D8",
    borderColor: "#00B4D8",
  },
  typeText: {
    color: "#333",
  },
  selectedTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  createButton: {
    backgroundColor: "#FF006E",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateEventScreen;
