import React from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const GamesNearYou = ({ gamesList, isLoading }) => {
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
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("GameDetails", { game: item })
                        }
                    >
                        <Text style={styles.gameName}>{item.game_name}</Text>
                        <Text style={styles.gameLocation}>
                            at {item.location}
                        </Text>
                    </TouchableOpacity>
                )}
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
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 3,
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
