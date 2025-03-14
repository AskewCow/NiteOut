import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    Text,
    SafeAreaView,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { DrawerActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

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

const MainScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [games, setGames] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [fetchingUser, setFetchingUser] = useState(false);
    const [pubs, setPubs] = useState(null);
    const [fetchingPubs, setFetchingPubs] = useState(false);
    const [friends, setFriends] = useState(null);
    const { gamerId, setGamerId } = useGamer();
    const [selectedTag, setSelectedTag] = useState("All");

    useEffect(() => {
        getLocation();
        fetchPubs();
        fetchUserInfo();
        fetchGames();
    }, []);

    useEffect(() => {
        if (currentLocation && pubs && userInfo) {
            setLoading(false); // Data has finished loading
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
            const { status } =
                await Location.requestForegroundPermissionsAsync();
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

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <LoadingAnimation /> {/* Display loading animation */}
            </View>
        );
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

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tagScrollView}
                >
                    {[
                        "All",
                        "Scrabble",
                        "Darts",
                        "Billiards",
                        "Trivia",
                        "Cards",
                        "Catan",
                    ].map((tag, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedTag(tag)}
                            style={[
                                styles.tagButton,
                                selectedTag === tag
                                    ? styles.selectedTag
                                    : styles.unselectedTag,
                            ]}
                        >
                            <Text style={styles.tagText}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.00922,
                        longitudeDelta: 0.0421,
                    }}
                    onLongPress={() => navigation.navigate("Map")}
                >
                    {currentLocation && (
                        <Marker
                            coordinate={currentLocation}
                            title="You are here"
                            pinColor="blue"
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
                            />
                        ))}
                </MapView>
            </View>

            <View style={styles.friendsAndGamesContainer}>
                <Friends friends={friends} />
                <GamesNearYou gamesList={games} />
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
        height: 40,
        backgroundColor: "#eef0f2",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginLeft: 5,
        fontSize: 17,
    },
    tagScrollView: {
        paddingHorizontal: 10,
    },
    tagButton: {
        marginLeft: 0,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        height: 16 * 1.2 + 8 * 2,
        justifyContent: "center",
    },
    tagText: {
        fontSize: 16,
        lineHeight: 16 * 1.2,
        color: "black",
    },
    selectedTag: {
        backgroundColor: "#FF006E",
    },
    unselectedTag: {
        backgroundColor: "#FFDCEC",
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
    friendsAndGamesContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        padding: 10,
    },
});

export default MainScreen;
