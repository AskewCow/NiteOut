import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  FlatList
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { DrawerActions } from "@react-navigation/native";
import MapTags from "../../components/MapTags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";
import { useGamer } from "../contexts/GamerContext";

// Firebase Import
import { db } from "../firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

const MainScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [pubs, setPubs] = useState(null);
  const [fetchingPubs, setFetchingPubs] = useState(false);
  const [friends, setFriends] = useState(null);
  const { gamerId, setGamerId } = useGamer();

  // Upon rendering
  useEffect(() => {
    getLocation();
    fetchPubs();
    fetchUserInfo();
  }, []);


  const handleProfilePress = (gamerId) => {
    console.log("GamerId: ", gamerId);
    if(gamerId) {
      navigation.dispatch(DrawerActions.openDrawer());
    } else {
      alert("Please log in again.");
      navigation.navigate("Login");
      return;
    }
  };

  // Get current location
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


  // Fetch pub data from Firestore
  const fetchPubs = async () => {
    setFetchingPubs(true);
    try {
      const pubsCollect = await getDocs(collection(db, "publicans"));
      const pubList = pubsCollect.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          pub_name: data.pub_name,
          address: data.address,
          xcoord: data.xcoord,
          ycoord: data.ycoord,
        };
      });

      if(pubList.length === 0) {
        console.warn("No pubs in list.");
      }

      console.log("Fetched pubs: ", pubList);
      setPubs(pubList);
    } catch (error) {
      console.log("Error fetching pubs: ", error);
    } finally {
      setFetchingPubs(false);
    }
  }

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

      setGamerId(gamerId);
      const userDoc = await getDoc(doc(db, "gamers", gamerId));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User Data Retrieved:", userData);

        setUserInfo({
          fullName: userData.fullName, 
          gamer_id: gamerId, 
        });
        setFriends(userData.friends_list || []);
        setModalVisible(true);
        setGamerId(gamerId); 
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
          <View>
            <TouchableOpacity onPress={handleProfilePress}>
              <SvgXml xml={logoXml} width={40} height={40} />
            </TouchableOpacity>
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
          {pubs && pubs.map((pub) => (
            <Marker
              key={pub.id}
              coordinate={{
                latitude: pub.xcoord,
                longitude: pub.ycoord,
              }}
              title={pub.pub_name}
              description={pub.address}
            />
          ))}
        </MapView>
      </View>

      {/* Friends List Section */}
      <View style={styles.friendsContainer}>
          <Text style={styles.friendsTitle}>Find your friends!</Text>
          { !friends ? (
            <Text style={styles.noFriendsText}>No friends added yet.</Text>
          ) : (
            <FlatList
              data={friends}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.friendItem}>
                  <Text style={styles.friendName}>{item}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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
    height: "60%",
    borderRadius: 10,
    paddingBottom: 0
  },
  closeButton: {
    marginTop: 20,
    fontSize: 16,
    color: "#00B4D8",
    fontWeight: "bold",
  },
  friendsContainer: {
    width: "45%",
    height: "45%",
    backgroundColor: "#90E0EF",
    borderRadius: 10,
    padding: 10,
    marginTop: -20,
    marginLeft: 10,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center"
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  friendName: {
    fontSize: 16,
  },
  noFriendsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});

export default MainScreen;
