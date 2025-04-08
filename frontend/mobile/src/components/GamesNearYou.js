import React from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const GamesNearYou = ({ gamesList, publicans, isLoading }) => {
    const navigation = useNavigation();

    if (isLoading) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Games Near You</Text>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#0000ff" />
                </View>
            </View>
        );
    }

    if (!gamesList || gamesList.length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Games Near You</Text>
                <View style={styles.noGamesContainer}>
                    <Text style={styles.noGamesText}>No games available.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Games Near You</Text>
            <FlatList
                data={gamesList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const matchedPublican = publicans?.find(
                        (pub) => pub.id === item.pub_id
                    );
                    console.log(
                        "🖼️ Image URL:",
                        matchedPublican?.pub_image_url
                    );

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate("GameDetails", {
                                    game: item,
                                })
                            }
                        >
                            <View style={styles.rowContainer}>
                                {matchedPublican?.pub_image_url ? (
                                    <Image
                                        source={{
                                            uri: matchedPublican.pub_image_url,
                                        }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.placeholder} />
                                )}
                                <View style={styles.textContainer}>
                                    <Text style={styles.gameName}>
                                        {item.game_name}
                                    </Text>
                                    <Text style={styles.gameLocation}>
                                        at {item.location}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        flex: 1,
        height: "100%",
        width: "100%",
        padding: 10,
        backgroundColor: "#90E0EF",
        borderRadius: 10,
        marginRight: 0,
        marginHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    card: {
        backgroundColor: "white",
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 3,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 6,
        marginRight: 10,
        resizeMode: "cover",
        overflow: "hidden",
    },
    placeholder: {
        width: 80,
        height: 80,
        backgroundColor: "#ccc",
        borderRadius: 8,
        marginRight: 10,
    },
    textContainer: {
        flexShrink: 1,
    },
    gameName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    gameLocation: {
        fontSize: 14,
        color: "gray",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noGamesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noGamesText: {
        fontSize: 16,
        color: "gray",
    },
});

export default GamesNearYou;
