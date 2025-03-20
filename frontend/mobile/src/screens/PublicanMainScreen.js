import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { DrawerActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

// Contexts
import { useGamer } from "../contexts/GamerContext";

// Components
import GamesNearYou from "../components/GamesNearYou";
import Friends from "../components/Friends";
import LoadingAnimation from "../components/LoadingAnimation";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";

// Firebase Import
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

const PublicanMainScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [games, setGames] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [pubs, setPubs] = useState(null);
  const [fetchingPubs, setFetchingPubs] = useState(false);
  const [friends, setFriends] = useState(null);
  const { gamerId, setGamerId } = useGamer();
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const searchBarRef = useRef(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    getLocation();
    fetchPubs();
    fetchUserInfo();
    fetchGames();
  }, []);

  useEffect(() => {
    if (games) {
      handleSearch();
    }
  }, [searchQuery, pubs, games]);

  useEffect(() => {
    if (currentLocation && pubs && userInfo) {
      setLoading(false);
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.0421,
      });
    }
  }, [currentLocation, pubs, userInfo]);

  const handleProfilePress = (gamerId) => {
    console.log("GamerId: ", gamerId);
    if (gamerId) {
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

      if (pubList.length === 0) {
        console.warn("No pubs in list.");
      }

      console.log("Fetched pubs: ", pubList);
      setPubs(pubList);
    } catch (error) {
      console.log("Error fetching pubs: ", error);
    } finally {
      setFetchingPubs(false);
    }
  };

  // Fetch games info from Firestore
  const fetchGames = async () => {
    try {
      const now = moment().format("YYYY-MM-DDTHH:mm:ss");
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("expires", ">", now));

      const querySnapshot = await getDocs(q);
      const gameList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        game_name: doc.data().game_name,
        location: doc.data().location,
        xcoord: doc.data().xcoord,
        ycoord: doc.data().ycoord,
        start_time: doc.data().start_time,
        end_time: doc.data().end_time,
        expires: doc.data().expires,
        max_players: doc.data().max_players,
        participants: doc.data().participants,
        host: doc.data().host,
        game_desc: doc.data().game_desc,
      }));

      setGames(gameList);
      console.log("Fetched games: ", gameList);
    } catch (error) {
      console.error("Error fetching games: ", error);
    }
  };

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

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const filteredPubs = (pubs || [])
      .filter((pub) =>
        pub.pub_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((pub) => ({ ...pub, type: "pub" }));

    const filteredGames = (games || [])
      .filter((game) =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((game) => ({ ...game, type: "game" }));

    setFilteredResults([...filteredPubs, ...filteredGames]);
  };

  const handleResultPress = (item) => {
    if (item.type === "pub" && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: item.xcoord,
          longitude: item.ycoord,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        3000
      );
    } else if (item.type === "game") {
      alert(`Game: ${item.game_name}`);
    }
    setSearchQuery("");
    setFilteredResults([]);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isSearchActive) {
          setIsSearchActive(false);
          setSearchQuery(""); // Clear search query
          setFilteredResults([]); // Hide results
        }
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <TouchableOpacity onPress={handleProfilePress}>
                <SvgXml xml={logoXml} width={40} height={40} />
              </TouchableOpacity>
            </View>
            <TextInput
              ref={searchBarRef}
              style={styles.searchBar}
              placeholder="Search pubs and games"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchActive(true)} // Set active on focus
            />
          </View>

          {searchQuery.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
                {filteredResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.searchResult}
                    onPress={() => handleResultPress(item)}
                  >
                    <Text style={styles.resultText}>
                      {item.type === "pub" ? "🍺 " : "🎲 "}
                      {item.pub_name || item.game_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.tagContainer}>
            <TouchableOpacity
              onPress={() => setSelectedTag("All")}
              style={[
                styles.tagButton,
                selectedTag === "All"
                  ? styles.selectedTag
                  : styles.unselectedTag,
              ]}
            >
              <Text style={styles.tagText}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTag("Favourites")}
              style={[
                styles.tagButton,
                selectedTag === "Favourites"
                  ? styles.selectedTag
                  : styles.unselectedTag,
              ]}
            >
              <Text style={styles.tagText}>Favourites</Text>
            </TouchableOpacity>
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            onLongPress={() => navigation.navigate("Map")}
          >
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="You are here"
                pinColor="#FF006E"
              />
            )}
            {pubs &&
              pubs.map((pub) => (
                <Marker
                  key={pub.id}
                  coordinate={{
                    latitude: pub.xcoord,
                    longitude: pub.ycoord,
                  }}
                  title={pub.pub_name}
                  description={pub.address}
                  pinColor="#90E0EF"
                />
              ))}
          </MapView>
        </View>

        <View style={styles.createEventContainer}>
          <TouchableOpacity
            style={styles.createEventButton}
            onPress={() => navigation.navigate("CreateEvent")}
          >
            <Ionicons name="add" size={30} color="white" />
            <Text style={styles.createEventText}>Create Event</Text>
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
    height: 40,
    backgroundColor: "#eef0f2",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginLeft: 5,
    fontSize: 17,
  },
  searchResultsContainer: {
    position: "absolute",
    top: 60,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    maxHeight: 200,
    zIndex: 10,
  },
  scrollView: {
    maxHeight: 200,
  },
  searchResult: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  resultText: {
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "98%", // Same width as the map
    alignSelf: "center",
    marginBottom: 7,
  },
  tagButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedTag: {
    backgroundColor: "#FF006E",
  },
  unselectedTag: {
    backgroundColor: "#FFDCEC",
  },
  tagText: {
    fontSize: 16,
    lineHeight: 16 * 1.2,
    color: "black",
  },
  map: {
    width: "95%",
    height: "71%",
    borderRadius: 10,
    paddingBottom: 0,
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
    marginTop: 100,
    marginLeft: 10,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
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
  createEventContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "coloumn",
    padding: 10,
  },
  createEventButton: {
    backgroundColor: "#FF006E",
    borderRadius: 25,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
  },
  createEventText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default PublicanMainScreen;
