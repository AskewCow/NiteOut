import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";

import GamesList from "../components/GamesList";
import LoadingAnimation from "../components/LoadingAnimation";
import SearchBer from "../components/SearchBer";
import { db } from "../firebaseConfig";
import { leafIconXml } from "../utils/leafIcon";
import { logoXml } from "../utils/logo";
import { minimizeIconXml } from "../utils/minimizeIcon";

const MapScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pubs, setPubs] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [showBerInfo, setShowBerInfo] = useState(false);
  const [, setIsSearchActive] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    getLocation();
    fetchPubs();
    fetchGames();
  }, []);

  useEffect(() => {
    if (currentLocation && pubs.length > 0 && games.length > 0) {
      setLoading(false);
    }
  }, [currentLocation, pubs, games]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, pubs, games]);

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

  const fetchPubs = async () => {
    try {
      const pubsCollect = await getDocs(collection(db, "publicans"));
      const pubList = pubsCollect.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPubs(pubList);
    } catch (error) {
      console.error("Error fetching pubs: ", error);
    }
  };

  const fetchGames = async () => {
    try {
      const gamesCollect = await getDocs(collection(db, "games"));
      const gamesList = gamesCollect.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGames(gamesList);
    } catch (error) {
      console.error("Error fetching games: ", error);
    }
  };

  const berPriority = {
    A1: 1,
    A2: 2,
    A3: 3,
    B1: 4,
    B2: 5,
    B3: 6,
    C1: 7,
    C2: 8,
    C3: 9,
    D1: 10,
    D2: 11,
    E1: 12,
    E2: 13,
    F: 14,
    G: 15,
    "N/A": 16,
    null: 16,
    undefined: 16,
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      return;
    }

    const filteredPubs = (pubs || [])
      .filter((pub) =>
        pub.pub_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((pub) => ({ ...pub, type: "pub" }))
      .sort((a, b) => {
        const aRating = berPriority[a.BER?.toUpperCase?.()] ?? 16;
        const bRating = berPriority[b.BER?.toUpperCase?.()] ?? 16;
        return aRating - bRating;
      });

    const filteredGames = (games || [])
      .filter((game) =>
        game.game_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .map((game) => ({ ...game, type: "game" }));

    setFilteredResults([...filteredPubs, ...filteredGames]);
  };

  const handleResultPress = (item) => {
    if (item.type === "pub") {
      // Zoom to pub
      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(item.xcoord),
          longitude: parseFloat(item.ycoord),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        3000,
      );
    } else if (item.type === "game") {
      navigation.navigate("GameDetails", {
        game: item,
      });
    }

    setSearchQuery("");
    setFilteredResults([]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingAnimation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section (Logo + Search Bar) */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Drawer", { screen: "Main" })}
        >
          <SvgXml xml={logoXml} width={40} height={40} />
        </TouchableOpacity>

        <TextInput
          style={styles.searchBar}
          placeholder="Search pubs, games"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchActive(true)}
        />
      </SafeAreaView>
      {searchQuery.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <ScrollView style={styles.scrollView} nestedScrollEnabled>
            {filteredResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResult}
                onPress={() => handleResultPress(item)}
              >
                <View style={styles.resultRow}>
                  <Text style={styles.resultText}>
                    {item.type === "pub" ? "🍺 " : "🎲 "}
                    {item.pub_name || item.game_name}
                  </Text>

                  {item.type === "pub" &&
                    ["A1", "A2", "A3", "B1", "B2"].includes(
                      item.BER?.toUpperCase?.(),
                    ) && (
                      <TouchableOpacity onPress={() => setShowBerInfo(true)}>
                        <SvgXml xml={leafIconXml} width={20} height={20} />
                      </TouchableOpacity>
                    )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Map Section (fills remaining space) */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={
            currentLocation
              ? {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  latitudeDelta: 0.00922,
                  longitudeDelta: 0.00421,
                }
              : {
                  latitude: 53.3498,
                  longitude: -6.2603,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }
          }
        >
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="You are here"
              pinColor="#FF006E"
            />
          )}
          {pubs.map((pub) => (
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

          <TouchableOpacity
            style={styles.minimizeIconContainer}
            onPress={() => navigation.navigate("Drawer", { screen: "Main" })}
          >
            <SvgXml xml={minimizeIconXml} width={25} height={25} />
          </TouchableOpacity>

          <View style={styles.gamesListContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gamesListScrollView}
            >
              <GamesList games={games} />
            </ScrollView>
          </View>
        </MapView>
      </View>
      <SearchBer visible={showBerInfo} onClose={() => setShowBerInfo(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00B4D8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#00B4D8",
    marginBottom: "-8%",
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: "#eef0f2",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginLeft: 10,
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
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultText: {
    fontSize: 16,
  },
  minimizeIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  gamesListContainer: {
    position: "absolute",
    bottom: "7%",
  },
  gamesListScrollView: {
    flexDirection: "row",
    paddingHorizontal: 5, // Some space at the edges
  },
});

export default MapScreen;
