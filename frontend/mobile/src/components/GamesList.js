import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { db } from "../firebaseConfig";

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [publicans, setPublicans] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGamesAndPublicans = async () => {
      try {
        // Fetch games
        const gamesSnapshot = await getDocs(collection(db, "games"));
        const gamesData = gamesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch publicans
        const publicansSnapshot = await getDocs(collection(db, "publicans"));
        const publicansData = publicansSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGames(gamesData);
        setPublicans(publicansData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGamesAndPublicans();
  }, []);

  const renderGameCard = ({ item }) => {
    const spotsLeft = item.max_players - (item.participants?.length || 0);

    // Find the matching publican by comparing pub_name with the game's location
    const matchedPublican = publicans.find((pub) => {
      return pub.id === item.pub_id;
    });
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("GameDetails", { game: item })}
      >
        <View style={styles.rowContainer}>
          {matchedPublican?.pub_image_url ? (
            <Image
              source={{ uri: matchedPublican.pub_image_url }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder} />
          )}
          <View style={styles.textContainer}>
            <Text style={styles.gameName}>{item.game_name}</Text>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.spotsLeft}>{spotsLeft} spots left</Text>
          </View>
        </View>
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
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    height: 100, // Keep height fixed
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // Let width be dynamic based on content
    paddingRight: 15, // Prevent text from touching the edge
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: "cover",
  },
  placeholder: {
    width: 80,
    height: 80,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flexShrink: 1, // Prevents overflow
    maxWidth: "80%", // Keeps text wrapping within a reasonable size
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
