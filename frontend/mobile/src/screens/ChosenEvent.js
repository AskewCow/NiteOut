import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
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
  ScrollView,
  Modal,
  FlatList,
} from "react-native";

import { NGROK_URL } from "../../environment";
import TimeRangeSlider from "../components/TimeRangeSlider";
import { useGamer } from "../contexts/GamerContext";

const ChosenEvent = () => {
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(1);
  const [numPlayers, setNumPlayers] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params;
  const { gamerId } = useGamer();
  const [timeSlots, setTimeSlots] = useState([]);
  const gameTypes = [
    "Darts",
    "Pool",
    "Trivia",
    "Card Games",
    "Board Games",
    "Video Games",
    "Other",
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState("Select game type");

  useEffect(() => {
    if (event && event.available_slots) {
      const slotsArray = Object.entries(event.available_slots).map(
        ([timeString, capacity]) => ({
          time: timeString,
          capacity: typeof capacity === "number" ? capacity : capacity.capacity,
        }),
      );

      slotsArray.sort((a, b) => {
        const aStartTime = a.time.split("-")[0].trim();
        const bStartTime = b.time.split("-")[0].trim();
        return aStartTime.localeCompare(bStartTime);
      });
      setTimeSlots(slotsArray);
    }
  }, [event]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedGameType(item);
        setModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  console.log("TimeSlots array mapping:");
  timeSlots.forEach((slot, index) => {
    console.log(`Index ${index}: ${slot.time}`);
  });

  const generateGameCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = async () => {
    console.log("Submitting game...");
    console.log("Game Name: ", gameName);
    console.log("Game Description: ", gameDescription);
    console.log("pub_id: ", event.pub_details.pub_id);
    console.log("Start Time: ", startTime);
    console.log("End Time: ", endTime);
    console.log("gamerId: ", gamerId);
    console.log("Game Type: ", selectedGameType);
    if (
      !gameName ||
      !gameDescription ||
      selectedGameType === "Select game type" ||
      startTime > endTime ||
      !gamerId ||
      !event.pub_details.pub_id
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const eventStartDate = new Date(event.start_time);
    console.log("eventStartDate: ", eventStartDate);
    const dateString = eventStartDate.toISOString().split("T")[0];
    console.log("dateString: ", dateString);

    const start_time = timeSlots[startTime].time.split("-")[0].trim();
    const end_time = timeSlots[endTime].time.split("-")[1].trim();
    const formattedStartTime = `${dateString}T${start_time}:00`;
    const formattedEndTime = `${dateString}T${end_time}:00`;

    console.log("formattedStartTime: ", formattedStartTime);
    console.log("formattedEndTime: ", formattedEndTime);

    const updatedSlots = { ...event.available_slots };
    console.log("updated slots: ", updatedSlots);

    const selectedSlotKeys = getSelectedSlotKeys(startTime, endTime);
    console.log("selected slots: ", selectedSlotKeys);

    const insufficientSlots = selectedSlotKeys.filter(
      (key) => updatedSlots[key].capacity < numPlayers,
    );

    if (insufficientSlots.length > 0) {
      Alert.alert(
        "Error",
        "Some selected time slots don't have enough capacity.",
      );
      return;
    }

    selectedSlotKeys.forEach((key) => {
      updatedSlots[key] = updatedSlots[key] - numPlayers;
    });
    console.log("updated slots after subtraction: ", updatedSlots);

    const game_code = generateGameCode();
    const gameData = {
      game_name: gameName,
      game_desc: gameDescription,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      pub_id: event.pub_details.pub_id,
      host: gamerId,
      location: event.pub_details.pub_name,
      max_players: numPlayers,
      participants: [],
      xcoord: event.pub_details.xcoord,
      ycoord: event.pub_details.ycoord,
      event_id: event.id,
      game_code,
      updated_slots: updatedSlots,
      game_type: selectedGameType,
    };

    try {
      const response = await fetch(`${NGROK_URL}/api/create_game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Game created on backend:", responseData);
      Alert.alert("Success", "Game created successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error creating game:", error);
      Alert.alert("Error", `Failed to create game: ${error.message}`);
    }
  };

  const getSelectedSlotKeys = (start, end) => {
    const startTimeStr = timeSlots[start].time;
    const endTimeStr = timeSlots[end].time;

    const allSlotEntries = Object.entries(event.available_slots)
      .map(([key, capacity]) => ({
        key,
        startTime: key.split("-")[0].trim(),
        endTime: key.split("-")[1].trim(),
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const startPos = allSlotEntries.findIndex(
      (item) => item.key === startTimeStr,
    );
    const endPos = allSlotEntries.findIndex((item) => item.key === endTimeStr);
    const minPos = Math.min(startPos, endPos);
    const maxPos = Math.max(startPos, endPos);

    return allSlotEntries.slice(minPos, maxPos + 1).map((item) => item.key);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Game Details</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Game Name</Text>
            <TextInput
              style={styles.input}
              value={gameName}
              onChangeText={setGameName}
              placeholder="Enter Game Name"
              placeholderTextColor="#888"
            />

            <Text style={styles.label}>Game Description</Text>
            <TextInput
              style={[styles.input, styles.gameDescriptionInput]}
              value={gameDescription}
              onChangeText={setGameDescription}
              placeholder="Enter Game Description"
              placeholderTextColor="#888"
              multiline
              maxLength={400}
            />
            <Text style={styles.characterCount}>
              {gameDescription.length}/400
            </Text>

            {/* Game Type Modal Trigger */}
            <Text style={styles.label}>Game Type</Text>
            <TouchableOpacity
              style={styles.gameTypeButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.gameTypeText}>{selectedGameType}</Text>
            </TouchableOpacity>
            {/* Modal */}
            <Modal
              animationType="slide"
              transparent
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList // Flatlist added here.
                    data={gameTypes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item}
                  />
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* 🔄 NEW TIME RANGE SLIDER */}
            <Text style={styles.label}>Select Game Time</Text>
            <TimeRangeSlider
              timeSlots={timeSlots}
              startTime={startTime}
              endTime={endTime}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              setNumPlayers={setNumPlayers}
            />

            <Text style={styles.label}>Number of Players</Text>
            <View style={styles.numberInputContainer}>
              <TouchableOpacity
                onPress={() => setNumPlayers(Math.max(1, numPlayers - 1))}
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
                onPress={() => {
                  const selectedIndices = [];
                  const startPos = timeSlots.findIndex(
                    (slot) => slot === timeSlots[startTime],
                  );
                  const endPos = timeSlots.findIndex(
                    (slot) => slot === timeSlots[endTime],
                  );
                  const minPos = Math.min(startPos, endPos);
                  const maxPos = Math.max(startPos, endPos);

                  for (let i = minPos; i <= maxPos; i++) {
                    selectedIndices.push(i);
                  }

                  const maxCapacity = Math.min(
                    ...selectedIndices.map(
                      (index) => timeSlots[index].capacity,
                    ),
                  );
                  setNumPlayers(Math.min(numPlayers + 1, maxCapacity));
                }}
                style={styles.numberButton}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <View style={styles.submitButtonContainer}>
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
    color: "#000",
  },
  cancelButton: {
    backgroundColor: "#FF006E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#90E0EF",
    width: "95%",
    alignSelf: "center",
    borderRadius: 20,
    marginBottom: 10,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    alignSelf: "flex-end",
    color: "#555",
    marginBottom: -17,
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
    backgroundColor: "#FFDCEC",
    padding: 10,
    borderRadius: 13,
  },
  numberButtonText: {
    fontSize: 16,
  },
  submitButtonContainer: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#FF006E",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    width: "95%",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameTypeButton: {
    borderRadius: 13,
    padding: 10,
    backgroundColor: "#eef0f2",
    marginBottom: 10,
  },
  gameTypeText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#FF006E",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ChosenEvent;
