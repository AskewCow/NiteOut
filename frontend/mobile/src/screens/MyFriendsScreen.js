import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { db } from "../firebaseConfig";
import profileIcons from "../utils/profileIcons/profileIcons";

const MyFriendsScreen = ({ route, navigation }) => {
    return (
        <View style={styles.container}>
            <Text>My Friends Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FF006E",
    },
});

export default MyFriendsScreen;
