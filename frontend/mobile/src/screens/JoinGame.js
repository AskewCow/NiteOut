import {
  collection,
  doc,
  updateDoc,
  where,
  getDocs,
  query,
  arrayUnion,
} from "firebase/firestore";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { SvgXml } from "react-native-svg";

import { useGamer } from "../contexts/GamerContext";
import { db } from "../firebaseConfig";
import { logoXml } from "../utils/logo";

const JoinGame = () => {
  const { gamerId } = useGamer();
  const [gameCodeInput, setGameCodeInput] = useState("");
  const [, setGamerDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setGameDetails] = useState({
    hosted: [],
    joined: [],
    fullGameInfo: null,
  });
  const [selectedGameId, setSelectedGameId] = useState(null);

  const fetchGameByCode = async () => {
    try {
      if (!gameCodeInput) {
        Alert.alert("Error", "Please enter a valid Game Code");
        return;
      }

      setIsLoading(true);
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("game_code", "==", gameCodeInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Game not found");
        setIsLoading(false);
        return;
      }

      const gameDoc = querySnapshot.docs[0];
      const gameData = gameDoc.data();
      console.log("Game data:", gameData);

      setGameDetails({
        fullGameInfo: {
          id: gameDoc.id,
          name: gameData.game_name,
          location: gameData.location,
          hostName: gameData.host_name,
          availableSlots: gameData.available_slots,
        },
      });
      setSelectedGameId(gameDoc.id);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching game:", error);
      Alert.alert("Error", "Failed to fetch game");
      setIsLoading(false);
    }
  };

  const confirmJoinGame = async () => {
    try {
      if (!selectedGameId) {
        Alert.alert("Error", "No game selected to join.");
        return;
      }

      console.log(
        "Attempting to join game:",
        selectedGameId,
        "with gamerId:",
        gamerId,
      );

      setIsLoading(true);
      const gameRef = doc(db, "games", selectedGameId);
      await updateDoc(gameRef, {
        participants: arrayUnion(gamerId),
      });

      const gamerRef = doc(db, "gamers", gamerId);
      await updateDoc(gamerRef, {
        joined_games: arrayUnion(selectedGameId),
      });

      Alert.alert(
        "Game Joined!",
        "You've successfully joined the game. Have fun!",
        [{ text: "OK" }],
      );
      setGameCodeInput("");
      setGamerDetails(null);
      setGameDetails({ hosted: [], joined: [], fullGameInfo: null });
      setIsLoading(false);
    } catch (error) {
      console.error("Error joining game:", error);
      Alert.alert("Error", "Failed to join game");
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setGamerDetails(null);
    setGameCodeInput("");
    setGameDetails({ hosted: [], joined: [], fullGameInfo: null });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Join Private Game</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Game Code</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                value={gameCodeInput}
                onChangeText={setGameCodeInput}
                placeholder="Example: D01W2"
                placeholderTextColor="#999"
              />
              {gameCodeInput.length > 0 && (
                <TouchableOpacity
                  onPress={resetSearch}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              fetchGameByCode();
              confirmJoinGame();
            }}
            style={[styles.createEventButton, { marginTop: 10 }]}
            disabled={isLoading || !gameCodeInput}
          >
            <Text style={styles.createEventButtonText}>Join Game</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    paddingLeft: 10,
    flex: 1,
    color: "#000",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef0f2",
    borderRadius: 13,
    position: "relative",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    flex: 1,
    padding: 14,
    borderRadius: 13,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "bold",
  },
  playerDetailsContainer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#eef0f2",
    marginVertical: 15,
  },
  playerInfoItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  playerInfoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: 60,
  },
  playerInfoValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  gamesSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  gamesSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f2",
    paddingBottom: 5,
  },
  gamesList: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 8,
  },
  gameItem: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "flex-start",
  },
  gameNumber: {
    fontSize: 14,
    color: "#555",
    marginRight: 8,
    fontWeight: "500",
    width: 20,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "700",
    marginBottom: 2,
  },
  pubName: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
  },
  noGamesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  dateInput: {
    backgroundColor: "#eef0f2",
    padding: 14,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  numberPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberButton: {
    backgroundColor: "#FF007A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  numberInputContainer: {
    backgroundColor: "#eef0f2",
    flex: 1,
    height: 50,
    borderRadius: 13,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  numberInputText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  createEventButton: {
    backgroundColor: "#FF007A",
    borderRadius: 13,
    padding: 16,
    alignItems: "center",
  },
  createEventButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 16,
    paddingTop: 10,
    backgroundColor: "#00B4D8",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: "#FF007A",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default JoinGame;
