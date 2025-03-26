import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { SvgXml } from "react-native-svg";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { DrawerActions } from "@react-navigation/native";
import { db } from "../firebaseConfig";

import profileIcons from "../utils/profileIcons/profileIcons";
import { logoXml } from "../utils/logo";
import { pinkEditIconXml } from "../utils/pinkEditIcon";
import { editIconXml } from "../utils/editIcon";
import { useGamer } from "../contexts/GamerContext";

const ProfileScreen = ({ route, navigation }) => {
  const { gamerId: navigatedGamerId } = route.params || {};
  const { gamerId: currentUserId } = useGamer();
  const [userInfo, setUserInfo] = useState(null);
  const [isPublican, setIsPublican] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const [gamerId, setGamerId] = useState(navigatedGamerId || currentUserId);

  useEffect(() => {
    if (navigatedGamerId) {
      setGamerId(navigatedGamerId || currentUserId);
    }
  }, [navigatedGamerId, currentUserId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        let userData = {};
        let userProfile = "01"; // Default profile
        let userIdToDisplay = "";

        const userRef = doc(db, "users", gamerId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().publicanId) {
          userData = userSnap.data();
          userIdToDisplay = userSnap.data().publicanId;
          setIsPublican(true);
        } else {
          const gamerRef = doc(db, "gamers", gamerId);
          const gamerSnap = await getDoc(gamerRef);

          if (gamerSnap.exists()) {
            userData = gamerSnap.data();
            userIdToDisplay = gamerId;
          } else {
            Alert.alert("Error", "User data not found. Please log in again.");
            navigation.navigate("Login");
            return;
          }
        }

        userProfile = userData.profile || "01";
        setUserInfo({
          ...userData,
          userIdToDisplay,
          profile: userProfile,
        });
        setNameInput(
          isPublican ? userData.pub_name || "" : userData.fullName || ""
        );
        setEmailInput(userData.email || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user information.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [gamerId]);

  const handleProfilePress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkIfEmailExists = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email in Firestore:", error);
      return false;
    }
  };

  const checkIfPubNameExists = async (pubName) => {
    try {
      const pubsRef = collection(db, "publican");
      const q = query(pubsRef, where("pub_name", "==", pubName));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking pub name in Firestore:", error);
      return false;
    }
  };

  const updateUserInfo = async (field, value) => {
    try {
      const userRef = doc(db, "users", gamerId);
      const targetRef = isPublican
        ? doc(db, "publican", userInfo.userIdToDisplay)
        : doc(db, "gamers", gamerId);

      await Promise.all([
        updateDoc(targetRef, { [field]: value }),
        updateDoc(userRef, { [field]: value }),
      ]);

      setUserInfo((prev) => ({ ...prev, [field]: value }));
      Alert.alert(
        "Success",
        `${field === "email" ? "Email" : "Name"} updated successfully.`
      );
    } catch (error) {
      console.error("Error updating info:", error);
      Alert.alert("Error", "Failed to update info.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
      </View>
    );
  }

  const userProfileXml = profileIcons[userInfo?.profile] || profileIcons["01"];

  const createdAt = userInfo?.createdAt?.toDate();
  const formattedDate = createdAt
    ? createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not Available";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        {/* Header (Blue background only here) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleProfilePress}>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {isPublican ? "Publican Profile" : "Gamer Profile"}
          </Text>
        </View>

        {/* Safe Area View for the rest of the screen */}
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <View style={styles.container}>
            {/* Profile Picture Section */}
            <View style={styles.profileContainer}>
              <SvgXml xml={userProfileXml} width={120} height={120} />
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() =>
                  navigation.navigate("pfpChoice", {
                    gamerId,
                  })
                }
              >
                <SvgXml xml={editIconXml} width="50%" height="50%" />
              </TouchableOpacity>
            </View>

            {/* Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {isPublican ? "Pub Name" : "Name"}
              </Text>
              <View style={styles.editableRow}>
                <TextInput
                  ref={nameInputRef}
                  style={styles.fixedInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  onBlur={async () => {
                    const trimmed = nameInput.trim();

                    const currentName = isPublican
                      ? userInfo.pub_name
                      : userInfo.fullName;

                    if (trimmed === currentName) return;

                    if (isPublican) {
                      // Check uniqueness for pub_name
                      if (!trimmed) {
                        Alert.alert(
                          "Invalid Name",
                          "Pub name cannot be empty."
                        );
                        setNameInput(currentName);
                        return;
                      }

                      const exists = await checkIfPubNameExists(trimmed);
                      if (exists) {
                        Alert.alert(
                          "Name Taken",
                          "That pub name is already in use."
                        );
                        setNameInput(currentName);
                        return;
                      }
                    } else {
                      // Validate format for fullName (2–3 words)
                      const wordCount = trimmed.split(/\s+/).length;
                      if (wordCount !== 2 && wordCount !== 3) {
                        Alert.alert(
                          "Invalid Name",
                          "Please enter a Forename and Surname."
                        );
                        setNameInput(currentName);
                        return;
                      }
                    }

                    // Confirm update
                    Alert.alert(
                      "Confirm Name Change",
                      `Do you want to update your ${
                        isPublican ? "pub" : "user"
                      } name?`,
                      [
                        {
                          text: "Cancel",
                          onPress: () => setNameInput(currentName),
                          style: "destructive",
                        },
                        {
                          text: "Yes",
                          onPress: () =>
                            updateUserInfo(
                              isPublican ? "pub_name" : "fullName",
                              trimmed
                            ),
                          style: "default",
                        },
                      ]
                    );
                  }}
                />
                <TouchableOpacity onPress={() => nameInputRef.current?.focus()}>
                  <SvgXml
                    xml={pinkEditIconXml}
                    width={17}
                    height={17}
                    style={styles.editIconInline}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.editableRow}>
                <TextInput
                  ref={emailInputRef}
                  style={styles.fixedInput}
                  value={emailInput}
                  onChangeText={setEmailInput}
                  keyboardType="email-address"
                  onBlur={async () => {
                    const trimmedEmail = emailInput.trim();
                    if (trimmedEmail !== userInfo.email) {
                      if (!trimmedEmail) {
                        Alert.alert("Invalid Email", "*Email is required.");
                        setEmailInput(userInfo.email);
                        return;
                      }
                      if (!validateEmail(trimmedEmail)) {
                        Alert.alert(
                          "Invalid Email",
                          "Please enter a valid email address."
                        );
                        setEmailInput(userInfo.email);
                        return;
                      }
                      const emailExists = await checkIfEmailExists(
                        trimmedEmail
                      );
                      if (emailExists) {
                        Alert.alert(
                          "Email Exists",
                          "That email is already in use."
                        );
                        setEmailInput(userInfo.email);
                        return;
                      }

                      Alert.alert(
                        "Confirm Email Change",
                        "Do you want to update your email?",
                        [
                          {
                            text: "Cancel",
                            onPress: () => setEmailInput(userInfo.email),
                            style: "destructive",
                          },
                          {
                            text: "Yes",
                            onPress: () =>
                              updateUserInfo("email", trimmedEmail),
                            style: "default",
                          },
                        ]
                      );
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => emailInputRef.current?.focus()}
                >
                  <SvgXml
                    xml={pinkEditIconXml}
                    width={17}
                    height={17}
                    style={styles.editIconInline}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ID + Created Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {isPublican ? "Publican ID" : "User ID"}
              </Text>
              <TextInput
                style={styles.input}
                value={userInfo.userIdToDisplay}
                editable={false}
              />
              <Text style={styles.createdAtText}>
                Created: <Text style={styles.boldText}>{formattedDate}</Text>
              </Text>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>

            {/* Forgot Password */}
            <View style={styles.footerContainer}>
              <Text style={styles.forgotPassText}>
                Need to reset your password?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("PassReset")}
              >
                <Text style={styles.forgotPassLink}>Click here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  profileContainer: {
    position: "relative",
    marginTop: 30,
    marginBottom: "15%",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00B4D8",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  createdAtText: {
    marginTop: 5,
    fontSize: 12,
    color: "#888",
  },
  boldText: {
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#eef0f2",
    height: 55,
    padding: 12,
    borderRadius: 13,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  editableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eef0f2",
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 55,
  },
  fixedInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  editIconInline: {
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: "#FF007A",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: "30%",
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: "3%",
  },
  forgotPassText: {
    color: "#666",
    fontSize: 14,
  },
  forgotPassLink: {
    color: "#FF007A",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
