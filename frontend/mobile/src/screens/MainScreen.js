import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MapTags from "../../components/MapTags";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase Import
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const MainScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const navigation = useNavigation();

  const handleProfilePress = async () => {
    const gamerId = await AsyncStorage.getItem("gamerId");
    if (gamerId) {
      navigation.navigate("Profile", { gamerId });
    } else {
      alert("Please log in again.");
      navigation.navigate("Login");
    }
  };

  // Get current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setCurrentLocation(location.coords);
        } else {
          alert("Location permission denied!");
        }
      } catch (error) {
        console.error(error);
      }
    };
    getLocation();
  }, []);

  // Fetch User Info from Firestore
  const fetchUserInfo = async () => {
    setFetchingUser(true);
    try {
      const gamerId = await AsyncStorage.getItem("gamerId");
      console.log("Retrieved Gamer ID from AsyncStorage:", gamerId);

      if (!gamerId) {
        alert("Please log in again.");
        navigation.navigate("Login");
        return;
      }

      const userDoc = await getDoc(doc(db, "gamers", gamerId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User Data Retrieved:", userData);

        setUserInfo({
          fullName: userData.fullName, // Using fullName instead of name
          gamer_id: gamerId, // Using the stored gamer ID
        });
        setModalVisible(true);
      } else {
        console.log("No user document found with ID:", gamerId);
        alert("User data not found. Please log in again.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.code === "unavailable") {
        alert("Network error. Please check your connection.");
      } else {
        alert("Failed to load user information.");
      }
    } finally {
      setFetchingUser(false);
    }
  };

  if (!currentLocation) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.userIconContainer}>
            <AntDesign
              name="user"
              size={28}
              color="black"
              onPress={handleProfilePress}
            />
          </View>
          <TextInput
            style={styles.searchBar}
            placeholder="Search pubs and games"
            placeholderTextColor="#999"
          />
        </View>

        <MapTags
          tags={["Scrabble", "Darts", "Billiards", "Trivia", "Cards", "Catan"]}
          onSelectedTag={(tag) => console.log("Selected:", tag)}
        />

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.0421,
          }}
        >
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="You are here"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>

      {/* Simplified Modal to show user info */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {fetchingUser ? (
              <ActivityIndicator size="large" color="#00B4D8" />
            ) : (
              <>
                <Text style={styles.modalTitle}>Gamer Profile</Text>
                {userInfo ? (
                  <>
                    <Text style={styles.modalText}>
                      Name: {userInfo.fullName}
                    </Text>
                    <Text style={styles.modalText}>
                      Gamer ID: {userInfo.gamer_id}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.modalText}>No user data available.</Text>
                )}
                <Text
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  Close
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  userIconContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: "#eef0f2",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginLeft: 5,
    fontSize: 17,
  },
  map: {
    width: "95%",
    height: "40%",
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    fontSize: 16,
    color: "#00B4D8",
    fontWeight: "bold",
  },
});

export default MainScreen;
