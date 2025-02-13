import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SvgXml } from "react-native-svg";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import profileIcons from "../utils/profileIcons/profileIcons"; // Assuming this holds all profiles

const ProfileScreen = ({ route, navigation }) => {
    const { gamerId } = route.params;
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userDoc = await getDoc(doc(db, "gamers", gamerId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // Use the user's profile if it exists, else use the default "01" profile
                    const userProfile = userData.profile || "01"; // "01" is the default profile
                    setUserInfo({ ...userData, profile: userProfile });
                } else {
                    Alert.alert(
                        "Error",
                        "User data not found. Please log in again."
                    );
                    navigation.navigate("Login");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                Alert.alert("Error", "Failed to load user information.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [gamerId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00B4D8" />
            </View>
        );
    }

    const userProfileXml =
        profileIcons[userInfo?.profile] || profileIcons["01"]; // Fallback to "01" if profile not found

    return (
        <View style={styles.container}>
            <SvgXml
                xml={userProfileXml} // Dynamically load the user's profile or default
                width={50}
                height={50}
                style={styles.icon}
            />
            <Text style={styles.title}>Gamer Profile</Text>
            {userInfo ? (
                <>
                    <Text style={styles.info}>Name: {userInfo.fullName}</Text>
                    <Text style={styles.info}>Email: {userInfo.email}</Text>
                    <Text style={styles.info}>
                        Gamer ID: {userInfo.gamerId}
                    </Text>
                </>
            ) : (
                <Text>No user data available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EAF4F4",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },
    info: {
        fontSize: 18,
        marginVertical: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        marginBottom: 20, // Adds space between the icon and title
    },
});

export default ProfileScreen;
