import React from "react";
import { View, Text, StyleSheet } from "react-native";

const GameDetails = ({ route }) => {
  const { game } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{game.game_name}</Text>
      <Text style={styles.location}>{game.location}</Text>
      <Text style={styles.description}>{game.description || "No description available."}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  location: {
    fontSize: 18,
    color: "gray",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default GameDetails;
