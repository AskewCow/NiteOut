"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useGamer } from "../contexts/GamerContext";
import { SvgXml } from "react-native-svg";
import { logoXml } from "../utils/logo";
import { db } from "../firebaseConfig";
import {
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";
import { DrawerActions } from "@react-navigation/native";
import profileIcons from "../utils/profileIcons/profileIcons";

const MyFriendsScreen = ({ navigation }) => {
  const { gamerId } = useGamer();
  const [allUsers, setAllUsers] = useState([]);
  const [unaddedUsers, setUnaddedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendList = async () => {
      try {
        const userDoc = await getDoc(doc(db, "gamers", gamerId));
        const userData = userDoc.data();
        let friends = [];
        if (userData && userData.friends_list) {
          friends = userData.friends_list;
        }

        const gamersRef = collection(db, "gamers");
        const unaddedQuery = query(
          gamersRef,
          where("gamerId", "not-in", friends),
          limit(20)
        );
        const unaddedSnapshot = await getDocs(unaddedQuery);
        const fetchedUnaddedUsers = unaddedSnapshot.docs.map((doc) => ({
          ...doc.data(),
          userId: doc.id,
        }));
        const allUsersSnapshot = await getDocs(gamersRef);
        const fetchedUsers = allUsersSnapshot.docs.map((doc) => ({
          ...doc.data(),
          userId: doc.id,
        }));
        setAllUsers(fetchedUsers);
        setUnaddedUsers(fetchedUnaddedUsers);
        setFilteredUsers(fetchedUnaddedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching friend data:", error);
        setLoading(false);
      }
    };

    fetchFriendList();
  }, [gamerId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(unaddedUsers);
    } else {
      const filtered = allUsers.filter((user) => {
        const nameMatch = user.fullName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const friendIdMatch = user.gamerId === searchQuery.trim();
        return nameMatch || friendIdMatch;
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  const addFriend = async (friendId) => {
    try {
      const friendDoc = doc(db, "gamers", friendId);
      const userDoc = doc(db, "gamers", gamerId);

      const friendDocSnapshot = await getDoc(friendDoc);
      const userDocSnapshot = await getDoc(userDoc);

      const friendData = friendDocSnapshot.data();
      const userData = userDocSnapshot.data();

      if (
        userData.friends_list &&
        userData.friends_list.includes(friendData.gamerId)
      ) {
        Alert.alert(
          "Already Friends",
          "You are already friends with this person."
        );
        return;
      }

      await updateDoc(friendDoc, {
        friends_list: arrayUnion(userData.gamerId),
      });

      await updateDoc(userDoc, {
        friends_list: arrayUnion(friendData.gamerId),
      });

      Alert.alert("Friend added");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend");
    }
  };

  const removeFriend = async (friendId) => {
    try {
      const friendDoc = doc(db, "gamers", friendId);
      const userDoc = doc(db, "gamers", gamerId);

      const friendDocSnapshot = await getDoc(friendDoc);
      const userDocSnapshot = await getDoc(userDoc);

      const friendData = friendDocSnapshot.data();
      const userData = userDocSnapshot.data();

      await updateDoc(friendDoc, {
        friends_list: arrayRemove(userData.gamerId),
      });

      await updateDoc(userDoc, {
        friends_list: arrayRemove(friendData.gamerId),
      });

      Alert.alert("Friend Removed!");
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Failed to remove friend");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        {/* Header (Blue background) */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Find Friends</Text>
        </View>

        {/* Safe Area View for the rest of the screen */}
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.container}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name/friend ID"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.gamerId}
              renderItem={({ item }) => {
                const userProfileXml =
                  profileIcons[item.profile] || profileIcons["01"];
                const isFriend =
                  item.friends_list && item.friends_list.includes(gamerId);

                return (
                  <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() =>
                      navigation.navigate("Profile", {
                        gamerId: item.userId,
                      })
                    }
                  >
                    <View style={styles.friendInfo}>
                      <SvgXml xml={userProfileXml} width={50} height={50} />
                      <Text style={styles.friendName}>{item.fullName}</Text>
                    </View>
                    {item.statusMessage && (
                      <Text style={styles.statusMessage}>
                        {item.statusMessage}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.addFriendButton,
                        isFriend && styles.friendAddedButton,
                      ]}
                      onPress={() => {
                        if (!isFriend) {
                          addFriend(item.userId);
                        } else {
                          removeFriend(item.userId);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.addFriendText,
                          isFriend && styles.friendAddedText,
                        ]}
                      >
                        {isFriend ? "Added" : "Add Friend"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00B4D8",
    paddingHorizontal: 16,
    paddingTop: "12%",
    height: "12%",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#eef0f2",
    height: 55,
    padding: 12,
    borderRadius: 13,
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  friendItem: {
    backgroundColor: "#eef0f2",
    padding: 15,
    borderRadius: 13,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  statusMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  addFriendButton: {
    borderColor: "#FF007A",
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  friendAddedButton: {
    backgroundColor: "#FF007A",
    borderColor: "#FF007A",
  },
  addFriendText: {
    color: "#FF007A",
    fontSize: 14,
    fontWeight: "bold",
  },
  friendAddedText: {
    color: "white",
  },
});

export default MyFriendsScreen;
