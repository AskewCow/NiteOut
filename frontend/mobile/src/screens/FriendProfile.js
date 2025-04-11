import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SvgXml } from "react-native-svg";

import profileIcons from "../utils/profileIcons/profileIcons";

const FriendProfile = ({ route, navigation }) => {
  const { friend } = route.params; // Get the friend data passed from FriendsList
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false); // Since the friend's data is already passed, no need to fetch
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  const friendProfileXml = profileIcons[friend?.profile] || profileIcons["01"]; // Fallback to "01" if profile not found

  const createdAt = friend?.createdAt?.toDate();
  const formattedDate = createdAt
    ? createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not Available";

  return (
    <View style={styles.container}>
      {/* Profile Picture Section - Now above the name */}
      <View style={styles.profileContainer}>
        <SvgXml xml={friendProfileXml} width={100} height={100} />
      </View>

      {/* Friend's Name */}
      <Text style={styles.title}>{friend?.fullName}</Text>

      <TouchableOpacity
        style={styles.removeFriendButton}
        onPress={() =>
          Alert.alert(
            "Remove Friend",
            "Are you sure you want to remove this friend?",
            [
              {
                text: "Cancel",
                style: "cancel", // Makes it look like a default cancel button
              },
              {
                text: "Confirm",
                onPress: () => {
                  // Add your remove friend logic here
                  console.log("Friend removed");
                },
                style: "destructive", // Makes the text red on iOS (optional)
              },
            ],
          )
        }
      >
        <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
      </TouchableOpacity>

      {/* Footer Section - Member since */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Member since: <Text style={styles.boldPinkText}>{formattedDate}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingTop: "5%",
  },
  title: {
    fontSize: 28,
    marginBottom: "95%",
    color: "#212529",
    fontWeight: "bold",
    textAlign: "center",
  },
  profileContainer: {
    marginTop: "10%",
    marginBottom: "10%",
  },
  removeFriendButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: "20%",
    width: "100%",
    alignItems: "center",
  },
  removeFriendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: "5%",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  boldPinkText: {
    fontWeight: "bold",
    color: "#FF007A", // Pink color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FriendProfile;
