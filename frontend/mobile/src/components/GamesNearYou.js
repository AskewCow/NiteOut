import React, { use } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const GamesNearYou = ({ gamesList }) => {
    const navigation = useNavigation();

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
});

export default GamesNearYou;
