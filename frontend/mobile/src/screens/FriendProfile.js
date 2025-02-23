import React from "react";
import { View, Text, StyleSheet } from "react-native";

const FriendProfile = ({ route }) => {
  const { friend } = route.params; // Get the friend's name from navigation params
  const friendName = friend.fullName;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{friendName}'s Profile</Text>
      <Text style={styles.info}>More details about {friendName} will go here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "gray",
  },
});

export default FriendProfile;
