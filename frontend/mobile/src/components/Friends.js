import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import profileIcons from "../utils/profileIcons/profileIcons"; // Assuming profileIcons contains all 12 icons

const FriendsList = ({ friends }) => {
  const navigation = useNavigation();
  const [friendDetails, setFriendDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.friendsContainer}>
      <Text style={styles.friendsTitle}>Find your friends!</Text>
      {friendDetails.length === 0 ? (
        <Text style={styles.noFriendsText}>No friends added yet.</Text>
      ) : (
        <FlatList
          data={friendDetails}
          keyExtractor={(item) => item.gamerId}
          renderItem={({ item }) => {
            const userProfileXml =
              profileIcons[item.profile] || profileIcons["01"]; // Fallback to "01" if profile not found

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
    width: "48%",
    height: "100%",
    backgroundColor: "#90E0EF",
    borderRadius: 10,
    marginRight: 5,
    padding: 10,
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
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendName: {
    fontSize: 16,
    marginLeft: 10,
  },
  noFriendsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
  statusMessage: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FriendsList;
