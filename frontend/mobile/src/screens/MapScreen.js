import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SvgXml } from "react-native-svg";

import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

import GamesList from "../components/GamesList";
import { logoXml } from "../utils/logo";
import LoadingAnimation from "../components/LoadingAnimation";

const MapScreen = ({ navigation }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [pubs, setPubs] = useState([]);
    const [selectedTag, setSelectedTag] = useState("All");
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    onPress={() =>
                        navigation.navigate("Drawer", { screen: "Main" })
                    }
                >
                    <SvgXml xml={logoXml} width={40} height={40} />
                </TouchableOpacity>

                <TextInput
                    style={styles.searchBar}
                    placeholder="Search pubs, games"
                    placeholderTextColor="#999"
                />
            </SafeAreaView>

            <View style={styles.tagContainer}>
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
            </View>

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
    tagContainer: {
        height: "5%",
        justifyContent: "center",
        marginBottom: 5, // Creates a small gap between the buttons and the map
    },
    tagScrollView: {
        flexGrow: 0,
        paddingHorizontal: 7,
    },
    tagButton: {
        paddingHorizontal: 15,
        borderRadius: 10,
        marginHorizontal: 3,
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
