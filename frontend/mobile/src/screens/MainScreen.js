"use client";
import { NGROK_URL } from "../../environment";

import { useState, useEffect, useRef } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SvgXml } from "react-native-svg";

// Contexts
import { useGamer } from "../contexts/GamerContext";

// Components
import GamesNearYou from "../components/GamesNearYou";
import LoadingAnimation from "../components/LoadingAnimation";
import { logoXml } from "../utils/logo";
import { expandIconXml } from "../utils/expandIcon";
import profileIcons from "../utils/profileIcons/profileIcons";

const MainScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [games, setGames] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [pubs, setPubs] = useState(null);
  const [fetchingPubs, setFetchingPubs] = useState(false);
  const [friends, setFriends] = useState([]);
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
    fetchFriends();
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
    } else {
      console.log("Loading not complete yet:", {
        currentLocation,
        pubs,
        userInfo,
      });
    }
  }, [currentLocation, pubs, userInfo]);

  // Get current location
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied!");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      console.log("Current Location: ", location.coords);
      console.log("NGROK_URL:", NGROK_URL);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  // Fetch pub data from API
  const fetchPubs = async () => {
    try {
      const response = await fetch(`${NGROK_URL}/api/fetch_pubs`);
      const pubs = await response.json();
      console.log("Fetched pubs data:", pubs);
      setPubs(pubs);
    } catch (error) {
      console.error("Error fetching pubs:", error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch(`${NGROK_URL}/api/fetch_games`);
      const games = await response.json();
      console.log("Fetched games data:", games);
      setGames(games);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const gamerId = await AsyncStorage.getItem("gamerId");
      console.log("Retrieved Gamer ID from AsyncStorage:", gamerId);
      const response = await fetch(`${NGROK_URL}/api/fetch_user_info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gamerId }),
      });
      const userInfo = await response.json();
      console.log("Fetched user info:", userInfo);
      setGamerId(gamerId);
      setUserInfo(userInfo);

      // Set friends after fetching user info
      if (userInfo && userInfo.friends_list) {
        setFriends(userInfo.friends_list);
        console.log("Friends list set:", userInfo.friends_list);
      } else {
        setFriends([]);
        console.log("No friends found");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const gamerId = await AsyncStorage.getItem("gamerId");
      const response = await fetch(`${NGROK_URL}/api/fetch_friends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gamerId }),
      });
      const fetchedFriends = await response.json();
      console.log("Fetched friends data:", fetchedFriends);
      setFriends(fetchedFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
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
              <TouchableOpacity>
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
          <View style={styles.mapWrapper}>
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

            <TouchableOpacity
              style={styles.expandIconContainer}
              onPress={() => navigation.navigate("Map")}
            >
              <SvgXml xml={expandIconXml} width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.friendsAndGamesContainer}>
          <View style={styles.friendsContainer}>
            <Text style={styles.friendsTitle}>Your Friends</Text>
            <ScrollView style={styles.friendsScrollView}>
              {friends.length === 0 ? (
                <Text style={styles.noFriendsText}>No friends added yet.</Text>
              ) : (
                friends.map((friend) => {
                  // Check if profile exists before trying to use toString()
                  const profileKey = friend.profile
                    ? (typeof friend.profile === "string"
                        ? friend.profile
                        : friend.profile.toString()
                      ).padStart(2, "0")
                    : "01"; // Default to "01" if profile is undefined

                  const userProfileXml =
                    profileIcons[profileKey] ||
                    (friend.profile
                      ? profileIcons[Number.parseInt(friend.profile)]
                      : null) ||
                    profileIcons["01"];

                  return (
                    <View key={friend.gamerId} style={styles.friendItem}>
                      <View style={styles.friendInfo}>
                        <SvgXml xml={userProfileXml} width={30} height={30} />
                        <Text style={styles.friendName}>{friend.fullName}</Text>
                      </View>
                      {friend.statusMessage && (
                        <Text style={styles.statusMessage}>
                          {friend.statusMessage}
                        </Text>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
          <GamesNearYou gamesList={games} />
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
  mapWrapper: {
    alignItems: "center",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
  },
  expandIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    marginRight: 10,
  },
  closeButton: {
    marginTop: 20,
    fontSize: 16,
    color: "#00B4D8",
    fontWeight: "bold",
  },
  friendsContainer: {
    width: "45%",
    backgroundColor: "#90E0EF",
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
    flex: 1, // This will make it expand to match the height
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  friendItem: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
  },
  friendName: {
    fontSize: 16,
  },
  noFriendsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  friendsAndGamesContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    gap: 5,
    padding: 10,
  },
  friendsScrollView: {
    flex: 1,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusMessage: {
    fontSize: 12,
    color: "gray",
  },
});

export default MainScreen;
