import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SvgXml } from "react-native-svg";

import profileIcons from "../utils/profileIcons/profileIcons";

const FriendsList = ({ friends }) => {
  const navigation = useNavigation();
  const [friendDetails, setFriendDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    if (friends && friends.length > 0) {
      setFriendDetails(friends);
      setLoading(false);
      console.log("Friends data received as prop:", friends);
    } else {
      setLoading(false);
      console.log("No friends to display.");
    }
  }, [friends]);

  if (loading) {
    return (
      <View style={styles.friendsContainer}>
        <Text style={styles.friendsTitle}>Find your friends!</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.friendsContainer}>
      <Text style={styles.friendsTitle}>Find your friends!</Text>
      {friendDetails.length === 0 ? (
        <View style={styles.noFriendsContainer}>
          <Text style={styles.noFriendsText}>No friends added yet.</Text>
        </View>
      ) : (
        <FlatList
          data={friendDetails}
          keyExtractor={(item) => item.gamerId}
          renderItem={({ item }) => {
            const userProfileXml =
              profileIcons[item.profile] || profileIcons["01"];

            return (
              <TouchableOpacity
                style={styles.friendItem}
                onPress={() =>
                  navigation.navigate("FriendProfile", {
                    friend: item,
                  })
                }
              >
                <View style={styles.friendInfo}>
                  <SvgXml xml={userProfileXml} width={30} height={30} />
                  <Text style={styles.friendName}>{item.fullName}</Text>
                </View>
                {item.statusMessage && (
                  <Text style={styles.statusMessage}>{item.statusMessage}</Text>
                )}
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  friendsContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#90E0EF",
    borderRadius: 10,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  friendItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendName: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "semibold",
  },
  statusMessage: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsText: {
    fontSize: 16,
    color: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FriendsList;
