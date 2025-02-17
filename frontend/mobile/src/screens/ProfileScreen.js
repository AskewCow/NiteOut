import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import profileIcons from "../utils/profileIcons/profileIcons";
import { editIconXml } from "../utils/editIcon";
import { useGamer } from '../contexts/GamerContext'; 

const ProfileScreen = ({ navigation }) => {
    // const { gamerId } = route.params;
    const { gamerId } = useGamer();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userDoc = await getDoc(doc(db, "gamers", gamerId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
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

    const createdAt = userInfo?.createdAt?.toDate();
    const formattedDate = createdAt
        ? createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Not Available";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gamer Profile</Text>

            {/* Profile Picture Section */}
            <View style={styles.profileContainer}>
                <SvgXml xml={userProfileXml} width={100} height={100} />
                <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() =>
                        navigation.navigate("pfpChoice", { gamerId })
                    }
                >
                    <SvgXml xml={editIconXml} width="50%" height="50%" />
                </TouchableOpacity>
            </View>

            {/* User Info Section */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={userInfo.fullName}
                    editable={false}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={userInfo.email}
                    editable={false}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Gamer ID</Text>
                <TextInput
                    style={styles.input}
                    value={userInfo.gamerId}
                    editable={false}
                />
                <Text style={styles.createdAtText}>
                    Created:{" "}
                    <Text style={styles.boldText}>{formattedDate}</Text>
                </Text>
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.navigate("Login")}
            >
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>

            {/* Forgot Pass Link */}
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 20,
        paddingTop: "10%",
    },
    title: {
        fontSize: 28,
        color: "#212529",
        fontWeight: "bold",
        textAlign: "center",
    },
    profileContainer: {
        position: "relative",
        marginTop: "10%",
        marginBottom: 20,
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
        padding: 12,
        borderRadius: 13,
        fontSize: 16,
        color: "#333",
        marginBottom: 15,
    },
    logoutButton: {
        backgroundColor: "#FF007A",
        paddingVertical: 20,
        paddingHorizontal: 30,
        borderRadius: 15,
        marginTop: "25%",
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
