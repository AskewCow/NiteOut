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
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  where,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useGamer } from "../contexts/GamerContext";

const BannedPlayersScreen = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [gamerIdInput, setGamerIdInput] = useState("");

  const banPlayer = async () => {
    try {
      if (!gamerIdInput) {
        Alert.alert("Error", "Please enter a valid Gamer ID");
        console.log("Please enter a valid Gamer ID");
        return;
      } else {
        const gamersRef = collection(db, "gamers");
        const q = query(gamersRef, where("gamerId", "==", gamerIdInput));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert("Error", "Player not found");
          console.log("Player not found");
          return;
        }

        const gamerDoc = querySnapshot.docs[0];
        const gamerUid = gamerDoc.id;
        const publicanRef = doc(db, "publicans", gamerId);
        const publicanSnap = await getDoc(publicanRef);

        const publicanData = publicanSnap.data();
        const bannedPlayers = publicanData.bannedPlayers || [];

        // Check if the player is already banned
        if (bannedPlayers.includes(gamerUid)) {
          Alert.alert("Error", "Player is already banned");
          return;
        }

        bannedPlayers.push(gamerUid);
        await updateDoc(publicanRef, {
          bannedPlayers,
        });

        Alert.alert("Success", "Player has been banned successfully");
        setGamerIdInput("");
      }
    } catch (error) {
      console.error("Error banning player:", error);
      Alert.alert("Error", "Failed to ban player");
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
        <Text style={styles.headerText}>Ban Player</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter Gamer ID</Text>
            <TextInput
              style={styles.input}
              value={gamerIdInput}
              onChangeText={setGamerIdInput}
              placeholder="Enter Gamer ID"
              placeholderTextColor="#333"
            />
          </View>
        </View>
        <TouchableOpacity onPress={banPlayer} style={styles.createEventButton}>
          <Text style={styles.createEventButtonText}>Ban Player</Text>
        </TouchableOpacity>
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
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#eef0f2",
    padding: 14,
    borderRadius: 13,
    fontSize: 16,
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
