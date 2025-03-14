import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig"; // Ensure your Firebase setup is correct

const GamesList = () => {
    const [games, setGames] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "games"));
                const gamesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setGames(gamesData);
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        };

        fetchGames();
    }, []);

    const renderGameCard = ({ item }) => {
        const spotsLeft = item.max_players - (item.participants?.length || 0);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate("GameDetails", { game: item })
                }
            >
                <Text style={styles.gameName}>{item.game_name}</Text>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.spotsLeft}>{spotsLeft} spots left</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={games}
                keyExtractor={(item) => item.id}
                horizontal
                renderItem={renderGameCard}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
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
    location: {
        fontSize: 14,
        color: "gray",
    },
    spotsLeft: {
        fontSize: 14,
        color: "#ff006e",
        fontWeight: "bold",
    },
});

export default GamesList;
