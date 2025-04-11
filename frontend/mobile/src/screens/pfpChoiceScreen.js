import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { doc, updateDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

import { db } from "../firebaseConfig"; // Ensure Firebase is configured
import { logoXml } from "../utils/logo";
import profileIcons from "../utils/profileIcons/profileIcons";

const { width } = Dimensions.get("window");

const containerWidth = width * 0.9;
const numColumns = 3;
const avatarSize = containerWidth / (numColumns + 1.5);
const avatarSpacing = avatarSize * 0.1;
const boxPadding = avatarSize * 0.2;

const PfpChoiceScreen = ({ route, navigation }) => {
  const { gamerId: routeGamerId } = route.params || {}; // Extract from navigation params
  const [gamerId, setGamerId] = useState(routeGamerId); // Store gamerId in state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const avatarsArray = Object.entries(profileIcons);

  useEffect(() => {
    // Retrieve gamerId from AsyncStorage if not provided in route params
    if (!gamerId) {
      const fetchGamerId = async () => {
        const storedGamerId = await AsyncStorage.getItem("gamerId");
        setGamerId(storedGamerId);
      };
      fetchGamerId();
    }
  }, [gamerId]);

  // Function to save selected avatar to Firebase
  const saveProfileToFirebase = async () => {
    if (!selectedAvatar) {
      Alert.alert("Error", "Please select an avatar!");
      return;
    }

    if (!gamerId) {
      Alert.alert("Error", "Gamer ID is missing!");
      return;
    }

    try {
      const userRef = doc(db, "gamers", gamerId);
      await updateDoc(userRef, {
        profile: selectedAvatar,
      });

      Alert.alert("Success", "Profile updated!");
      navigation.navigate("Drawer", { screen: "Home" });
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile. Try again.");
    }
  };

  const handleProfilePress = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <SvgXml xml={logoXml} width={40} height={40} />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Choose your Avatar</Text>

          <View
            style={[
              styles.avatarBox,
              { minHeight: avatarSize * 3 + boxPadding * 2 },
            ]}
          >
            <View style={[styles.avatarsContainer, { gap: avatarSpacing }]}>
              {avatarsArray.map(([key, xml]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.avatarWrapper,
                    selectedAvatar === key && styles.selectedAvatar,
                    { margin: avatarSpacing / 2 },
                  ]}
                  onPress={() => setSelectedAvatar(key)}
                >
                  <SvgXml xml={xml} width="80%" height="80%" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.startButton,
              selectedAvatar
                ? styles.startButtonActive
                : styles.startButtonInactive,
            ]}
            disabled={!selectedAvatar}
            onPress={saveProfileToFirebase}
          >
            <Text style={styles.startButtonText}>Set Avatar</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By signing in with an account, you agree to NiteOut's{" "}
            <Text style={styles.linkText}>Terms of Service</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: "#212529",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  avatarBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: boxPadding,
    width: containerWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  avatarWrapper: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderColor: "#E0E0E0",
  },
  selectedAvatar: {
    borderWidth: 3,
    borderColor: "#007BFF",
  },
  startButton: {
    width: "90%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  startButtonInactive: {
    backgroundColor: "#FFDCEC",
  },
  startButtonActive: {
    backgroundColor: "#FF007A",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginHorizontal: 10,
    marginTop: 10,
  },
  linkText: {
    color: "#FF007A",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "left",
    backgroundColor: "#00B4D8",
    paddingHorizontal: 16,
    paddingTop: "12%",
    height: "12%",
    width: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
});

export default PfpChoiceScreen;
