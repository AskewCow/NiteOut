import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebaseConfig";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useGamer } from "../contexts/GamerContext";

const CreateEventScreen = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [gameType] = useState("Seat Based");
  const [numSeats, setNumSeats] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showExpirePicker, setShowExpirePicker] = useState(false);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [expireDateTime, setExpireDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!numSeats || !startDateTime || !endDateTime || !expireDateTime) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    let eventData = {
      game_type: gameType,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      expires: expireDateTime.toISOString(),
      pub_id: gamerId,
    };

    if (gameType === "Seat Based") {
      eventData.num_seats = parseInt(numSeats);
    }

    setLoading(true);

    try {
      const eventRef = await addDoc(collection(db, "events"), eventData);
      await updateDoc(doc(db, "publicans", gamerId), {
        events: eventRef.id,
      });

      Alert.alert("Success", "Event created successfully!");
      navigation.navigate("MyGames");
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Create Events</Text>
      </View>
      <View style={styles.scrollView}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Game Type</Text>
          <TextInput
            style={styles.input}
            value={gameType}
            editable={false} // Make the input read-only
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number of Seats</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={numSeats}
            onChangeText={setNumSeats}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartPicker(true)}
          >
            <Text>{startDateTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDateTime}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) setStartDateTime(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEndPicker(true)}
          >
            <Text>{endDateTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDateTime}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) setEndDateTime(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiration Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowExpirePicker(true)}
          >
            <Text>{expireDateTime.toLocaleString()}</Text>
          </TouchableOpacity>
          {showExpirePicker && (
            <DateTimePicker
              value={expireDateTime}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowExpirePicker(false);
                if (selectedDate) setExpireDateTime(selectedDate);
              }}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.createEventButton}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          <Text style={styles.createEventButtonText}>
            {loading ? "Creating..." : "Create Event"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    paddingLeft: 10,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
    width: "100%",
    alignSelf: "center",
    padding: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  createEventButton: {
    backgroundColor: "#FF007A",
    borderRadius: 5,
    padding: 15,
    alignItems: "center",
  },
  createEventButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
    paddingTop: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
    justifyContent: "flex-start",
  },
});

export default CreateEventScreen;
