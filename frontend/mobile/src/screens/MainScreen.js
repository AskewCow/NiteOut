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
    FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SvgXml } from "react-native-svg";
import { DrawerActions } from "@react-navigation/native";

// Contexts
import { useGamer } from "../contexts/GamerContext";

// Components
import GamesNearYou from "../components/GamesNearYou";
import FriendsList from "../components/Friends";
import LoadingAnimation from "../components/LoadingAnimation";
import { logoXml } from "../utils/logo";
import { expandIconXml } from "../utils/expandIcon";

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
            const { status } =
                await Location.requestForegroundPermissionsAsync();
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
                            <TouchableOpacity onPress={() => handleProfilePress(gamerId)}>
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
                            <ScrollView
                                style={styles.scrollView}
                                nestedScrollEnabled={true}
                            >
                                {filteredResults.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.searchResult}
                                        onPress={() => handleResultPress(item)}
                                    >
                                        <Text style={styles.resultText}>
                                            {item.type === "pub"
                                                ? "🍺 "
                                                : "🎲 "}
                                            {item.pub_name || item.game_name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

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
                            <SvgXml
                                xml={expandIconXml}
                                width={20}
                                height={20}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.friendsAndGamesContainer}>
                    <FriendsList friends={friends} />
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
    map: {
        width: "95%",
        height: "77%",
        borderRadius: 10,
        paddingBottom: 0,
    },
    mapWrapper: {
        alignItems: "center",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        marginTop: 20,
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
    friendsAndGamesContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        gap: 5,
        padding: 10,
    },
    statusMessage: {
        fontSize: 12,
        color: "gray",
    },
});

export default MainScreen;
