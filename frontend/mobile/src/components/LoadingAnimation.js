import React, { useEffect } from "react";
import { View, Animated, Easing } from "react-native";

const LoadingAnimation = () => {
    const rotateAnim = new Animated.Value(0);

    // Rotate animation with loop and continuous smooth transition
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[styles.spinner, { transform: [{ rotate }] }]}
            >
                <View style={[styles.circle, { backgroundColor: "#00b4d8" }]} />
                <View style={[styles.circle, { backgroundColor: "#90e0ef" }]} />
                <View style={[styles.circle, { backgroundColor: "#ff006e" }]} />
            </Animated.View>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    spinner: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        margin: 5,
    },
};

export default LoadingAnimation;
