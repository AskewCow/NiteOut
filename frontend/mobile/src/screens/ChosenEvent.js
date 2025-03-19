import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGamer } from "../contexts/GamerContext";

const ChosenEvent = () => {
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gameType, setGameType] = useState("Seat Based");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [expires, setExpires] = useState(new Date());
  const [numPlayers, setNumPlayers] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params;
  const { gamerId } = useGamer();

  const handleIncrement = () => {
    if (numPlayers < event.num_seats) {
      setNumPlayers(numPlayers + 1);
    }
  };

  const handleDecrement = () => {
    if (numPlayers > 1) {
      setNumPlayers(numPlayers - 1);
    }
  };

  const handleSubmit = async () => {
    if (
      !gameName ||
      !gameDescription ||
      !gameType ||
      !startTime ||
      !endTime ||
      !expires ||
      !numPlayers ||
      !gamerId ||
      !event.pub_details.pub_id ||
      !event.expires
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const eventDate = event.start_time.split('T')[0]; // Extracts "YYYY-MM-DD"
    const combinedStartTime = `${eventDate}T${startTime}:00Z`;
    const combinedEndTime = `${eventDate}T${endTime}:00Z`;

    console.log("handling submit");

    const gameData = {
      game_name: gameName,
      game_desc: gameDescription,
      game_type: gameType,
      start_time: new Date(combinedStartTime).toISOString(),
      end_time: new Date(combinedEndTime).toISOString(),
      expires: event.expires,
      pub_id: event.pub_details.pub_id,
      gamer_id: gamerId,
      max_players: parseInt(numPlayers, 10),
    };

    try {
      console.log('Sending POST request to backend');
      const response = await axios.post(
        "http://localhost:8080/create_game",
        gameData
      );
      console.log('Response:', response);
      Alert.alert("Success", "Game created successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to create game: ${error.response.data.error}`
      );
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const generateTimeSlots = (start, end) => {
    const times = [];
    let currentTime = new Date(start);
    const endTime = new Date(end);

    while (currentTime <= endTime) {
      times.push(currentTime.toTimeString().split(" ")[0].substring(0, 5));
      currentTime.setHours(currentTime.getHours() + 1);
    }

    return times;
  };

  const timeSlots = generateTimeSlots(event.start_time, event.end_time);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Enter game details</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <Text style={styles.label}>Game Name</Text>
          <TextInput
            style={styles.input}
            value={gameName}
            onChangeText={setGameName}
            placeholder="Enter game name"
          />

          <Text style={styles.label}>Game Description</Text>
          <TextInput
            style={styles.gameDescriptionInput}
            value={gameDescription}
            onChangeText={setGameDescription}
            placeholder="Enter game description"
            multiline
            maxLength={400}
          />
          <Text style={styles.characterCount}>
            {gameDescription.length}/400
          </Text>

          <Text style={styles.label}>Number of Players</Text>
          <View style={styles.numberInputContainer}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={styles.numberButton}
            >
              <Text style={styles.numberButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.numberInput}
              value={String(numPlayers)}
              editable={false}
            />
            <TouchableOpacity
              onPress={handleIncrement}
              style={styles.numberButton}
            >
              <Text style={styles.numberButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timePickerContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.timePickerLabel}>Start Time</Text>
              <Picker
                selectedValue={startTime}
                onValueChange={(itemValue) => setStartTime(itemValue)}
                style={styles.picker}
              >
                {timeSlots.slice(0, -1).map((slot) => (
                  <Picker.Item key={slot} label={slot} value={slot} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <Text style={styles.timePickerLabel}>End Time</Text>
              <Picker
                selectedValue={endTime}
                onValueChange={(itemValue) => setEndTime(itemValue)}
                style={styles.picker}
              >
                {timeSlots.slice(1).map((slot) => (
                  <Picker.Item key={slot} label={slot} value={slot} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#00B4D8",
    margin: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    padding: 0,
    alignSelf: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#90E0EF",
    width: "95%",
    alignSelf: "center",
    borderRadius: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderRadius: 13,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#eef0f2",
    marginBottom: 10,
  },
  gameDescriptionInput: {
    borderRadius: 13,
    padding: 10,
    paddingBottom: 40,
    fontSize: 16,
    backgroundColor: "#eef0f2",
    marginBottom: 10,
  },
  characterCount: {
    alignSelf: "flex-start",
    color: "#555",
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#eef0f2",
    borderRadius: 13,
    marginBottom: 10,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  numberInput: {
    borderRadius: 13,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#eef0f2",
    textAlign: "center",
    marginHorizontal: 10,
    flex: 1,
  },
  numberButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 13,
  },
  numberButtonText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#FF006E",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChosenEvent;
