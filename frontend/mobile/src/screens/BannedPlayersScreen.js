
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  where,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useGamer } from "../contexts/GamerContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

const BannedPlayersScreen = ({ navigation }) => {
  const [publicanId, setPublicanId] = useState(null);
  const { gamerId } = useGamer();
  const [gamerIdInput, setGamerIdInput] = useState("");
  const [gamerDetails, setGamerDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameDetails, setGameDetails] = useState({
    hosted: [],
    joined: [],
  });

  useEffect(() => {
    const fetchPublicanId = async () => {
      try {
        const retrievedPublicanId = await AsyncStorage.getItem("publicanId");
        if (retrievedPublicanId) {
          setPublicanId(retrievedPublicanId);
          console.log("Publican ID set:", retrievedPublicanId);
        } else {
          console.warn("No publican ID found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Error fetching publican ID from AsyncStorage:", error);
      }
    };
    fetchPublicanId();
  }, []);

  const fetchGameDetails = async (gameIds) => {
    console.log("Fetching game details for IDs:", gameIds);
    const gameDetails = [];
    for (const gameId of gameIds) {
      try {
        const gameDoc = await getDoc(doc(db, "games", gameId));
        if (gameDoc.exists()) {
          const data = gameDoc.data();
          console.log(`Fetched game ${gameId}:`, data);
          gameDetails.push({
            id: gameId,
            name: data.game_name || "Unnamed Game",
            pubName: data.location || "Unknown Location",
          });
        } else {
          console.log(`Game with ID ${gameId} does not exist.`);
        }
      } catch (error) {
        console.error(`Error fetching game ${gameId}:`, error);
      }
    }
    return gameDetails;
  };

  const fetchGamerDetails = async () => {
    try {
      if (!gamerIdInput) {
        Alert.alert("Error", "Please enter a valid Gamer ID");
        return;
      }

      setIsLoading(true);
      const gamersRef = collection(db, "gamers");
      const q = query(gamersRef, where("gamerId", "==", gamerIdInput));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Player not found");
        setIsLoading(false);
        return;
      }

      const gamerDoc = querySnapshot.docs[0];
      const gamerData = gamerDoc.data();
      console.log("Gamer data:", gamerData);
      console.log("Hosted games:", gamerData.hosted_games);
      console.log("Joined games:", gamerData.joined_games);

      setGamerDetails({
        uid: gamerDoc.id,
        ...gamerData,
      });

      // Fetch game details from games collection
      const hostedGames = await fetchGameDetails(gamerData.hosted_games || []);
      const joinedGames = await fetchGameDetails(gamerData.joined_games || []);

      setGameDetails({
        hosted: hostedGames,
        joined: joinedGames,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching gamer:", error);
      Alert.alert("Error", "Failed to fetch gamer");
      setIsLoading(false);
    }
  };

  const banPlayer = async () => {
    try {
      setIsLoading(true);
      if (!publicanId) {
        Alert.alert("Error", "Publican ID not found");
        setIsLoading(false);
        return;
      }

      const publicanRef = doc(db, "publicans", publicanId);
      const publicanSnap = await getDoc(publicanRef);

      if (!publicanSnap.exists()) {
        Alert.alert("Error", "Publican profile not found");
        setIsLoading(false);
        return;
      }

      const publicanData = publicanSnap.data();
      const bannedPlayers = publicanData.bannedPlayers || [];

      if (bannedPlayers.includes(gamerDetails.uid)) {
        Alert.alert("Error", "Player is already banned");
        setIsLoading(false);
        return;
      }

      bannedPlayers.push(gamerDetails.uid);
      await updateDoc(publicanRef, {
        bannedPlayers,
      });

      Alert.alert("Success", "Player has been banned successfully");
      setGamerIdInput("");
      setGamerDetails(null);
      setGameDetails({ hosted: [], joined: [] });
      setIsLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error banning player:", error);
      Alert.alert("Error", "Failed to ban player");
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setGamerDetails(null);
    setGamerIdInput("");
    setGameDetails({ hosted: [], joined: [] });
  };

  const renderGameItem = (item, index) => (
    <View style={styles.gameItem} key={item.id}>
      <Text style={styles.gameNumber}>{index + 1}.</Text>
      <View style={styles.gameDetails}>
        <Text style={styles.gameName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.pubName} numberOfLines={1} ellipsizeMode="tail">
          {item.pubName}
        </Text>
      </View>
    </View>
  );

  const handleProfilePress = (gamerId) => {
      console.log("GamerId: ", gamerId);
      if (gamerId) {
          navigation.goBack();
      } else {
          alert("Please log in again.");
          navigation.navigate("Login");
          return;
      }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={() => handleProfilePress(publicanId)}>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Ban Player</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Gamer ID</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                value={gamerIdInput}
                onChangeText={setGamerIdInput}
                placeholder="Example: D01W2"
                placeholderTextColor="#999"
              />
              {gamerIdInput.length > 0 && (
                <TouchableOpacity
                  onPress={resetSearch}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!gamerDetails ? (
            <TouchableOpacity
              onPress={fetchGamerDetails}
              style={[styles.createEventButton, { marginTop: 10 }]}
              disabled={isLoading || !gamerIdInput}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createEventButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.playerDetailsContainer}>
              <View style={styles.divider} />
              <View style={styles.playerInfoItem}>
                <Text style={styles.playerInfoLabel}>Name</Text>
                <Text style={styles.playerInfoValue}>
                  {gamerDetails.fullName}
                </Text>
              </View>
              <View style={styles.playerInfoItem}>
                <Text style={styles.playerInfoLabel}>Email</Text>
                <Text style={styles.playerInfoValue}>{gamerDetails.email}</Text>
              </View>
              <View style={styles.playerInfoItem}>
                <Text style={styles.playerInfoLabel}>ID</Text>
                <Text style={styles.playerInfoValue}>
                  {gamerDetails.gamerId}
                </Text>
              </View>

              {/* Hosted Games Section */}
              <View style={styles.gamesSection}>
                <Text style={styles.gamesSectionTitle}>Hosted Games</Text>
                {gameDetails.hosted.length > 0 ? (
                  <View style={styles.gamesList}>
                    {gameDetails.hosted.map((game, index) =>
                      renderGameItem(game, index)
                    )}
                  </View>
                ) : (
                  <Text style={styles.noGamesText}>No hosted games</Text>
                )}
              </View>

              {/* Joined Games Section */}
              <View style={styles.gamesSection}>
                <Text style={styles.gamesSectionTitle}>Joined Games</Text>
                {gameDetails.joined.length > 0 ? (
                  <View style={styles.gamesList}>
                    {gameDetails.joined.map((game, index) =>
                      renderGameItem(game, index)
                    )}
                  </View>
                ) : (
                  <Text style={styles.noGamesText}>No joined games</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={banPlayer}
                style={[styles.createEventButton, { marginTop: 16 }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createEventButtonText}>Ban Player</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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

export default BannedPlayersScreen;
