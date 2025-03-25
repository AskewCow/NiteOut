import React, { useEffect, useState } from "react";
import { 
    View, Text, StyleSheet, ActivityIndicator, FlatList, 
    TouchableOpacity, SafeAreaView, TextInput, Alert
} from "react-native";
import { useGamer } from '../contexts/GamerContext'; 
import { SvgXml } from "react-native-svg";
import { logoXml } from "../utils/logo";
import { db } from "../firebaseConfig";
import { updateDoc, arrayUnion, arrayRemove, getDoc, doc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { DrawerActions } from '@react-navigation/native';
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
                const unaddedQuery = query(gamersRef, where("gamerId", "not-in", friends), limit(20));
                const unaddedSnapshot = await getDocs(unaddedQuery);
                const fetchedUnaddedUsers = unaddedSnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    userId: doc.id,
                }));
                const allUsersSnapshot = await getDocs(gamersRef);
                const fetchedUsers = allUsersSnapshot.docs.map(doc => ({
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
            const filtered = allUsers.filter(user =>
                user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, allUsers]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(unaddedUsers);
        } else {
            const filtered = allUsers.filter(user => {
                const nameMatch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
                const friendIdMatch = user.gamerId === searchQuery.trim();
                return nameMatch || friendIdMatch;
            });
            setFilteredUsers(filtered);
        }
    }, [searchQuery, allUsers]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
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

            if (userData.friends_list && userData.friends_list.includes(friendData.gamerId)) {
                Alert.alert("Already Friends", "You are already friends with this person.");
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                    <SvgXml xml={logoXml} width={40} height={40} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Find Friends</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name/friend ID"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.gamerId}
                renderItem={({ item }) => {
                    const userProfileXml = profileIcons[item.profile] || profileIcons["01"];
                    const isFriend = item.friends_list && item.friends_list.includes(gamerId);

                    return (
                        <TouchableOpacity
                            style={styles.friendItem}
                            onPress={() =>
                                navigation.navigate("Profile", {
                                    gamerId: item.userId
                                })
                            }
                        >
                            <View style={styles.friendInfo}>
                                <SvgXml xml={userProfileXml} width={50} height={50} />
                                <Text style={styles.friendName}>{item.fullName}</Text>
                            </View>
                            {item.statusMessage && (
                                <Text style={styles.statusMessage}>{item.statusMessage}</Text>
                            )}

                            <TouchableOpacity
                                style={styles.addFriendButton}
                                onPress={() => {
                                    if (!isFriend) {
                                        addFriend(item.userId);
                                    } else {
                                        removeFriend(item.userId);
                                    }
                                }}
                            >
                                <Text style={styles.addFriendText}>
                                    {isFriend ? "Added" : "Add Friend"}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#00B4D8',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        padding: 10,
        paddingTop: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingLeft: 10,
        flex: 1,
    },
    searchContainer: {
        padding: 10,
    },
    searchInput: {
        height: 40,
        borderColor: "#0000000",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    friendInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10, 
    },
    friendItem: {
        backgroundColor: '#90E0EF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    friendName: {
        fontSize: 16,
    },
    addFriendButton: {
        borderColor: '#FF006E',
        borderWidth: 2,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        position: 'absolute',
        right: 10, 
        top: '50%',
        transform: [{ translateY: -10 }],
        alignItems: 'center',
        justifyContent: 'center',
    },
    addFriendText: {
        color: '#FF006E',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default MyFriendsScreen;